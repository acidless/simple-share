import FileModel from "../../src/models/FileModel.ts";
import {FileType} from "../../src/Schema.ts";

jest.mock("nanoid", () => ({
    nanoid: jest.fn()
}));

jest.mock("node:fs", () => ({
    existsSync: jest.fn(),
    unlinkSync: jest.fn()
}));

const mockDb = {
    read: jest.fn(),
    write: jest.fn(),
    data: jest.fn<any, any>(() => ({files: []}))
};

jest.mock("../../src/Database.ts", () => ({
    __esModule: true,
    default: {
        instance: jest.fn(() => mockDb)
    }
}));

import {nanoid} from "nanoid";
import * as fs from "node:fs";

describe("FileModel", () => {
    let fileModel: FileModel;
    let dataObj = {files: [] as FileType[]};

    beforeEach(() => {
        jest.clearAllMocks();
        dataObj.files.length = 0;
        mockDb.data.mockReturnValue(dataObj);

        (nanoid as jest.Mock)
            .mockImplementationOnce(() => "mock-id")
            .mockImplementationOnce(() => "mock-token");

        fileModel = new FileModel();
    });

    test("should create new file", () => {
        const entry = fileModel.create({
            originalName: "test.png",
            size: 123,
            mimeType: "image/png",
            path: "/tmp/test.png"
        });

        expect(entry).toMatchObject({
            id: "mock-id",
            token: "mock-token",
            originalName: "test.png",
            size: 123,
            mimeType: "image/png",
            path: "/tmp/test.png",
            downloadCount: 0,
            lastDownloadedAt: null
        });
        expect(dataObj.files).toHaveLength(1);
        expect(mockDb.write).toHaveBeenCalled();
    });

    test("should return found file", () => {
        dataObj.files.push({
            id: "a1",
            originalName: "f",
            size: 1,
            mimeType: "t",
            path: "p",
            token: "t",
            createdAt: "now",
            lastDownloadedAt: null,
            downloadCount: 0
        });
        const found = fileModel.findById("a1");
        expect(found?.id).toBe("a1");
    });

    test("should increase downloads count", () => {
        const f = {
            id: "x1",
            originalName: "f",
            size: 1,
            mimeType: "t",
            path: "p",
            token: "t",
            createdAt: "now",
            lastDownloadedAt: null,
            downloadCount: 0
        };
        dataObj.files.push(f);

        const updated = fileModel.incrementDownloads("x1");

        expect(updated?.downloadCount).toBe(1);
        expect(updated?.lastDownloadedAt).not.toBeNull();
        expect(mockDb.write).toHaveBeenCalled();
    });

    test("should sort by downloadCount", () => {
        dataObj.files.push({
            id: "a",
            originalName: "",
            size: 1,
            mimeType: "",
            path: "",
            token: "t",
            createdAt: "now",
            lastDownloadedAt: null,
            downloadCount: 5
        });
        dataObj.files.push({
            id: "b",
            originalName: "",
            size: 1,
            mimeType: "",
            path: "",
            token: "t",
            createdAt: "now",
            lastDownloadedAt: null,
            downloadCount: 10
        });

        const result = fileModel.topNFiles(100);
        expect(result[0].id).toBe("b");
    });

    test("should delete file from database and storage", () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        dataObj.files.push({
            id: "del1",
            originalName: "",
            size: 1,
            mimeType: "",
            path: "/tmp/f",
            token: "t",
            createdAt: "now",
            lastDownloadedAt: null,
            downloadCount: 0
        });

        fileModel.deleteFile(dataObj.files[0]);

        expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/f");
        expect(dataObj.files).toHaveLength(0);
    });

    test("should delete old files", () => {
        const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
        dataObj.files.push({
            id: "old", originalName: "", size: 1, mimeType: "", path: "", token: "t",
            createdAt: oldDate, lastDownloadedAt: oldDate, downloadCount: 1
        });

        const deletedCount = fileModel.pruneOldFiles(5);
        expect(deletedCount).toBe(1);
        expect(dataObj.files).toHaveLength(0);
    });
});
