import dotenv from 'dotenv';
import app from './app.js';
import { testDbConnection } from './config/db.js';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    await testDbConnection();
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
