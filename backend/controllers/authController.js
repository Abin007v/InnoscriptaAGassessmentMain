import { AuthService } from '../services/authService.js';
import { EmailSyncService } from '../services/emailSyncService.js';

class AuthController {
  static async register(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Email and password are required' 
        });
      }

      const result = await AuthService.createUser({ email, password });
      res.status(201).json({
        success: true,
        userId: result.userId,
        email: result.email
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({ 
          success: false,
          error: error.message 
        });
      }
      
      if (error.message.includes('password')) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }

      res.status(500).json({ 
        success: false,
        error: 'Registration failed' 
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Email and password are required' 
        });
      }

      const result = await AuthService.loginUser({ email, password });
      res.status(200).json({
        success: true,
        userId: result.userId,
        email: result.email
      });
    } catch (error) {
      console.error('Login error:', error);

      if (error.message.includes('No account found')) {
        return res.status(404).json({ 
          success: false,
          error: error.message 
        });
      }

      if (error.message === 'Invalid password') {
        return res.status(401).json({ 
          success: false,
          error: error.message 
        });
      }

      res.status(500).json({ 
        success: false,
        error: 'Login failed' 
      });
    }
  }

  static async storeOutlookData(req, res) {
    try {
      const { userId, accessToken, outlookEmail, name } = req.body;

      if (!userId || !accessToken || !outlookEmail) {
        return res.status(400).json({
          success: false,
          error: 'Missing required Outlook data'
        });
      }

      console.log('📝 [Backend] Storing Outlook data for user:', userId);

      // Store Outlook data
      await AuthService.updateOutlookData(userId, {
        email: outlookEmail,
        name,
        accessToken
      });

      console.log('✅ [Backend] Outlook data stored, starting sync...');

      try {
        // Start initial email sync
        await EmailSyncService.initialSync(userId, accessToken, outlookEmail);
        
        res.status(200).json({
          success: true,
          message: 'Outlook data stored and sync started'
        });
      } catch (syncError) {
        console.error('❌ [Backend] Sync error:', syncError);
        // Even if sync fails, we've stored the data
        res.status(200).json({
          success: true,
          message: 'Outlook data stored but initial sync failed. Will retry automatically.',
          syncError: syncError.message
        });
      }
    } catch (error) {
      console.error('❌ [Backend] Error storing outlook data:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to store outlook data'
      });
    }
  }
}

export { AuthController }; 