import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import FileController from "./controllers/FileController.js";
import AuthController from "./controllers/AuthController.js";
import AuthMiddleware from "./middlewares/AuthMiddleware.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
process.env.RETENTION_DAYS = process.env.RETENTION_DAYS || "30";
process.env.BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, safe);
    }
});
const upload = multer({storage, limits: {fileSize: 100 * 1024 * 1024}});

const authMiddleware = new AuthMiddleware();


const authController = new AuthController(app, authMiddleware);
const fileController = new FileController(app, upload, authMiddleware);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});