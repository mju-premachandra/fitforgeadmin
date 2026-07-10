import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);
const ALLOWED_TYPES = new Set([...IMAGE_TYPES, ...VIDEO_TYPES]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

@Injectable()
export class MediaService {
  async upload(file: Express.Multer.File, folder = 'exercises') {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    const maxSize = VIDEO_TYPES.has(file.mimetype)
      ? MAX_VIDEO_BYTES
      : MAX_IMAGE_BYTES;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large (max ${maxSize / (1024 * 1024)}MB)`,
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) {
      throw new BadRequestException(
        'Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN to backend/.env',
      );
    }

    const ext = extname(file.originalname) || mimeToExt(file.mimetype);
    const pathname = `${folder}/${randomUUID()}${ext}`;

    try {
      const blob = await put(pathname, file.buffer, {
        access: 'public',
        contentType: file.mimetype,
        token,
      });

      return { url: blob.url };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Blob upload failed';
      throw new InternalServerErrorException(
        `${message}. Refresh BLOB_READ_WRITE_TOKEN from Vercel → Storage → your store → Copy Snippet, then restart the backend.`,
      );
    }
  }
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'video/mp4':
      return '.mp4';
    case 'video/webm':
      return '.webm';
    case 'video/quicktime':
      return '.mov';
    default:
      return '';
  }
}
