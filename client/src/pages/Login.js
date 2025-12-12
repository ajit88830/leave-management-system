import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // <-- ADD THIS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.token);

      if (res.data.user.role === 'manager') navigate('/manager');
      else navigate('/employee');

    } catch (err) {
      alert('Login Failed: ' + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <div className="login-container">
      
      <div className="login-card">
        <h2 className="login-title">Leave Management System</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />

          <label>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="login-hint">
          Use <b>employee@test.com</b> or <b>manager@test.com</b><br />
          Password: <b>123456</b>
        </p>
      </div>
    </div>
  );
};

export default Login;
