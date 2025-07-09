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
import { eq, desc, sql, and, lte, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string, plan?: string): Promise<User>;
  cancelUserSubscription(userId: string): Promise<User>;
  scheduleSubscriptionCancellation(userId: string): Promise<User>;
  processExpiredSubscriptions(): Promise<void>;
  cleanupFreeUserData(): Promise<void>;
  
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

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
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

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string, plan: string = 'pro'): Promise<User> {
    const status = plan === 'free' ? 'incomplete' : 'incomplete'; // Always incomplete until payment is confirmed
    const subscriptionStartedAt = new Date();
    const subscriptionPeriodEnd = new Date(subscriptionStartedAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionPlan: plan,
        subscriptionStatus: status,
        subscriptionStartedAt: subscriptionStartedAt,
        subscriptionPeriodEnd: subscriptionPeriodEnd,
        subscriptionCancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async cancelUserSubscription(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionPlan: 'free',
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
        subscriptionPeriodEnd: null,
        subscriptionCancelAtPeriodEnd: false,
        subscriptionStartedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async scheduleSubscriptionCancellation(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionCancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async processExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    
    // Find all users with expired subscriptions that are scheduled for cancellation
    const expiredUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.subscriptionCancelAtPeriodEnd, true),
          sql`${users.subscriptionPeriodEnd} <= ${now}`
        )
      );
    
    console.log(`Found ${expiredUsers.length} expired subscriptions to process`);
    
    for (const user of expiredUsers) {
      try {
        console.log(`Processing expired subscription for user: ${user.id}`);
        
        // Cancel the subscription in database
        await this.cancelUserSubscription(user.id);
        
        console.log(`Successfully cancelled subscription for user: ${user.id}`);
      } catch (error) {
        console.error(`Error cancelling subscription for user ${user.id}:`, error);
      }
    }
  }

  async cleanupFreeUserData(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Get all free users
    const freeUsers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.subscriptionPlan, 'free'),
          sql`${users.subscriptionPlan} IS NULL`
        )
      );
    
    console.log(`Found ${freeUsers.length} free users to check for data cleanup`);
    
    for (const user of freeUsers) {
      await this.cleanupFreeUserDataForUser(user.id);
    }
  }

  async cleanupFreeUserDataForUser(userId: string): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    try {
      // Get workouts older than 30 days for this user
      const oldWorkouts = await db
        .select()
        .from(workouts)
        .where(
          and(
            eq(workouts.userId, userId),
            sql`${workouts.date} < ${thirtyDaysAgo.toISOString().split('T')[0]}`
          )
        );
      
      if (oldWorkouts.length > 0) {
        console.log(`Cleaning up ${oldWorkouts.length} old workouts for free user: ${userId}`);
        
        // Delete sets for old workouts
        for (const workout of oldWorkouts) {
          await db.delete(sets).where(eq(sets.workoutId, workout.id));
        }
        
        // Delete old workouts
        await db
          .delete(workouts)
          .where(
            and(
              eq(workouts.userId, userId),
              sql`${workouts.date} < ${thirtyDaysAgo.toISOString().split('T')[0]}`
            )
          );
        
        console.log(`Successfully cleaned up data for free user: ${userId}`);
      }
    } catch (error) {
      console.error(`Error cleaning up data for free user ${userId}:`, error);
    }
  }

  // Workout operations
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    // Check if user is on free plan and enforce 30-day limit
    const user = await this.getUser(workout.userId);
    if (user && (user.subscriptionPlan === 'free' || !user.subscriptionPlan)) {
      // Delete old workouts for free users when creating new ones
      await this.cleanupFreeUserDataForUser(workout.userId);
    }
    
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
    // Check if user is on free plan and apply 30-day limit
    const user = await this.getUser(userId);
    let workoutsQuery = db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId));
    
    // Apply 30-day limit for free users
    if (user && (user.subscriptionPlan === 'free' || !user.subscriptionPlan)) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      workoutsQuery = workoutsQuery.where(
        and(
          eq(workouts.userId, userId),
          sql`${workouts.date} >= ${thirtyDaysAgo.toISOString().split('T')[0]}`
        )
      );
    }
    
    const userWorkouts = await workoutsQuery.orderBy(desc(workouts.date), desc(workouts.time));

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
    // Check if user is on free plan and apply 30-day limit
    const user = await this.getUser(userId);
    let whereCondition = eq(workouts.userId, userId);
    
    // Apply 30-day limit for free users
    if (user && (user.subscriptionPlan === 'free' || !user.subscriptionPlan)) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      whereCondition = and(
        eq(workouts.userId, userId),
        sql`${workouts.date} >= ${thirtyDaysAgo.toISOString().split('T')[0]}`
      );
      // Limit days to max 30 for free users
      days = Math.min(days, 30);
    }
    
    const result = await db
      .select({
        date: workouts.date,
        volume: sql<number>`SUM(${sets.weight} * ${sets.reps})`.as('volume'),
      })
      .from(workouts)
      .innerJoin(sets, eq(workouts.id, sets.workoutId))
      .where(whereCondition)
      .groupBy(workouts.date)
      .orderBy(desc(workouts.date))
      .limit(days);

    return result.map(row => ({
      date: row.date,
      volume: row.volume || 0,
    }));
  }

  async get1RMHistory(userId: string, days: number): Promise<{ date: string; max1rm: number }[]> {
    // Check if user is on free plan and apply 30-day limit
    const user = await this.getUser(userId);
    let whereCondition = eq(workouts.userId, userId);
    
    // Apply 30-day limit for free users
    if (user && (user.subscriptionPlan === 'free' || !user.subscriptionPlan)) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      whereCondition = and(
        eq(workouts.userId, userId),
        sql`${workouts.date} >= ${thirtyDaysAgo.toISOString().split('T')[0]}`
      );
      // Limit days to max 30 for free users
      days = Math.min(days, 30);
    }
    
    const result = await db
      .select({
        date: workouts.date,
        weight: sets.weight,
        reps: sets.reps,
      })
      .from(workouts)
      .innerJoin(sets, eq(workouts.id, sets.workoutId))
      .where(whereCondition)
      .orderBy(desc(workouts.date))
      .limit(days * 10); // Get more sets to process

    // Calculate 1RM for each set and group by date
    const groupedByDate = result.reduce((acc: { [key: string]: number[] }, row) => {
      const date = row.date;
      const weight = parseFloat(row.weight);
      const reps = row.reps;
      
      // Skip if data is invalid
      if (!weight || !reps) return acc;
      
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
    // Check if user is on free plan and apply 30-day limit
    const user = await this.getUser(userId);
    let whereCondition = eq(workouts.userId, userId);
    
    // Apply 30-day limit for free users
    if (user && (user.subscriptionPlan === 'free' || !user.subscriptionPlan)) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      whereCondition = and(
        eq(workouts.userId, userId),
        sql`${workouts.date} >= ${thirtyDaysAgo.toISOString().split('T')[0]}`
      );
    }
    
    // Get current max weight
    const [maxWeight] = await db
      .select({ max: sql<number>`MAX(${sets.weight})` })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(whereCondition);

    // Get this week's workouts count (apply 30-day limit for free users)
    let thisWeekWhereCondition = sql`${workouts.userId} = ${userId} AND ${workouts.date} >= DATE_TRUNC('week', CURRENT_DATE)`;
    if (user && (user.subscriptionPlan === 'free' || !user.subscriptionPlan)) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      thisWeekWhereCondition = sql`${workouts.userId} = ${userId} AND ${workouts.date} >= DATE_TRUNC('week', CURRENT_DATE) AND ${workouts.date} >= ${thirtyDaysAgo.toISOString().split('T')[0]}`;
    }
    
    const [thisWeekCount] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${workouts.id})` })
      .from(workouts)
      .where(thisWeekWhereCondition);

    // Get total volume (apply 30-day limit for free users)
    const [totalVol] = await db
      .select({ total: sql<number>`SUM(${sets.weight} * ${sets.reps})` })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(whereCondition);

    // Get all non-failed sets for 1RM calculation (apply 30-day limit for free users)
    const allSets = await db
      .select({
        weight: sets.weight,
        reps: sets.reps,
        failed: sets.failed,
      })
      .from(sets)
      .innerJoin(workouts, eq(sets.workoutId, workouts.id))
      .where(whereCondition);

    // Calculate 1RM using the same table as the chart
    let highest1RM = 0;
    allSets.forEach(set => {
      // Skip failed sets
      if (set.failed) return;

      const weight = parseFloat(set.weight);
      const reps = set.reps;

      // Use the same calculation method as the chart
      const estimated1RM = this.calculate1RM(weight, reps);
      if (estimated1RM) {
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
