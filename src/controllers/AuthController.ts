import express from "express";
import bcrypt from "bcrypt";
import Controller from "./Controller.ts";
import {jwtSign} from "../JWT.ts";
import UserModel from "../models/UserModel.ts";

class AuthController extends Controller {
    public async login(req: express.Request, res: express.Response) {
        const {email, password} = req.body;

        const userModel = new UserModel();
        let user = userModel.findByEmail(email);
        if (!user) {
            user = await userModel.create(email, password);
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(400).json({success: false, error: "Неверные данные для входа"});
        }

        const token = jwtSign({userId: user.id});

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        }).json({success: true, isAdmin: user.isAdmin});
    }

    public async logout(req: express.Request, res: express.Response) {
        return res.clearCookie("token").json({success: true});
    }

    public async me(req: express.Request, res: express.Response) {
        if ((req as any).user) {
            return res.json({success: true, isAdmin: (req as any).user.isAdmin});
        }

        return res.status(401).json({success: false, error: "Вы должны быть авторизованы для этого"});
    }
}

export default new AuthController();