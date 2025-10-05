import Database from "../src/Database.ts";
import { BaseSchema } from "../src/Schema.ts";
import fs from "fs";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

jest.mock("fs");

class TestSchema extends BaseSchema {
    static filename = "testschema";
}

class Test2Schema extends BaseSchema {
    static filename = "test2schema";
}

describe("Database", () => {
    let mockRead: jest.Mock;
    let mockWrite: jest.Mock;
    let mockData: any;

    beforeEach(() => {
        jest.clearAllMocks();
        // @ts-ignore
        Database["instances_"].clear();

        (fs.existsSync as jest.Mock).mockReturnValue(false);
        (fs.mkdirSync as jest.Mock).mockImplementation(() => {});

        mockRead = jest.fn();
        mockWrite = jest.fn();
        mockData = { test: 123 };

        (LowSync as unknown as jest.Mock).mockImplementation(() => ({
            read: mockRead,
            write: mockWrite,
            data: mockData,
        }));

        (JSONFileSync as unknown as jest.Mock).mockImplementation(() => ({}));
    });

    test("should create datasources folder, if it doesnt exist", () => {
        Database.instance(TestSchema);

        expect(fs.existsSync).toHaveBeenCalledWith("datasources");
        expect(fs.mkdirSync).toHaveBeenCalledWith("datasources");
    });

    test("should return the same instance for specific schema", () => {
        const db1 = Database.instance(TestSchema);
        const db2 = Database.instance(TestSchema);

        expect(db1).toBe(db2);
        expect(LowSync).toHaveBeenCalledTimes(1);
    });

    test("should call db.read()", () => {
        const db = Database.instance(TestSchema);
        db.read();

        expect(mockRead).toHaveBeenCalled();
    });

    test("should call db.write()", () => {
        const db = Database.instance(TestSchema);
        db.write();

        expect(mockWrite).toHaveBeenCalled();
    });

    test("should return db.data", () => {
        const db = Database.instance(TestSchema);
        expect(db.data()).toEqual({ test: 123 });
    });
});
