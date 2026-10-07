import React from 'react';
import { Cpu, Search, Sparkles, Network, GitMerge, FileText } from 'lucide-react';

const algorithmConfigs = {
  'kmp': {
    name: 'Algorithm: KMP (Knuth-Morris-Pratt)',
    color: 'badge-primary',
    icon: Search,
    desc: 'O(N + M) Exact single-keyword matching using LPS failure table'
  },
  'aho-corasick': {
    name: 'Algorithm: Aho-Corasick',
    color: 'badge-indigo',
    icon: Cpu,
    desc: 'O(N + ΣM) Multi-pattern simultaneous search using Trie + BFS failure links'
  },
  'edit-distance': {
    name: 'Algorithm: Edit Distance (Levenshtein DP)',
    color: 'badge-warning',
    icon: Sparkles,
    desc: 'O(M × N) 2D Dynamic Programming typo detection and suggestions'
  },
  'suffix-array': {
    name: 'Algorithm: Suffix Array + LCP',
    color: 'badge-success',
    icon: GitMerge,
    desc: 'Kasai O(N) LCP array & common substring overlap for paper similarity'
  },
  'graph': {
    name: 'Algorithm: Citation Graph (BFS/DFS)',
    color: 'badge-indigo',
    icon: Network,
    desc: 'Directed adjacency list representation with BFS shortest path & DFS traversal'
  },
  'inverted-index': {
    name: 'Algorithm: Inverted Index Hashing',
    color: 'badge-primary',
    icon: FileText,
    desc: 'O(1) candidate paper filtering using in-memory hash index'
  },
  'trie': {
    name: 'Algorithm: Prefix Trie Autocomplete',
    color: 'badge-primary',
    icon: Search,
    desc: 'O(L) Prefix tree autocomplete with bounded transposition matching'
  },
  'prefix-trie': {
    name: 'Algorithm: Prefix Trie Autocomplete',
    color: 'badge-primary',
    icon: Search,
    desc: 'O(L) Prefix tree autocomplete with bounded transposition matching'
  }
};

export default function AlgorithmBadge({ type = 'kmp', label = null }) {
  const config = algorithmConfigs[type.toLowerCase()] || {
    name: label || type,
    color: 'badge-primary',
    icon: Cpu,
    desc: ''
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.color}`} title={config.desc}>
      <Icon size={13} />
      <span>{label || config.name}</span>
    </span>
  );
}
