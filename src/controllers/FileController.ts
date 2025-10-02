import Controller from "./Controller.js";
import {Express} from "express";
import {Multer} from "multer";
import FileModel from "../models/FileModel.js";

export default class FileController extends Controller {
    public constructor(app: Express, upload: Multer) {
        super(app);

        app.post('/api/files', upload.single('file'), (req, res) => {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'No file provided' });
            }

            const fileModel = new FileModel();
            const entry = fileModel.create({
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
                path: req.file.path
            });

            const link = `${process.env.BASE_URL}/d/${entry.id}/${entry.token}`;
            res.json({ success: true, id: entry.id, link, meta: entry });
        });

        app.get('/d/:id/:token', (req, res) => {
            const { id, token } = req.params;

            const fileModel = new FileModel();
            const entry = fileModel.findById(id);
            if (!entry) {
                return res.status(404).json({ success: false, error: 'File not found' });
            }

            if (entry.token !== token) {
                return res.status(403).send({ success: false, error: 'Forbidden' });
            }

            fileModel.incrementDownloads(id);

            res.download(entry.path, entry.originalName, (err) => {
                if (err) {
                    console.error('Download error', err);
                }
            });
        });

        app.get('/api/files', (req, res) => {
            const fileModel = new FileModel();

            const files = fileModel.listFiles();
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