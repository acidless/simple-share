import Controller from "./Controller.js";
import {Express} from "express";
import {jwtSign} from "../jwt.js";

export default class AuthController extends Controller {
    public constructor(app: Express) {
        super(app);

        app.post('/api/login', (req, res) => {
            const { username, password } = req.body;
            const ADMIN = process.env.ADMIN_USER || 'admin';
            const PASS = process.env.ADMIN_PASS || 'admin';

            if (username === ADMIN && password === PASS) {
                const token = jwtSign({ username });
                return res.json({ token });
            }

            res.status(401).json({ error: 'Invalid credentials' });
        });
    }
}