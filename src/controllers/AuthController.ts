import Controller from "./Controller.js";
import {Express} from "express";
import {jwtSign} from "../jwt.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";

export default class AuthController extends Controller {
    public constructor(app: Express) {
        super(app);

        app.post('/api/users', async (req, res) => {
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
            res.json({ token });
        });
    }
}