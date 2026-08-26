import Organization from "../models/OrganizationModel.js";
import Team from "../models/TeamModel.js";
import Membership from "../models/MembershipModel.js";

export const create = async (req, res) => {
  const { name, description, teamId } = req.body;
  const ownerId = req.user?.id;

  if (!name || !ownerId) {
    return res
      .status(400)
      .json({ message: "Organization name is required" });
  }

  try {
    const exist = await Organization.findOne({ name, ownerId });
    if (exist) {
      return res
        .status(400)
        .json({ message: "You already own an Organization with this name!" });
    }

    const organization = await Organization.create({
      name,
      description,
      ownerId,
    });

    if (teamId) {
      const team = await Team.findOne({ _id: teamId, ownerId });
      if (team) {
        team.organizationId = organization._id;
        await team.save();
      }
    }

    return res.status(201).json({ success: true, organization });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listMine = async (req, res) => {
  const userId = req.user.id;
  try {
    const owned = await Organization.find({ ownerId: userId }).lean();
    const teams = await Team.find({
      $or: [{ members: userId }, { ownerId: userId }],
    })
      .select("organizationId")
      .lean();
    const viaTeamIds = teams
      .map((t) => t.organizationId)
      .filter(Boolean)
      .map((id) => String(id));
    const viaTeams = viaTeamIds.length
      ? await Organization.find({ _id: { $in: viaTeamIds } }).lean()
      : [];

    const byId = new Map();
    [...owned, ...viaTeams].forEach((org) => byId.set(String(org._id), org));

    return res.status(200).json({
      success: true,
      organizations: Array.from(byId.values()),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const attachTeam = async (req, res) => {
  const { id } = req.params;
  const { teamId } = req.body;
  const userId = req.user.id;

  if (!teamId) {
    return res.status(400).json({ message: "Team ID is required" });
  }

  try {
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found!" });
    }
    if (String(organization.ownerId) !== String(userId)) {
      return res.status(403).json({
        message: "Only the organization owner can attach teams.",
      });
    }

    const membership = await Membership.findOne({
      teamId,
      userId,
      role: "team_head",
    });
    const team = await Team.findById(teamId);
    if (!team || !membership) {
      return res.status(403).json({
        message: "You can only attach a team you head.",
      });
    }

    team.organizationId = organization._id;
    await team.save();

    return res.status(200).json({ success: true, team, organization });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const myOrganizations = async (req, res) => {
  const { userId } = req.params;
  try {
    const organizations = await Organization.find({ ownerId: userId });
    if (!organizations || organizations.length === 0) {
      return res
        .status(404)
        .json({ message: "You don't own any organizations yet!" });
    }
    return res.status(200).json({ message: organizations });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const update = async (req, res) => {
  const updates = req.body;
  const { id } = req.params;

  try {
    const updatedOrg = await Organization.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedOrg) {
      return res.status(404).json({ message: "Organization not found!" });
    }
    return res.status(200).json({ message: updatedOrg });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const deleteOrg = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOrg = await Organization.findByIdAndDelete(id);
    if (!deletedOrg) {
      return res.status(404).json({ message: "Organization not found!" });
    }
    return res
      .status(200)
      .json({ message: "Organization deleted successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
