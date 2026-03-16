import { useState, useEffect } from 'react';
import Auth from './Auth';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [text, setText] = useState("");
  const [ambience, setAmbience] = useState("forest");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchInsights();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/journal/${user.id}`);
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      console.error("Failed to fetch entries", e);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch(`/api/journal/insights/${user.id}`);
      const data = await res.json();
      setInsights(data);
    } catch (e) {
      console.error("Failed to fetch insights", e);
    }
  };

  const handleAnalyze = async (entry) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: entry.id, text: entry.text })
      });
      const data = await res.json();
      
      fetchEntries();
      fetchInsights();
      alert(`Emotion: ${data.emotion}\nKeywords: ${data.keywords?.join(', ')}\nSummary: ${data.summary}`);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze text");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Analyze text to extract emotion and keywords to store them in DB for insights
      const analyzeRes = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const analysisData = await analyzeRes.json();

      await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: user.id, 
          ambience, 
          text,
          emotion: analysisData.emotion,
          keywords: analysisData.keywords
        })
      });
      setText("");
      fetchEntries();
      fetchInsights();
    } catch (e) {
      console.error("Failed to submit entry", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEntries([]);
    setInsights(null);
  };

  if (!user) {
    return (
      <div>
        <h1 style={{ textAlign: 'center', marginTop: '40px' }}>AI-Assisted Journal System</h1>
        <Auth onLogin={setUser} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>AI-Assisted Journal System</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Welcome, <strong>{user.username}</strong></span>
          <button 
            onClick={handleLogout} 
            style={{ backgroundColor: '#f44336', marginTop: 0, padding: '8px 15px', fontSize: '0.9rem' }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="card">
        <h2>Write Journal Entry</h2>
        <form onSubmit={handleSubmit}>
          <label>Ambience:</label>
          <select value={ambience} onChange={(e) => setAmbience(e.target.value)}>
            <option value="forest">Forest 🌲</option>
            <option value="ocean">Ocean 🌊</option>
            <option value="mountain">Mountain ⛰️</option>
          </select>
          <label>Journal Text:</label>
          <textarea 
            rows="4" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="How do you feel after the session?"
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving & Analyzing...' : 'Submit Entry'}
          </button>
        </form>
      </div>

      {insights && (
        <div className="card">
          <h2>Insights for {user.username}</h2>
          <p><strong>Total Entries:</strong> {insights.totalEntries}</p>
          <p><strong>Current Emotion:</strong> {entries.length > 0 ? (entries[0].emotion || 'Pending') : 'None'}</p>
          <p><strong>Top Emotion:</strong> {insights.topEmotion}</p>
          <p><strong>Most Used Ambience:</strong> {insights.mostUsedAmbience}</p>
          <p><strong>Recent Keywords:</strong> {insights.recentKeywords?.join(', ')}</p>
        </div>
      )}

      <div className="card">
        <h2>Previous Entries</h2>
        {entries.length === 0 ? <p>No entries yet.</p> : (
          entries.map((entry, index) => (
            <div key={entry.id || index} className="entry-item">
              <p><strong>Date:</strong> {new Date(entry.date).toLocaleString()} &nbsp;&bull;&nbsp; <strong>Ambience:</strong> {entry.ambience}</p>
              <p>"{entry.text}"</p>
              {entry.emotion && (
                <p style={{fontSize: '14px', color: '#666'}}>
                  <em>Emotion: {entry.emotion}</em> &nbsp;&bull;&nbsp; <em>Keywords: {entry.keywords?.join(', ')}</em>
                </p>
              )}
              <button 
                onClick={() => handleAnalyze(entry)} 
                disabled={isAnalyzing}
                className="analyze-btn"
              >
                Analyze Again
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
