import {Express} from "express";
import multer, {Multer} from "multer";
import Controller from "./Controller.ts";
import FileModel from "../models/FileModel.ts";
import AuthMiddleware from "../middlewares/AuthMiddleware.ts";

export default class FileController extends Controller {
    public constructor(app: Express, upload: Multer, authMiddleware: AuthMiddleware) {
        super(app);

        app.post('/api/files', authMiddleware.middleware, (req, res) => {
            upload.single("file")(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return res.status(400).json({ success: false, error: "Файл слишком большой" });
                    }

                    return res.status(400).json({ success: false, error: err.message });
                } else if (err) {
                    return res.status(500).json({ success: false, error: "Ошибка загрузки файла" });
                }

                if (!req.file) {
                    return res.status(400).json({ success: false, error: "Файл не предоставлен" });
                }

                const fileModel = new FileModel();
                const entry = fileModel.create({
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimeType: req.file.mimetype,
                    path: req.file.path,
                });

                const link = `${process.env.BASE_URL}/d/${entry.id}/${entry.token}`;
                res.json({ success: true, id: entry.id, link, meta: entry });
            });
        });

        app.get('/d/:id/:token', (req, res) => {
            const { id, token } = req.params;

            const fileModel = new FileModel();
            const entry = fileModel.findById(id);
            if (!entry) {
                return res.status(404).json({ success: false, error: 'Файл не найден' });
            }

            if (entry.token !== token) {
                return res.status(403).send({ success: false, error: 'Доступ запрещен' });
            }

            fileModel.incrementDownloads(id);

            res.download(entry.path, entry.originalName, (err) => {
                if (err) {
                    console.error('Ошибка загрузки', err);
                }
            });
        });

        app.get('/api/files', (req, res) => {
            const fileModel = new FileModel();

            const files = fileModel.top100Files();
            res.json(files);
        });

        app.delete('/api/files', (req, res) => {
            const fileModel = new FileModel();

            const deleted = fileModel.pruneOldFiles(Number(process.env.RETENTION_DAYS));
            res.json({ deleted });
        });

        setInterval(() => {
            try {
                const fileModel = new FileModel();

                const deleted = fileModel.pruneOldFiles(Number(process.env.RETENTION_DAYS));
                console.log(`[Prune] removed ${deleted} files`);
            } catch (e) {
                console.error('Prune error', e);
            }
        }, 24 * 60 * 60 * 1000);
    }
}