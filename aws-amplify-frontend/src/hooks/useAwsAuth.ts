import { useState, useEffect } from 'react';
import { authService, CognitoUser } from '../lib/aws-auth';

export function useAwsAuth() {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      await checkAuthState();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, attributes?: Record<string, string>) => {
    try {
      const result = await authService.signUp(email, password, attributes);
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    try {
      await authService.confirmSignUp(email, code);
      await checkAuthState();
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const forgotPasswordSubmit = async (email: string, code: string, newPassword: string) => {
    try {
      return await authService.forgotPasswordSubmit(email, code, newPassword);
    } catch (error) {
      console.error('Forgot password submit error:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    forgotPassword,
    forgotPasswordSubmit,
    checkAuthState
  };
}