import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BrainCircuit, 
  Code2, 
  LineChart, 
  StickyNote, 
  Sun, 
  Moon, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Tutor', icon: MessageSquare },
  { path: '/quiz', label: 'Quiz Engine', icon: BrainCircuit },
  { path: '/code', label: 'Code Lab', icon: Code2 },
  { path: '/progress', label: 'Progress', icon: LineChart },
  { path: '/notes', label: 'My Notes', icon: StickyNote },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const xp = user?.xp || 240;
  const xpToNext = 500;
  const xpPct = Math.min((xp / xpToNext) * 100, 100);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-top">
        <button className="brand" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
          <motion.div 
            className="brand-icon-wrap"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 32 32" fill="none" className="brand-svg">
              <circle cx="16" cy="16" r="14" fill="url(#brandGrad)" opacity=".2"/>
              <circle cx="16" cy="10" r="3" fill="url(#brandGrad)"/>
              <circle cx="9"  cy="20" r="3" fill="url(#brandGrad)" opacity=".8"/>
              <circle cx="23" cy="20" r="3" fill="url(#brandGrad)" opacity=".8"/>
              <line x1="16" y1="10" x2="9"  y2="20" stroke="url(#brandGrad)" strokeWidth="1.5"/>
              <line x1="16" y1="10" x2="23" y2="20" stroke="url(#brandGrad)" strokeWidth="1.5"/>
              <line x1="9"  y1="20" x2="23" y2="20" stroke="url(#brandGrad)" strokeWidth="1.5" opacity=".5"/>
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6c63ff"/>
                  <stop offset="100%" stopColor="#ff6b9d"/>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                className="brand-name"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                NeuroTutor
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="nav-links">
          {navItems.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <motion.span 
                className="nav-icon"
                whileHover={{ scale: 1.2, color: 'var(--accent-primary)' }}
              >
                <item.icon size={20} strokeWidth={2.2} />
              </motion.span>
              {!collapsed && (
                <motion.span 
                  className="nav-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                >
                  {item.label}
                </motion.span>
              )}
              {!collapsed && <span className="nav-active-dot" />}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="user-info">
          <motion.div 
            className="user-avatar"
            whileHover={{ scale: 1.05 }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
            <span className="avatar-ring" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="user-details"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <span className="user-name">{user?.name || 'Student'}</span>
                <div className="xp-mini">
                  <div className="xp-mini-bar">
                    <motion.div 
                      className="xp-mini-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="xp-mini-label">⭐ {xp} XP · Lv.3</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="sidebar-actions">
          <button className="theme-toggle-btn" onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>
            {!collapsed && <span className="theme-toggle-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>

          {!collapsed && (
            <motion.div 
              className="sidebar-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="certified-badge elite">
                <div className="badge-glow" />
                <Award size={16} className="badge-icon" />
                <div className="badge-text">
                  <span>© 2026 Satyam Shukla</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

