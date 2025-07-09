import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionPlan: varchar("subscription_plan").default("free"), // free, pro, ultimate
  subscriptionStatus: varchar("subscription_status").default("active"), // active, canceled, past_due
  subscriptionPeriodEnd: timestamp("subscription_period_end"),
  subscriptionCancelAtPeriodEnd: boolean("subscription_cancel_at_period_end").default(false),
  subscriptionStartedAt: timestamp("subscription_started_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workouts table
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  time: text("time").notNull(),
  notes: text("notes"),
  overallRating: integer("overall_rating").default(5), // 1-10 scale
  allOutFeeling: integer("all_out_feeling").default(5), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sets table
export const sets = pgTable("sets", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  setNumber: integer("set_number").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  powerBelt: boolean("power_belt").default(false),
  buttUp: boolean("butt_up").default(false),
  assistance: boolean("assistance").default(false),
  failed: boolean("failed").default(false),
  isCheatingSet: boolean("is_cheating_set").default(false),
  formFocused: boolean("form_focused").default(false),
  repFocused: boolean("rep_focused").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSetSchema = createInsertSchema(sets).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Set = typeof sets.$inferSelect;
export type InsertSet = z.infer<typeof insertSetSchema>;

// Workout with sets type
export type WorkoutWithSets = Workout & {
  sets: Set[];
};
