// The dashboard tile and the Route Orders list must agree on what counts as a current
// route, so both read from the same endpoint through this selector rather than each
// filtering a different payload with its own date rule.

const startOfTodayMs = () => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime();
};

const notInPast = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getTime() >= startOfTodayMs();
};

// Batches are dated by delivery day, so only what is already past gets dropped.
// Anything dated today or later stays visible, and an unknown date is never hidden.
export const isPastRouteHandoff = (handoff) => {
  const scheduled = handoff?.batch?.scheduledDate ?? handoff?.batch?.timeWindowStart;
  if (!scheduled) return false;
  const date = new Date(scheduled);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < startOfTodayMs();
};

const pendingPhaseCount = (handoff) =>
  (handoff?.orders ?? []).filter(
    (order) => order.currentPhase === 'PICKUP' || order.currentPhase === 'DROPOFF'
  ).length;

// Current routes, the ones with outstanding work first. Falls back to the full list so a
// day with only past routes still renders something instead of an empty screen.
export const selectCurrentRouteHandoffs = (handoffs) => {
  const list = Array.isArray(handoffs) ? handoffs : [];
  const current = list.filter((handoff) => !isPastRouteHandoff(handoff));
  const visible = current.length > 0 ? current : list;
  return [...visible].sort((a, b) => pendingPhaseCount(b) - pendingPhaseCount(a));
};

// An order belongs to today's allocated batch by route/batch schedule. Older history is
// hidden at render time so the hosted API can stay unchanged.
export const isCurrentBatchOrder = (order) => {
  const byRoute = notInPast(order?.route?.scheduledStart);
  if (byRoute !== null) return byRoute;
  const byBatch = notInPast(order?.batch?.scheduledDate ?? order?.batch?.timeWindowStart);
  if (byBatch !== null) return byBatch;
  const byDeliveredAt = notInPast(order?.deliveredAt);
  if (byDeliveredAt !== null) return byDeliveredAt;
  const byPlacedAt = notInPast(order?.placedAt);
  if (byPlacedAt !== null) return byPlacedAt;
  return false;
};
