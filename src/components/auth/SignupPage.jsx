import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    setErrorMsg('');
    if (password !== confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }
    if (password.length < 8) {
      return setErrorMsg('Password must be at least 8 characters');
    }
    
    const { error } = await signUp(email, password);
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <h2 className="page-title text-center">Create Meridian Account</h2>
        {errorMsg && <div className="text-red text-center meta-text">{errorMsg}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password (min 8 chars)</label>
          <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <button className="btn-primary mt-16" onClick={handleSignup}>Sign Up</button>
        <div className="text-center meta-text" style={{ margin: '8px 0' }}>or</div>
        <button className="btn-primary" style={{ backgroundColor: '#fff', color: '#000', border: '1px solid var(--border)' }} onClick={signInWithGoogle}>Sign up with Google</button>
        <div className="text-center meta-text mt-8">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
