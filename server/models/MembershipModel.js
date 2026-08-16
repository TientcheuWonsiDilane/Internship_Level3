import mongoose from 'mongoose';


const membershipSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    role: { type: String, enum: ['team_head', 'developer'], default: 'developer' },
}, { timestamps: true });

membershipSchema.index({ userId: 1, teamId: 1 }, { unique: true });

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;