import jwt from 'jsonwebtoken';
import Membership from '../models/MembershipModel.js';

export const verifyJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Access denied. No session token found. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_cle_secrete_alternative');
        req.user = decoded; 
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(403).json({ message: "Invalid or expired session token. Please log in again." });
    }
};

export const verifyRole = (requiredRole) => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const { teamId } = req.params;

        if (!teamId) {
            return res.status(400).json({ message: "Bad request. Team ID parameter missing from route URL." });
        }

        try {
            const membership = await Membership.findOne({ teamId, userId });

            if (!membership) {
                return res.status(403).json({ message: "Forbidden: You are not a member of this team." });
            }

            if (requiredRole === 'team_head' && membership.role !== 'team_head') {
                return res.status(403).json({ message: "Forbidden: This action requires [team_head] privileges." });
            }

            next();
        } catch (error) {
            console.error("Role Verification Error:", error);
            return res.status(500).json({ message: "Internal server error during role verification" });
        }
    };
};
