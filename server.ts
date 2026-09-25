import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { handleRegister, handleLogin, handleGetMe, requireAuth, AuthenticatedRequest } from './server/modules/auth.js';
import { handleGetCriteria, handleUpdateCriterion, handleResetCriteria } from './server/modules/criteriaRoutes.js';
import {
  handleEvaluate,
  handleSaveAssessment,
  handleGetHistory,
  handleGetAssessmentById,
  handleDeleteAssessment,
  handleGetStatsSummary,
} from './server/modules/assessmentRoutes.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'academic_compliance_system_jwt_secret_2026_secure';

app.use(express.json({ limit: '10mb' }));

// Middleware to extract user from token if present (without rejecting if unauthenticated)
const optionalAuth = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // Ignore token failure in optional auth
    }
  }
  next();
};

// --- API Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI-Based Academic Performance and Approval Eligibility Analysis System',
  });
});

// Authentication
app.post('/api/auth/register', handleRegister);
app.post('/api/auth/login', handleLogin);
app.get('/api/auth/me', requireAuth, handleGetMe);

// Criteria Management (Database-driven, not hardcoded)
app.get('/api/criteria/:type', handleGetCriteria);
app.put('/api/criteria/:type/:id', requireAuth, handleUpdateCriterion);
app.post('/api/criteria/:type/reset', requireAuth, handleResetCriteria);

// Assessments
app.post('/api/assessments/evaluate', optionalAuth, handleEvaluate);
app.post('/api/assessments', requireAuth, handleSaveAssessment);
app.get('/api/assessments', requireAuth, handleGetHistory);
app.get('/api/assessments/stats/summary', requireAuth, handleGetStatsSummary);
app.get('/api/assessments/:id', optionalAuth, handleGetAssessmentById);
app.delete('/api/assessments/:id', requireAuth, handleDeleteAssessment);

// --- Vite Integration & Static Serving ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Compliance Analysis System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
