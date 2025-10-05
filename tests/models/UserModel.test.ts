import UserModel from "../../src/models/UserModel.ts";
import { UserType } from "../../src/Schema.ts";
import bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
    hash: jest.fn()
}));

const mockDb = {
    read: jest.fn(),
    write: jest.fn(),
    data: jest.fn<any, any>(() => ({ users: [] }))
};

jest.mock("../../src/Database.ts", () => ({
    __esModule: true,
    default: {
        instance: jest.fn(() => mockDb)
    }
}));

describe("UserModel", () => {
    let userModel: UserModel;
    let users: UserType[];

    beforeEach(() => {
        jest.clearAllMocks();
        users = [];
        mockDb.data.mockReturnValue({ users });

        (bcrypt.hash as jest.Mock).mockImplementation(async (password: string) => `hashed-${password}`);

        userModel = new UserModel();
    });

    test("should create new user with hashed password", async () => {
        const user = await userModel.create("test@example.com", "password");

        expect(user).toMatchObject({
            email: "test@example.com",
            passwordHash: "hashed-password",
            isAdmin: false
        });
        expect(users).toHaveLength(1);
        expect(mockDb.write).toHaveBeenCalled();
    });

    test("should create admin user if email matches ADMIN_EMAIL", async () => {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminUser = await userModel.create(adminEmail, "admin");

        expect(adminUser.isAdmin).toBe(true);
    });

    test("should find user by email", async () => {
        const user = { id: "1", email: "a@b.com", passwordHash: "password", isAdmin: false };
        users.push(user);

        const found = userModel.findByEmail("a@b.com");
        expect(found).toBe(user);
    });

    test("should return undefined for non-existent email", () => {
        const found = userModel.findByEmail("notfound@example.com");
        expect(found).toBeUndefined();
    });

    test("should find user by id", () => {
        const user = { id: "42", email: "x@y.com", passwordHash: "password", isAdmin: false };
        users.push(user);

        const found = userModel.findById("42");
        expect(found).toBe(user);
    });

    test("should return undefined for non-existent id", () => {
        const found = userModel.findById("999");
        expect(found).toBeUndefined();
    });
});
