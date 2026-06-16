import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg('');
    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg('Invalid credentials');
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <h2 className="page-title text-center">Meridian Sign In</h2>
        {errorMsg && <div className="text-red text-center meta-text">{errorMsg}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn-primary mt-16" onClick={handleLogin}>Sign In</button>
        <div className="text-center meta-text" style={{ margin: '8px 0' }}>or</div>
        <button className="btn-primary" style={{ backgroundColor: '#fff', color: '#000', border: '1px solid var(--border)' }} onClick={signInWithGoogle}>Sign in with Google</button>
        <div className="text-center meta-text mt-8">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};
