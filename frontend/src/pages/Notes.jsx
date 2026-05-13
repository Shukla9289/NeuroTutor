import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import './Notes.css';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Notes component mounted");
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notes", err);
      setNotes([]);
      setLoading(false);
    }
  };

  const createNewNote = async () => {
    const newNote = {
      title: 'Untitled Note',
      content: '',
      category: 'General'
    };
    try {
      const res = await api.post('/notes', newNote);
      setNotes([res.data, ...notes]);
      setActiveNote(res.data);
    } catch (err) {
      console.error("Error creating note", err);
    }
  };

  const updateNote = async (updatedFields) => {
    if (!activeNote) return;
    const updatedNote = { ...activeNote, ...updatedFields };
    setActiveNote(updatedNote);
    
    // Auto-save logic
    setSaving(true);
    try {
      await api.put(`/notes/${activeNote.id}`, updatedNote);
      setNotes(notes.map(n => n.id === activeNote.id ? updatedNote : n));
      setTimeout(() => setSaving(false), 800);
    } catch (err) {
      console.error("Error updating note", err);
    }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
    } catch (err) {
      console.error("Error deleting note", err);
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title && n.title.toLowerCase().includes(search.toLowerCase())) || 
    (n.content && n.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="notes-container">
      <header className="notes-header">
        <h1>My Learning Notes 📝</h1>
        <button className="btn btn-primary" onClick={createNewNote}>+ New Note</button>
      </header>

      <div className="notes-grid">
        {/* Sidebar */}
        <aside className="notes-sidebar">
          <div className="notes-search-wrap">
            <input 
              type="text" 
              className="notes-search" 
              placeholder="Search notes..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="notes-list">
            {loading ? (
               <div className="placeholder-view">Loading...</div>
            ) : (
              Object.entries(
                filteredNotes.reduce((groups, note) => {
                  const cat = note.category || 'Uncategorized';
                  if (!groups[cat]) groups[cat] = [];
                  groups[cat].push(note);
                  return groups;
                }, {})
              ).map(([folder, folderNotes]) => (
                <div key={folder} className="note-folder">
                  <div className="folder-name">📂 {folder}</div>
                  {folderNotes.map(note => (
                    <div 
                      key={note.id} 
                      className={`note-item ${activeNote?.id === note.id ? 'active' : ''}`}
                      onClick={() => setActiveNote(note)}
                    >
                      <span className="note-item-title">{note.title}</span>
                      <button className="delete-note-mini" onClick={(e) => deleteNote(note.id, e)}>×</button>
                    </div>
                  ))}
                </div>
              ))
            )}
            {filteredNotes.length === 0 && !loading && <div className="placeholder-view">No notes found.</div>}
          </div>
        </aside>

        {/* Editor */}
        <main className="note-editor-wrap">
          {activeNote ? (
            <>
              <div className="editor-toolbar">
                <input 
                  className="editor-title-input"
                  value={activeNote.title}
                  onChange={e => updateNote({ title: e.target.value })}
                />
                <select 
                  className="editor-category-tag"
                  value={activeNote.category}
                  onChange={e => updateNote({ category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Technology">Technology</option>
                  <option value="Arts">Arts</option>
                  <option value="Self-Growth">Self-Growth</option>
                </select>
              </div>
              <div className="editor-main">
                <textarea 
                  className="note-textarea"
                  placeholder="Start writing your thoughts..."
                  value={activeNote.content}
                  onChange={e => updateNote({ content: e.target.value })}
                />
                <div className="note-preview markdown-content">
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                </div>
              </div>
              <div className={`save-status ${saving ? 'show' : ''}`}>Saving...</div>
            </>
          ) : (
            <div className="placeholder-view">
              <div className="placeholder-icon">📝</div>
              <h2>Capture Your Knowledge</h2>
              <p>Select a note from the list or create a new one to begin your study journey.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
