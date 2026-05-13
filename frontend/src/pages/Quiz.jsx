import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Quiz.css';

const SUBJECTS = ['Mathematics', 'Computer Science', 'Science', 'Languages'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const DEMO_QUESTIONS = [
  { question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1, explanation: '2+2=4 is basic arithmetic.' },
  { question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Unit', 'Core Processing Unit', 'Central Power Unit'], correct: 0, explanation: 'CPU = Central Processing Unit.' },
  { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correct: 2, explanation: '12 × 12 = 144' },
  { question: 'Which language runs in browsers?', options: ['Python', 'Java', 'JavaScript', 'C++'], correct: 2, explanation: 'JavaScript is the native browser scripting language.' },
  { question: 'What is H2O?', options: ['Hydrogen gas', 'Water', 'Oxygen', 'Helium'], correct: 1, explanation: 'H2O is the chemical formula for water.' },
];

function Confetti() {
  const colors = ['#6c63ff','#ff6b9d','#00d4aa','#ffd166','#38bdf8'];
  return (
    <div className="confetti-container" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 1.5}s`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

export default function Quiz() {
  const [params] = useSearchParams();
  const [setup, setSetup] = useState({ 
    subject: params.get('subject') || 'General Knowledge', 
    difficulty: 'Beginner', 
    count: 5 
  });
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    if (quiz && !done && selected === null) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleAnswer(-1); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [current, quiz, done]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.post('/quiz/generate', setup);
      setQuiz(res.data.questions);
    } catch {
      setQuiz(DEMO_QUESTIONS);
    } finally {
      setCurrent(0); setAnswers([]); setSelected(null); setDone(false); setLoading(false);
    }
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setAnswers(prev => [...prev, { question: current, selected: idx, correct: quiz[current].correct }]);
  };

  const next = () => {
    if (current + 1 >= quiz.length) { 
      setDone(true); 
      // Add XP: 1 point per correct answer
      const finalScore = answers.filter(a => a.selected === a.correct).length;
      if (finalScore > 0) {
        api.post('/progress/xp/add', { amount: finalScore }).catch(() => {});
      }
      return; 
    }
    setCurrent(c => c + 1);
    setSelected(null);
  };

  const score = answers.filter(a => a.selected === a.correct).length;

  if (!quiz) return (
    <div className="quiz-setup">
      <div className="page-header">
        <h1>Quiz Engine 🧠</h1>
        <p>Adaptive quizzes powered by AI — spaced repetition algorithm</p>
      </div>
      <div className="card setup-card">
        <h3>Configure Your Quiz</h3>
        <div className="setup-fields">
          <div className="field-group">
            <label>Subject Topic</label>
            <input 
              type="text" 
              className="subject-input"
              placeholder="e.g. CA Foundation, Physics, Marketing..."
              value={setup.subject}
              onChange={e => setSetup(p => ({ ...p, subject: e.target.value }))}
            />
          </div>
          <div className="field-group">
            <label>Difficulty</label>
            <div className="chip-group">
              {DIFFICULTIES.map(d => (
                <button key={d} className={`chip diff-chip diff-${d.toLowerCase()} ${setup.difficulty === d ? 'active' : ''}`}
                  onClick={() => setSetup(p => ({ ...p, difficulty: d }))}>{d}</button>
              ))}
            </div>
          </div>
          <div className="field-group">
            <label>Questions: <strong>{setup.count}</strong></label>
            <div className="range-wrap">
              <input type="range" min="3" max="15" value={setup.count}
                onChange={e => setSetup(p => ({ ...p, count: +e.target.value }))} />
              <div className="range-track"><div className="range-fill" style={{ width: `${((setup.count - 3) / 12) * 100}%` }} /></div>
            </div>
          </div>
          <button className="btn btn-primary start-btn" onClick={startQuiz} disabled={loading}>
            {loading ? '⏳ Generating...' : '🚀 Start Quiz'}
          </button>
        </div>
      </div>
    </div>
  );

  if (done) {
    const pct = Math.round((score / quiz.length) * 100);
    const isGreat = pct >= 80;
    return (
      <div className="quiz-result">
        {isGreat && <Confetti />}
        <div className="card result-card">
          <div className="result-emoji">{pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '📚'}</div>
          <h2>Quiz Complete!</h2>
          <div className="result-score-ring">
            <svg viewBox="0 0 120 120" className="score-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8"/>
              <circle cx="60" cy="60" r="52" fill="none"
                stroke={pct >= 60 ? 'var(--accent-green)' : 'var(--accent-secondary)'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52 * pct / 100} ${2 * Math.PI * 52}`}
                strokeDashoffset={2 * Math.PI * 52 * 0.25}
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="score-inner">
              <span className="score-num">{pct}%</span>
              <span className="score-sub">{score}/{quiz.length}</span>
            </div>
          </div>
          <p className="result-msg">{pct >= 80 ? 'Excellent work! 🎉' : pct >= 60 ? 'Good effort! Keep practicing.' : 'Review the material and try again!'}</p>
          <div className="result-review">
            {answers.map((a, i) => (
              <div key={i} className={`review-item ${a.selected === a.correct ? 'correct' : 'wrong'}`}>
                <span>{a.selected === a.correct ? '✅' : '❌'} Q{i + 1}: {quiz[i].question}</span>
                {a.selected !== a.correct && <small>💡 {quiz[i].explanation}</small>}
              </div>
            ))}
          </div>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => setQuiz(null)}>🔄 New Quiz</button>
            <button className="btn btn-secondary" onClick={() => { setCurrent(0); setAnswers([]); setSelected(null); setDone(false); }}>↩ Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz[current];
  const timerPct = (timeLeft / 30) * 100;
  return (
    <div className="quiz-active">
      <div className="quiz-header">
        <div className="quiz-progress-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(current / quiz.length) * 100}%` }} />
          </div>
          <span className="progress-label">{current + 1} / {quiz.length}</span>
        </div>
        <div className="quiz-score-chip">⭐ {answers.filter(a => a.selected === a.correct).length} correct</div>
      </div>

      <div className="timer-bar-wrap">
        <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerPct < 33 ? 'var(--accent-secondary)' : timerPct < 66 ? 'var(--accent-yellow)' : 'var(--accent-green)' }} />
        <span className="timer-label">{timeLeft}s</span>
      </div>

      <div className="card question-card">
        <div className="q-number">Question {current + 1}</div>
        <h2 className="q-text">{q.question}</h2>
        <div className="options-grid">
          {q.options.map((opt, i) => (
            <button key={i}
              className={`option-btn ${selected !== null ? (i === q.correct ? 'correct' : i === selected ? 'wrong' : 'faded') : ''}`}
              onClick={() => handleAnswer(i)} disabled={selected !== null}
              style={{ animationDelay: `${i * 60}ms` }}>
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {selected !== null && (
          <div className={`feedback ${selected === q.correct ? 'correct' : 'wrong'}`}>
            <strong>{selected === q.correct ? '✅ Correct!' : selected === -1 ? '⏰ Time\'s up!' : '❌ Wrong!'}</strong>
            <p>{q.explanation}</p>
          </div>
        )}
        {selected !== null && (
          <button className="btn btn-primary next-btn" onClick={next}>
            {current + 1 >= quiz.length ? '🏁 Finish Quiz' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
