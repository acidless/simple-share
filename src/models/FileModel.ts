import Database from "../Database.js";
import {nanoid} from "nanoid";
import * as fs from "node:fs";
import Model from "./Model.js";
import {FileSchema, FileType} from "../Schema.js";

export type CreateFileParams = {
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
}

export default class FileModel extends Model<FileSchema> {
    public constructor() {
        super(Database.instance(FileSchema));
    }

    public create(params: CreateFileParams) {
        const id = nanoid(10);
        const token = nanoid(24);
        const entry: FileType = {
            id,
            originalName: params.originalName,
            size: params.size,
            mimeType: params.mimeType,
            path: params.path,
            token,
            createdAt: new Date().toISOString(),
            lastDownloadedAt: null,
            downloadCount: 0
        };

        this.db.read();
        this.db.data().files.push(entry);
        this.db.write();

        return entry;
    }

    public findById(id: string) {
        this.db.read();
        return this.db.data().files.find(f => f.id === id);
    }

    public incrementDownloads(id: string) {
        this.db.read();
        const f = this.db.data().files.find(x => x.id === id);
        if (!f) {
            return null;
        }

        f.downloadCount += 1;
        f.lastDownloadedAt = new Date().toISOString();
        this.db.write();
        return f;
    }

    public listFiles() {
        this.db.read();
        return this.db.data().files;
    }

    public deleteFile(entry: FileType) {
        try {
            if (fs.existsSync(entry.path)) {
                fs.unlinkSync(entry.path);
            }
        } catch (e) {
            console.error('Error deleting file from disk', e);
        }

        this.db.read();
        this.db.data().files = this.db.data().files.filter(f => f.id !== entry.id);
        this.db.write();
    }

    pruneOldFiles(retentionDays: number) {
        this.db.read();
        const now = Date.now();
        const threshold = retentionDays * 24 * 60 * 60 * 1000;
        const toDelete = this.db.data().files.filter(f => {
            const lastAccess = f.lastDownloadedAt ? new Date(f.lastDownloadedAt).getTime() :
                new Date(f.createdAt).getTime();
            return now - lastAccess > threshold;
        });

        toDelete.forEach(this.deleteFile);
        return toDelete.length;
    }
}