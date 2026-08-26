/**
 * Asynchronous webhook ingestion queue.
 *
 * The endpoint verifies the signature and enqueues immediately, keeping the
 * HTTP response fast; processing happens here with retry/back-off. The
 * interface mirrors BullMQ's (`enqueue`, `registerHandler`) so a Redis-backed
 * queue can replace this module without touching callers.
 */

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const MAX_FAILED_HISTORY = 100;

let queue = [];
let failed = [];
let processing = false;
const handlers = new Map(); // event name -> handler fn
const seenDeliveries = new Set(); // idempotency for at-least-once delivery

export function registerHandler(eventName, handler) {
  handlers.set(eventName, handler);
}

/** Drop duplicate deliveries (GitHub retries on timeout -> at-least-once). */
export function isDuplicateDelivery(deliveryId) {
  if (!deliveryId) return false;
  if (seenDeliveries.has(deliveryId)) return true;
  seenDeliveries.add(deliveryId);
  // Keep the set bounded.
  if (seenDeliveries.size > 5000) {
    const first = seenDeliveries.values().next().value;
    seenDeliveries.delete(first);
  }
  return false;
}

export function enqueue(job) {
  queue.push({
    attempts: 0,
    queuedAt: Date.now(),
    ...job,
  });
  kick();
}

function backoffMs(attempt) {
  return BASE_BACKOFF_MS * 2 ** attempt + Math.random() * 250;
}

function requeueWithBackoff(job) {
  const delay = backoffMs(job.attempts);
  setTimeout(() => {
    queue.push(job);
    kick();
  }, delay).unref?.();
}

async function processNext() {
  const job = queue.shift();
  if (!job) {
    processing = false;
    return;
  }

  const handler = handlers.get(job.event);
  try {
    if (!handler) throw new Error(`No handler registered for event "${job.event}"`);
    await handler(job);
  } catch (error) {
    job.attempts += 1;
    console.error(
      `[webhook-queue] attempt ${job.attempts} failed for ${job.event}:`,
      error.message,
    );
    if (job.attempts < MAX_RETRIES) {
      requeueWithBackoff(job);
      scheduleNext();
      return;
    }
    job.failedAt = Date.now();
    job.error = error.message;
    failed.push(job);
    if (failed.length > MAX_FAILED_HISTORY) failed.shift();
  }

  scheduleNext();
}

function scheduleNext() {
  if (queue.length === 0) {
    processing = false;
    return;
  }
  setImmediate(processNext);
}

function kick() {
  if (processing) return;
  processing = true;
  setImmediate(processNext);
}

/** Resolves when the current backlog has been drained (used by tests/graceful shutdown). */
export function idle() {
  if (queue.length === 0 && !processing) return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => {
      if (queue.length === 0 && !processing) return resolve();
      setTimeout(check, 25);
    };
    check();
  });
}

export function stats() {
  return { pending: queue.length, processedHandlers: [...handlers.keys()], failed: failed.length };
}

export function __resetForTests() {
  queue = [];
  failed = [];
  processing = false;
  handlers.clear();
  seenDeliveries.clear();
}

export default { enqueue, registerHandler, isDuplicateDelivery, idle, stats };
