import { API_BASE_URL } from '../config';

export const authService = {
  async register(userData) {
    try {
      // Validate email format
      if (!this.isValidEmail(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      sessionStorage.setItem('userId', data.userId);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  },

  async login(credentials) {
    try {
      // Validate email format
      if (!this.isValidEmail(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password presence
      if (!credentials.password) {
        throw new Error('Password is required');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No account found with this email');
        } else if (response.status === 401) {
          throw new Error('Invalid password');
        }
        throw new Error(data.error || 'Login failed');
      }

      sessionStorage.setItem('userId', data.userId);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  },

  async linkMicrosoftAccount(userId, accessToken, outlookEmail) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/link-microsoft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          outlookEmail,
          accessToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link Microsoft account');
      }

      return data;
    } catch (error) {
      console.error('Microsoft account linking error:', error);
      throw new Error(error.message || 'Failed to link Microsoft account');
    }
  },

  async verifySession() {
    const userId = sessionStorage.getItem('userId');
    const accessToken = sessionStorage.getItem('accessToken');

    if (!userId || !accessToken) {
      throw new Error('No active session');
    }

    return { userId, accessToken };
  },

  async storeOutlookData(userId, accessToken, outlookEmail, name) {
    try {
      if (!userId || !accessToken || !outlookEmail) {
        throw new Error('Missing required data for Outlook connection');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/store-outlook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          accessToken,
          outlookEmail,
          name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to store outlook data');
      }

      return data;
    } catch (error) {
      console.error('Store outlook data error:', error);
      throw new Error(error.message || 'Failed to store outlook data');
    }
  },

  // Helper method to validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}; 