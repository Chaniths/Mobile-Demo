// Simple in-memory demo "database" for auth flows
// NOTE: This data resets when the app reloads (no persistence).

const demoDatabase = {
  buyers: [
    {
      id: 'buyer-1',
      name: 'Ava Martinez',
      email: 'ava.martinez@freshroute.com',
      phone: '+1 415 555 1010',
      password: 'password123',
      role: 'buyer',
    },
    {
      id: 'buyer-2',
      name: 'Leo Chen',
      email: 'leo.chen@freshroute.com',
      phone: '+1 917 555 8822',
      password: 'password123',
      role: 'buyer',
    },
  ],
  sellers: [
    {
      id: 'seller-1',
      name: 'Green Valley Farms',
      email: 'contact@greenvalley.com',
      phone: '+1 503 555 2020',
      password: 'password123',
      role: 'seller',
    },
    {
      id: 'seller-2',
      name: 'Harvest Hub Co.',
      email: 'hello@harvesthub.com',
      phone: '+1 206 555 3300',
      password: 'password123',
      role: 'seller',
    },
  ],
  drivers: [
    {
      id: 'driver-1',
      name: 'Riley Johnson',
      email: 'driver.riley@freshroute.com',
      phone: '+1 801 555 4444',
      password: 'driverpass',
      role: 'driver',
    },
  ],
  fieldAdmins: [
    {
      id: 'fieldadmin-1',
      name: 'Morgan Lee',
      email: 'morgan.lee@freshroute.com',
      phone: '+1 720 555 7777',
      password: 'fieldadmin',
      role: 'fieldadmin',
    },
    {
      id: 'fieldadmin-2',
      name: 'Chanith Wijekoon',
      email: 'chanithwijekoon@gmail.com',
      phone: '+1 555 555 5555',
      password: 'password@123',
      role: 'fieldadmin',
    },
  ],
};

const signupAllowedRoles = ['buyer', 'seller'];

const roleKeyMap = {
  buyer: 'buyers',
  seller: 'sellers',
  driver: 'drivers',
  fieldadmin: 'fieldAdmins',
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const getAllUsers = () => Object.values(demoDatabase).flat();

export const findUserByCredentials = (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const passwordToMatch = password || '';

  const allUsers = getAllUsers();
  return allUsers.find(
    (user) =>
      normalizeEmail(user.email) === normalizedEmail &&
      user.password === passwordToMatch
  );
};

export const updateUserProfile = ({ id, lookupEmail, name, email, phone, password }) => {
  const allUsers = getAllUsers();
  const normalizedLookupEmail = lookupEmail ? normalizeEmail(lookupEmail) : null;
  const targetUser = allUsers.find(
    (user) =>
      (id && user.id === id) ||
      (normalizedLookupEmail && normalizeEmail(user.email) === normalizedLookupEmail)
  );

  if (!targetUser) {
    throw new Error('User not found.');
  }

  if (email) {
    const normalizedEmail = normalizeEmail(email);
    const emailTaken = allUsers.some(
      (user) => user.id !== targetUser.id && normalizeEmail(user.email) === normalizedEmail
    );

    if (emailTaken) {
      throw new Error('Email already exists.');
    }

    targetUser.email = email;
  }

  if (name !== undefined) targetUser.name = name;
  if (phone !== undefined) targetUser.phone = phone;
  if (password !== undefined) targetUser.password = password;

  return targetUser;
};

export const addUser = ({ role, name, email, phone, password }) => {
  const normalizedRole = role?.toLowerCase();
  if (!signupAllowedRoles.includes(normalizedRole)) {
    throw new Error('This role cannot be created via signup.');
  }

  const emailKey = normalizeEmail(email);
  const allUsers = Object.values(demoDatabase).flat();
  if (allUsers.some((user) => normalizeEmail(user.email) === emailKey)) {
    throw new Error('Email already exists.');
  }

  const newUser = {
    id: `${normalizedRole}-${Date.now()}`,
    name,
    email,
    phone,
    password,
    role: normalizedRole,
  };

  const targetListKey = roleKeyMap[normalizedRole];
  demoDatabase[targetListKey].push(newUser);

  return newUser;
};

export const listUsersByRole = () => demoDatabase;

export const getSignupAllowedRoles = () => signupAllowedRoles;

export default demoDatabase;

