// src/App.js
import React, { useState } from 'react';
import Login from './login/Login';
import './App.css';

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <div className="app-container">
      {!isAuth ? (
        <Login onSuccess={() => setIsAuth(true)} />
      ) : (
        <div className="success-container">
          <h1>¡Inicio de sesión exitoso!</h1>
        </div>
      )}
    </div>
  );
}

export default App;
