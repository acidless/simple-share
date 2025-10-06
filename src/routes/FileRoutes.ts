import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.ts";
import FileController from "../controllers/FileController.ts";

const router = express.Router();

router.route("/")
    .post(AuthMiddleware.execute, FileController.uploadFile)
    .get(FileController.getTopNFiles);

router.route("/:id/:token").get(FileController.downloadFile);

export default router;