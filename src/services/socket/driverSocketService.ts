import { io, type Socket } from 'socket.io-client';
import { appConfig } from '../../config/appConfig';

type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

type ListenerPayload = {
  status: SocketStatus;
  message?: string;
};

type Listener = (payload: ListenerPayload) => void;

let socket: Socket | null = null;
let socketToken: string | null = null;
const listeners = new Set<Listener>();

const notify = (payload: ListenerPayload) => {
  listeners.forEach((listener) => listener(payload));
};

const bindEvents = (activeSocket: Socket) => {
  activeSocket.on('connect', () => {
    notify({ status: 'connected' });
  });

  activeSocket.on('disconnect', (reason: string) => {
    const friendlyMessage =
      reason === 'transport error' || reason === 'ping timeout'
        ? 'Network interruption in live tracking. Reconnecting...'
        : `Socket disconnected: ${reason}`;
    notify({ status: 'disconnected', message: friendlyMessage });
  });

  activeSocket.on('reconnect_attempt', () => {
    notify({ status: 'reconnecting', message: 'Reconnecting live updates...' });
  });

  activeSocket.on('connect_error', (error: Error) => {
    notify({ status: 'disconnected', message: error.message || 'Socket connection failed.' });
  });

  activeSocket.on('error', (payload: { event: string; message: string }) => {
    notify({ status: 'connected', message: `${payload.event}: ${payload.message}` });
  });
};

export const driverSocketService = {
  connect(token: string): Socket {
    if (socket && socketToken === token) {
      if (!socket.connected && !socket.active) {
        notify({ status: 'connecting', message: 'Connecting live updates...' });
        socket.connect();
      }
      return socket;
    }

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    socketToken = token;
    notify({ status: 'connecting', message: 'Connecting live updates...' });

    socket = io(appConfig.socketUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    bindEvents(socket);
    return socket;
  },

  getSocket(): Socket | null {
    return socket;
  },

  isConnected(): boolean {
    return !!socket?.connected;
  },

  async waitForConnect(timeoutMs = 12000): Promise<void> {
    const activeSocket = socket;
    if (!activeSocket) {
      throw new Error('Socket is not initialized.');
    }

    if (activeSocket.connected) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Socket connection timeout.'));
      }, timeoutMs);

      const onConnect = () => {
        cleanup();
        resolve();
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error || new Error('Socket connection failed.'));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        activeSocket.off('connect', onConnect);
        activeSocket.off('connect_error', onError);
      };

      activeSocket.on('connect', onConnect);
      activeSocket.on('connect_error', onError);
    });
  },

  disconnect(): void {
    if (!socket) return;

    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    socketToken = null;
    notify({ status: 'disconnected' });
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener({ status: socket?.connected ? 'connected' : 'disconnected' });

    return () => {
      listeners.delete(listener);
    };
  },
};

export type { SocketStatus, ListenerPayload };
