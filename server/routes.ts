import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
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

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has this plan and it's truly active
      if (user.subscriptionPlan === plan && user.subscriptionStatus === 'active' && user.subscriptionPlan !== 'free') {
        return res.status(400).json({ message: `User already has ${plan} plan` });
      }

      // If user already has a subscription, check its status
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        // If subscription is already active and user has paid plan, don't create a new one
        if (subscription.status === 'active' && user.subscriptionPlan !== 'free') {
          return res.status(400).json({ message: "User already has an active subscription" });
        }
        
        // If subscription exists but not active, check if we can reuse the payment intent
        if (subscription.status === 'incomplete' && subscription.latest_invoice) {
          const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
          if (invoice.payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent as string);
            
            // Only return existing payment intent if it's not already succeeded
            if (paymentIntent.status !== 'succeeded') {
              return res.json({
                subscriptionId: subscription.id,
                clientSecret: paymentIntent.client_secret,
              });
            }
          }
        }
        
        // Cancel existing incomplete subscription and create new one
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
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

      console.log('Created subscription:', subscription.id);

      // Update user with Stripe info but keep plan as free until payment is confirmed
      await storage.updateUserStripeInfo(userId, customerId, subscription.id, 'free');
      
      console.log('User updated with subscription info:', { userId, customerId, subscriptionId: subscription.id });

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

  // Update plan after successful payment
  app.post('/api/update-plan-after-payment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { paymentIntentId, plan } = req.body;
      
      console.log('Updating plan after payment:', { userId, paymentIntentId, plan });
      
      // Update user plan to paid plan with active status
      const [updatedUser] = await db
        .update(users)
        .set({
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      
      console.log('User plan updated successfully:', updatedUser);
      
      res.json({
        message: "Plan updated successfully",
        user: updatedUser
      });
    } catch (error: any) {
      console.error("Error updating plan after payment:", error);
      res.status(500).json({ message: "Failed to update plan: " + error.message });
    }
  });

  // Cancel subscription and downgrade to free
  app.post('/api/cancel-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Cancel Stripe subscription if it exists
      if (user.stripeSubscriptionId) {
        try {
          const canceledSubscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          console.log("Stripe subscription canceled:", canceledSubscription.id);
        } catch (stripeError) {
          console.error("Error canceling Stripe subscription:", stripeError);
          return res.status(500).json({ message: "Failed to cancel subscription with Stripe" });
        }
      }

      // Update user to free plan only after successful Stripe cancellation
      const updatedUser = await storage.cancelUserSubscription(userId);
      
      res.json({
        message: "Subscription canceled successfully",
        user: updatedUser
      });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription: " + error.message });
    }
  });

  // Stripe webhook endpoint for payment confirmations
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Find the subscription associated with this payment
        const subscriptions = await stripe.subscriptions.list({
          limit: 100,
        });
        
        const subscription = subscriptions.data.find(sub => {
          const invoice = sub.latest_invoice as Stripe.Invoice;
          return invoice.payment_intent === paymentIntent.id;
        });

        if (subscription) {
          // Find user by customer ID
          const customerId = subscription.customer as string;
          const user = await storage.getUserByStripeCustomerId(customerId);
          
          if (user) {
            // Determine plan based on subscription
            const planMapping: { [key: string]: string } = {
              [process.env.STRIPE_PRO_PRODUCT_ID || '']: 'pro',
              [process.env.STRIPE_ULTIMATE_PRODUCT_ID || '']: 'ultimate',
            };
            
            const subscriptionItem = subscription.items.data[0];
            const price = await stripe.prices.retrieve(subscriptionItem.price.id);
            const plan = planMapping[price.product as string] || 'free';
            
            // Update user plan only after successful payment
            const [updatedUser] = await db
              .update(users)
              .set({
                subscriptionPlan: plan,
                subscriptionStatus: 'active',
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id))
              .returning();
            console.log(`User ${user.id} upgraded to ${plan} plan`);
          }
        }
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription canceled:', deletedSubscription.id);
        
        // Find user by customer ID and downgrade to free
        const canceledCustomerId = deletedSubscription.customer as string;
        const canceledUser = await storage.getUserByStripeCustomerId(canceledCustomerId);
        
        if (canceledUser) {
          await storage.cancelUserSubscription(canceledUser.id);
          console.log(`User ${canceledUser.id} downgraded to free plan`);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
