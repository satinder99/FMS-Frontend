// main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import  App  from './App';
import './index.css'; // your existing Tailwind entry file
import StoreVal from './pages/SrtoreVal';


// No AuthProvider wrapper needed — Zustand stores are plain modules,
// not React context, so there's nothing to provide at the tree root.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
    <StoreVal/>
      <App />
      
    </BrowserRouter>
  </React.StrictMode>
);
