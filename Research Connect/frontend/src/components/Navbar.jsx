import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookOpen, Search, Sparkles, BarChart2, Cpu, FileText } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <BookOpen size={18} />
          </div>
          <span>Research Connect</span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/papers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Papers
              </NavLink>
            </li>
            <li>
              <NavLink to="/advanced-search" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Advanced Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/plagiarism-check" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Plagiarism Check
              </NavLink>
            </li>
            <li>
              <NavLink to="/statistics" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Statistics
              </NavLink>
            </li>
            <li>
              <NavLink to="/algorithms" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Algorithms
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
