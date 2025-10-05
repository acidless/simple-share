    import express from "express";
    import {jwtVerify} from "../JWT.ts";
    import UserModel from "../models/UserModel.ts";

    class AuthMiddleware {
        public middleware(req: express.Request, res: express.Response, next: express.NextFunction) {
            const token = req.cookies?.token;
            if (!token) {
                return res.status(401).json({ success: false, error: "Вы должны быть авторизованы для этого" });
            }

            try {
                const decoded = jwtVerify(token) as { userId: string };
                const userModel = new UserModel();
                const user = userModel.findById(decoded.userId);

                if(!user) {
                    throw new Error("Пользователь не найден");
                }

                (req as any).user = user;
                next();
            } catch (err) {
                return res.status(401).json({ success: false, error: "Предоставлен неверный токен" });
            }
        }
    }

    export default AuthMiddleware;