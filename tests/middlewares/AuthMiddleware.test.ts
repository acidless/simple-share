jest.mock("../../src/models/UserModel.ts");

jest.mock("../../src/JWT.ts", () => ({
    jwtVerify: jest.fn()
}));
import AuthMiddleware from "../../src/middlewares/AuthMiddleware.ts";
import {jwtVerify} from "../../src/JWT.ts";
import UserModel from "../../src/models/UserModel.ts";


describe("AuthMiddleware", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;
    let mockFindById: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {cookies: {}};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        mockFindById = jest.fn();
        (UserModel as jest.Mock).mockImplementation(() => ({
            findById: mockFindById
        }));
    });

    test("should return 401 if token is missing", () => {
        AuthMiddleware.execute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({success: false, error: "Вы должны быть авторизованы для этого"});
        expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if jwtVerify throws", () => {
        req.cookies.token = "token123";
        (jwtVerify as jest.Mock).mockImplementation(() => { throw new Error("invalid"); });

        AuthMiddleware.execute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({success: false, error: "Предоставлен неверный токен"});
        expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if user not found", () => {
        req.cookies.token = "token123";
        (jwtVerify as jest.Mock).mockReturnValue({userId: "u1"});
        mockFindById.mockReturnValue(undefined);

        AuthMiddleware.execute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({success: false, error: "Предоставлен неверный токен"});
        expect(next).not.toHaveBeenCalled();
    });

    test("should attach user and call next if token is valid", () => {
        const user = {id: "u1", email: "test@test.com"};
        req.cookies.token = "valid-token";
        (jwtVerify as jest.Mock).mockReturnValue({userId: "u1"});
        mockFindById.mockReturnValue(user);

        AuthMiddleware.execute(req, res, next);

        expect((req as any).user).toBe(user);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});