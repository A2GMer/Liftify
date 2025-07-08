import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DatabaseService } from './database';
import { verifyToken, createResponse, createErrorResponse } from './auth';
import { z } from 'zod';

const db = new DatabaseService();

// Validation schemas
const createWorkoutSchema = z.object({
  workout: z.object({
    date: z.string(),
    time: z.string().optional(),
    notes: z.string().optional()
  }),
  sets: z.array(z.object({
    setNumber: z.number(),
    weight: z.number(),
    reps: z.number(),
    powerBelt: z.boolean(),
    buttUp: z.boolean(),
    assistance: z.boolean(),
    failed: z.boolean(),
    notes: z.string().optional()
  }))
});

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }
  
  const path = event.path;
  const method = event.httpMethod;
  
  try {
    // Authentication endpoints
    if (path === '/api/auth/user' && method === 'GET') {
      return await handleGetUser(event);
    }
    
    // Workout endpoints
    if (path === '/api/workouts' && method === 'GET') {
      return await handleGetWorkouts(event);
    }
    
    if (path === '/api/workouts' && method === 'POST') {
      return await handleCreateWorkout(event);
    }
    
    if (path.startsWith('/api/workouts/') && method === 'GET') {
      const workoutId = parseInt(path.split('/')[3]);
      return await handleGetWorkout(event, workoutId);
    }
    
    // Analytics endpoints
    if (path === '/api/analytics/user-stats' && method === 'GET') {
      return await handleGetUserStats(event);
    }
    
    if (path === '/api/analytics/daily-volume' && method === 'GET') {
      return await handleGetDailyVolume(event);
    }
    
    // 404 for unknown endpoints
    return createErrorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Handler error:', error);
    return createErrorResponse(500, 'Internal Server Error');
  }
};

async function handleGetUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const cognitoUser = await verifyToken(event);
  
  if (!cognitoUser) {
    return createErrorResponse(401, 'Unauthorized');
  }
  
  try {
    // Upsert user in database
    const user = await db.upsertUser({
      id: cognitoUser.sub,
      email: cognitoUser.email,
      firstName: cognitoUser.given_name,
      lastName: cognitoUser.family_name,
      profileImageUrl: cognitoUser.picture
    });
    
    return createResponse(200, user);
  } catch (error) {
    console.error('Get user error:', error);
    return createErrorResponse(500, 'Failed to get user');
  }
}

async function handleGetWorkouts(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const cognitoUser = await verifyToken(event);
  
  if (!cognitoUser) {
    return createErrorResponse(401, 'Unauthorized');
  }
  
  try {
    const workouts = await db.getWorkoutsByUserId(cognitoUser.sub);
    return createResponse(200, workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    return createErrorResponse(500, 'Failed to get workouts');
  }
}

async function handleCreateWorkout(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const cognitoUser = await verifyToken(event);
  
  if (!cognitoUser) {
    return createErrorResponse(401, 'Unauthorized');
  }
  
  try {
    const body = JSON.parse(event.body || '{}');
    const validatedData = createWorkoutSchema.parse(body);
    
    // Create workout
    const workout = await db.createWorkout({
      userId: cognitoUser.sub,
      date: validatedData.workout.date,
      time: validatedData.workout.time,
      notes: validatedData.workout.notes
    });
    
    // Create sets
    const sets = [];
    for (const setData of validatedData.sets) {
      const set = await db.createSet({
        workoutId: workout.id,
        setNumber: setData.setNumber,
        weight: setData.weight,
        reps: setData.reps,
        powerBelt: setData.powerBelt,
        buttUp: setData.buttUp,
        assistance: setData.assistance,
        failed: setData.failed,
        notes: setData.notes
      });
      sets.push(set);
    }
    
    return createResponse(201, { ...workout, sets });
  } catch (error) {
    console.error('Create workout error:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(400, 'Invalid request data');
    }
    return createErrorResponse(500, 'Failed to create workout');
  }
}

async function handleGetWorkout(event: APIGatewayProxyEvent, workoutId: number): Promise<APIGatewayProxyResult> {
  const cognitoUser = await verifyToken(event);
  
  if (!cognitoUser) {
    return createErrorResponse(401, 'Unauthorized');
  }
  
  try {
    const workout = await db.getWorkoutById(workoutId);
    
    if (!workout) {
      return createErrorResponse(404, 'Workout not found');
    }
    
    // Check if user owns this workout
    if (workout.userId !== cognitoUser.sub) {
      return createErrorResponse(403, 'Forbidden');
    }
    
    return createResponse(200, workout);
  } catch (error) {
    console.error('Get workout error:', error);
    return createErrorResponse(500, 'Failed to get workout');
  }
}

async function handleGetUserStats(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const cognitoUser = await verifyToken(event);
  
  if (!cognitoUser) {
    return createErrorResponse(401, 'Unauthorized');
  }
  
  try {
    const stats = await db.getUserStats(cognitoUser.sub);
    return createResponse(200, stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    return createErrorResponse(500, 'Failed to get user stats');
  }
}

async function handleGetDailyVolume(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const cognitoUser = await verifyToken(event);
  
  if (!cognitoUser) {
    return createErrorResponse(401, 'Unauthorized');
  }
  
  try {
    const days = parseInt(event.queryStringParameters?.days || '30');
    const volumeData = await db.getDailyVolumeStats(cognitoUser.sub, days);
    return createResponse(200, volumeData);
  } catch (error) {
    console.error('Get daily volume error:', error);
    return createErrorResponse(500, 'Failed to get daily volume stats');
  }
}