import type { Exercise } from '../types/exercise'
import { api } from '../lib/api'
import { saveExercise } from '../utils/exerciseStorage'

import barbell1 from '../assets/barbell1.webp'
import barbell2 from '../assets/barbell2.jpg'
import pullup2 from '../assets/pullup2.webp'
import squat2 from '../assets/barbellsquat2.webp'
import demoVideo1 from '../assets/bench-press-demo.mp4'
import demoVideo2 from '../assets/✅ Learn the “Perfect” Pull-Up - SaturnoMovement (1080p, h264).mp4'
import demoVideo3 from '../assets/BARBELL SQUAT - Recharge Body (1080p, h264).mp4'

const now = '2026-01-01T00:00:00.000Z'

export const sampleExercises: Exercise[] = [
  {
    id: 'sample-barbell-bench-press',
    name: 'Barbell Bench Press',
    instructions:
      'Lie flat on the bench with your feet planted. Grip the bar slightly wider than shoulder-width. Lower the bar to mid-chest, then press back up until your arms are fully extended.',
    frontMuscleImage: barbell1,
    backMuscleImage: barbell2,
    video: demoVideo1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-pull-up',
    name: 'Pull-Up',
    instructions:
      'Hang from a bar with an overhand grip, hands just wider than shoulders. Pull your chest toward the bar by driving your elbows down, then lower under control to a full hang.',
    frontMuscleImage: pullup2,
    backMuscleImage: pullup2,
    video: demoVideo2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-squat',
    name: 'Back Squat',
    instructions:
      'Rest the bar across your upper back. With feet shoulder-width apart, brace your core and squat down until your thighs are at least parallel to the floor. Drive back up through your heels.',
    frontMuscleImage: squat2,
    backMuscleImage: squat2,
    video: demoVideo3,
    createdAt: now,
    updatedAt: now,
  },
]

function assetFilename(url: string, fallback: string): string {
  try {
    const name = decodeURIComponent(
      new URL(url, window.location.origin).pathname.split('/').pop() ?? '',
    )
    return name || fallback
  } catch {
    return fallback
  }
}

async function uploadBundledAsset(
  url: string,
  fallbackName: string,
  kind: 'image' | 'video',
  cache: Map<string, string>,
): Promise<string> {
  const cached = cache.get(url)
  if (cached) return cached

  const response = await fetch(url, { cache: 'no-store' })
  const blob = await response.blob()
  const file = new File([blob], assetFilename(url, fallbackName), {
    type: blob.type,
  })
  const { url: blobUrl } = await api.uploadMedia(file, kind)

  cache.set(url, blobUrl)
  return blobUrl
}

export async function seedSampleExercises(): Promise<void> {
  const cache = new Map<string, string>()

  for (const exercise of sampleExercises) {
    await saveExercise({
      ...exercise,
      frontMuscleImage: await uploadBundledAsset(
        exercise.frontMuscleImage,
        'front-muscle.webp',
        'image',
        cache,
      ),
      backMuscleImage: await uploadBundledAsset(
        exercise.backMuscleImage,
        'back-muscle.webp',
        'image',
        cache,
      ),
      video: await uploadBundledAsset(
        exercise.video,
        'demo.mp4',
        'video',
        cache,
      ),
    })
  }
}
