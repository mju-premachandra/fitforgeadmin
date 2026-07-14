import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { assertAdminSession } from './assertAdminSession'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

const IMAGE_PREFIX = 'exercises/images/'
const VIDEO_PREFIX = 'exercises/videos/'

const IMAGE_MAX_BYTES = 10 * 1024 * 1024
const VIDEO_MAX_BYTES = 50 * 1024 * 1024

function uploadKindFromPath(pathname: string): 'image' | 'video' | null {
  if (pathname.startsWith(VIDEO_PREFIX)) return 'video'
  if (pathname.startsWith(IMAGE_PREFIX)) return 'image'
  return null
}

export async function handleBlobUpload(
  body: HandleUploadBody,
  request: unknown,
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is missing. Create a Vercel Blob store, then add the token to .env.local (see .env.example).',
    )
  }

  return handleUpload({
    token,
    body,
    request: request as Parameters<typeof handleUpload>[0]['request'],
    onBeforeGenerateToken: async (pathname) => {
      await assertAdminSession(request)

      const kind = uploadKindFromPath(pathname)
      if (!kind) {
        throw new Error('Upload path must start with exercises/images/ or exercises/videos/')
      }

      return {
        allowedContentTypes: kind === 'video' ? VIDEO_TYPES : IMAGE_TYPES,
        maximumSizeInBytes:
          kind === 'video' ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES,
        addRandomSuffix: true,
        validUntil: Date.now() + 5 * 60 * 1000,
        tokenPayload: JSON.stringify({ source: 'fitforge-admin', kind }),
      }
    },
    onUploadCompleted: async () => {
      // Client receives the public blob URL directly.
    },
  })
}
