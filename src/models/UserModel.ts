import bcrypt from "bcrypt";
import Database from "../Database.ts";
import {UserSchema, UserType} from "../Schema.ts";
import Model from "./Model.ts";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

export default class UserModel extends Model<UserSchema> {
    public constructor() {
        super(Database.instance(UserSchema));
    }

    async create(email: string, password: string): Promise<UserType> {
        const id = Date.now().toString();
        const passwordHash = await bcrypt.hash(password, 10);

        const user: UserType = { id, email, passwordHash, isAdmin: email === ADMIN_EMAIL };
        this.db.data().users.push(user);
        this.db.write();

        return user;
    }

    findByEmail(email: string): UserType | undefined {
        return this.db.data().users.find(u => u.email === email);
    }

    findById(id: string): UserType | undefined {
        return this.db.data().users.find(u => u.id === id);
    }
}