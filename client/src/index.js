// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // ó 'react-dom' si usas v17
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
