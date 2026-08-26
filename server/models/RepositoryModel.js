import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  description: { type: String, required: false, trim: true },
  repoId: { type: Number, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  lastSyncedAt: { type: Date, required: false },
  defaultBranch: { type: String, required: false, default: 'main' },
  // GitHub webhook id registered for this repository, used for de-registration.
  webhookId: { type: Number, required: false, default: null },
  // Per-repository secret (encrypted at rest) used to verify incoming payloads.
  webhookSecret: { type: String, required: false, default: null },
  // Per-repository integration settings managed from Project/Repository Settings.
  settings: {
    autoLinkEnabled: { type: Boolean, default: true },
    events: {
      type: [String],
      default: ['push', 'pull_request', 'issues', 'workflow_run'],
    },
  },
}, { timestamps: true });

repositorySchema.index({ projectId: 1 });
repositorySchema.index({ connectedBy: 1 });
repositorySchema.index({ fullName: 1 });

const Repository = mongoose.model('Repository', repositorySchema);
export default Repository;
