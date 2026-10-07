import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Papers from './pages/Papers';
import PaperDetail from './pages/PaperDetail';
import SearchResults from './pages/SearchResults';
import AdvancedSearch from './pages/AdvancedSearch';
import PlagiarismCheck from './pages/PlagiarismCheck';
import Statistics from './pages/Statistics';
import Algorithms from './pages/Algorithms';

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/papers/:id" element={<PaperDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/plagiarism-check" element={<PlagiarismCheck />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/algorithms" element={<Algorithms />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
