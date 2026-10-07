import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Filter, Search, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { paperService } from '../services/api';
import PaperCard from '../components/PaperCard';

export default function Papers() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [papers, setPapers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter options from backend
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([]);

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Load filter options once
  useEffect(() => {
    Promise.all([paperService.getCategories(), paperService.getYears()])
      .then(([cats, yrs]) => {
        setCategories(Array.from(cats).sort());
        setYears(Array.from(yrs).sort((a, b) => b - a));
      })
      .catch(err => console.error("Error loading filter metadata:", err));
  }, []);

  // Fetch papers on filter/page change
  useEffect(() => {
    setLoading(true);

    const params = {
      page: currentPage,
      limit: 12
    };

    if (selectedCategory && selectedCategory !== 'All') {
      params.category = selectedCategory;
    }
    if (selectedYear && selectedYear !== 'All') {
      params.year = parseInt(selectedYear, 10);
    }
    if (searchQuery.trim()) {
      params.query = searchQuery.trim();
    }

    paperService.getPapers(params)
      .then(data => {
        setPapers(data.papers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading papers:", err);
        setLoading(false);
      });
  }, [selectedCategory, selectedYear, searchQuery, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedYear('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              Research Papers Corpus
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Explore {total} research papers in the digital repository.
            </p>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
            Showing page {currentPage} of {totalPages} ({total} papers)
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          {/* Category Filter */}
          <select 
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select 
            className="filter-select"
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Years</option>
            {years.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          {/* In-list Search Filter */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Filter by title, author, or keyword..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {(selectedCategory !== 'All' || selectedYear !== 'All' || searchQuery) && (
            <button 
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="state-box">
            <div className="spinner"></div>
            <p>Loading papers...</p>
          </div>
        )}

        {/* Papers Grid */}
        {!loading && papers.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {papers.map(p => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && papers.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', margin: '2rem 0' }}>
            <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              No papers found matching criteria
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Try adjusting your category, year, or search query filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
              Reset All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span style={{ padding: '0 0.4rem', color: '#94a3b8' }}>...</span>}
                    <button
                      className={`page-btn ${p === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
