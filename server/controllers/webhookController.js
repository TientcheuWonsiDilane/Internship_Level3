import Repository from "../models/RepositoryModel.js";
import { decryptSecret, verifyGithubSignature } from "../services/cryptoService.js";
import { enqueue, isDuplicateDelivery } from "../services/webhookQueue.js";

/**
 * GitHub webhook receiver (POST /api/webhooks/github).
 *
 * 1. Resolves the target repository from payload.repository.id.
 * 2. Verifies X-Hub-Signature-256 against the repo's stored secret
 *    (unverified payloads are rejected with 401).
 * 3. Deduplicates deliveries and enqueues the event for async processing,
 *    responding 202 immediately so the endpoint stays fast and resilient.
 */
export const receiveGithubWebhook = async (req, res) => {
  const signature =
    req.headers["x-hub-signature-256"] || req.headers["X-Hub-Signature-256"];
  const event = req.headers["x-github-event"];
  const deliveryId = req.headers["x-github-delivery"];

  if (!signature) {
    return res.status(400).json({ message: "Missing X-Hub-Signature-256 header" });
  }
  if (!event) {
    return res.status(400).json({ message: "Missing X-GitHub-Event header" });
  }

  const payload = req.body;
  const githubRepoId = payload?.repository?.id;
  if (!githubRepoId) {
    return res.status(400).json({ message: "Payload does not identify a repository" });
  }

  const repo = await Repository.findOne({ repoId: githubRepoId }).select(
    "_id fullName webhookSecret settings",
  );
  if (!repo) {
    // Unknown repository — cannot verify; reject without revealing details.
    return res.status(401).json({ message: "Signature verification failed" });
  }

  const secret = decryptSecret(repo.webhookSecret);
  if (!secret || !verifyGithubSignature(req.rawBody, signature, secret)) {
    return res.status(401).json({ message: "Signature verification failed" });
  }

  if (isDuplicateDelivery(deliveryId)) {
    return res.status(200).json({ message: "Duplicate delivery ignored" });
  }

  enqueue({
    event,
    deliveryId,
    repositoryDbId: String(repo._id),
    payload,
  });

  return res.status(202).json({ message: "Event queued for processing", event });
};

export default { receiveGithubWebhook };
