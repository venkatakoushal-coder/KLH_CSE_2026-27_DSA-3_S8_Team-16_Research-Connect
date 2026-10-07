import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, FileText, CheckCircle2, 
  ArrowRight, Sparkles, HelpCircle, BookOpen, Layers, RefreshCw 
} from 'lucide-react';
import { paperService } from '../services/api';
import AlgorithmBadge from '../components/AlgorithmBadge';

export default function PlagiarismCheck() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    paperService.getCategories()
      .then(cats => {
        if (Array.isArray(cats)) {
          setCategoriesList(cats);
          if (cats.length > 0) setCategory(cats[0]);
        }
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  const handleCheckPlagiarism = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please paste or type the research paper text to evaluate.");
      return;
    }

    if (content.trim().length < 50) {
      setError("Please provide at least 50 characters of research paper content for meaningful Suffix Array + LCP similarity analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await paperService.checkPlagiarism({
        title: title.trim() || "Untitled Manuscript",
        author: author.trim() || "Anonymous",
        year: parseInt(year) || new Date().getFullYear(),
        category: category || "General",
        content: content.trim()
      });
      setResult(data);
      setLoading(false);
      
      // Scroll to result view
      setTimeout(() => {
        const el = document.getElementById('plagiarism-verdict-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error("Plagiarism check error:", err);
      setError("Failed to run plagiarism evaluation. Ensure the Spring Boot backend is active.");
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setAuthor('');
    setYear(new Date().getFullYear().toString());
    setContent('');
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '850px', margin: '0 auto 2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.35rem 0.85rem' }}>
              First-Principles String Similarity
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Academic Plagiarism & Textual Similarity Check
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Verify research manuscript authenticity against the Research Connect corpus. Textual overlap is analyzed by building a Generalized Suffix Array and Kasai's Longest Common Prefix (LCP) array from ground up.
          </p>
        </div>

        {/* Submission Form Card */}
        <div className="card" style={{ maxWidth: '850px', margin: '0 auto 2.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Manuscript Details
            </h2>
            <AlgorithmBadge type="suffix-array" label="Engine: Suffix Array + LCP" />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              color: 'var(--danger)',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCheckPlagiarism}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Paper Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Attention Mechanisms in Deep Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Author(s)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Smith, John Doe"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Publication Year
                </label>
                <input
                  type="number"
                  placeholder="2025"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Research Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {categoriesList.length === 0 && (
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                  )}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  Research Paper Text / Abstract <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {content.length} characters
                </span>
              </div>
              <textarea
                rows={12}
                placeholder="Paste the full manuscript text or abstract here to evaluate against all 180 papers in the corpus..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
              {content && (
                <button 
                  type="button" 
                  onClick={handleReset} 
                  className="btn btn-secondary btn-sm"
                  disabled={loading}
                >
                  <RefreshCw size={14} />
                  <span>Clear</span>
                </button>
              )}
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !content.trim()}
                style={{ padding: '0.65rem 1.75rem', fontSize: '0.95rem' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '0.5rem' }}></div>
                    <span>Evaluating Suffix Array & LCP...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={18} />
                    <span>Check Plagiarism</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* Plagiarism Analysis Results Section                                       */}
        {/* ========================================================================= */}
        {result && (
          <div id="plagiarism-verdict-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
            {/* Verdict Banner */}
            <div className="card" style={{
              backgroundColor: result.potentialPlagiarism ? '#fff1f2' : '#f0fdf4',
              borderColor: result.potentialPlagiarism ? '#fecdd3' : '#bbf7d0',
              borderLeftWidth: '6px',
              borderLeftColor: result.potentialPlagiarism ? '#e11d48' : '#16a34a',
              marginBottom: '1.75rem',
              padding: '1.5rem 1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {result.potentialPlagiarism ? (
                    <div style={{ backgroundColor: '#ffe4e6', color: '#e11d48', padding: '0.6rem', borderRadius: '50%' }}>
                      <ShieldAlert size={28} />
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '0.6rem', borderRadius: '50%' }}>
                      <ShieldCheck size={28} />
                    </div>
                  )}
                  <div>
                    <h2 style={{ 
                      fontSize: '1.35rem', 
                      fontWeight: 800, 
                      color: result.potentialPlagiarism ? '#9f1239' : '#14532d',
                      marginBottom: '0.2rem'
                    }}>
                      {result.verdict}
                    </h2>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 600, 
                      color: result.potentialPlagiarism ? '#be123c' : '#15803d' 
                    }}>
                      Similarity: {result.overallSimilarity}%
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{
                    backgroundColor: result.potentialPlagiarism ? '#e11d48' : '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.4rem 0.85rem'
                  }}>
                    {result.potentialPlagiarism ? 'Threshold > 60% Exceeded' : 'Threshold ≤ 60% Clear'}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Algorithm: Suffix Array + Kasai LCP
                  </div>
                </div>
              </div>

              {/* Mandatory Academic Prototype Disclaimers */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${result.potentialPlagiarism ? '#fecdd3' : '#bbf7d0'}`,
                fontSize: '0.85rem',
                color: result.potentialPlagiarism ? '#881337' : '#166534',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  • {result.primaryDisclaimer}
                </div>
                <div style={{ fontStyle: 'italic', opacity: 0.9 }}>
                  • {result.secondaryDisclaimer}
                </div>
              </div>
            </div>

            {/* Potential Source Papers */}
            <div className="card" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    Potential Source Papers in Corpus
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Papers exhibiting highest textual n-gram alignment based on Kasai's LCP traversal.
                  </p>
                </div>
                <span className="badge badge-primary">
                  {result.potentialSources.length} {result.potentialSources.length === 1 ? 'source' : 'sources'} identified
                </span>
              </div>

              {result.potentialSources.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                  No corpus papers showed non-trivial shared textual regions with the submitted text.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.potentialSources.map((source, index) => (
                    <div 
                      key={source.paper.id}
                      style={{
                        padding: '1.25rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            color: '#64748b',
                            backgroundColor: '#f1f5f9',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                          }}>
                            #{index + 1}
                          </span>
                          <Link 
                            to={`/papers/${source.paper.id}`}
                            style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {source.paper.title}
                          </Link>
                        </div>

                        <span className={`badge ${source.similarityPercentage > 60 ? 'badge-danger' : 'badge-category'}`} style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                          Similarity: {source.similarityPercentage}%
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>Author(s): <strong>{source.paper.author}</strong></span>
                        <span>Year: <strong>{source.paper.year}</strong></span>
                        <span>Category: <strong>{source.paper.category}</strong></span>
                        <span>Matched Non-Overlapping: <strong>{source.matchedCharacters} chars</strong></span>
                      </div>

                      {/* Matching Text Snippets */}
                      {source.matchingSnippets && source.matchingSnippets.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.4rem' }}>
                            Common Matching Text Portions:
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {source.matchingSnippets.map((snippet, sIdx) => (
                              <div
                                key={sIdx}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: '#fffbeb',
                                  borderLeft: '3px solid #f59e0b',
                                  borderRadius: '2px',
                                  fontSize: '0.85rem',
                                  color: '#78350f',
                                  fontStyle: 'italic',
                                  lineHeight: 1.4
                                }}
                              >
                                "{snippet}"
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: '0.85rem', textAlign: 'right' }}>
                        <Link 
                          to={`/papers/${source.paper.id}`} 
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
                        >
                          <span>Open Full Source Paper</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
