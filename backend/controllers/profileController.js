import { ProfileService } from '../services/profileService.js';

class ProfileController {
  static async getProfile(req, res) {
    try {
      const token = req.token;
      const profile = await ProfileService.getUserProfile(token);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default ProfileController; 