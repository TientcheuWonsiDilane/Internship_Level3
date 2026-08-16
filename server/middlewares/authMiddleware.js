import jwt from 'jsonwebtoken';

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

export const requireRole = (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({ message: "Auth middleware ordering error. verifyJWT must run first." });
        }

        if (req.user.role !== "team_head") {
            return res.status(403).json({ 
                message: `Forbidden: This action requires the team head privilege. Your current role is [${req.user.role}].` 
            });
        }

        next();
    };
