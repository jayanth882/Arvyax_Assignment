import { useState } from 'react';

function Auth({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center' }}>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
          style={{ padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }}
        />
        
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          style={{ padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Sign Up')}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setIsLoginMode(!isLoginMode); setError(''); }}
          style={{ color: '#2196F3', textDecoration: 'none' }}
        >
          {isLoginMode ? 'Sign Up' : 'Login'}
        </a>
      </p>
    </div>
  );
}

export default Auth;
