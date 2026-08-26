import Invitation from '../models/InvitationModel.js';
import Membership from '../models/MembershipModel.js';
import User from '../models/UserModel.js';

export const sendInvitation = async (req, res) => {
    const { email, teamId, role } = req.body;
    const inviterId = req.user.id;

    if (!email || !teamId) {
        return res.status(400).json({ message: "Email and Team ID are required" });
    }

    try {
        const targetEmail = email.toLowerCase().trim();

        const existingMembership = await User.findOne({ email: targetEmail }).then(async (user) => {
            if (!user) return null;
            return await Membership.findOne({ teamId, userId: user._id });
        });

        if (existingMembership) {
            return res.status(400).json({ message: "This user is already a member of the team" });
        }

        const existingInvitation = await Invitation.findOne({ email: targetEmail, teamId, status: 'pending' });
        if (existingInvitation) {
            return res.status(400).json({ message: "A pending invitation already exists for this user in this team" });
        }

        const newInvitation = await Invitation.create({
            email: targetEmail,
            teamId,
            inviterId,
            role: role || 'developer'
        });

        return res.status(201).json({ success: true, invitation: newInvitation });
    } catch (error) {
        console.error("Send Invitation Error:", error);
        return res.status(500).json({ message: "Internal server error during invitation creation" });
    }
};

export const getMyInvitations = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const invitations = await Invitation.find({ email: user.email, status: 'pending' })
            .populate('teamId', 'name description')
            .populate('inviterId', 'username avatarUrl')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, invitations });
    } catch (error) {
        console.error("Fetch Invitations Error:", error);
        return res.status(500).json({ message: "Internal server error while fetching invitations" });
    }
};

export const getTeamInvitations = async (req, res) => {
  const { teamId } = req.params;
  try {
    const invitations = await Invitation.find({ teamId })
      .populate("inviterId", "username avatarUrl")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, invitations });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptInvitationByToken = async (req, res) => {
  req.params.id = req.params.token;
  req.body = { ...(req.body || {}), action: "accepted" };
  return respondToInvitation(req, res);
};

export const respondToInvitation = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // Doit être 'accepted' ou 'declined'
    const userId = req.user.id;

    if (!['accepted', 'declined'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'accepted' or 'declined'" });
    }

    try {
        const invitation = await Invitation.findById(id);
        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found" });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: "This invitation has already been processed" });
        }

        const user = await User.findById(userId);
        if (user.email !== invitation.email) {
            return res.status(403).json({ message: "Unauthorized: This invitation was not sent to your email address" });
        }

        invitation.status = action;
        await invitation.save();

        if (action === 'accepted') {
            await Membership.create({
                userId: user._id,
                teamId: invitation.teamId,
                role: invitation.role
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: `Invitation ${action} successfully`, 
            invitation 
        });
    } catch (error) {
        console.error("Respond Invitation Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "You are already a member of this team" });
        }
        return res.status(500).json({ message: "Internal server error during invitation processing" });
    }
};
