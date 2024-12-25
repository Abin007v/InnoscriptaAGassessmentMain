import { validateMsalToken } from '../utils/msalHelper.js';

export const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Validate the token
    const isValid = await validateMsalToken(token);
    if (!isValid) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    // Store token for use in controllers
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(403).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

export { validateToken as authenticateToken }; 