import multer from 'multer';
import { Request } from 'express';
export declare const upload: multer.Multer;
export declare const uploadRecordAttachments: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadPatientPhoto: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadSignature: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const processUploads: (files: Express.Multer.File[]) => {
    id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    attachment_type: string;
    uploaded_at: Date;
}[];
export declare const handleUploadError: (error: any, req: Request, res: any, next: any) => any;
//# sourceMappingURL=upload.d.ts.map