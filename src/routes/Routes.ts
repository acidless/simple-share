import express from "express";
import AuthRoutes from "./AuthRoutes.ts";
import FileRoutes from "./FileRoutes.ts";

const routes = express.Router();

routes.use("/session", AuthRoutes);
routes.use("/files", FileRoutes);

export default routes;