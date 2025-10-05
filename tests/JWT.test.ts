import {jwtSign, jwtVerify} from "../src/JWT.ts";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

describe("JWT utils (mocked)", () => {
    const payload = { userId: "12345" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("jwtSign should call jwt.sign with correct args", () => {
        (jwt.sign as jest.Mock).mockReturnValue("mocked.token");

        let token = jwtSign(payload);

        expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), { expiresIn: "1d" });
        expect(token).toBe("mocked.token");

        token = jwtSign(payload, "1s");

        expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), { expiresIn: "1s" });
        expect(token).toBe("mocked.token");
    });

    it("jwtVerify should return decoded payload if verify succeeds", () => {
        (jwt.verify as jest.Mock).mockReturnValue(payload);

        const decoded = jwtVerify("mocked.token");

        expect(jwt.verify).toHaveBeenCalledWith("mocked.token", expect.any(String));
        expect(decoded).toEqual(payload);
    });

    it("jwtVerify should return null if verify throws", () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("invalid token");
        });

        const decoded = jwtVerify("bad.token");

        expect(decoded).toBeNull();
    });
});