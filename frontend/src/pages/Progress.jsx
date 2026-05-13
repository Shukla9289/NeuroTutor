import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Progress.css';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mockActivity = [3, 7, 5, 0, 8, 6, 4];
const mockSubjectProgress = [
  { subject: 'Mathematics', progress: 72, color: '#6c63ff' },
  { subject: 'Computer Science', progress: 88, color: '#00d4aa' },
  { subject: 'Science', progress: 45, color: '#ff6b9d' },
  { subject: 'Languages', progress: 60, color: '#ffd166' },
];
const mockBadges = [
  { icon: '🔥', label: '5-Day Streak', unlocked: true },
  { icon: '🧠', label: 'Quiz Master', unlocked: true },
  { icon: '💻', label: 'Code Warrior', unlocked: true },
  { icon: '⭐', label: '500 XP Club', unlocked: false },
  { icon: '🏆', label: 'Top 10%', unlocked: false },
  { icon: '🎓', label: 'Graduation', unlocked: false },
];

export default function Progress() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/progress/full').then(r => setStats(r.data)).catch(() => {
      setStats({ xp: 240, streak: 5, quizzes: 12, sessions: 28, rank: 34 });
    });
  }, []);

  const maxActivity = Math.max(...mockActivity);

  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>Your Progress 📈</h1>
        <p>Track your learning journey, XP, streaks, and mastery</p>
      </div>

      <div className="progress-grid">
        {/* XP + Stats */}
        <div className="card xp-card">
          <div className="xp-header">
            <div>
              <div className="xp-label">Total XP Earned</div>
              <div className="xp-value">⭐ {stats?.xp || 240}</div>
            </div>
            <div className="xp-level">
              <div className="level-badge">Lv. 3</div>
              <div className="level-label">Apprentice</div>
            </div>
          </div>
          <div className="xp-bar-container">
            <div className="xp-progress-bar">
              <div className="xp-progress-fill" style={{ width: '48%' }} />
            </div>
            <span className="xp-next">240 / 500 XP to Level 4</span>
          </div>
        </div>

        {/* Streak */}
        <div className="card streak-card">
          <div className="streak-fire">🔥</div>
          <div className="streak-number">{stats?.streak || 5}</div>
          <div className="streak-label">Day Streak</div>
          <div className="week-grid">
            {weekDays.map((d, i) => (
              <div key={d} className="week-day">
                <div className={`day-dot ${mockActivity[i] > 0 ? 'active' : ''}`} />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity bar chart */}
        <div className="card activity-card">
          <h3>Weekly Activity</h3>
          <div className="bar-chart">
            {mockActivity.map((val, i) => (
              <div key={i} className="bar-col">
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${(val / maxActivity) * 100}%` }} />
                </div>
                <span className="bar-label">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject mastery */}
        <div className="card mastery-card">
          <h3>Subject Mastery</h3>
          <div className="mastery-list">
            {mockSubjectProgress.map(s => (
              <div key={s.subject} className="mastery-item">
                <div className="mastery-top">
                  <span>{s.subject}</span>
                  <span style={{ color: s.color }}>{s.progress}%</span>
                </div>
                <div className="mastery-bar">
                  <div className="mastery-fill" style={{ width: `${s.progress}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="card quick-stats-card">
          <h3>Session Stats</h3>
          <div className="quick-stats">
            <div className="qs"><span className="qs-val">{stats?.sessions || 28}</span><span className="qs-lbl">AI Sessions</span></div>
            <div className="qs"><span className="qs-val">{stats?.quizzes || 12}</span><span className="qs-lbl">Quizzes Done</span></div>
            <div className="qs"><span className="qs-val">#{stats?.rank || 34}</span><span className="qs-lbl">Global Rank</span></div>
            <div className="qs"><span className="qs-val">4.2h</span><span className="qs-lbl">Avg/Week</span></div>
          </div>
        </div>

        {/* Badges */}
        <div className="card badges-card">
          <h3>Achievements 🏅</h3>
          <div className="badges-grid">
            {mockBadges.map((b, i) => (
              <div key={i} className={`badge-item ${b.unlocked ? 'unlocked' : 'locked'}`}>
                <span className="badge-icon">{b.icon}</span>
                <span className="badge-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
