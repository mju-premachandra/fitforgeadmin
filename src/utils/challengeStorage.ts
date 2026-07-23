import type { Challenge, ChallengeParticipant, ChallengeType } from '../types/challenge'
import { api } from '../lib/api'

export async function getChallenges(params?: {
  scope?: 'all' | 'official' | 'user'
  search?: string
}): Promise<Challenge[]> {
  return api.getChallenges(params)
}

export async function getChallengeCount(): Promise<number> {
  const challenges = await api.getChallenges({ scope: 'all' })
  return challenges.length
}

export async function createChallenge(payload: {
  title: string
  description?: string
  challengeType: ChallengeType
  target: number
  startDate?: string
  endDate?: string
}): Promise<Challenge> {
  return api.createChallenge(payload)
}

export async function updateChallenge(
  id: string,
  payload: Partial<{
    title: string
    description: string
    challengeType: ChallengeType
    target: number
    startDate: string | null
    endDate: string | null
  }>,
): Promise<Challenge> {
  return api.updateChallenge(id, payload)
}

export async function getChallengeParticipants(
  id: string,
): Promise<ChallengeParticipant[]> {
  return api.getChallengeParticipants(id)
}

export async function deleteChallenge(id: string): Promise<void> {
  await api.deleteChallenge(id)
}
