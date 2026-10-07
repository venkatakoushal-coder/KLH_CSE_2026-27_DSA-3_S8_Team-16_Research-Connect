import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paperService = {
  // Get paginated / filtered papers
  getPapers: async (params = {}) => {
    const response = await api.get('/papers', { params });
    return response.data;
  },

  // Get single paper by ID
  getPaperById: async (id) => {
    const response = await api.get(`/papers/${id}`);
    return response.data;
  },

  // Get metadata
  getCategories: async () => {
    const response = await api.get('/papers/meta/categories');
    return response.data;
  },

  getYears: async () => {
    const response = await api.get('/papers/meta/years');
    return response.data;
  },

  getAuthors: async () => {
    const response = await api.get('/papers/meta/authors');
    return response.data;
  },

  // Exact single keyword search using KMP
  searchKMP: async (keyword) => {
    const response = await api.get('/search', { params: { keyword } });
    return response.data;
  },

  // Search inside single paper using KMP
  searchInsidePaper: async (id, keyword) => {
    const response = await api.get(`/papers/${id}/search`, { params: { keyword } });
    return response.data;
  },

  // Typo suggestions using Levenshtein Edit Distance
  getSuggestions: async (keyword) => {
    const response = await api.get('/search/suggestions', { params: { keyword } });
    return response.data;
  },

  // Real-time prefix autocomplete using Trie
  getAutocomplete: async (prefix) => {
    const response = await api.get('/search/autocomplete', { params: { prefix } });
    return response.data;
  },

  // Plagiarism & Textual Similarity Check using Suffix Array + LCP
  checkPlagiarism: async (paperData) => {
    const response = await api.post('/papers/plagiarism/check', paperData);
    return response.data;
  },

  // Multi-keyword search using Aho-Corasick
  searchMultiple: async (keywords) => {
    const kwString = Array.isArray(keywords) ? keywords.join(',') : keywords;
    const response = await api.get('/search/multiple', { params: { keywords: kwString } });
    return response.data;
  },

  // Suffix Array + LCP Document Similarity
  getSimilarPapers: async (id, limit = 5) => {
    const response = await api.get(`/papers/${id}/similar`, { params: { limit } });
    return response.data;
  },

  // Citation Graph
  getCitations: async (id) => {
    const response = await api.get(`/papers/${id}/citations`);
    return response.data;
  },

  getCitationPath: async (sourceId, targetId) => {
    const response = await api.get(`/papers/${sourceId}/citation-path/${targetId}`);
    return response.data;
  },

  getBfsTraversal: async (id) => {
    const response = await api.get(`/papers/${id}/bfs`);
    return response.data;
  },

  getDfsTraversal: async (id) => {
    const response = await api.get(`/papers/${id}/dfs`);
    return response.data;
  },

  addCitation: async (fromId, toId) => {
    const response = await api.post('/citations', null, { params: { fromId, toId } });
    return response.data;
  },

  // Corpus Statistics
  getStatistics: async () => {
    const response = await api.get('/statistics');
    return response.data;
  },
};

export default api;
