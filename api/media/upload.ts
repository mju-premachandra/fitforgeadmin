import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { HandleUploadBody } from '@vercel/blob/client';
import { handleBlobUpload } from './blobUploadHandler';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleBlobUpload(
      request.body as HandleUploadBody,
      request,
    );
    return response.status(200).json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return response.status(400).json({ message });
  }
}
