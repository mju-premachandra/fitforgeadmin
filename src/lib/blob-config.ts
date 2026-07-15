export type MediaUploadKind =
  | 'image'
  | 'video'
  | 'equipment-image'
  | 'trainer-image'

export const BLOB_IMAGE_PREFIX = 'exercises/images'
export const BLOB_VIDEO_PREFIX = 'exercises/videos'
export const BLOB_EQUIPMENT_IMAGE_PREFIX = 'equipment/images'
export const BLOB_TRAINER_IMAGE_PREFIX = 'trainers/images'

export const BLOB_IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const BLOB_VIDEO_MAX_BYTES = 50 * 1024 * 1024

export function blobPathname(kind: MediaUploadKind, filename: string): string {
  const prefix =
    kind === 'video'
      ? BLOB_VIDEO_PREFIX
      : kind === 'equipment-image'
        ? BLOB_EQUIPMENT_IMAGE_PREFIX
        : kind === 'trainer-image'
          ? BLOB_TRAINER_IMAGE_PREFIX
          : BLOB_IMAGE_PREFIX
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
  return `${prefix}/${safeName || 'upload'}`
}
