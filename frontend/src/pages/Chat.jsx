import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Chat.css';

const MODES = [
  { id: 'tutor',    label: 'Tutor',    emoji: '📚', desc: 'Explains concepts clearly',  color: '#6c63ff' },
  { id: 'socratic', label: 'Socratic', emoji: '🏛️', desc: 'Guides without spoiling',    color: '#00d4aa' },
  { id: 'debate',   label: 'Debate',   emoji: '⚔️', desc: "Devil's advocate mode",      color: '#ff6b9d' },
  { id: 'project',  label: 'Project',  emoji: '🚀', desc: 'Real-world projects',         color: '#ffd166' },
  { id: 'communication', label: 'Comm Lab', emoji: '🎙️', desc: 'Improve English & Rating', color: '#0ea5e9' },
];

const SUBJECT_HIERARCHY = {
  "School": {
    "Class 6-10": ["Mathematics", "Science", "Social Science", "English", "Hindi"],
    "Class 11-12 (Science)": ["Physics", "Chemistry", "Mathematics", "Biology"],
    "Class 11-12 (Commerce)": ["Accounts", "Economics", "Business Studies"],
    "Class 11-12 (Humanities)": ["History", "Political Science", "Sociology"]
  },
  "Engineering": {
    "Computer Science": ["OOPS", "Data Structures", "DBMS", "AI/ML", "OS"],
    "Electronics": ["Circuits", "Digital Electronics", "Microprocessors"],
    "Mechanical": ["Thermodynamics", "Fluid Mechanics"],
    "Civil": ["Structural Analysis", "Construction"]
  },
  "Professional": {
    "CA Foundation": ["Principles of Accounting", "Business Laws", "Business Math & Stats", "Business Economics"],
    "CA Intermediate": ["Taxation", "Audit & Assurance", "Costing", "Advanced Accounting"],
    "Banking": ["Quantitative Aptitude", "Reasoning Ability", "Banking Awareness"],
    "Medical (NEET)": ["Anatomy", "Physiology", "Biochemistry"]
  },
  "Competitive": {
    "UPSC/IAS": ["Indian Polity", "Geography", "Indian Economy", "Modern History"],
    "General": ["Current Affairs", "General Knowledge", "Aptitude Training"]
  }
};

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, '<br/>');
}

