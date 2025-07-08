export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Workout {
  id: number;
  userId: string;
  date: string;
  time?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Set {
  id: number;
  workoutId: number;
  setNumber: number;
  weight: number;
  reps: number;
  powerBelt: boolean;
  buttUp: boolean;
  assistance: boolean;
  failed: boolean;
  notes?: string;
  createdAt?: Date;
}

export interface WorkoutWithSets extends Workout {
  sets: Set[];
}

export interface InsertWorkout {
  userId: string;
  date: string;
  time?: string;
  notes?: string;
}

export interface InsertSet {
  workoutId: number;
  setNumber: number;
  weight: number;
  reps: number;
  powerBelt: boolean;
  buttUp: boolean;
  assistance: boolean;
  failed: boolean;
  notes?: string;
}

export interface CognitoUser {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}