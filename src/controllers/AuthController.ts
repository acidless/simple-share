import {Express} from "express";
import bcrypt from "bcrypt";
import Controller from "./Controller.ts";
import {jwtSign} from "../JWT.ts";
import UserModel from "../models/UserModel.ts";
import AuthMiddleware from "../middlewares/AuthMiddleware.ts";

export default class AuthController extends Controller {
    public constructor(app: Express, authMiddleware: AuthMiddleware) {
        super(app);

        app.post('/api/session', async (req, res) => {
            const { email, password } = req.body;

            const userModel = new UserModel();
            let user = userModel.findByEmail(email);
            if (!user) {
                user = await userModel.create(email, password);
            }

            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) {
                return res.status(400).json({ success: false, error: "Неверные данные для входа" });
            }

            const token = jwtSign({userId: user.id});

            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            }).json({success: true, isAdmin: user.isAdmin});
        });

        app.delete('/api/session', authMiddleware.middleware, async (req, res) => {
            return res.clearCookie("token").json({success: true});
        });

        app.get('/api/session', authMiddleware.middleware, async (req, res) => {
            if((req as any).user) {
                return res.json({success: true, isAdmin: (req as any).user.isAdmin});
            }

            return res.status(401).json({success: false, error: "Вы должны быть авторизованы для этого"});
        });
    }
}