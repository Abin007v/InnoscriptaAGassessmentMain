import { AuthService } from '../services/authService.js';

class AuthController {
  static async register(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.createUser({ email, password });
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'User already exists') {
        res.status(409).json({ error: 'User already exists' });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser({ email, password });
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'User not found' || error.message === 'Invalid password') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    }
  }
}

export { AuthController }; 