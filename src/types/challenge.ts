export type ChallengeType =
  | 'workout_count'
  | 'totalVolume'
  | 'streak_days'
  | 'water_goal'

export interface Challenge {
  id: string
  title: string
  description: string | null
  challengeType: ChallengeType
  target: number
  isOfficial: boolean
  startDate: string | null
  endDate: string | null
  participantCount: number
  creator: { id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
}

export interface ChallengeParticipant {
  id: string
  userId: string
  name: string
  email: string
  progress: number
  joinedAt: string
}

export interface ChallengeFormData {
  title: string
  description: string
  challengeType: ChallengeType
  target: string
  startDate: string
  endDate: string
}

export const CHALLENGE_TYPES: { value: ChallengeType; label: string }[] = [
  { value: 'workout_count', label: 'Workout Count' },
  { value: 'totalVolume', label: 'Total Volume' },
  { value: 'streak_days', label: 'Streak Days' },
  { value: 'water_goal', label: 'Water Goal' },
]

export function challengeTypeLabel(type: ChallengeType | string): string {
  return CHALLENGE_TYPES.find((item) => item.value === type)?.label ?? type
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}
