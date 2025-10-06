const multer = jest.fn(() => {
    return {
        single: (field: string) => {
            return (req: any, res: any, next: any) => {
                next();
            };
        }
    };
});

class MulterError extends Error {
    code: string;
    constructor(code: string, message?: string) {
        super(message || code);
        this.name = "MulterError";
        this.code = code;
    }
}
(multer as any).MulterError = MulterError;
(multer as any).diskStorage = jest.fn(() => ({}));

export default multer;