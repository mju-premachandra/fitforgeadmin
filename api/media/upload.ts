import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = request.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
        validUntil: Date.now() + 5 * 60 * 1000,
        tokenPayload: JSON.stringify({ source: 'fitforge-admin' }),
      }),
      onUploadCompleted: async () => {
        // No post-processing needed; the client receives the blob URL.
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Upload failed';
    return response.status(400).json({ message });
  }
}
