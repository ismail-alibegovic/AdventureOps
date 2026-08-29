import express from 'express';
import path from 'path';
import { apiRouter } from './server/routes/api';
import { getDatabase, ensureDemoFutureDepartures, saveDatabase } from './server/db/database';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || '0.0.0.0';

  // Initialize DB and ensure rolling 30-day demo departure availability
  const db = getDatabase();
  const addedDepartures = ensureDemoFutureDepartures(db);
  if (addedDepartures > 0) {
    saveDatabase(db);
    console.log(`[Demo Seed Maintenance] Added ${addedDepartures} rolling future departures across next 30 days.`);
  } else {
    console.log(`[Demo Seed Maintenance] 30-day rolling departure window is verified and up-to-date.`);
  }

  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Neretva Rafting Konjic Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Neretva Rafting Konjic Platform running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
