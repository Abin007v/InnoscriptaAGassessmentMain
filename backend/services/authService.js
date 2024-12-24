import esClient from '../config/database.js';
import bcrypt from 'bcryptjs';

class AuthService {
  static async createUser(userData) {
    try {
      // Check if user exists
      const existingUser = await esClient.search({
        index: 'users',
        body: {
          query: {
            term: {
              email: userData.email
            }
          }
        }
      });

      if (existingUser.hits.total.value > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const response = await esClient.index({
        index: 'users',
        body: {
          email: userData.email,
          password: hashedPassword,
          createdAt: new Date(),
          lastLogin: new Date(),
          isActive: true
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

      // Find user
      const response = await esClient.search({
        index: 'users',
        body: {
          query: {
            term: {
              email: email
            }
          }
        }
      });

      if (response.hits.total.value === 0) {
        throw new Error('User not found');
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
}

export { AuthService }; 