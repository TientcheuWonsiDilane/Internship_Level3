import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema({
    email: { type: String, required: true, trim: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    inviterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    role: { type: String, enum: ['team_head', 'developer'], default: 'developer' },
}, { timestamps: true });

InvitationSchema.index({ email: 1, teamId: 1 }, { unique: true });

const Invitation = mongoose.model('Invitation', InvitationSchema);
export default Invitation;