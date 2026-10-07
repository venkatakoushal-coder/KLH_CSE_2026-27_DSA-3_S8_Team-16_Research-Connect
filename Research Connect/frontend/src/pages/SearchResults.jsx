import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, AlertCircle, Info, ChevronDown, ChevronUp, ArrowUpDown, Filter } from 'lucide-react';
import { paperService } from '../services/api';
import PaperCard from '../components/PaperCard';
import AlgorithmBadge from '../components/AlgorithmBadge';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(keyword);
  
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);
  const [showLps, setShowLps] = useState(false);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState('relevance');
  const [filterYear, setFilterYear] = useState('all');

  // Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const searchContainerRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    setSearchInput(keyword);
    setFilterYear('all');
    setSortBy('relevance');
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);

    paperService.searchKMP(keyword.trim())
      .then(data => {
        setResultsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Search failed:", err);
        setError("Failed to execute search. Ensure the Spring Boot backend is running.");
        setLoading(false);
      });
  }, [keyword]);

  // Autocomplete while typing
  useEffect(() => {
    const clean = searchInput.trim();
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
  }, [searchInput]);

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
      setSearchInput(selected);
      setShowSuggestions(false);
      setSearchParams({ keyword: selected });
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setShowSuggestions(false);
      setSearchParams({ keyword: searchInput.trim() });
    }
  };

  const handleSuggestionClick = (suggestedTerm) => {
    setSearchInput(suggestedTerm);
    setShowSuggestions(false);
    setSearchParams({ keyword: suggestedTerm });
  };

  // Extract distinct years from results
  const availableYears = resultsData && resultsData.results
    ? Array.from(new Set(resultsData.results.map(r => r.paper.year))).sort((a, b) => b - a)
    : [];

  // Filter & sort results
  const processedResults = (() => {
    if (!resultsData || !resultsData.results) return [];
    let list = [...resultsData.results];

    if (filterYear !== 'all') {
      const targetYear = parseInt(filterYear);
      list = list.filter(r => r.paper.year === targetYear);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => b.paper.year - a.paper.year);
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => a.paper.year - b.paper.year);
    } else {
      // Relevance (default)
      list.sort((a, b) => b.totalOccurrences - a.totalOccurrences);
    }

    return list;
  })();

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Top Search Bar with Trie Autocomplete */}
        <div ref={searchContainerRef} style={{ maxWidth: '780px', margin: '0 auto 2.5rem', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit} className="search-form" style={{ margin: 0 }}>
            <div className="search-input-group">
              <Search size={20} color="#64748b" style={{ marginRight: '0.5rem' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search research papers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                onKeyDown={handleKeyDown}
              />
              <button type="submit" className="search-btn">
                Search
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
                  onClick={() => handleSuggestionClick(term)}
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
                    borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={14} color={idx === activeSuggestionIdx ? '#2563eb' : '#94a3b8'} />
                    <span style={{ fontWeight: 500 }}>{term}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>select</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-box">
            <div className="spinner"></div>
            <p style={{ fontWeight: 500 }}>Scanning 180 papers using Knuth-Morris-Pratt (KMP) algorithm...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-bg)', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
              <AlertCircle size={20} />
              <h3 style={{ fontWeight: 600 }}>Error</h3>
            </div>
            <p style={{ color: '#991b1b', fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* Results Header */}
        {!loading && resultsData && (
          <div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: '1rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '1.75rem'
            }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Search results for "{resultsData.keyword}"
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Found <strong style={{ color: '#0f172a' }}>{resultsData.papersCount}</strong> {resultsData.papersCount === 1 ? 'paper' : 'papers'} with <strong style={{ color: '#2563eb' }}>{resultsData.totalOccurrences}</strong> total occurrences across the corpus.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlgorithmBadge type="kmp" label="Algorithm: KMP" />
                {resultsData.lpsTable && (
                  <button 
                    onClick={() => setShowLps(!showLps)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
                  >
                    <span>LPS Table</span>
                    {showLps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
            </div>

            {/* LPS Visualizer Accordion */}
            {showLps && resultsData.lpsTable && (
              <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: '#f8fafc', borderStyle: 'dashed' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#1e40af', fontWeight: 600, fontSize: '0.875rem' }}>
                  <Info size={16} />
                  <span>KMP Longest Prefix-Suffix (LPS) Preprocessing Table for "{resultsData.keyword}"</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  In O(M) preprocessing, lps[i] stores the length of the longest proper prefix of pattern[0..i] that is also a suffix. When a mismatch occurs, the search pointer shifts using this table without backtracking text index.
                </p>
                <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {resultsData.keyword.split('').map((char, idx) => (
                    <div key={idx} style={{ 
                      minWidth: '36px', 
                      textAlign: 'center', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '4px',
                      backgroundColor: '#ffffff'
                    }}>
                      <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>{char}</div>
                      <div style={{ padding: '0.25rem', fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>{resultsData.lpsTable[idx]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Exact Results — Edit Distance Typo Suggestions */}
            {resultsData.papersCount === 0 && (
              <div className="card" style={{ maxWidth: '680px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                  No exact results found for "{resultsData.keyword}".
                </p>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Knuth-Morris-Pratt exact string matching found 0 occurrences in the 180-paper corpus.
                </p>

                {resultsData.suggestions && resultsData.suggestions.length > 0 ? (
                  <div style={{ 
                    backgroundColor: '#fffbeb', 
                    border: '1px solid #fde68a', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '1.25rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 600, fontSize: '0.9rem' }}>
                        <Sparkles size={16} />
                        <span>Did you mean:</span>
                      </div>
                      <AlgorithmBadge type="edit-distance" label="Algorithm: Edit Distance" />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      {resultsData.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(sug.candidate)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #fcd34d',
                            color: '#92400e',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.4rem 0.85rem',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <span>"{sug.candidate}"</span>
                          <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 400 }}>
                            (dist: {sug.distance})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    No close vocabulary matches found within Levenshtein distance 2.
                  </p>
                )}
              </div>
            )}

            {/* Sort & Year Filter Controls */}
            {resultsData.papersCount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                  <Filter size={16} color="var(--primary)" />
                  <span>Showing <strong>{processedResults.length}</strong> of <strong>{resultsData.papersCount}</strong> matching papers</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {/* Sort By */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <ArrowUpDown size={15} color="#64748b" />
                    <span style={{ fontWeight: 500, color: '#64748b' }}>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-medium)',
                        fontSize: '0.85rem',
                        backgroundColor: '#ffffff',
                        color: '#1e293b',
                        fontWeight: 500
                      }}
                    >
                      <option value="relevance">Relevance (Occurrences)</option>
                      <option value="newest">Newest Year First</option>
                      <option value="oldest">Oldest Year First</option>
                    </select>
                  </div>

                  {/* Year Filter */}
                  {availableYears.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 500, color: '#64748b' }}>Year:</span>
                      <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                          fontSize: '0.85rem',
                          backgroundColor: '#ffffff',
                          color: '#1e293b',
                          fontWeight: 500
                        }}
                      >
                        <option value="all">All Years</option>
                        {availableYears.map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state when year filter has 0 matches */}
            {resultsData.papersCount > 0 && processedResults.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#f8fafc' }}>
                <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  No papers matching "{resultsData.keyword}" found for publication year <strong>{filterYear}</strong>.
                </p>
                <button onClick={() => setFilterYear('all')} className="btn btn-secondary btn-sm">
                  Show All Years
                </button>
              </div>
            )}

            {/* Results Grid */}
            {processedResults.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {processedResults.map((res, index) => (
                  <PaperCard
                    key={res.paper.id || index}
                    paper={res.paper}
                    totalOccurrences={res.totalOccurrences}
                    matches={res.matches}
                    highlightKeyword={resultsData.keyword}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
