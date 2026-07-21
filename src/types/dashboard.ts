export interface UserWorkoutStat {
  userId: string
  name: string
  email: string
  workoutsCompleted: number
}

export interface DashboardStats {
  totalNormalUsers: number
  totalCoaches: number
  workoutsByUser: UserWorkoutStat[]
}
