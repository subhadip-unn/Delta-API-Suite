/**
 * UserSessionService - Handles user session isolation and data scoping
 * Ensures each user only sees their own data
 */

export interface UserSession {
  userId: string;
  name: string;
  role: string;
  createdAt: string;
  lastActive: string;
}

export class UserSessionService {
  private static readonly SESSION_KEY = 'cbz-user-session';
  private static readonly USER_DATA_PREFIX = 'user_data_';

  /**
   * Get or create a unique user ID based on name and role
   */
  static getUserId(name: string, role: string): string {
    // Create a unique, consistent ID for the user
    const userKey = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${role.toLowerCase().replace(/\s+/g, '')}`;
    return `user_${userKey}_${Date.now().toString(36)}`;
  }

  /**
   * Initialize or restore user session
   */
  static initializeSession(name: string, role: string): UserSession {
    const existingSession = this.getCurrentSession();
    
    if (existingSession && existingSession.name === name && existingSession.role === role) {
      // Update last active time
      const updatedSession = { ...existingSession, lastActive: new Date().toISOString() };
      this.saveSession(updatedSession);
      return updatedSession;
    }

    // Create new session
    const newSession: UserSession = {
      userId: this.getUserId(name, role),
      name,
      role,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    this.saveSession(newSession);
    return newSession;
  }

  /**
   * Get current user session
   */
  static getCurrentSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to parse user session:', error);
      return null;
    }
  }

  /**
   * Save user session
   */
  private static saveSession(session: UserSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Clear user session
   */
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Get user-specific storage key
   */
  static getUserStorageKey(key: string): string {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active user session');
    }
    return `${this.USER_DATA_PREFIX}${session.userId}_${key}`;
  }

  /**
   * Get all user-specific storage keys
   */
  static getUserStorageKeys(): string[] {
    const session = this.getCurrentSession();
    if (!session) return [];

    const userPrefix = `${this.USER_DATA_PREFIX}${session.userId}_`;
    const allKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(userPrefix)) {
        allKeys.push(key);
      }
    }
    
    return allKeys;
  }

  /**
   * Check if a storage key belongs to current user
   */
  static isUserStorageKey(key: string): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;
    
    return key.startsWith(`${this.USER_DATA_PREFIX}${session.userId}_`);
  }

  /**
   * Get user data with proper scoping
   */
  static getUserData(key: string): any {
    try {
      const userKey = this.getUserStorageKey(key);
      const data = localStorage.getItem(userKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get user data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set user data with proper scoping
   */
  static setUserData(key: string, value: any): void {
    try {
      const userKey = this.getUserStorageKey(key);
      localStorage.setItem(userKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set user data for key ${key}:`, error);
    }
  }

  /**
   * Remove user data
   */
  static removeUserData(key: string): void {
    try {
      const userKey = this.getUserStorageKey(key);
      localStorage.removeItem(userKey);
    } catch (error) {
      console.error(`Failed to remove user data for key ${key}:`, error);
    }
  }

  /**
   * Clear all user data (logout)
   */
  static clearAllUserData(): void {
    const userKeys = this.getUserStorageKeys();
    userKeys.forEach(key => localStorage.removeItem(key));
    this.clearSession();
  }

  /**
   * Get storage statistics for current user
   */
  static getUserStorageStats(): { totalItems: number; totalSize: number } {
    const userKeys = this.getUserStorageKeys();
    let totalSize = 0;
    
    userKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });

    return {
      totalItems: userKeys.length,
      totalSize
    };
  }
}
