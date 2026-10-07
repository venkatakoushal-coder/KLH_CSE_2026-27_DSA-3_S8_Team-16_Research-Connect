import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, BookOpen, Network, User, Calendar, Database, Layers, ArrowRight } from 'lucide-react';
import { paperService } from '../services/api';
import AlgorithmBadge from '../components/AlgorithmBadge';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    paperService.getStatistics()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load statistics:", err);
        setError("Could not load corpus statistics.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <div className="state-box">
          <div className="spinner"></div>
          <p>Calculating corpus and graph analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="card" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center', borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)' }}>{error || "Unable to fetch statistics"}</p>
        </div>
      </div>
    );
  }

  // Calculate maximum count for category bars
  const maxCategoryCount = Math.max(...Object.values(stats.papersByCategory || { 'a': 1 }));
  const maxYearCount = Math.max(...Object.values(stats.papersByYear || { 2024: 1 }));

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Corpus & Citation Analytics Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Real-time analytics computed directly from the 180-paper file repository and directed citation graph.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label">Total Papers</span>
              <BookOpen size={20} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalPapers}</div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Plain text files in Corpus/</span>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--indigo)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label">Total Citations</span>
              <Network size={20} color="var(--indigo)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalCitations}</div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Directed graph edges</span>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label">Categories</span>
              <Layers size={20} color="var(--success)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalCategories}</div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Distinct research domains</span>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="stat-label">Total Authors</span>
              <User size={20} color="#d97706" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalAuthors}</div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Contributing researchers</span>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Papers by Category Bar Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
              Papers Distribution by Category ({stats.totalCategories} domains)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(stats.papersByCategory || {})
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => {
                  const percentage = Math.round((count / maxCategoryCount) * 100);
                  return (
                    <div key={category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <Link to={`/papers?category=${encodeURIComponent(category)}`} style={{ fontWeight: 500, color: '#1e293b' }}>
                          {category}
                        </Link>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{count} papers</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Papers by Publication Year */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
              Publication Timeline (2019 – 2025)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(stats.papersByYear || {}).map(([year, count]) => {
                const percentage = Math.round((count / maxYearCount) * 100);
                return (
                  <div key={year}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <Link to={`/papers?year=${year}`} style={{ fontWeight: 600, color: '#0f172a' }}>
                        {year}
                      </Link>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{count} papers</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: '#16a34a',
                        borderRadius: '5px'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Most Cited Papers Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Most Cited Papers (Graph In-Degree Ranking)
            </h3>
            <AlgorithmBadge type="graph" label="Graph In-Degree Metric" />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Rank</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Title</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Year</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Citations Received</th>
                </tr>
              </thead>
              <tbody>
                {stats.mostCitedPapers && stats.mostCitedPapers.map((item, idx) => (
                  <tr key={item.paper.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: idx < 3 ? '#d97706' : '#64748b' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <Link to={`/papers/${item.paper.id}`} style={{ fontWeight: 600 }}>
                        {item.paper.title}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.paper.author}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>{item.paper.category}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{item.paper.year}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <span className="badge badge-indigo" style={{ fontWeight: 700 }}>
                        {item.citationsCount} citations
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
