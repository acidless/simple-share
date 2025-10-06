import express from "express";
import AuthController from "../controllers/AuthController.ts";
import AuthMiddleware from "../middlewares/AuthMiddleware.ts";

const router = express.Router();

router.route("/")
    .post(AuthController.login)
    .delete(AuthMiddleware.execute, AuthController.logout)
    .get(AuthMiddleware.execute, AuthController.me);

export default router;