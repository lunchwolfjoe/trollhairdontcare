import { supabase } from '../supabaseClient';
import { ApiResponse, handleError } from './api';
import { Profile } from '../types/models';
import type { User, Session } from '@supabase/supabase-js';

/**
 * User registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

/**
 * Login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * User session data
 */
export type SessionData = Session;

/**
 * Check if we're in development mode
 */
const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

/**
 * Service for handling authentication operations
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<ApiResponse<SessionData>> {
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name || '',
          },
        },
      });

      if (signUpError) {
        return {
          data: null,
          error: handleError(signUpError),
        };
      }

      // If no session was created and we're in development, try to manually confirm
      if (!authData.session && isDevelopment && authData.user) {
        console.log('Development mode: Attempting to auto-confirm email...');
        
        try {
          // Try to manually confirm email using a direct SQL query
          // This is safe to do only in development environments
          const confirmResult = await this.confirmEmailForDevelopment(authData.user.id);
          
          if (confirmResult.error) {
            console.warn('Could not auto-confirm email:', confirmResult.error);
          } else {
            console.log('Email auto-confirmed successfully in development mode');
            
            // Try signing in now that the email is confirmed
            const signInResult = await this.login({
              email: data.email,
              password: data.password
            });
            
            if (signInResult.data) {
              return signInResult;
            }
          }
        } catch (confirmErr) {
          console.warn('Error in auto-confirmation process:', confirmErr);
        }
      }

      // If no session was created, the user probably needs to confirm their email
      if (!authData.session) {
        return {
          data: null,
          error: {
            name: 'ApiError',
            status: 401,
            message: isDevelopment 
              ? 'Email confirmation required. In production, check your email. For development, see sql-solutions.md for workarounds.'
              : 'Please check your email to confirm your account',
          },
        };
      }

      return {
        data: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
      };
    }
  }

  /**
   * Log in an existing user
   */
  async login(data: LoginData): Promise<ApiResponse<SessionData>> {
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        // If login failed due to email confirmation and we're in development
        if (isDevelopment && signInError.message.includes('Email not confirmed')) {
          // Try to look up the user
          /* // Commenting out direct auth.users query
          const { data: userData } = await supabase
            .from('auth.users') 
            .select('id')
            .eq('email', data.email)
            .single();
            
          if (userData?.id) {
            console.log('Development mode: Attempting to auto-confirm email...');
            const confirmResult = await this.confirmEmailForDevelopment(userData.id);
            
            if (!confirmResult.error) {
              console.log('Email auto-confirmed, retrying login...');
              // Retry login
              return this.login(data);
            }
          }
          */
        }
        
        return {
          data: null,
          error: handleError(signInError),
        };
      }

      return {
        data: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
      };
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          data: null,
          error: handleError(error),
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<ApiResponse<SessionData>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return {
          data: null,
          error: handleError(error),
        };
      }

      if (!session) {
        return {
          data: null,
          error: {
            name: 'ApiError',
            status: 401,
            message: 'No active session',
          },
        };
      }

      return {
        data: session,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
      };
    }
  }

  /**
   * Send a password reset email
   */
  async resetPassword(email: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          data: null,
          error: handleError(error),
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
      };
    }
  }

  /**
   * Update password with reset token
   */
  async updatePassword(password: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return {
          data: null,
          error: handleError(error),
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error),
      };
    }
  }

  /**
   * Check if a user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.getSession();
    return !!data;
  }

  /**
   * DEVELOPMENT ONLY: Confirm a user's email directly in the database
   * This should only be used in development as it requires direct database access
   */
  private async confirmEmailForDevelopment(userId: string): Promise<ApiResponse<null>> {
    if (!isDevelopment) {
      console.error('This method should only be called in development environments');
      return {
        data: null,
        error: {
          name: 'ApiError',
          status: 403,
          message: 'Method not available in production'
        }
      };
    }

    try {
      // Execute a SQL query to update the email_confirmed_at field
      // Note: This requires using the service_role key with enough permissions
      const { error } = await supabase.rpc('confirm_user_email', {
        user_id: userId
      });

      if (error) {
        console.error('Error confirming email:', error);
        return {
          data: null,
          error: handleError(error)
        };
      }

      return {
        data: null,
        error: null
      };
    } catch (error) {
      console.error('Error in confirmEmailForDevelopment:', error);
      return {
        data: null,
        error: handleError(error)
      };
    }
  }

  /**
   * Create a test user with pre-confirmed email
   * Only for development/testing purposes
   */
  async createTestUser(email: string, password: string, fullName = 'Test User'): Promise<ApiResponse<SessionData>> {
    if (!isDevelopment) {
      return {
        data: null,
        error: {
          name: 'ApiError',
          status: 403,
          message: 'Test users can only be created in development mode'
        }
      };
    }

    try {
      // First register the user normally
      const { data, error } = await this.register({
        email,
        password,
        full_name: fullName
      });

      if (error && !error.message.includes('confirmation')) {
        return { data: null, error };
      }

      // If we get here, either:
      // 1. The user was created successfully with a session (unlikely with email confirmation enabled)
      // 2. The user was created but needs email confirmation
      // 3. The user already exists

      // Try to sign in to see if the user exists and is confirmed
      const signInResult = await this.login({ email, password });
      if (!signInResult.error) {
        return signInResult;
      }

      // If we couldn't sign in, try to confirm the email
      /* // Commenting out direct auth.users query
      const { data: userData } = await supabase
        .from('auth.users') 
        .select('id')
        .eq('email', email)
        .single();

      if (userData?.id) {
        await this.confirmEmailForDevelopment(userData.id);
        
        // Try signing in again
        return this.login({ email, password });
      }
      */

      return {
        data: null,
        error: {
          name: 'ApiError',
          status: 500,
          message: 'Failed to create or confirm test user'
        }
      };
    } catch (error) {
      return {
        data: null,
        error: handleError(error)
      };
    }
  }
}

// Create a singleton instance
export const authService = new AuthService(); 