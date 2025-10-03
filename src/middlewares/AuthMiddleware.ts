import express from "express";
import {jwtVerify} from "../jwt.js";
import UserModel from "../models/UserModel.js";

class AuthMiddleware {
    public middleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ error: "Вы должны быть авторизованы для этого" });
        }

        try {
            const decoded = jwtVerify(token) as { userId: string };
            (req as any).userId = decoded.userId;

            const userModel = new UserModel();
            const user = userModel.findById(decoded.userId);

            if(!user) {
                throw new Error("Пользователь не найден");
            }

            next();
        } catch (err) {
            return res.status(401).json({ error: "Предоставлен неверный токен" });
        }
    }
}

export default AuthMiddleware;