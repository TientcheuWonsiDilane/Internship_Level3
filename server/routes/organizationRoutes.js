import {
  create,
  listMine,
  attachTeam,
  myOrganizations,
  update,
  deleteOrg,
} from "../controllers/organizationController.js";
import express from "express";
import { verifyJWT, verifyRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyJWT, listMine);
router.post("/", verifyJWT, create);
router.post("/create", verifyJWT, create);
router.get("/my-organizations/:userId", myOrganizations);
router.post("/:id/teams", verifyJWT, attachTeam);
router.put("/update/:id", verifyJWT, verifyRole("team_head"), update);
router.delete("/delete/:id", verifyJWT, verifyRole("team_head"), deleteOrg);

export default router;
