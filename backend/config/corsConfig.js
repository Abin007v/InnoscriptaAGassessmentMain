const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Last-Sync-Time',
    'Force-Sync'
  ],
  exposedHeaders: ['Last-Sync-Time'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export default corsOptions; 