import {
  users,
  workouts,
  sets,
  type User,
  type UpsertUser,
  type Workout,
  type InsertWorkout,
  type Set,
  type InsertSet,
  type WorkoutWithSets,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Workout operations
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: InsertWorkout): Promise<Workout>;
  getWorkoutsByUserId(userId: string): Promise<WorkoutWithSets[]>;
  getWorkoutById(id: number): Promise<WorkoutWithSets | undefined>;
  
  // Set operations
  createSet(set: InsertSet): Promise<Set>;
  getSetsByWorkoutId(workoutId: number): Promise<Set[]>;
  deleteSetsByWorkoutId(workoutId: number): Promise<void>;
  
  // Analytics
  getDailyVolumeStats(userId: string, days: number): Promise<{ date: string; volume: number }[]>;
  get1RMHistory(userId: string, days: number): Promise<{ date: string; max1rm: number }[]>;
  getUserStats(userId: string): Promise<{
    currentMax: number;
    thisWeekWorkouts: number;
    monthlyGain: number;
    totalVolume: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Workout operations
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db
      .insert(workouts)
      .values(workout)
      .returning();
    return newWorkout;
  }

  async updateWorkout(id: number, workout: InsertWorkout): Promise<Workout> {
    const [updatedWorkout] = await db
      .update(workouts)
      .set({ ...workout, updatedAt: new Date() })
      .where(eq(workouts.id, id))
      .returning();
    return updatedWorkout;
  }

  async getWorkoutsByUserId(userId: string): Promise<WorkoutWithSets[]> {
    const userWorkouts = await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .orderBy(desc(workouts.date), desc(workouts.time));

    const workoutsWithSets: WorkoutWithSets[] = [];
    
    for (const workout of userWorkouts) {
      const workoutSets = await this.getSetsByWorkoutId(workout.id);
      workoutsWithSets.push({
        ...workout,
        sets: workoutSets,
      });
    }

    return workoutsWithSets;
  }

  async getWorkoutById(id: number): Promise<WorkoutWithSets | undefined> {
    const [workout] = await db
      .select()
      .from(workouts)
      .where(eq(workouts.id, id));

    if (!workout) return undefined;

    const workoutSets = await this.getSetsByWorkoutId(id);
    return {
      ...workout,
      sets: workoutSets,
    };
  }

  // Set operations
  async createSet(set: InsertSet): Promise<Set> {
    const [newSet] = await db
      .insert(sets)
      .values(set)
      .returning();
    return newSet;
  }

  async getSetsByWorkoutId(workoutId: number): Promise<Set[]> {
    return await db
      .select()
      .from(sets)
      .where(eq(sets.workoutId, workoutId))
      .orderBy(sets.setNumber);
  }

  async deleteSetsByWorkoutId(workoutId: number): Promise<void> {
    await db.delete(sets).where(eq(sets.workoutId, workoutId));
  }

  // Analytics
  async getDailyVolumeStats(userId: string, days: number): Promise<{ date: string; volume: number }[]> {
    const result = await db
      .select({
        date: workouts.date,
        volume: sql<number>`SUM(${sets.weight} * ${sets.reps})`.as('volume'),
      })
      .from(workouts)
      .innerJoin(sets, eq(workouts.id, sets.workoutId))
      .where(eq(workouts.userId, userId))
      .groupBy(workouts.date)
      .orderBy(desc(workouts.date))
      .limit(days);

    return result.map(row => ({
      date: row.date,
      volume: row.volume || 0,
    }));
  }

  async get1RMHistory(userId: string, days: number): Promise<{ date: string; max1rm: number }[]> {
    const result = await db
      .select({
        date: workouts.date,
        weight: sets.weight,
        reps: sets.reps,
      })
      .from(workouts)
      .innerJoin(sets, eq(workouts.id, sets.workoutId))
      .where(
        and(
          eq(workouts.userId, userId),
          eq(sets.failed, false) // Only include non-failed sets
        )
      )
      .orderBy(desc(workouts.date))
      .limit(days * 10); // Get more sets to process

    // Calculate 1RM for each set and group by date
    const groupedByDate = result.reduce((acc: { [key: string]: number[] }, row) => {
      const date = row.date;
      const weight = parseFloat(row.weight);
      const reps = row.reps;
      
      // Calculate 1RM using the oneRMCalculator
      const oneRM = this.calculate1RM(weight, reps);
      
      if (!acc[date]) {
        acc[date] = [];
      }
      if (oneRM) {
        acc[date].push(oneRM);
      }
      
      return acc;
    }, {});
    
    // Get max 1RM for each date
    const history = Object.entries(groupedByDate).map(([date, oneRMs]) => ({
      date,
      max1rm: Math.max(...oneRMs)
    }));
    
    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Helper method to calculate 1RM
  private calculate1RM(weight: number, reps: number): number | null {
    // 1RM conversion table
    const conversionTable: { [key: number]: number } = {
      1: 1.00, 2: 0.95, 3: 0.93, 4: 0.90, 5: 0.87, 6: 0.85, 7: 0.83, 8: 0.80, 9: 0.77, 10: 0.75,
      11: 0.73, 12: 0.70, 13: 0.67, 14: 0.65, 15: 0.63, 16: 0.60, 17: 0.57, 18: 0.55, 19: 0.52, 20: 0.50
    };
    
    if (reps < 1 || reps > 20) return null;
    
    const percentage = conversionTable[reps];
    return Math.round(weight / percentage);
  }

  async getUserStats(userId: string): Promise<{
    currentMax: number;
    thisWeekWorkouts: number;
    monthlyGain: number;
    totalVolume: number;
    estimated1RM: number;
  }> {
    // Get current max weight
    const [maxWeight] = await db
      .select({ max: sql<number>`MAX(${sets.weight})` })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(eq(workouts.userId, userId));

    // Get this week's workouts count
    const [thisWeekCount] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${workouts.id})` })
      .from(workouts)
      .where(
        sql`${workouts.userId} = ${userId} AND ${workouts.date} >= DATE_TRUNC('week', CURRENT_DATE)`
      );

    // Get total volume
    const [totalVol] = await db
      .select({ total: sql<number>`SUM(${sets.weight} * ${sets.reps})` })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(eq(workouts.userId, userId));

    // Get all non-failed sets for 1RM calculation
    const allSets = await db
      .select({
        weight: sets.weight,
        reps: sets.reps,
        failed: sets.failed,
      })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(eq(workouts.userId, userId));

    // Calculate 1RM using the table
    let highest1RM = 0;
    allSets.forEach(set => {
      // Skip failed sets
      if (set.failed) return;

      const weight = parseFloat(set.weight);
      const reps = set.reps;

      // For 1 rep, the weight is the 1RM
      if (reps === 1) {
        highest1RM = Math.max(highest1RM, weight);
      } else if (reps >= 2 && reps <= 12) {
        // Use simplified calculation for 1RM: weight * (1 + (reps / 30))
        const estimated1RM = weight * (1 + (reps / 30));
        highest1RM = Math.max(highest1RM, estimated1RM);
      }
    });

    return {
      currentMax: maxWeight?.max || 0,
      thisWeekWorkouts: thisWeekCount?.count || 0,
      monthlyGain: 5, // Placeholder calculation
      totalVolume: totalVol?.total || 0,
      estimated1RM: Math.round(highest1RM),
    };
  }
}

export const storage = new DatabaseStorage();
