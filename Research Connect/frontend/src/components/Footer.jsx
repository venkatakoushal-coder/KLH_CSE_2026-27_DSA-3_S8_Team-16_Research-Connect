import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p style={{ fontWeight: 600, color: '#0f172a' }}>
          Research Connect — Algorithm-Based Research Paper Discovery and Analysis System
        </p>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          Powered by pure Data Structures & Algorithms: Knuth-Morris-Pratt (KMP), Aho-Corasick, Levenshtein Edit Distance, Suffix Array + LCP, and Directed Citation Graph.
        </p>
        <div className="footer-disclaimer">
          Research Connect provides algorithm-driven research paper discovery and citation analysis across academic datasets.
        </div>
      </div>
    </footer>
  );
}
