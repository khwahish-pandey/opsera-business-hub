import app from './app';
import { config } from './config';
import { seedDatabaseIfNeeded } from './utils/seed';

const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`🚀 NEXORA ERP Backend running on port ${PORT} [Env: ${config.nodeEnv}]`);
  await seedDatabaseIfNeeded();
});
