import mysql from 'mysql2/promise';
import { User, Workout, Set, WorkoutWithSets, InsertWorkout, InsertSet } from './types';

const dbConfig = {
  host: process.env.RDS_HOSTNAME!,
  user: process.env.RDS_USERNAME!,
  password: process.env.RDS_PASSWORD!,
  database: process.env.RDS_DB_NAME!,
  port: parseInt(process.env.RDS_PORT || '3306'),
  ssl: {
    rejectUnauthorized: false
  }
};

export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool(dbConfig);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users[0];
  }

  async upsertUser(userData: Partial<User>): Promise<User> {
    const { id, email, firstName, lastName, profileImageUrl } = userData;
    
    await this.pool.execute(
      `INSERT INTO users (id, email, first_name, last_name, profile_image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
       email = VALUES(email),
       first_name = VALUES(first_name),
       last_name = VALUES(last_name),
       profile_image_url = VALUES(profile_image_url),
       updated_at = NOW()`,
      [id, email, firstName, lastName, profileImageUrl]
    );

    const user = await this.getUser(id!);
    return user!;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [result] = await this.pool.execute(
      'INSERT INTO workouts (user_id, date, time, notes, created_at) VALUES (?, ?, ?, ?, NOW())',
      [workout.userId, workout.date, workout.time, workout.notes]
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    const [rows] = await this.pool.execute(
      'SELECT * FROM workouts WHERE id = ?',
      [insertResult.insertId]
    );
    
    const workouts = rows as Workout[];
    return workouts[0];
  }

  async getWorkoutsByUserId(userId: string): Promise<WorkoutWithSets[]> {
    const [workoutRows] = await this.pool.execute(
      'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [userId]
    );
    
    const workouts = workoutRows as Workout[];
    const workoutsWithSets: WorkoutWithSets[] = [];
    
    for (const workout of workouts) {
      const sets = await this.getSetsByWorkoutId(workout.id);
      workoutsWithSets.push({ ...workout, sets });
    }
    
    return workoutsWithSets;
  }

  async getWorkoutById(id: number): Promise<WorkoutWithSets | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM workouts WHERE id = ?',
      [id]
    );
    
    const workouts = rows as Workout[];
    if (workouts.length === 0) return undefined;
    
    const workout = workouts[0];
    const sets = await this.getSetsByWorkoutId(id);
    return { ...workout, sets };
  }

  async createSet(set: InsertSet): Promise<Set> {
    const [result] = await this.pool.execute(
      `INSERT INTO sets (workout_id, set_number, weight, reps, power_belt, butt_up, assistance, failed, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [set.workoutId, set.setNumber, set.weight, set.reps, set.powerBelt, set.buttUp, set.assistance, set.failed, set.notes]
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    const [rows] = await this.pool.execute(
      'SELECT * FROM sets WHERE id = ?',
      [insertResult.insertId]
    );
    
    const sets = rows as Set[];
    return sets[0];
  }

  async getSetsByWorkoutId(workoutId: number): Promise<Set[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM sets WHERE workout_id = ? ORDER BY set_number',
      [workoutId]
    );
    
    return rows as Set[];
  }

  async getDailyVolumeStats(userId: string, days: number): Promise<{ date: string; volume: number }[]> {
    const [rows] = await this.pool.execute(
      `SELECT 
         w.date,
         COALESCE(SUM(s.weight * s.reps), 0) as volume
       FROM workouts w
       LEFT JOIN sets s ON w.id = s.workout_id
       WHERE w.user_id = ? AND w.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY w.date
       ORDER BY w.date DESC`,
      [userId, days]
    );
    
    return rows as { date: string; volume: number }[];
  }

  async getUserStats(userId: string): Promise<{
    currentMax: number;
    thisWeekWorkouts: number;
    monthlyGain: number;
    totalVolume: number;
  }> {
    // Get current max weight
    const [maxRows] = await this.pool.execute(
      `SELECT MAX(s.weight) as max_weight
       FROM sets s
       INNER JOIN workouts w ON s.workout_id = w.id
       WHERE w.user_id = ?`,
      [userId]
    );
    
    // Get this week's workouts
    const [weekRows] = await this.pool.execute(
      `SELECT COUNT(DISTINCT w.id) as week_count
       FROM workouts w
       WHERE w.user_id = ? AND w.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [userId]
    );
    
    // Get total volume
    const [volumeRows] = await this.pool.execute(
      `SELECT COALESCE(SUM(s.weight * s.reps), 0) as total_volume
       FROM sets s
       INNER JOIN workouts w ON s.workout_id = w.id
       WHERE w.user_id = ?`,
      [userId]
    );
    
    const maxResult = maxRows as any[];
    const weekResult = weekRows as any[];
    const volumeResult = volumeRows as any[];
    
    return {
      currentMax: maxResult[0]?.max_weight || 0,
      thisWeekWorkouts: weekResult[0]?.week_count || 0,
      monthlyGain: 0, // Placeholder for now
      totalVolume: volumeResult[0]?.total_volume || 0
    };
  }

  async close() {
    await this.pool.end();
  }
}