import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.post('/register',AuthController.register);
router.post('/login',AuthController.login);
router.post("/logout",authenticateJWT, AuthController.logout);

export default router;