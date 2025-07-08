import { Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Configure Amplify
Auth.configure(awsconfig);

export interface CognitoUser {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export class AuthService {
  async getCurrentUser(): Promise<CognitoUser | null> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return {
        sub: user.attributes.sub,
        email: user.attributes.email,
        given_name: user.attributes.given_name,
        family_name: user.attributes.family_name,
        picture: user.attributes.picture
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const user = await Auth.signIn(email, password);
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, attributes: Record<string, string> = {}): Promise<any> {
    try {
      const user = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          ...attributes
        }
      });
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async confirmSignUp(email: string, code: string): Promise<any> {
    try {
      const result = await Auth.confirmSignUp(email, code);
      return result;
    } catch (error) {
      console.error('Error confirming sign up:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const result = await Auth.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Error initiating password reset:', error);
      throw error;
    }
  }

  async forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<any> {
    try {
      const result = await Auth.forgotPasswordSubmit(email, code, newPassword);
      return result;
    } catch (error) {
      console.error('Error submitting new password:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();