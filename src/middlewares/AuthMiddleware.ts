import express from "express";
import {jwtVerify} from "../jwt.js";

class AuthMiddleware {
    public middleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ error: "Вы должны быть авторизованы для этого" });
        }

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwtVerify(token) as { userId: string };
            (req as any).userId = decoded.userId;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Предоставлен неверный токен" });
        }
    }
}

export default AuthMiddleware;