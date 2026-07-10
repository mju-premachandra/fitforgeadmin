import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function handleBlobUpload(
  body: HandleUploadBody,
  request: unknown,
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is missing. Copy it from Vercel → Storage → your Blob store → .env.local, or run: npx vercel env pull .env.local',
    );
  }

  return handleUpload({
    token,
    body,
    request: request as Parameters<typeof handleUpload>[0]['request'],
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
}
