jest.mock("nanoid", () => ({
    nanoid: jest.fn(() => "mock-id"),
}));
jest.mock("../../src/models/FileModel.ts");

import FileController from "../../src/controllers/FileController.ts";
import AuthMiddleware from "../../src/middlewares/AuthMiddleware.ts";
import FileModel from "../../src/models/FileModel.ts";



describe("FileController", () => {
    let app: any;
    let authMiddleware: AuthMiddleware;
    let upload: any;

    let postHandler: any;
    let getDownloadHandler: any;
    let getFilesHandler: any;
    let deleteHandler: any;

    beforeEach(() => {
        jest.clearAllMocks();

        app = {
            post: jest.fn((path, ...handlers) => {
                if (path === "/api/files") {
                    postHandler = handlers[handlers.length - 1];
                }
            }),
            get: jest.fn((path, handler) => {
                if (path === "/d/:id/:token") {
                    getDownloadHandler = handler;
                }
                if (path === "/api/files") {
                    getFilesHandler = handler;
                }
            }),
            delete: jest.fn((path, handler) => {
                if (path === "/api/files") {
                    deleteHandler = handler;
                }
            })
        };

        authMiddleware = new AuthMiddleware();
        authMiddleware.middleware = (req, res, next: Function) => next();

        upload = {
            single: jest.fn(() => (req: any, res: any, cb: Function) => cb())
        };

        new FileController(app, upload as any, authMiddleware);
    });

    describe("POST /api/files", () => {
        test("should return error if no file provided", async () => {
            const req: any = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            await postHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: "Файл не предоставлен" });
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
            const res = { json: jest.fn() };

            const mockEntry = { id: "1", token: "abc", path: "/tmp/test.txt", originalName: "test.txt" };
            (FileModel as jest.Mock).mockImplementation(() => ({
                create: jest.fn().mockReturnValue(mockEntry)
            }));

            await postHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                id: "1",
                link: "http://localhost:3000/d/1/abc",
                meta: mockEntry
            });
        });
    });

    describe("GET /d/:id/:token", () => {
        test("should return 404 if file not found", async () => {
            const req: any = { params: { id: "1", token: "abc" } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

            (FileModel as jest.Mock).mockImplementation(() => ({
                findById: jest.fn().mockReturnValue(undefined)
            }));

            await getDownloadHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: "Файл не найден" });
        });

        test("should return 403 if token mismatch", async () => {
            const req: any = { params: { id: "1", token: "wrong" } };
            const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

            (FileModel as jest.Mock).mockImplementation(() => ({
                findById: jest.fn().mockReturnValue({ id: "1", token: "abc" })
            }));

            await getDownloadHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalledWith({ success: false, error: "Доступ запрещен" });
        });

        test("should download file if valid", async () => {
            const req: any = { params: { id: "1", token: "abc" } };
            const res = { download: jest.fn((path, name, cb) => cb && cb()) };

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

            await getDownloadHandler(req, res);

            expect(res.download).toHaveBeenCalledWith("/tmp/test.txt", "test.txt", expect.any(Function));
        });
    });

    describe("GET /api/files", () => {
        test("should return top files", async () => {
            const req: any = {};
            const res = { json: jest.fn() };
            const files = [{ id: "1" }];

            (FileModel as jest.Mock).mockImplementation(() => ({
                top100Files: jest.fn().mockReturnValue(files)
            }));

            await getFilesHandler(req, res);

            expect(res.json).toHaveBeenCalledWith(files);
        });
    });

    describe("DELETE /api/files", () => {
        test("should prune old files", async () => {
            process.env.RETENTION_DAYS = "7";
            const req: any = {};
            const res = { json: jest.fn() };

            (FileModel as jest.Mock).mockImplementation(() => ({
                pruneOldFiles: jest.fn().mockReturnValue(3)
            }));

            await deleteHandler(req, res);

            expect(res.json).toHaveBeenCalledWith({ deleted: 3 });
        });
    });
});
