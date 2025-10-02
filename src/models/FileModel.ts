import Database from "../Database.js";
import {nanoid} from "nanoid";
import * as fs from "node:fs";

export type CreateFileParams = {
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
}

export interface FileType {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
    token: string;
    createdAt: string;
    lastDownloadedAt: string | null;
    downloadCount: number;
}

class FileModel {
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

        Database.instance().read();
        Database.instance().data().files.push(entry);
        Database.instance().write();

        return entry;
    }

    public findById(id: string) {
        Database.instance().read();
        return Database.instance().data().files.find(f => f.id === id);
    }

    public incrementDownloads(id: string) {
        Database.instance().read();
        const f = Database.instance().data().files.find(x => x.id === id);
        if (!f) {
            return null;
        }

        f.downloadCount += 1;
        f.lastDownloadedAt = new Date().toISOString();
        Database.instance().write();
        return f;
    }

    public listFiles() {
        Database.instance().read();
        return Database.instance().data().files;
    }

    public deleteFile(entry: FileType) {
        try {
            if (fs.existsSync(entry.path)) {
                fs.unlinkSync(entry.path);
            }
        } catch (e) {
            console.error('Error deleting file from disk', e);
        }

        Database.instance().read();
        Database.instance().data().files = Database.instance().data().files.filter(f => f.id !== entry.id);
        Database.instance().write();
    }

    pruneOldFiles(retentionDays: number) {
        Database.instance().read();
        const now = Date.now();
        const threshold = retentionDays * 24 * 60 * 60 * 1000;
        const toDelete = Database.instance().data().files.filter(f => {
            const lastAccess = f.lastDownloadedAt ? new Date(f.lastDownloadedAt).getTime() :
                new Date(f.createdAt).getTime();
            return now - lastAccess > threshold;
        });

        toDelete.forEach(this.deleteFile);
        return toDelete.length;
    }
}

export default FileModel;