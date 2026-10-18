import app from './app.js';
import { env } from './config/env.js';

// Express 5 passes a startup error (for example "port in use") to this callback.
app.listen(env.PORT, (err) => {
  if (err) {
    console.error('Cannot start server:', err.message);
    process.exit(1);
  }
  console.log(`Backend listening on port ${env.PORT}`);
});
