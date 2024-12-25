import esClient from '../config/database.js';
import bcrypt from 'bcryptjs';

class AuthService {
  static async createUser(userData) {
    try {
      // Validate input
      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }

      // Check if user exists
      const existingUser = await esClient.search({
        index: 'users',
        body: {
          query: {
            term: {
              email: userData.email.toLowerCase()
            }
          }
        }
      });

      if (existingUser.hits.total.value > 0) {
        throw new Error('An account with this email already exists');
      }

      // Validate password strength
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const response = await esClient.index({
        index: 'users',
        body: {
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          createdAt: new Date(),
          lastLogin: new Date(),
          isActive: true,
          outlookData: null
        },
        refresh: true
      });

      return {
        success: true,
        userId: response._id,
        email: userData.email
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async loginUser(credentials) {
    try {
      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user
      const response = await esClient.search({
        index: 'users',
        body: {
          query: {
            term: {
              email: email.toLowerCase()
            }
          }
        }
      });

      if (response.hits.total.value === 0) {
        throw new Error('No account found with this email');
      }

      const user = response.hits.hits[0]._source;
      const userId = response.hits.hits[0]._id;

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Update last login
      await esClient.update({
        index: 'users',
        id: userId,
        body: {
          doc: {
            lastLogin: new Date()
          }
        }
      });

      return {
        success: true,
        userId,
        email: user.email
      };
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  static async updateOutlookData(userId, outlookData) {
    try {
      if (!userId || !outlookData.email || !outlookData.accessToken) {
        throw new Error('Missing required Outlook data');
      }

      // Check if user exists
      const userExists = await esClient.exists({
        index: 'users',
        id: userId
      });

      if (!userExists) {
        throw new Error('User not found');
      }

      await esClient.update({
        index: 'users',
        id: userId,
        body: {
          doc: {
            outlookData: {
              email: outlookData.email,
              name: outlookData.name || '',
              accessToken: outlookData.accessToken,
              lastSync: new Date()
            }
          }
        }
      });

      return {
        success: true,
        message: 'Outlook data updated successfully'
      };
    } catch (error) {
      console.error('Error updating outlook data:', error);
      throw error;
    }
  }
}

export { AuthService }; 