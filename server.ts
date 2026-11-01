import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'HRMS Corporate Enterprise REST API',
    version: '2.6.0',
    database: 'MySQL 8.0 Ready',
    timestamp: new Date().toISOString(),
  });
});

// API Info & Endpoints summary
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'HRMS REST API Service',
    modules: [
      '/api/employees',
      '/api/attendance',
      '/api/leave-requests',
      '/api/payroll',
      '/api/departments',
      '/api/work-plans',
      '/api/job-vacancies',
      '/api/audit-logs',
    ],
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

export default app;
