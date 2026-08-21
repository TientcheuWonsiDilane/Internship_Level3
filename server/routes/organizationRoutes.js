import {
  create,
  myOrganizations,
  update,
  deleteOrg,
} from "../controllers/organizationController.js";
import express from "express";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyJWT, verifyRole("team_head"), create);
router.get("/my-organizations/:userId", myOrganizations);
router.put("/update/:id", verifyJWT, verifyRole("team_head"), update);
router.delete("/delete/:id", verifyJWT, verifyRole("team_head"), deleteOrg);

export default router;
