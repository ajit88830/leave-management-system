import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// 🚀 FIX: Define the base URL dynamically
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 🎯 FIXED URL: Use the dynamic base URL
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            
            login(res.data.token, res.data.user.role); // Assuming login function is updated to take role

            if (res.data.user.role === 'manager') navigate('/manager');
            else navigate('/employee');

        } catch (err) {
            alert('Login Failed: ' + (err.response?.data?.msg || err.message));
        }
    };

    return (
        <div className="login-container">
            
            {/* Visual background element for animation */}
            <div className="animated-background"></div>
            
            <div className="login-card">
                <h2 className="login-title">Leave Management System</h2>
                <p className="login-subtitle">Sign in to your dashboard</p>

                <form onSubmit={handleSubmit} className="login-form">
                    
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email"
                            placeholder="e.g., you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className="login-btn">Secure Login</button>
                </form>

                <p className="login-hint">
                    Demo: Use **employee@test.com** or **manager@test.com**<br />
                    Password: **123456**
                </p>
            </div>
        </div>
    );
};

export default Login;