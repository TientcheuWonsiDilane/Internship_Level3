import Organization from "../models/OrganizationModel.js";

export const create = async (req, res) => {
    const { name, description, userId } = req.body;

    if (!name || !userId) {
        return res.status(400).json({ message: "Organization name and user ID are required" });
    }

    try {
        const exist = await Organization.findOne({ name, userId });
        if (exist) {
            return res.status(400).json({ message: 'You already own an Organization with this name!' });
        }
        
        const newOrg = new Organization({ name, description, userId });
        await newOrg.save();
        
        return res.status(201).json({ message: newOrg });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const myOrganizations = async (req, res) => {
    const { userId } = req.params;
    try {
        const organizations = await Organization.find({ userId });
        if (!organizations || organizations.length === 0) {
            return res.status(404).json({ message: "You don't own any organizations yet!" });
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
        const updatedOrg = await Organization.findByIdAndUpdate(id, updates, { new: true });
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
        return res.status(200).json({ message: "Organization deleted successfully!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error!" });
    }
};
