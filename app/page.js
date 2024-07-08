'use client';
import React, {useState} from 'react';
import classes from "./page.module.css";

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
        window.location.href = 'http://localhost:3000/table';
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
        <>
            <div className={classes.container}>
                <div className={classes.loginBox}>
                    <h2>Enter your credentials</h2>
                    <form onSubmit={handleLogin}>
                        <div className={classes.userBox}>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                            <label>Username</label>
                        </div>
                        <div className={classes.userBox}>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <label>Password</label>
                        </div>
                        <input className={classes.loginButton} type="submit" value="login"/>
                    </form>
                </div>
            </div>
        </>
    );
}
