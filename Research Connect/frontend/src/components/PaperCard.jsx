import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PaperCard({ paper, totalOccurrences = null, matches = null, highlightKeyword = null }) {
  if (!paper) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span className="badge badge-category">
          {paper.category}
        </span>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.4 }}>
        <Link to={`/papers/${paper.id}${highlightKeyword ? `?highlight=${encodeURIComponent(highlightKeyword)}` : ''}`} style={{ color: 'inherit' }}>
          {paper.title}
        </Link>
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <User size={14} />
          <span>{paper.author}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={14} />
          <span>{paper.year}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <FileText size={14} />
          <span>{paper.wordCount} words</span>
        </div>
      </div>

      {totalOccurrences !== null && (
        <div style={{ 
          backgroundColor: '#eff6ff', 
          border: '1px solid #bfdbfe', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.5rem 0.75rem',
          fontSize: '0.85rem',
          color: '#1d4ed8',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.85rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{totalOccurrences} {totalOccurrences === 1 ? 'occurrence' : 'occurrences'} found</span>
        </div>
      )}

      {matches && matches.length > 0 && (
        <div style={{ 
          fontSize: '0.825rem', 
          color: '#334155', 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.6rem 0.75rem', 
          marginBottom: '1rem',
          fontStyle: 'italic'
        }}>
          "{matches[0].snippet}"
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link 
          to={`/papers/${paper.id}${highlightKeyword ? `?highlight=${encodeURIComponent(highlightKeyword)}` : ''}`}
          className="btn btn-primary btn-sm"
          style={{ width: '100%' }}
        >
          <span>View Full Paper</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
