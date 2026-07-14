import type { IncomingMessage, ServerResponse } from 'node:http';
import { config as loadEnv } from 'dotenv';
import type { Plugin } from 'vite';
import type { HandleUploadBody } from '@vercel/blob/client';

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function blobUploadDevApi(): Plugin {
  return {
    name: 'blob-upload-dev-api',
    configureServer(server) {
      loadEnv({ path: '.env.local' });
      loadEnv({ path: '.env' });

      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/media/upload' || req.method !== 'POST') {
          next();
          return;
        }

        const response = res as ServerResponse;

        try {
          const rawBody = await readRequestBody(req);
          const body = JSON.parse(rawBody) as HandleUploadBody;
          const { handleBlobUpload } = await import('./api/media/blobUploadHandler');
          const jsonResponse = await handleBlobUpload(body, req);
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(jsonResponse));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Upload failed';
          response.statusCode = 400;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ message }));
        }
      });
    },
  };
}
