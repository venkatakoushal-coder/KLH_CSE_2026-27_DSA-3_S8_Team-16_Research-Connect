import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Network, Cpu, ArrowRight, Layers, Database } from 'lucide-react';
import { paperService } from '../services/api';
import AlgorithmBadge from '../components/AlgorithmBadge';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    paperService.getStatistics()
      .then(data => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error("Failed to load statistics:", err);
        setLoadingStats(false);
      });
  }, []);

  // Fetch real-time Trie-based autocomplete suggestions while typing
  useEffect(() => {
    const clean = keyword.trim();
    if (clean.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      paperService.getAutocomplete(clean)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSuggestions(data);
            setShowSuggestions(true);
            setActiveSuggestionIdx(-1);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        })
        .catch(err => {
          console.error("Autocomplete failed:", err);
          setSuggestions([]);
        });
    }, 120);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIdx(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeSuggestionIdx >= 0) {
      e.preventDefault();
      const selected = suggestions[activeSuggestionIdx];
      setKeyword(selected);
      setShowSuggestions(false);
      navigate(`/search?keyword=${encodeURIComponent(selected)}`);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (term) => {
    setKeyword(term);
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowSuggestions(false);
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const sampleKeywords = ['transformer', 'attention', 'neural', 'quantum', 'zero-trust', 'blockchain', 'federated'];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Research Connect
          </h1>
          <p className="hero-subtitle">
            Algorithm-Based Research Paper Discovery and Citation Analysis System
          </p>

          {/* Search Box with Real-Time Trie Autocomplete */}
          <div ref={searchContainerRef} style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
            <form className="search-form" onSubmit={handleSearch} style={{ margin: 0 }}>
              <div className="search-input-group">
                <Search size={20} color="#64748b" style={{ marginRight: '0.5rem' }} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search research papers by keyword (e.g. transformer, neural, quantum)..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <button type="submit" className="search-btn">
                  <span>Search</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
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
                  <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 500 }}>Trie Prefix Matching</span>
                </div>
                {suggestions.map((term, idx) => (
                  <div
                    key={term}
                    onClick={() => handleSelectSuggestion(term)}
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
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>click to select</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p style={{ marginTop: '0.85rem', fontSize: '0.9rem', color: '#64748b' }}>
            Search research papers using efficient string matching and graph algorithms.
          </p>

          {/* Sample Keywords */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Popular terms:</span>
            {sampleKeywords.map(term => (
              <button
                key={term}
                onClick={() => navigate(`/search?keyword=${encodeURIComponent(term)}`)}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Quick Statistics Bar */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-num">{loadingStats ? '...' : (stats?.totalPapers || 180)}</div>
              <div className="stat-label">Total Papers</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{loadingStats ? '...' : (stats?.totalCategories || 18)}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{loadingStats ? '...' : (stats?.totalCitations || 415)}</div>
              <div className="stat-label">Citations</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">6</div>
              <div className="stat-label">Algorithms Used</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feature / Architecture Section */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Foundational DSA Algorithms in Action
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Every feature in Research Connect is powered by custom Data Structures & Algorithms implemented from first principles without external search libraries.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <Search size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Knuth-Morris-Pratt (KMP)</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Exact Keyword Search</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
                Builds an LPS (Longest Prefix Suffix) failure table in O(M) time and scans the text in O(N) time without backtracking, identifying line numbers and exact positions.
              </p>
              <AlgorithmBadge type="kmp" label="KMP Pattern Matching" />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <Cpu size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Aho-Corasick Automaton</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Multi-Keyword Search</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
                Constructs a Trie with BFS failure transitions to locate multiple search patterns simultaneously in a single linear pass over the paper corpus.
              </p>
              <AlgorithmBadge type="aho-corasick" label="Aho-Corasick Multi-Search" />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#fffbeb', color: '#d97706', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Levenshtein Edit Distance</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Typo Tolerance & Suggestions</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
                Uses 2D Dynamic Programming to compute minimum edit operations (insert, delete, replace) and suggest accurate vocabulary terms if typos occur.
              </p>
              <AlgorithmBadge type="edit-distance" label="Levenshtein 2D DP" />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <Layers size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Suffix Array & LCP Array</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Document Similarity</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
                Employs Kasai's O(N) LCP array on concatenated documents with unique delimiters to compute shared substring density and recommend related research papers.
              </p>
              <AlgorithmBadge type="suffix-array" label="Suffix Array + Kasai LCP" />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#fdf2f8', color: '#db2777', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <Network size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Directed Citation Graph</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Network & Path Analysis</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
                Models papers as nodes and citations as directed edges. Implements BFS for shortest citation paths and level exploration, and DFS for tracing deep dependency chains.
              </p>
              <AlgorithmBadge type="graph" label="Adjacency List + BFS/DFS" />
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', color: '#0284c7', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <Database size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Inverted Index Hashing</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Fast Candidate Retrieval</span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
                Maintains an in-memory HashMap of unique terms to paper IDs for instantaneous candidate retrieval, accelerating search over the expanded corpus.
              </p>
              <AlgorithmBadge type="inverted-index" label="HashMap Inverted Index" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation CTA */}
      <section style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="container">
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Ready to explore research papers?
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Browse the complete 180-paper corpus, run multi-pattern queries, or view citation analytics.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/papers" className="btn btn-primary">
              <BookOpen size={16} />
              <span>Browse All Papers</span>
            </Link>
            <Link to="/advanced-search" className="btn btn-secondary">
              <Cpu size={16} />
              <span>Try Multi-Keyword Search</span>
            </Link>
            <Link to="/statistics" className="btn btn-secondary">
              <Network size={16} />
              <span>View Corpus Statistics</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
