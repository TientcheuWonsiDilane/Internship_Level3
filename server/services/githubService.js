import { Octokit } from "@octokit/rest";

/**
 * Thin wrapper around Octokit with a single token-resolution rule:
 * an explicit token wins, then the server-level GITHUB_TOKEN, else it throws
 * `GithubUnavailableError`. Production prefers a per-user (or GitHub App
 * installation) token; the fallback keeps local dev/sync possible.
 */
export class GithubUnavailableError extends Error {
  constructor(message = "GitHub credentials are not configured") {
    super(message);
    this.name = "GithubUnavailableError";
  }
}

function resolveToken(explicitToken) {
  const token = explicitToken || process.env.GITHUB_TOKEN;
  if (!token) throw new GithubUnavailableError();
  return token;
}

function getClient(explicitToken) {
  return new Octokit({ auth: resolveToken(explicitToken), timeout: 15000 });
}

function parseRepoFullName(fullName) {
  const [owner, repo] = String(fullName).split("/");
  return { owner, repo };
}

export async function fetchRepositoryMeta(fullName, token) {
  const client = getClient(token);
  const { owner, repo } = parseRepoFullName(fullName);
  const { data } = await client.repos.get({ owner, repo });
  return {
    repoId: data.id,
    fullName: data.full_name,
    defaultBranch: data.default_branch || "main",
    description: data.description || "",
    private: data.private,
    htmlUrl: data.html_url,
  };
}

export async function fetchBranches(fullName, token) {
  const client = getClient(token);
  const { owner, repo } = parseRepoFullName(fullName);
  const { data } = await client.repos.listBranches({
    owner,
    repo,
    per_page: 50,
  });
  return data.map((b) => ({
    name: b.name,
    lastCommitSha: b.commit?.sha || "",
    isProtected: Boolean(b.protected),
  }));
}

export async function fetchCommits(fullName, token, perPage = 30) {
  const client = getClient(token);
  const { owner, repo } = parseRepoFullName(fullName);
  const { data } = await client.repos.listCommits({
    owner,
    repo,
    per_page: perPage,
  });
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit?.message || "",
    authorName: c.commit?.author?.name || c.author?.login || "",
    authorEmail: c.commit?.author?.email || "",
    committedAt: c.commit?.author?.date ? new Date(c.commit.author.date) : null,
    htmlUrl: c.html_url || "",
  }));
}

export async function fetchPullRequests(
  fullName,
  token,
  state = "open",
  perPage = 30,
) {
  const client = getClient(token);
  const { owner, repo } = parseRepoFullName(fullName);
  const { data } = await client.pulls.list({
    owner,
    repo,
    state,
    per_page: perPage,
  });
  return data.map((pr) => ({
    prId: pr.id,
    number: pr.number,
    title: pr.title || "",
    state: pr.state, // open | closed
    merged: Boolean(pr.merged),
    mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
    closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
    htmlUrl: pr.html_url || "",
    authorLogin: pr.user?.login || "",
    authorAvatarUrl: pr.user?.avatar_url || "",
    headRef: pr.head?.ref || "",
    baseRef: pr.base?.ref || "",
    draft: Boolean(pr.draft),
  }));
}

export async function registerWebhook(fullName, secret, token, events) {
  const client = getClient(token);
  const { owner, repo } = parseRepoFullName(fullName);
  const config = {
    url:
      process.env.GITHUB_WEBHOOK_URL ||
      "https://metrics-server-6zd9.onrender.com/api/webhooks/github",
    content_type: "json",
    secret,
    insecure_ssl: "0",
  };
  const { data } = await client.repos.createWebhook({
    owner,
    repo,
    name: "web",
    config,
    events: events || ["push", "pull_request", "issues", "workflow_run"],
  });
  return data.id;
}

export async function deleteWebhook(fullName, webhookId, token) {
  if (!webhookId) return;
  const client = getClient(token);
  const { owner, repo } = parseRepoFullName(fullName);
  await client.repos.deleteWebhook({ owner, repo, webhook_id: webhookId });
}

export default {
  fetchRepositoryMeta,
  fetchBranches,
  fetchCommits,
  fetchPullRequests,
  registerWebhook,
  deleteWebhook,
  GithubUnavailableError,
};
