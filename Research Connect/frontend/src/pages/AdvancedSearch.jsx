import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Search, Plus, X, ArrowRight, Layers, Tag, Sparkles } from 'lucide-react';
import { paperService } from '../services/api';
import AlgorithmBadge from '../components/AlgorithmBadge';

export default function AdvancedSearch() {
  const [keywords, setKeywords] = useState(['transformer', 'attention', 'NLP']);
  const [inputKeyword, setInputKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);

  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);

  const inputContainerRef = useRef(null);
  const inputRef = useRef(null);

  const samplePresets = [
    ['transformer', 'attention', 'NLP'],
    ['quantum', 'optical', 'cryptography'],
    ['zero-trust', 'cloud', 'security'],
    ['neural', 'deep', 'layers'],
    ['federated', 'privacy', 'edge'],
    ['robotics', 'autonomous', 'navigation']
  ];

  // Fetch real-time Prefix Trie autocomplete suggestions for the current keyword input
  useEffect(() => {
    const clean = inputKeyword.trim();
    if (clean.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      paperService.getAutocomplete(clean)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Filter out keywords that are already added
            const lowerKeywords = keywords.map(k => k.toLowerCase());
            const filtered = data.filter(item => !lowerKeywords.includes(item.toLowerCase()));
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
            setActiveSuggestionIdx(-1);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        })
        .catch(err => {
          console.error("Autocomplete failed:", err);
          setSuggestions([]);
          setShowSuggestions(false);
        });
    }, 120);

    return () => clearTimeout(timer);
  }, [inputKeyword, keywords]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addKeyword = (word) => {
    if (!word) return;
    const clean = word.trim().toLowerCase();
    if (clean.length > 0) {
      const lowerKeywords = keywords.map(k => k.toLowerCase());
      if (!lowerKeywords.includes(clean)) {
        setKeywords(prev => [...prev, clean]);
      }
    }
    setInputKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const removeKeyword = (wordToRemove) => {
    setKeywords(prev => prev.filter(k => k.toLowerCase() !== wordToRemove.toLowerCase()));
  };

  const clearAllKeywords = () => {
    setKeywords([]);
    setInputKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
    setResultsData(null);
    setError(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIdx(prev => (prev > -1 ? prev - 1 : -1));
        return;
      } else if (e.key === 'Enter' && activeSuggestionIdx >= 0) {
        e.preventDefault();
        addKeyword(suggestions[activeSuggestionIdx]);
        return;
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputKeyword.trim()) {
        addKeyword(inputKeyword.trim());
      } else if (keywords.length > 0) {
        handleExecuteSearch();
      }
    } else if (e.key === 'Backspace' && inputKeyword === '' && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();

    let targetKeywords = [...keywords];
    if (inputKeyword.trim()) {
      const clean = inputKeyword.trim().toLowerCase();
      if (!targetKeywords.map(k => k.toLowerCase()).includes(clean)) {
        targetKeywords.push(clean);
        setKeywords(targetKeywords);
      }
      setInputKeyword('');
      setShowSuggestions(false);
    }

    if (targetKeywords.length === 0) {
      setError("Please add at least one keyword to execute search.");
      return;
    }

    setLoading(true);
    setError(null);

    paperService.searchMultiple(targetKeywords)
      .then(data => {
        setResultsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Advanced search error:", err);
        setError("Multi-keyword search failed. Ensure the Spring Boot backend is active.");
        setLoading(false);
      });
  };

  const handleApplyPreset = (presetList) => {
    setKeywords(presetList);
    setInputKeyword('');
    setShowSuggestions(false);
    setError(null);
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '800px', margin: '0 auto 2.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <AlgorithmBadge type="aho-corasick" label="Algorithm: Aho-Corasick Automaton" />
            <AlgorithmBadge type="trie" label="Autocomplete: Prefix Trie" />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Multi-Keyword Advanced Search
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Select keywords with dynamic Prefix Trie autocomplete. Aho-Corasick scans the entire corpus in linear O(N + ΣM) time with AND semantics.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="card" style={{ maxWidth: '840px', margin: '0 auto 2.5rem', padding: '2rem' }}>
          {/* Active Keyword Chips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                Search Keywords ({keywords.length} selected):
              </label>
              {keywords.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllKeywords}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            {keywords.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                {keywords.map(kw => (
                  <span
                    key={kw}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#eef2ff',
                      color: '#3730a3',
                      border: '1px solid #c7d2fe',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#6366f1',
                        borderRadius: '50%',
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#6366f1'}
                      title={`Remove "${kw}"`}
                      aria-label={`Remove ${kw}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: '0.25rem 0 0' }}>
                No keywords selected yet. Type a term below with Trie autocomplete or select a preset.
              </p>
            )}
          </div>

          {/* Dynamic Autocomplete Input & Search Buttons */}
          <div ref={inputContainerRef} style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none' }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputKeyword}
                  onChange={(e) => setInputKeyword(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type keyword with Trie autocomplete (e.g. neural, attention, transformer)..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    fontSize: '0.95rem',
                    border: '2px solid var(--primary-border)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => { if (inputKeyword.trim()) addKeyword(inputKeyword.trim()); }}
                disabled={!inputKeyword.trim()}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} />
                <span>Add Keyword</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteSearch}
                disabled={loading || (keywords.length === 0 && !inputKeyword.trim())}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
              >
                <Cpu size={16} />
                <span>Run Aho-Corasick</span>
              </button>
            </div>

            {/* Trie Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                marginTop: '0.35rem',
                zIndex: 50,
                overflow: 'hidden',
                textAlign: 'left'
              }}>
                <div style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Vocabulary Suggestions</span>
                  <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 500 }}>Prefix Trie Matching</span>
                </div>
                {suggestions.map((term, idx) => (
                  <div
                    key={term}
                    onClick={() => addKeyword(term)}
                    onMouseEnter={() => setActiveSuggestionIdx(idx)}
                    style={{
                      padding: '0.6rem 0.85rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      backgroundColor: idx === activeSuggestionIdx ? '#eff6ff' : '#ffffff',
                      color: idx === activeSuggestionIdx ? '#1d4ed8' : '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Search size={14} color={idx === activeSuggestionIdx ? '#2563eb' : '#94a3b8'} />
                      <span style={{ fontWeight: 500 }}>{term}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+ add to search</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Presets:</span>
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.75rem',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              >
                {preset.join(' + ')}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-box">
            <div className="spinner"></div>
            <p>Scanning 180 papers via Aho-Corasick automaton with AND filter...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', borderColor: 'var(--danger)' }}>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && resultsData && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '1rem',
              paddingBottom: '1rem', 
              borderBottom: '1px solid var(--border-light)', 
              marginBottom: '1.75rem' 
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
                  Aho-Corasick Search Results
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Found <strong style={{ color: '#0f172a' }}>{resultsData.papersCount}</strong> matching {resultsData.papersCount === 1 ? 'paper' : 'papers'} containing ALL {resultsData.keywords.length} patterns with <strong style={{ color: '#4f46e5' }}>{resultsData.totalMatches}</strong> total keyword hits.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {resultsData.keywords.map(kw => (
                  <span key={kw} className="badge badge-indigo" style={{ fontSize: '0.8rem' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {resultsData.papersCount === 0 ? (
              <div className="card" style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center', padding: '3rem 1.5rem' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                  No matches found containing all specified keywords.
                </p>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Aho-Corasick applies strict AND semantics. Try removing a keyword or selecting one of the presets above.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {resultsData.results.map((res) => (
                  <div key={res.paper.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-category">{res.paper.category}</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{res.paper.year}</span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.35 }}>
                      <Link to={`/papers/${res.paper.id}`} style={{ color: 'inherit' }}>
                        {res.paper.title}
                      </Link>
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.85rem' }}>
                      {res.paper.author} ({res.paper.year})
                    </div>

                    {/* Matched Keywords Breakdown Bar */}
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '0.65rem 0.85rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                        Matched Keywords Breakdown:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {Object.entries(res.keywordCounts).map(([kw, count]) => (
                          <span key={kw} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                            {kw}: {count}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Snippet Preview */}
                    {res.matches && res.matches.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginBottom: '1rem' }}>
                        "...{res.matches[0].snippet}..."
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                      <Link to={`/papers/${res.paper.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                        <span>Inspect Paper</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
