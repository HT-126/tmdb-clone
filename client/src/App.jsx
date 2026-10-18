import {
  BrowserRouter,
} from "react-router-dom";

import { QueryClientProvider } from
  "@tanstack/react-query";

import { queryClient } from
  "./app/queryClient";

import FavoritesProvider from
  "./contexts/FavoritesProvider";

import Router from "./routes";
import "./App.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FavoritesProvider>
          <Router />
        </FavoritesProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
