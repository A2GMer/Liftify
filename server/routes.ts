import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWorkoutSchema, insertSetSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

const createWorkoutWithSetsSchema = z.object({
  workout: insertWorkoutSchema.omit({ userId: true }),
  sets: z.array(insertSetSchema.omit({ workoutId: true })),
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

if (!process.env.STRIPE_PRO_PRODUCT_ID || !process.env.STRIPE_ULTIMATE_PRODUCT_ID) {
  throw new Error('Missing required Stripe product IDs: STRIPE_PRO_PRODUCT_ID, STRIPE_ULTIMATE_PRODUCT_ID');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
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

  // Check subscription status
  app.get('/api/subscription-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user has no subscription
      if (!user.stripeSubscriptionId) {
        return res.json({
          hasSubscription: false,
          plan: 'free',
          status: 'active'
        });
      }

      // Check Stripe subscription status
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const currentPlan = subscription.items.data[0].price.product;
      
      // Determine plan name from product ID
      let planName = 'free';
      if (currentPlan === process.env.STRIPE_PRO_PRODUCT_ID) {
        planName = 'pro';
      } else if (currentPlan === process.env.STRIPE_ULTIMATE_PRODUCT_ID) {
        planName = 'ultimate';
      }
      
      res.json({
        hasSubscription: true,
        plan: planName,
        status: subscription.status,
        subscriptionId: subscription.id
      });
    } catch (error: any) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // If subscription is active and user tries to subscribe to the same plan, prevent it
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          const currentPlan = subscription.items.data[0].price.product;
          const requestedProductId = plan === 'pro' ? process.env.STRIPE_PRO_PRODUCT_ID : process.env.STRIPE_ULTIMATE_PRODUCT_ID;
          
          if (currentPlan === requestedProductId) {
            return res.status(400).json({ 
              message: "already_subscribed",
              currentPlan: plan,
              details: `You are already subscribed to the ${plan} plan`
            });
          }
        }
        
        // If trying to subscribe to a different plan, allow it but warn about plan change
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          // For now, prevent any plan changes and suggest canceling first
          return res.status(400).json({ 
            message: "plan_change_required",
            details: "Please cancel your current subscription before subscribing to a different plan"
          });
        }
      }

      // Create new customer if needed
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || '',
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || '',
        });
        customerId = customer.id;
      }

      // Use environment variables for product IDs
      const productId = plan === 'pro' ? process.env.STRIPE_PRO_PRODUCT_ID : process.env.STRIPE_ULTIMATE_PRODUCT_ID;
      
      if (!productId) {
        throw new Error(`Product ID not found for plan: ${plan}`);
      }
      
      // Get the default price for the product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      });
      
      if (prices.data.length === 0) {
        throw new Error(`No active prices found for product ${productId}`);
      }
      
      const price = prices.data[0]; // Use the first (and likely only) active price

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: price.id,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, customerId, subscription.id);

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
