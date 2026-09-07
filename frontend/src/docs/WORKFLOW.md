# Example Workflow / Procedures

This document outlines typical workflows supported by the site. The example below shows a team creating a project and completing a small task (implementing a "hello world" Python script), covering repository linking, PR review, and task completion.

1) Team & Project Creation
- Team Head creates an Organization → creates a Team → creates a Project under that Team.
- Team Head invites members; members accept invitations to join the Team.

2) Task Creation & Assignment
- Team Head creates a Task: "Create Python hello world script" and adds description and acceptance criteria.
- Team Head opens the Assign dialog (team-head only) and assigns the task to a developer.

3) Repository Link & Sync
- Team Head navigates to GitHub Sync and connects an existing repository by supplying `owner/repo` and repository numeric ID.
- The server stores the `repoId` and optional webhook id; server uses `GITHUB_TOKEN` or explicit token to fetch branches, commits, and PRs.
- The Team Head can click "Sync now" to pull a fresh snapshot of branches, commits, and PRs.

4) Developer Work & Pull Request
- Developer creates a new branch `feature/hello-world` and pushes a commit that adds `hello.py` containing:

```python
print("Hello, world!")
```

- Developer opens a pull request on GitHub targeting the project default branch.
- The integrated GitHub feed in the Project shows the new PR; the developer links the PR to the Task (auto-linking via commit messages or manual linking in the UI).

5) Review & Merge
- A reviewer (team head or another developer) reviews the PR on GitHub; once approved, the PR is merged.
- The webhook event (or periodic sync) updates the cached PR state; activity log records `pr_merged` and the Task may move to `in_review` or `done` depending on workflow rules.

6) Task Completion
- Once the PR is merged and CI passes, the Task is marked `done` by the reviewer or via automation.
- Notifications are sent to the task assignee and team activity records the completion.

Notes & Variations
- Connecting repositories can be done either by providing a repo `fullName` + `repoId` (link by ID) or by using a webhook registration flow (server registers a webhook with `GITHUB_TOKEN`).
- If per-user tokens or a GitHub App are available, fetches can use explicit credentials to avoid global `GITHUB_TOKEN` usage.
