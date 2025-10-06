import AuthController from "../../src/controllers/AuthController.ts";
import UserModel from "../../src/models/UserModel.ts";
import bcrypt from "bcrypt";
import {jwtSign, jwtVerify} from "../../src/JWT.ts";

jest.mock("bcrypt");
jest.mock("../../src/models/UserModel.ts");
jest.mock("../../src/JWT.ts");

describe("AuthController", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwtSign as jest.Mock).mockReturnValue("mock-token");
        (jwtVerify as jest.Mock).mockReturnValue({userId: "1"});
    });

    describe("login method", () => {
        test("should create user if not exists and return token", async () => {
            const req: any = {body: {email: "test@test.com", password: "pass"}};
            const res: any = {cookie: jest.fn().mockReturnThis(), json: jest.fn()};

            const mockUser = {id: "1", email: "test@test.com", passwordHash: "hashed", isAdmin: false};
            (UserModel as jest.Mock).mockImplementation(() => ({
                findByEmail: jest.fn().mockReturnValue(undefined),
                create: jest.fn().mockResolvedValue(mockUser),
                findById: jest.fn()
            }));

            await AuthController.login(req, res);

            expect(bcrypt.compare).toHaveBeenCalledWith("pass", "hashed");
            expect(res.cookie).toHaveBeenCalledWith("token", "mock-token", {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            expect(res.json).toHaveBeenCalledWith({success: true, isAdmin: false});
        });

        test("should return 400 if password invalid", async () => {
            const req: any = {body: {email: "a@b.com", password: "wrong"}};
            const res: any = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            const mockUser = {id: "1", email: "a@b.com", passwordHash: "hashed", isAdmin: false};
            (UserModel as jest.Mock).mockImplementation(() => ({
                findByEmail: jest.fn().mockReturnValue(mockUser),
                create: jest.fn(),
                findById: jest.fn()
            }));

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({success: false, error: "Неверные данные для входа"});
        });
    });

    describe("logout method", () => {
        test("should clear token cookie", async () => {
            const req: any = {cookies: {token: "token"}};
            const res: any = {clearCookie: jest.fn().mockReturnThis(), json: jest.fn()};

            await AuthController.logout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith("token");
            expect(res.json).toHaveBeenCalledWith({success: true});
        });
    });

    describe("me method", () => {
        test("should return success if user exists", async () => {
            const req: any = {user: {isAdmin: true}};
            const res: any = {json: jest.fn(), status: jest.fn().mockReturnThis()};

            await AuthController.me(req, res);

            expect(res.json).toHaveBeenCalledWith({success: true, isAdmin: true});
        });

        test("should return 401 if user missing", async () => {
            const req: any = {};
            const res: any = {json: jest.fn(), status: jest.fn().mockReturnThis()};

            await AuthController.me(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({success: false, error: "Вы должны быть авторизованы для этого"});
        });
    });
});