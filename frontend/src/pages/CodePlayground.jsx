import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import './CodePlayground.css';

const LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'sql'];
const STARTER_CODE = {
  python: '# NeuroTutor Code Lab\nprint("Hello, World!")\n\n# Try something:\nfor i in range(5):\n    print(f"Number: {i}")',
  javascript: '// NeuroTutor Code Lab\nconsole.log("Hello, World!");\n\n// Try something:\nconst arr = [1, 2, 3, 4, 5];\nconst doubled = arr.map(n => n * 2);\nconsole.log(doubled);',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  sql: 'SELECT * FROM students\nWHERE grade > 80\nORDER BY grade DESC\nLIMIT 10;',
};

export default function CodePlayground() {
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('output');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput('');
    setShowOutput(true);
    try {
      const res = await api.post('/code/execute', { code, language: lang });
      setOutput(res.data.output || '(No output)');
    } catch {
      setOutput('⚠️ Code execution unavailable. (Check backend)');
    } finally {
      setLoading(false);
    }
  };

  const getAiHelp = async () => {
    setAiLoading(true);
    setShowAiReview(true);
    try {
      const res = await api.post('/code/review', { code, language: lang });
      setAiSuggestion(res.data.review);
    } catch {
      setAiSuggestion('🤖 AI Code Review unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const hasSidePanels = showOutput || showAiReview;

  return (
    <div className={`code-page ${isFullscreen ? 'fullscreen-mode' : ''} ${showAiReview ? 'ai-panel-open' : ''} ${showOutput ? 'output-panel-open' : ''}`}>
      <div className="page-header">
        <h1>Code Lab 💻</h1>
        <p>Write, run, and get AI code reviews — in a sandboxed environment</p>
      </div>

      <div className={`code-layout ${!hasSidePanels ? 'editor-only' : ''}`}>
        <div className="code-panel">
          <div className="code-toolbar">
            <div className="lang-tabs">
              {LANGUAGES.map(l => (
                <button key={l} className={`lang-tab ${lang === l ? 'active' : ''}`}
                  onClick={() => { setLang(l); setCode(STARTER_CODE[l]); }}>
                  {l}
                </button>
              ))}
            </div>
            <div className="code-actions">
              <button 
                className="btn btn-secondary btn-icon" 
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <span style={{fontSize: '18px'}}>🗗</span> : <span style={{fontSize: '18px'}}>⛶</span>}
              </button>
              <button className="btn btn-secondary" onClick={async () => {
                try {
                  await api.post('/notes', {
                    title: `Code Snippet: ${lang} (${new Date().toLocaleDateString()})`,
                    content: `\`\`\`${lang}\n${code}\n\`\`\``,
                    category: lang
                  });
                  alert('Code saved to My Notes! 💾');
                } catch {
                  alert('Failed to save code. Make sure you are logged in.');
                }
              }} title="Save to My Notes">
                💾 Save
              </button>
              <button className={`btn btn-secondary ${showAiReview ? 'active' : ''}`} onClick={() => {
                if(!showAiReview) getAiHelp();
                else setShowAiReview(false);
              }}>
                {aiLoading ? '⏳' : '🤖 AI Review'}
              </button>
              <button className="btn btn-primary" onClick={runCode} disabled={loading}>
                {loading ? '⏳ Running...' : '▶ Run Code'}
              </button>
            </div>
          </div>

          <div className="editor-wrapper">
            <div className="line-numbers">
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              className="code-editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Dynamic Panels Layout */}
        {(showOutput || showAiReview) && (
          <div className={`side-panels ${isFullscreen ? 'fullscreen-layout' : 'split-view'}`}>
            
            {showOutput && (
              <div className="output-panel animate-slide-in">
                <div className="output-tabs">
                  <button className="output-tab active">📟 Terminal Output</button>
                  <button className="close-panel-btn" onClick={() => setShowOutput(false)}>×</button>
                </div>
                <div className="output-content">
                  <pre className="output-text">
                    {loading ? '⏳ Running code...' : output || '▶ Output will appear here'}
                  </pre>
                </div>
              </div>
            )}

            {showAiReview && (
              <div className="output-panel ai-panel animate-slide-in">
                <div className="output-tabs">
                  <button className="output-tab active">🤖 AI Expert Review</button>
                  <button className="close-panel-btn" onClick={() => setShowAiReview(false)}>×</button>
                </div>
                <div className="output-content">
                  <div className="markdown-content ai-review">
                    {aiLoading ? (
                      <div className="ai-loading-pulse"><span>🤖 Analyzing...</span><div className="pulse-bar"></div></div>
                    ) : (
                      <ReactMarkdown>{aiSuggestion}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
