import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import Routes from "./routes/Routes.ts";

dotenv.config();

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
process.env.RETENTION_DAYS = process.env.RETENTION_DAYS || "30";
process.env.BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use("/api", Routes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});