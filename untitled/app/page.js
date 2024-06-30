'use client';
import React, { useState } from 'react';

const handleLogin = async (event) => {
  event.preventDefault();

  const username = event.target.username ? event.target.username.value : undefined;
  const password = event.target.password ? event.target.password.value : undefined;

  const response = await fetch('http://localhost:8080/auth/login', {
    method: 'POST', credentials: 'include', headers: {
      'Content-Type': 'application/json'
    }, body: JSON.stringify({
      username, password
    })
  });

  if (response.ok) {
    console.log(response);
    localStorage.setItem('accessoEffettuato', true);
    const data = await response;
    console.log('Risposta del server:', data);
    console.log('Login effettuato con successo');
    window.location.replace("/user");
  } else {
    const text = await response.text();
    console.log('Errore del server:', text);
    console.error('Errore durante il login');
  }
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
      <main>
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>
            Password:
            <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </main>
  );
}