import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

teamSchema.index({ organizationId: 1 });
teamSchema.index({ ownerId: 1 });

const Team = mongoose.model('Team', teamSchema);
export default Team;