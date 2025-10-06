import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Controller from "./Controller.ts";
import FileModel from "../models/FileModel.ts";

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, safe);
    }
});
const upload = multer({storage, limits: {fileSize: 100 * 1024 * 1024}});


class FileController extends Controller {
    private static cleanupInterval: NodeJS.Timeout;

    public constructor() {
        super();

        if(FileController.cleanupInterval) {
            return;
        }

        FileController.cleanupInterval = setInterval(() => {
            try {
                const fileModel = new FileModel();

                const deleted = fileModel.pruneOldFiles(Number(process.env.RETENTION_DAYS));
                console.log(`[Prune] removed ${deleted} files`);
            } catch (e) {
                console.error('Prune error', e);
            }
        }, 24 * 60 * 60 * 1000);
    }


    public async uploadFile(req: express.Request, res: express.Response) {
        upload.single("file")(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({success: false, error: "Файл слишком большой"});
                }

                return res.status(400).json({success: false, error: err.message});
            } else if (err) {
                return res.status(500).json({success: false, error: "Ошибка загрузки файла"});
            }

            if (!req.file) {
                return res.status(400).json({success: false, error: "Файл не предоставлен"});
            }

            const fileModel = new FileModel();
            const entry = fileModel.create({
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
                path: req.file.path,
            });

            const link = `${process.env.BASE_URL}/api/files/${entry.id}/${entry.token}`;
            res.json({success: true, id: entry.id, link, meta: entry});
        });
    }

    public async downloadFile(req: express.Request, res: express.Response) {
        const {id, token} = req.params;

        const fileModel = new FileModel();
        const entry = fileModel.findById(id);
        if (!entry) {
            return res.status(404).json({success: false, error: 'Файл не найден'});
        }

        if (entry.token !== token) {
            return res.status(403).send({success: false, error: 'Доступ запрещен'});
        }

        fileModel.incrementDownloads(id);

        res.download(entry.path, entry.originalName, (err) => {
            if (err) {
                console.error('Ошибка загрузки', err);
            }
        });
    }

    public async getTopNFiles(req: express.Request, res: express.Response) {
        const MAX_AMOUNT = 100;
        let amount = +(req.query?.amount || MAX_AMOUNT);
        amount = Math.min(isNaN(amount) ? MAX_AMOUNT : amount, MAX_AMOUNT);

        const fileModel = new FileModel();
        const files = fileModel.topNFiles(amount);

        res.json(files);
    }
}

export default new FileController();