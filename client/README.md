# Frontend

React + Vite + MUI app for the TMDB clone. It talks only to our own backend (`../server`).
Setup, environment files, and Docker are explained in the [root README](../README.md).

```bash
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev              # http://localhost:5173
npm run lint
npm test                 # Vitest + React Testing Library
npm run build
```
