import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    repoId: { type: Number, required: true, unique: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
    connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    lastSyncedAt: { type: Date, required: false },
}, { timestamps: true });

repositorySchema.index({ projectId: 1 });
repositorySchema.index({ connectedBy: 1 });

const Repository = mongoose.model('Repository', repositorySchema);
export default Repository;