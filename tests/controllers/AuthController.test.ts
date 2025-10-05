import AuthController from "../../src/controllers/AuthController.ts";
import AuthMiddleware from "../../src/middlewares/AuthMiddleware.ts";
import UserModel from "../../src/models/UserModel.ts";
import bcrypt from "bcrypt";
import {jwtSign, jwtVerify} from "../../src/JWT.ts";

jest.mock("bcrypt");
jest.mock("../../src/models/UserModel.ts");
jest.mock("../../src/JWT.ts");

describe("AuthController", () => {
    let app: any;
    let authMiddleware: AuthMiddleware;
    let postHandler: any;
    let deleteHandler: any;
    let getHandler: any;

    beforeEach(() => {
        jest.clearAllMocks();

        app = {
            post: jest.fn((path, ...mv) => {
                if (path === '/api/session') {
                    postHandler = mv[mv.length - 1];
                }
            }),
            delete: jest.fn((path, ...mv) => {
                if (path === '/api/session') {
                    deleteHandler = mv[mv.length - 1];
                }
            }),
            get: jest.fn((path, ...mv) => {
                if (path === '/api/session') {
                    getHandler = mv[mv.length - 1];
                }
            })
        };

        authMiddleware = new AuthMiddleware();
        authMiddleware.middleware = (req, res, next: Function) => next();

        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwtSign as jest.Mock).mockReturnValue("mock-token");
        (jwtVerify as jest.Mock).mockReturnValue({userId: "1"});

        new AuthController(app, authMiddleware);
    });

    describe("POST /api/session", () => {
        test("should create user if not exists and return token", async () => {
            const req = {body: {email: "test@test.com", password: "pass"}};
            const res = {cookie: jest.fn().mockReturnThis(), json: jest.fn()};

            const mockUser = {id: "1", email: "test@test.com", passwordHash: "hashed", isAdmin: false};
            (UserModel as jest.Mock).mockImplementation(() => ({
                findByEmail: jest.fn().mockReturnValue(undefined),
                create: jest.fn().mockResolvedValue(mockUser),
                findById: jest.fn()
            }));

            await postHandler(req, res);

            expect(bcrypt.compare).toHaveBeenCalledWith("pass", "hashed");
            expect(res.cookie).toHaveBeenCalledWith("token", "mock-token", {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            expect(res.json).toHaveBeenCalledWith({success: true, isAdmin: false});
        });

        test("should return 400 if password invalid", async () => {
            const req = {body: {email: "a@b.com", password: "wrong"}};
            const res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            const mockUser = {id: "1", email: "a@b.com", passwordHash: "hashed", isAdmin: false};
            (UserModel as jest.Mock).mockImplementation(() => ({
                findByEmail: jest.fn().mockReturnValue(mockUser),
                create: jest.fn(),
                findById: jest.fn()
            }));

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await postHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({success: false, error: "Неверные данные для входа"});
        });
    });

    describe("DELETE /api/session", () => {
        test("should clear token cookie", async () => {
            const req = {cookies: {token: "token"}};
            const res = {clearCookie: jest.fn().mockReturnThis(), json: jest.fn()};

            await deleteHandler(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith("token");
            expect(res.json).toHaveBeenCalledWith({success: true});
        });
    });

    describe("GET /api/session", () => {
        test("should return success if user exists", async () => {
            const req: any = {user: {isAdmin: true}};
            const res: any = {json: jest.fn(), status: jest.fn().mockReturnThis()};

            await getHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({success: true, isAdmin: true});
        });

        test("should return 401 if user missing", async () => {
            const req: any = {};
            const res: any = {json: jest.fn(), status: jest.fn().mockReturnThis()};

            await getHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({success: false, error: "Вы должны быть авторизованы для этого"});
        });
    });
});