export abstract class BaseSchema {}

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

export class FileSchema extends BaseSchema {
    static filename = 'files';

    files: FileType[] = [];
}

export type UserType = {
    id: string;
    email: string;
    passwordHash: string;
    isAdmin: boolean;
};

export class UserSchema extends BaseSchema {
    static filename = 'users';

    users: UserType[] = [];
}