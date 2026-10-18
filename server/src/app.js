import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandlers.js';
import authRouter from './routes/auth.js';
import favoritesRouter from './routes/favorites.js';
import genresRouter from './routes/genres.js';
import healthRouter from './routes/health.js';
import moviesRouter from './routes/movies.js';

// The app is built here and exported; server.js calls listen(). Tests import this file.
const app = express();

// Allow only the frontend origin, not "*".
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/genres', genresRouter);

// Keep these last.
app.use(notFound);
app.use(errorHandler);

export default app;
