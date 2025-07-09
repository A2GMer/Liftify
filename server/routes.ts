import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWorkoutSchema, insertSetSchema } from "@shared/schema";
import { z } from "zod";

const createWorkoutWithSetsSchema = z.object({
  workout: insertWorkoutSchema.omit({ userId: true }),
  sets: z.array(insertSetSchema.omit({ workoutId: true })),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workout routes
  app.get('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workouts = await storage.getWorkoutsByUserId(userId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get('/api/workouts/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workouts = await storage.getWorkoutsByUserId(userId);
      // Get the most recent workout (first in the array as they're ordered by date DESC)
      const recentWorkout = workouts.length > 0 ? workouts[0] : null;
      res.json(recentWorkout);
    } catch (error) {
      console.error("Error fetching recent workout:", error);
      res.status(500).json({ message: "Failed to fetch recent workout" });
    }
  });

  app.get('/api/workouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      if (isNaN(workoutId)) {
        return res.status(400).json({ message: 'Invalid workout ID' });
      }
      
      const workout = await storage.getWorkoutById(workoutId);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // Check if the workout belongs to the authenticated user
      if (workout.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      res.json(workout);
    } catch (error) {
      console.error("Error fetching workout:", error);
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post('/api/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      console.log("Received workout data:", JSON.stringify(req.body, null, 2));
      
      const { workout: workoutData, sets: setsData } = req.body;
      
      // Create workout
      const workout = await storage.createWorkout({
        ...workoutData,
        userId,
      });

      // Create sets
      const sets = [];
      for (const setData of setsData) {
        console.log("Processing set data:", setData);
        const set = await storage.createSet({
          ...setData,
          workoutId: workout.id,
        });
        sets.push(set);
      }

      res.json({ ...workout, sets });
    } catch (error) {
      console.error("Error creating workout:", error);
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  // Update workout
  app.put('/api/workouts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const workoutId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      console.log("Updating workout data:", JSON.stringify(req.body, null, 2));
      
      const { workout: workoutData, sets: setsData } = req.body;
      
      // Update workout
      const workout = await storage.updateWorkout(workoutId, {
        ...workoutData,
        userId,
      });

      // Delete existing sets and create new ones
      await storage.deleteSetsByWorkoutId(workoutId);
      
      const sets = [];
      for (const setData of setsData) {
        console.log("Processing set data:", setData);
        const set = await storage.createSet({
          ...setData,
          workoutId: workoutId,
        });
        sets.push(set);
      }

      res.json({ ...workout, sets });
    } catch (error) {
      console.error("Error updating workout:", error);
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/daily-volume', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const data = await storage.getDailyVolumeStats(userId, days);
      res.json(data);
    } catch (error) {
      console.error("Error fetching daily volume:", error);
      res.status(500).json({ message: "Failed to fetch daily volume" });
    }
  });

  app.get('/api/analytics/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // 1RM tracking endpoint
  app.get('/api/analytics/1rm-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.get1RMHistory(userId, days);
      res.json(data);
    } catch (error) {
      console.error("Error fetching 1RM history:", error);
      res.status(500).json({ message: "Failed to fetch 1RM history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
