import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: false },
    slug: { type: String, required: true, unique: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true });

projectSchema.index({ organizationId: 1 });
projectSchema.index({ teamId: 1 });
projectSchema.index({ slug: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;