function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`} style={{ animationDelay: `${index * 20}ms` }}>
      <div className={`msg-avatar ${isUser ? 'user-av' : 'ai-av'}`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="msg-bubble">
        <div className="msg-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
        <div className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [params] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('tutor');
  
  // Hierarchical State
  const [category, setCategory] = useState("School");
  const [subCategory, setSubCategory] = useState("Class 6-10");
  const [subject, setSubject] = useState(params.get('subject') || 'Mathematics');
  
  const [listening, setListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const targetSubject = params.get('subject');
    if (targetSubject) {
      // Find where this subject belongs in the hierarchy
      let found = false;
      Object.entries(SUBJECT_HIERARCHY).forEach(([cat, subCats]) => {
        Object.entries(subCats).forEach(([subCat, subjects]) => {
          if (subjects.includes(targetSubject) || subjects.some(s => targetSubject.toLowerCase().includes(s.toLowerCase()))) {
            if (!found) {
              setCategory(cat);
              setSubCategory(subCat);
              setSubject(targetSubject);
              found = true;
            }
          }
        });
      });
      if (!found) setSubject(targetSubject); // Fallback for custom topics
    }
  }, [params]);

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: `Hello! I'm your AI tutor for **${subject}**. Choose a mode and ask me anything! 🎓`, timestamp: Date.now() }
    ]);
  }, [subject]);

  // Sync subCategory when category changes
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const firstSub = Object.keys(SUBJECT_HIERARCHY[cat])[0];
    setSubCategory(firstSub);
    setSubject(SUBJECT_HIERARCHY[cat][firstSub][0]);
  };

  // Sync subject when subCategory changes
  const handleSubCategoryChange = (sub) => {
    setSubCategory(sub);
    setSubject(SUBJECT_HIERARCHY[category][sub][0]);
  };

  const speak = (text) => {
    if (!isVoiceEnabled) return;
    // Strip markdown for speaking
    const cleanText = text.replace(/---[\s\S]*?---|\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => { 
    if (messages.length > 2) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chat/message', { message: userInput, mode, subject, history: messages.slice(-10) });
      const reply = res.data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
      
      // AI Speaks
      speak(reply);

      // Reward logic for Comm Lab
      if (mode === 'communication' && reply.includes('[Rating:')) {
        const ratingMatch = reply.match(/\[Rating:\s*(\d+)\/10\]/);
        if (ratingMatch) {
          const score = parseInt(ratingMatch[1]);
          if (score >= 5) {
            // FIX: Corrected endpoint path (removed double /api)
            api.post('/progress/xp/add', { amount: score * 2 }).catch(() => {});
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please check the backend server is running.', timestamp: Date.now() }]);
    } finally { setLoading(false); }
  };

  const saveToNotes = async () => {
    if (messages.length <= 1) return alert('No conversation to save!');
    const content = messages.map(m => `**${m.role === 'user' ? 'Me' : 'AI'}**: ${m.content}`).join('\n\n');
    try {
      const res = await api.post('/notes', {
        title: `Chat Session: ${subject} (${new Date().toLocaleDateString()})`,
        content: content,
        category: subject // Subject-wise categorization
      });
      console.log("Note saved successfully:", res.data);
      alert('Conversation saved to My Notes! 📝');
    } catch (err) {
      console.error("Failed to save note:", err);
      alert(`Failed to save note: ${err.message}`);
    }
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice not supported');
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onresult = e => setInput(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const activeMode = MODES.find(m => m.id === mode);

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="page-header">
          <h1>AI Tutor</h1>
          <p>Your intelligent learning companion</p>
        </div>
        <div className="chat-settings">
          <div className="settings-group">
            <label className="settings-label">Tutor Mode</label>
            <div className="mode-list">
              {MODES.map(m => (
                <button key={m.id} className={`mode-btn ${mode === m.id ? 'active' : ''}`}
                  onClick={() => setMode(m.id)} style={{ '--mode-color': m.color }}>
                  <span className="mode-emoji">{m.emoji}</span>
                  <span className="mode-text">
                    <span className="mode-label">{m.label}</span>
                    <small>{m.desc}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="settings-group">
            <label className="settings-label">1. Field</label>
            <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
              {Object.keys(SUBJECT_HIERARCHY).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="settings-group">
            <label className="settings-label">2. Class / Group</label>
            <select value={subCategory} onChange={e => handleSubCategoryChange(e.target.value)}>
              {Object.keys(SUBJECT_HIERARCHY[category]).map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div className="settings-group">
            <label className="settings-label">3. Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECT_HIERARCHY[category][subCategory].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="sidebar-actions-vertical">
          <button 
            className={`btn voice-toggle-btn ${isVoiceEnabled ? 'on' : 'btn-secondary'}`} 
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
          >
            {isVoiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>
          <button className="btn btn-secondary clear-btn" onClick={() => setMessages([])}>
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-main-header">
          <div className="chat-mode-badge" style={{ '--mode-color': activeMode?.color }}>
            <span>{activeMode?.emoji} {activeMode?.label} Mode</span>
          </div>
          <div className="chat-header-actions">
            <span className="chat-subject-tag">{subject}</span>
            <button className="btn btn-secondary save-note-btn" onClick={saveToNotes}>
              📝 Save as Note
            </button>
          </div>
        </div>

        <div className="messages-area">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} index={i} />)}
          {loading && (
            <div className="message-row assistant">
              <div className="msg-avatar ai-av">🤖</div>
              <div className="msg-bubble typing"><span/><span/><span/></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <div className="input-wrapper">
            <textarea ref={textareaRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for new line)" rows={2} />
            <div className="input-actions">
              <button className={`icon-btn voice-btn ${listening ? 'listening' : ''}`} onClick={startVoice} title="Voice input">🎤</button>
              <button className="icon-btn send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
