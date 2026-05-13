import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const subjects = [
  { id: 'math', icon: '📐', label: 'Mathematics', color: '#6c63ff', grad: 'linear-gradient(135deg,#6c63ff22,#6c63ff08)' },
  { id: 'cs',   icon: '💻', label: 'Computer Science', color: '#00d4aa', grad: 'linear-gradient(135deg,#00d4aa22,#00d4aa08)' },
  { id: 'science', icon: '🔬', label: 'Science', color: '#ff6b9d', grad: 'linear-gradient(135deg,#ff6b9d22,#ff6b9d08)' },
  { id: 'lang', icon: '📖', label: 'Languages', color: '#ffd166', grad: 'linear-gradient(135deg,#ffd16622,#ffd16608)' },
];

const features = [
  { icon: '🏛️', title: 'Socratic Mode', desc: 'Guides you to answers, never spoils them', color: '#6c63ff' },
  { icon: '💡', title: 'Real Projects', desc: 'End-to-end tasks, not toy examples', color: '#00d4aa' },
  { icon: '😊', title: 'Emotion-Aware', desc: 'Adapts tone when you\'re frustrated', color: '#ff6b9d' },
  { icon: '⚔️', title: 'Peer Debate', desc: 'AI plays devil\'s advocate for you', color: '#ffd166' },
];

const quickActions = [
  { icon: '🤖', label: 'Start AI Session', desc: 'Chat with your tutor', path: '/chat', color: 'var(--accent-primary)', cls: 'btn-primary' },
  { icon: '🧠', label: 'Take a Quiz', desc: 'Test your knowledge', path: '/quiz', color: 'var(--accent-secondary)', cls: 'btn-secondary' },
  { icon: '💻', label: 'Open Code Lab', desc: 'Write & run code', path: '/code', color: 'var(--accent-green)', cls: 'btn-secondary' },
  { icon: '📈', label: 'View Progress', desc: 'Track your journey', path: '/progress', color: 'var(--accent-yellow)', cls: 'btn-secondary' },
];

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function StatCard({ label, value, icon, colorClass, delay }) {
  const num = typeof value === 'number' ? value : parseInt(value) || 0;
  const counted = useCountUp(num, 1000);
  return (
    <div className="stat-card card" style={{ animationDelay: `${delay}ms` }}>
      <div className={`stat-icon-wrap badge-${colorClass}`}>{icon}</div>
      <div className="stat-value">{typeof value === 'number' ? counted : value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ xp: 240, streak: 5, quizzes: 12, sessions: 28, topSubjects: [] });
  const [tilt, setTilt] = useState({});
  const [customTopic, setCustomTopic] = useState('');

  useEffect(() => {
    api.get('/progress/stats').then(r => setStats(r.data)).catch(() => {
      setStats({ xp: user?.xp || 240, streak: 5, quizzes: 12, sessions: 28, topSubjects: [] });
    });
  }, []);

  const getSubjectStyle = (subName) => {
    const presets = {
      'math': { icon: '📐', color: '#6c63ff' },
      'cs': { icon: '💻', color: '#00d4aa' },
      'science': { icon: '🔬', color: '#ff6b9d' },
      'lang': { icon: '📖', color: '#ffd166' }
    };
    return presets[subName.toLowerCase()] || { icon: '📚', color: 'var(--accent-primary)' };
  };

  const displaySubjects = stats.topSubjects && stats.topSubjects.length > 0 
    ? stats.topSubjects.map(s => ({ id: s, label: s, ...getSubjectStyle(s) }))
    : subjects;

  const handleSearch = (e) => {
    e.preventDefault();
    if (customTopic.trim()) {
      navigate(`/chat?subject=${encodeURIComponent(customTopic)}`);
    }
  };

  const handleTilt = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -18;
    setTilt(prev => ({ ...prev, [id]: { x, y } }));
  };
  const resetTilt = (id) => setTilt(prev => ({ ...prev, [id]: { x: 0, y: 0 } }));

  return (
    <div className="dashboard">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content centered">
          <div className="hero-text">
            <p className="hero-greeting">Good to see you back 👋</p>
            <h1 className="hero-name">{user?.name?.split(' ')[0] || 'Learner'}</h1>
            <p className="hero-sub">
              You're on a <span className="streak-chip">🔥 {stats.streak}-day streak</span> — keep the momentum!
            </p>
          </div>
          
          <form className="topic-search-box elite" onSubmit={handleSearch}>
            <div className="search-icon">🔍</div>
            <input 
              type="text" 
              placeholder="What do you want to learn today?" 
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
            />
            <button type="submit" className="btn btn-primary search-btn">Explore Now</button>
          </form>
        </div>
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total XP"     value={stats.xp}       icon="⭐" colorClass="yellow" delay={0} />
        <StatCard label="Day Streak"   value={stats.streak}   icon="🔥" colorClass="pink"   delay={80} />
        <StatCard label="Quizzes Done" value={stats.quizzes}  icon="🧠" colorClass="purple" delay={160} />
        <StatCard label="AI Sessions"  value={stats.sessions} icon="🤖" colorClass="green"  delay={240} />
      </div>

      {/* Subjects */}
      <div className="section-title">✨ Recommended for You</div>
      <div className="subjects-grid">
        {displaySubjects.map(sub => {
          const t = tilt[sub.id] || { x: 0, y: 0 };
          return (
            <button
              key={sub.id}
              className="subject-card"
              style={{
                '--subject-color': sub.color,
                '--subject-grad': `linear-gradient(135deg, ${sub.color}22, ${sub.color}08)`,
                transform: `perspective(600px) rotateX(${t.y}deg) rotateY(${t.x}deg)`,
              }}
              onClick={() => navigate(`/chat?subject=${sub.id}`)}
              onMouseMove={e => handleTilt(e, sub.id)}
              onMouseLeave={() => resetTilt(sub.id)}
            >
              <span className="subject-icon">{sub.icon}</span>
              <span className="subject-label">{sub.label}</span>
              <span className="subject-arrow">→</span>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="section-title">⚡ Quick Actions</div>
      <div className="actions-grid">
        {quickActions.map((a, i) => (
          <button key={i} className="action-card" onClick={() => navigate(a.path)} style={{ '--action-color': a.color }}>
            <span className="action-icon">{a.icon}</span>
            <div className="action-text">
              <span className="action-label">{a.label}</span>
              <span className="action-desc">{a.desc}</span>
            </div>
            <span className="action-arrow">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
