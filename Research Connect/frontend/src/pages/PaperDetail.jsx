import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  BookOpen, Calendar, User, Tag, FileText, ArrowLeft, Search, 
  ChevronLeft, ChevronRight, GitMerge, Network, Cpu, ArrowRight,
  CheckCircle2, AlertCircle, Sparkles, Layers, ListFilter
} from 'lucide-react';
import { paperService } from '../services/api';
import AlgorithmBadge from '../components/AlgorithmBadge';

export default function PaperDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialHighlight = searchParams.get('highlight') || '';

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  // In-Paper Search & Highlighting State
  const [searchWord, setSearchWord] = useState(initialHighlight);
  const [activeKeyword, setActiveKeyword] = useState(initialHighlight);
  const [searchMatches, setSearchMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Similar Papers State (Suffix Array + LCP)
  const [similarPapers, setSimilarPapers] = useState(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Citation Network State (Graph)
  const [citationsData, setCitationsData] = useState(null);
  const [loadingCitations, setLoadingCitations] = useState(false);
  const [targetPathId, setTargetPathId] = useState('');
  const [citationPath, setCitationPath] = useState(null);
  const [bfsData, setBfsData] = useState(null);
  const [dfsData, setDfsData] = useState(null);
  const [newCiteId, setNewCiteId] = useState('');
  const [citeStatus, setCiteStatus] = useState(null);
  const [allPapersList, setAllPapersList] = useState([]);

  const contentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSearchMatches([]);
    setCurrentMatchIndex(0);

    paperService.getPaperById(id)
      .then(data => {
        setPaper(data);
        setLoading(false);
        if (initialHighlight) {
          executeInPaperSearch(data, initialHighlight);
        }
      })
      .catch(err => {
        console.error("Failed to load paper:", err);
        setError("Paper not found or backend service unavailable.");
        setLoading(false);
      });
  }, [id]);

  // Execute in-paper search using KMP algorithm
  const executeInPaperSearch = (paperObj, query) => {
    if (!paperObj || !query.trim()) {
      setActiveKeyword('');
      setSearchMatches([]);
      return;
    }

    const clean = query.trim();
    setActiveKeyword(clean);

    paperService.searchInsidePaper(paperObj.id, clean)
      .then(res => {
        if (res.matches) {
          setSearchMatches(res.matches);
          setCurrentMatchIndex(0);
          scrollToMatch(0);
        }
      })
      .catch(err => {
        console.error("In-paper search failed:", err);
      });
  };

  const handleInPaperSubmit = (e) => {
    e.preventDefault();
    executeInPaperSearch(paper, searchWord);
  };

  const clearInPaperSearch = () => {
    setSearchWord('');
    setActiveKeyword('');
    setSearchMatches([]);
    setCurrentMatchIndex(0);
  };

  // Occurrence Navigation
  const handlePrevOccurrence = () => {
    if (searchMatches.length === 0) return;
    const prev = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prev);
    scrollToMatch(prev);
  };

  const handleNextOccurrence = () => {
    if (searchMatches.length === 0) return;
    const next = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(next);
    scrollToMatch(next);
  };

  const scrollToMatch = (index) => {
    setTimeout(() => {
      const el = document.getElementById(`match-occurrence-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Load Similar Papers (Suffix Array + LCP)
  const handleLoadSimilar = () => {
    setActiveTab('similar');
    if (!similarPapers) {
      setLoadingSimilar(true);
      paperService.getSimilarPapers(id, 6)
        .then(data => {
          setSimilarPapers(data.recommendations || []);
          setLoadingSimilar(false);
        })
        .catch(err => {
          console.error("Similar papers load failed:", err);
          setLoadingSimilar(false);
        });
    }
  };

  // Load Citation Network
  const handleLoadCitations = () => {
    setActiveTab('citations');
    if (allPapersList.length === 0) {
      paperService.getPapers({ limit: 200 })
        .then(res => {
          if (res.papers) {
            setAllPapersList(res.papers.filter(p => String(p.id) !== String(id)));
          }
        })
        .catch(err => console.error("Failed to load paper list for target selector:", err));
    }
    if (!citationsData) {
      setLoadingCitations(true);
      paperService.getCitations(id)
        .then(data => {
          setCitationsData(data);
          setLoadingCitations(false);
        })
        .catch(err => {
          console.error("Citations load failed:", err);
          setLoadingCitations(false);
        });
    }
  };

  // Shortest Path Finder
  const handleFindPath = (e) => {
    e.preventDefault();
    if (!targetPathId.trim()) return;
    paperService.getCitationPath(id, targetPathId.trim())
      .then(data => {
        setCitationPath(data);
      })
      .catch(err => {
        console.error("Path finding failed:", err);
      });
  };

  // Run BFS Traversal
  const handleRunBfs = () => {
    paperService.getBfsTraversal(id)
      .then(data => setBfsData(data))
      .catch(err => console.error("BFS failed:", err));
  };

  // Run DFS Traversal
  const handleRunDfs = () => {
    paperService.getDfsTraversal(id)
      .then(data => setDfsData(data))
      .catch(err => console.error("DFS failed:", err));
  };

  // Add citation
  const handleAddCitation = (e) => {
    e.preventDefault();
    if (!newCiteId.trim()) return;
    paperService.addCitation(id, newCiteId.trim())
      .then(res => {
        setCiteStatus(res.message);
        paperService.getCitations(id).then(data => setCitationsData(data));
        setNewCiteId('');
      })
      .catch(err => {
        setCiteStatus("Error adding citation");
      });
  };

  // Render Highlighted Text in Content
  const renderHighlightedContent = (text, keyword) => {
    if (!text || !keyword) return text;

    const regex = new RegExp(`(${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    let matchCounter = 0;

    return parts.map((part, i) => {
      if (part.toLowerCase() === keyword.toLowerCase()) {
        const currentIdx = matchCounter++;
        const isActive = currentIdx === currentMatchIndex;
        return (
          <mark
            key={i}
            id={`match-occurrence-${currentIdx}`}
            className={`highlight-match ${isActive ? 'active-match' : ''}`}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <div className="state-box">
          <div className="spinner"></div>
          <p>Loading research paper details...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="card" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center', borderColor: 'var(--danger)' }}>
          <AlertCircle size={32} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Paper Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || "The requested paper ID does not exist in the corpus."}</p>
          <Link to="/papers" className="btn btn-primary">Back to Papers</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/papers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            <ArrowLeft size={16} />
            <span>Back to All Papers</span>
          </Link>
        </div>

        {/* Paper Header Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-category">
              {paper.category}
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.3 }}>
            {paper.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: '#475569', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} color="var(--primary)" />
              <span><strong>Author(s):</strong> {paper.author}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color="var(--primary)" />
              <span><strong>Year:</strong> {paper.year}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="var(--primary)" />
              <span><strong>Length:</strong> {paper.wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-list">
          <button 
            className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <BookOpen size={16} />
            <span>Full Content & Search</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'similar' ? 'active' : ''}`}
            onClick={handleLoadSimilar}
          >
            <GitMerge size={16} />
            <span>Similar Papers (Suffix Array)</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'citations' ? 'active' : ''}`}
            onClick={handleLoadCitations}
          >
            <Network size={16} />
            <span>Citations & Graph</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: Paper Content & In-Paper Search                                    */}
        {/* ========================================================================= */}
        {activeTab === 'content' && (
          <div>
            {/* In-Paper Search Tool */}
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                  <Search size={16} color="var(--primary)" />
                  <span>Search inside this paper (KMP Algorithm)</span>
                </div>
                <AlgorithmBadge type="kmp" label="Algorithm: KMP In-Paper" />
              </div>

              <form onSubmit={handleInPaperSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Enter keyword to search in this document..."
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '0.5rem 0.85rem',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem'
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <span>Find Occurrences</span>
                </button>
                {activeKeyword && (
                  <button type="button" onClick={clearInPaperSearch} className="btn btn-secondary btn-sm">
                    <span>Clear</span>
                  </button>
                )}
              </form>
            </div>

            {/* Occurrence Navigation Bar */}
            {activeKeyword && (
              <div className="occurrence-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <span>
                    Found <strong>{searchMatches.length}</strong> {searchMatches.length === 1 ? 'occurrence' : 'occurrences'} of "<strong>{activeKeyword}</strong>"
                  </span>
                </div>

                {searchMatches.length > 0 && (
                  <div className="occurrence-nav">
                    <span>Occurrence <strong>{currentMatchIndex + 1}</strong> of <strong>{searchMatches.length}</strong></span>
                    <button 
                      onClick={handlePrevOccurrence} 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', background: '#ffffff' }}
                      title="Previous occurrence"
                    >
                      <ChevronLeft size={16} />
                      <span>Prev</span>
                    </button>
                    <button 
                      onClick={handleNextOccurrence} 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', background: '#ffffff' }}
                      title="Next occurrence"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Full Document Reader Card */}
            <div className="card" ref={contentRef} style={{ padding: '2.5rem', lineHeight: 1.8, fontSize: '1rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>Abstract & Research Content</h2>
              </div>

              <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>
                {activeKeyword ? renderHighlightedContent(paper.content, activeKeyword) : paper.content}
              </div>

              {/* Connected Academic References Section */}
              <div style={{ marginTop: '3rem', paddingTop: '1.75rem', borderTop: '2px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>References</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                    {paper.references ? paper.references.length : 0} {paper.references?.length === 1 ? 'citation' : 'citations'}
                  </span>
                </h3>

                {paper.references && paper.references.length > 0 ? (
                  <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {paper.references.map((ref, idx) => (
                      <li key={ref.id} style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
                        <Link 
                          to={`/papers/${ref.id}`} 
                          style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {ref.title}
                        </Link>
                        <span style={{ color: '#64748b', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                          — {ref.author} ({ref.year}), <em>{ref.category}</em>
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    No outgoing citations referenced by this paper in the corpus.
                  </p>
                )}
              </div>

              {/* Connected Cited By Section */}
              <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Cited By</span>
                  <span className="badge badge-indigo" style={{ fontSize: '0.8rem' }}>
                    {paper.citedBy ? paper.citedBy.length : 0} {paper.citedBy?.length === 1 ? 'paper' : 'papers'}
                  </span>
                </h3>

                {paper.citedBy && paper.citedBy.length > 0 ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {paper.citedBy.map(c => (
                      <li key={c.id} style={{ color: '#475569', fontSize: '0.95rem' }}>
                        <Link 
                          to={`/papers/${c.id}`} 
                          style={{ fontWeight: 600, color: 'var(--indigo)', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {c.title}
                        </Link>
                        <span style={{ color: '#64748b', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                          — {c.author} ({c.year}), <em>{c.category}</em>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    This paper has not yet been cited by other papers in the corpus.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: Similar Papers (Suffix Array + LCP)                                */}
        {/* ========================================================================= */}
        {activeTab === 'similar' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534' }}>
                    Document Similarity via Suffix Array & LCP Array
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                    Paper texts are concatenated with unique sentinel delimiters. Suffixes are lexicographically sorted and Kasai's algorithm computes the Longest Common Prefix (LCP) array in O(N) to identify shared textual n-grams.
                  </p>
                </div>
                <AlgorithmBadge type="suffix-array" label="Algorithm: Suffix Array + LCP" />
              </div>
            </div>

            {loadingSimilar && (
              <div className="state-box">
                <div className="spinner"></div>
                <p>Computing Generalized Suffix Array and LCP overlap across 180 papers...</p>
              </div>
            )}

            {!loadingSimilar && similarPapers && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {similarPapers.map((sim, index) => (
                  <div key={sim.paper.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-success">
                        Score: {sim.similarityPercentage}% Match
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                      <Link to={`/papers/${sim.paper.id}`} style={{ color: 'inherit' }}>
                        {sim.paper.title}
                      </Link>
                    </h4>

                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                      <div>{sim.paper.author} ({sim.paper.year})</div>
                      <div style={{ marginTop: '0.25rem' }}>Domain: <strong>{sim.paper.category}</strong></div>
                    </div>

                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.8rem',
                      color: '#475569',
                      marginBottom: '1rem'
                    }}>
                      <div>Max Common Substring: <strong>{sim.maxCommonSubstringLength} chars</strong></div>
                      <div>Total Overlapping Content: <strong>{sim.sharedOverlapLength} chars</strong></div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <Link to={`/papers/${sim.paper.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                        <span>Open Similar Paper</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Citation Network (Graph)                                           */}
        {/* ========================================================================= */}
        {activeTab === 'citations' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#3730a3' }}>
                    Citation Network Analysis (Directed Graph)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#4338ca' }}>
                    Papers represent vertices and citations represent directed edges. Traversal routines (BFS and DFS) enable shortest path discovery and dependency chain analysis.
                  </p>
                </div>
                <AlgorithmBadge type="graph" label="Algorithm: Graph + BFS/DFS" />
              </div>
            </div>

            {loadingCitations && (
              <div className="state-box">
                <div className="spinner"></div>
                <p>Loading citation relationships...</p>
              </div>
            )}

            {!loadingCitations && citationsData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* References & Citations Received Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {/* Papers this paper cites */}
                  <div className="card">
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>References (Papers this paper cites)</span>
                      <span className="badge badge-primary">{citationsData.citedCount}</span>
                    </h4>
                    {citationsData.citedPapers.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>This paper does not cite any papers in the corpus.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {citationsData.citedPapers.map((p, idx) => (
                          <div key={p.id} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                            <Link to={`/papers/${p.id}`} style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              [{idx + 1}] {p.title}
                            </Link>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.author} ({p.year}) • {p.category}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Papers citing this paper */}
                  <div className="card">
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Citations Received (Cited by)</span>
                      <span className="badge badge-indigo">{citationsData.citingCount}</span>
                    </h4>
                    {citationsData.citingPapers.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No papers in the corpus cite this paper yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {citationsData.citingPapers.map(p => (
                          <div key={p.id} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                            <Link to={`/papers/${p.id}`} style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                              {p.title}
                            </Link>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.author} ({p.year}) • {p.category}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Shortest Citation Path Tool */}
                <div className="card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Find Shortest Citation Path (BFS)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                    Calculates the minimum citation hops from this paper to any target paper in the graph using Breadth-First Search.
                  </p>

                  <form onSubmit={handleFindPath} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <select
                      value={targetPathId}
                      onChange={(e) => setTargetPathId(e.target.value)}
                      style={{
                        padding: '0.5rem 0.85rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9rem',
                        minWidth: '280px',
                        maxWidth: '450px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="">-- Select Target Research Paper --</option>
                      {allPapersList.map(tp => (
                        <option key={tp.id} value={tp.id}>
                          {tp.title.length > 55 ? tp.title.substring(0, 55) + '...' : tp.title} ({tp.year})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!targetPathId}>
                      Find Shortest Path
                    </button>
                  </form>

                  {citationPath && (
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                      {citationPath.hasPath ? (
                        <div>
                          <p style={{ fontWeight: 600, color: '#166534', marginBottom: '0.75rem' }}>
                            Shortest citation path found ({citationPath.pathLength} {citationPath.pathLength === 1 ? 'hop' : 'hops'}):
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {citationPath.path.map((node, i) => (
                              <React.Fragment key={node.id}>
                                <Link 
                                  to={`/papers/${node.id}`} 
                                  className="badge badge-primary" 
                                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                                >
                                  {node.title.length > 35 ? node.title.substring(0, 35) + '...' : node.title}
                                </Link>
                                {i < citationPath.path.length - 1 && (
                                  <span style={{ color: '#2563eb', fontWeight: 700 }}>→</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                          No directed citation path exists between the selected papers in the current graph.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Graph Traversals Explorer (BFS & DFS) */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Graph Traversal Routines</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleRunBfs} className="btn btn-secondary btn-sm">
                        <span>Run BFS Level Order</span>
                      </button>
                      <button onClick={handleRunDfs} className="btn btn-secondary btn-sm">
                        <span>Run DFS Chain</span>
                      </button>
                    </div>
                  </div>

                  {bfsData && (
                    <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>
                        BFS Level-by-Level Visited Nodes ({bfsData.visitedCount} total reachable):
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                        {bfsData.traversal.map((item, idx) => (
                          <div key={idx} style={{ paddingLeft: `${item.level * 16}px` }}>
                            <span style={{ fontWeight: 600, color: '#2563eb' }}>[Level {item.level}]</span>{' '}
                            <Link to={`/papers/${item.paper.id}`}>{item.paper.title}</Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dfsData && (
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4338ca', marginBottom: '0.5rem' }}>
                        DFS Deep Traversal Chain ({dfsData.visitedCount} nodes):
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        {dfsData.chain.map((p, idx) => (
                          <React.Fragment key={p.id}>
                            <Link to={`/papers/${p.id}`} className="badge badge-indigo">
                              {p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title}
                            </Link>
                            {idx < dfsData.chain.length - 1 && <span style={{ color: '#4f46e5' }}>→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
