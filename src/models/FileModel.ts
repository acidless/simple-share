import Database from "../Database.js";
import {nanoid} from "nanoid";

export type CreateFileParams = {
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
}

export interface FileType {
    id?: string;
    originalName?: string;
    size?: number;
    mimeType?: string;
    path?: string;
    token?: string;
    createdAt?: string;
    lastDownloadedAt?: string | null;
    downloadCount?: number;
}

class FileModel implements FileType {
    id?: string;
    originalName?: string;
    size?: number;
    mimeType?: string;
    path?: string;
    token?: string;
    createdAt?: string;
    lastDownloadedAt?: string | null;
    downloadCount?: number;

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
}

export default FileModel;