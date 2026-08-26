import Team from "../models/TeamModel.js";
import Membership from "../models/MembershipModel.js";

export const create = async (req, res) => {
  const { name, description, organizationId, members } = req.body;
  const ownerId = req.user?.id || req.body.ownerId;

  if (!name || !ownerId) {
    return res
      .status(400)
      .json({ message: "Team name and registered user required" });
  }

  try {
    if (organizationId) {
      const exist = await Team.findOne({ name, organizationId });
      if (exist) {
        return res
          .status(400)
          .json({ message: "team name already exist in this organization!" });
      }
    }
    const newTeam = new Team({
      name,
      description,
      organizationId,
      members: members || [ownerId],
      ownerId,
    });

    await newTeam.save();
    try {
      const existingMembership = await Membership.findOne({
        teamId: newTeam._id,
        userId: ownerId,
      });
      if (!existingMembership) {
        const teamHeadMembership = new Membership({
          teamId: newTeam._id,
          userId: ownerId,
          role: "team_head",
        });
        await teamHeadMembership.save();
      } else if (existingMembership.role !== "team_head") {
        existingMembership.role = "team_head";
        await existingMembership.save();
      }
    } catch (mErr) {
      console.error("Failed to create/ensure team membership for owner:", mErr);
    }
    return res.status(201).json({ success: true, team: newTeam, message: newTeam });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const myTeams = async (req, res) => {
  const { userId } = req.params;
  try {
    const teams = await Team.find({
      $or: [{ members: userId }, { ownerId: userId }],
    });

    if (!teams || teams.length === 0) {
      return res
        .status(404)
        .json({ message: "You are not part of any teams yet!" });
    }
    return res.status(200).json({ message: teams });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const update = async (req, res) => {
  const updates = req.body;
  const { id } = req.params;

  try {
    const updatedTeam = await Team.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({ message: updatedTeam });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const team = await Team.findById(id).populate(
      "members ownerId",
      "username email avatarUrl github_id",
    );
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    return res.status(200).json({ success: true, team, message: team });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTeamMembers = async (req, res) => {
  const { id } = req.params;
  try {
    const memberships = await Membership.find({ teamId: id })
      .populate("userId", "username email avatarUrl github_id")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      members: memberships.map((m) => ({
        membershipId: m._id,
        role: m.role,
        user: m.userId,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const delTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTeam = await Team.findByIdAndDelete(id);
    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }
    return res.status(200).json({
      message: "Team deleted successfully",
      deleted_team: deletedTeam,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
