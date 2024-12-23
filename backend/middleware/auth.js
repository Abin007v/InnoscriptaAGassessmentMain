export const validateToken = (req, res, next) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  next();
}; 