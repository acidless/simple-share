import FileController from "../../src/controllers/FileController.ts";
import FileModel from "../../src/models/FileModel.ts";
jest.mock("fs");
jest.mock("path");
jest.mock("nanoid", () => ({
    nanoid: jest.fn(() => "mock-id"),
}));
jest.mock("../../src/models/FileModel.ts");

describe("FileController", () => {
    let upload: any;

    beforeEach(() => {
        jest.clearAllMocks();

        upload = {
            single: jest.fn(() => (req: any, res: any, cb: Function) => cb())
        };
    });

    describe("uploadFile method", () => {
        test("should return error if no file provided", async () => {
            const req: any = {};
            const res: any = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            await FileController.uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({success: false, error: "Файл не предоставлен"});
        });

        test("should create file entry and return link", async () => {
            process.env.BASE_URL = "http://localhost:3000";

            const req: any = {
                file: {
                    originalname: "test.txt",
                    size: 123,
                    mimetype: "text/plain",
                    path: "/tmp/test.txt"
                }
            };
            const res: any = {json: jest.fn()};

            const mockEntry = {id: "1", token: "abc", path: "/tmp/test.txt", originalName: "test.txt"};
            (FileModel as jest.Mock).mockImplementation(() => ({
                create: jest.fn().mockReturnValue(mockEntry)
            }));

            await FileController.uploadFile(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                id: "1",
                link: "http://localhost:3000/api/files/1/abc",
                meta: mockEntry
            });
        });
    });

    describe("downloadFile method", () => {
        test("should return 404 if file not found", async () => {
            const req: any = {params: {id: "1", token: "abc"}};
            const res: any = {status: jest.fn().mockReturnThis(), json: jest.fn()};

            (FileModel as jest.Mock).mockImplementation(() => ({
                findById: jest.fn().mockReturnValue(undefined)
            }));

            await FileController.downloadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({success: false, error: "Файл не найден"});
        });

        test("should return 403 if token mismatch", async () => {
            const req: any = {params: {id: "1", token: "wrong"}};
            const res: any = {status: jest.fn().mockReturnThis(), send: jest.fn()};

            (FileModel as jest.Mock).mockImplementation(() => ({
                findById: jest.fn().mockReturnValue({id: "1", token: "abc"})
            }));

            await FileController.downloadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalledWith({success: false, error: "Доступ запрещен"});
        });

        test("should download file if valid", async () => {
            const req: any = {params: {id: "1", token: "abc"}};
            const res: any = {download: jest.fn((path, name, cb) => cb && cb())};

            const mockEntry = {
                id: "1",
                token: "abc",
                path: "/tmp/test.txt",
                originalName: "test.txt"
            };

            (FileModel as jest.Mock).mockImplementation(() => ({
                findById: jest.fn().mockReturnValue(mockEntry),
                incrementDownloads: jest.fn()
            }));

            await FileController.downloadFile(req, res);

            expect(res.download).toHaveBeenCalledWith("/tmp/test.txt", "test.txt", expect.any(Function));
        });
    });

    describe("getTopNFiles method", () => {
        test("should return top files", async () => {
            const req: any = {};
            const res: any = {json: jest.fn()};
            const files = [{id: "1"}];

            (FileModel as jest.Mock).mockImplementation(() => ({
                topNFiles: jest.fn().mockReturnValue(files)
            }));

            await FileController.getTopNFiles(req, res);

            expect(res.json).toHaveBeenCalledWith(files);
        });
    });
});
