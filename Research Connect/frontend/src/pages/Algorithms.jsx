import React from 'react';
import { Search, Cpu, Sparkles, GitMerge, Network, Database, Layers, CheckCircle2 } from 'lucide-react';
import AlgorithmBadge from '../components/AlgorithmBadge';

export default function Algorithms() {
  const algorithmsList = [
    {
      id: 'kmp',
      name: 'Knuth-Morris-Pratt (KMP) Algorithm',
      role: 'Exact Single-Keyword Search',
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(M)',
      badgeType: 'kmp',
      whatItDoes: 'KMP is a linear-time string searching algorithm. Before searching the text, it analyzes the search pattern to compute the Longest Proper Prefix which is also a Suffix (LPS table). When a character mismatch occurs during text scanning, the pattern pointer shifts using the LPS table without ever moving the main text pointer backward.',
      whyUsed: 'Standard substring search methods (like naive nested loops or Java indexOf) repeatedly backtrack over long document texts, resulting in worst-case O(N × M) complexity. KMP guarantees deterministic O(N) search time regardless of repetitive patterns or text length.',
      whereUsed: 'Powers single-keyword searches across the entire 180-paper corpus and in-document searching inside individual papers. Pinpoints exact line numbers, column numbers, global offsets, and preview snippets.'
    },
    {
      id: 'aho-corasick',
      name: 'Aho-Corasick Multi-Pattern Matching',
      role: 'Simultaneous Multi-Keyword Search',
      timeComplexity: 'O(N + ΣM + Z)',
      spaceComplexity: 'O(ΣM)',
      badgeType: 'aho-corasick',
      whatItDoes: 'Aho-Corasick constructs a finite-state pattern matching machine from a set of keywords. It builds a Trie (prefix tree) of all patterns and uses Breadth-First Search (BFS) to establish failure transitions and dictionary suffix links. The entire text is scanned once in linear time to locate every pattern occurrence.',
      whyUsed: 'If a user queries 5 research terms (e.g. "transformer, attention, NLP, neural, encoder"), running single-string search 5 times scans the entire corpus 5 separate times. Aho-Corasick searches for all 5 terms simultaneously in a single linear pass.',
      whereUsed: 'Powers the Advanced Search page and in-paper multi-pattern topic extraction, returning matched keywords and individual occurrence tallies per paper.'
    },
    {
      id: 'edit-distance',
      name: 'Levenshtein Edit Distance (2D Dynamic Programming)',
      role: 'Typo-Tolerant Search & "Did You Mean" Suggestions',
      timeComplexity: 'O(M × N)',
      spaceComplexity: 'O(M × N)',
      badgeType: 'edit-distance',
      whatItDoes: 'Calculates the minimum number of single-character edits (insertions, deletions, substitutions) needed to transform string S1 into string S2 using a 2D bottom-up Dynamic Programming matrix: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).',
      whyUsed: 'Users frequently make spelling mistakes when searching specialized academic jargon (e.g. typing "transfomer", "artifical", or "residaul"). Instead of returning an empty screen, the system detects phonetic and typographical errors within an edit threshold of ≤ 2.',
      whereUsed: 'Triggered whenever exact KMP matching yields 0 results on the Search page and in the suggestions API to recommend genuine corpus vocabulary terms.'
    },
    {
      id: 'suffix-array',
      name: 'Suffix Array & LCP Array (Kasai\'s Algorithm)',
      role: 'Document Similarity & Paper Recommendations',
      timeComplexity: 'O(N log N) SA, O(N) LCP',
      spaceComplexity: 'O(N)',
      badgeType: 'suffix-array',
      whatItDoes: 'A Suffix Array (SA) is an array of integers representing the starting positions of all suffixes of a string sorted in lexicographical order. Kasai\'s algorithm computes the Longest Common Prefix (LCP) array in linear O(N) time. By concatenating two paper texts with unique delimiters, adjacent suffixes crossing the boundary reveal shared common substrings.',
      whyUsed: 'Traditional TF-IDF and bag-of-words ignore sequential phrasing and syntactic structure, while neural embeddings require heavy GPU runtime. Suffix Array + LCP directly measures verbatim and structural textual overlap from first principles.',
      whereUsed: 'Powers the "Similar Papers" recommendation engine on every paper detail page, calculating similarity percentages and maximum common phrase lengths.'
    },
    {
      id: 'citation-graph',
      name: 'Directed Citation Graph (Adjacency List + BFS/DFS)',
      role: 'Citation Network & Traversal Analysis',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V + E)',
      badgeType: 'graph',
      whatItDoes: 'Models research papers as vertices V and citation relationships as directed edges E (u → v means paper u cites paper v). Uses forward adjacency lists for references and reverse adjacency lists for citations received (in-degree). Implements Queue-based Breadth-First Search (BFS) for shortest path discovery and Depth-First Search (DFS) for dependency chain tracing.',
      whyUsed: 'Research papers exist within an interconnected citation tree. Academic impact, influence hubs, and conceptual lineages cannot be understood without graph topology modeling.',
      whereUsed: 'Powers the "Citations & Graph" tab on the paper detail page, finding shortest citation paths between papers, generating BFS level order trees, and calculating citation metrics.'
    },
    {
      id: 'inverted-index',
      name: 'Inverted Index & Hashing',
      role: 'Rapid Candidate Paper Filtering',
      timeComplexity: 'O(1) Average Lookup',
      spaceComplexity: 'O(Terms + Postings)',
      badgeType: 'inverted-index',
      whatItDoes: 'Tokenizes all research papers at system startup and maintains an in-memory HashMap<String, Set<Integer>> mapping every unique vocabulary word to the set of paper IDs where that word appears.',
      whyUsed: 'With 180 papers and tens of thousands of words, scanning every file from disk on every keystroke causes unnecessary I/O overhead. The inverted index narrows candidate paper IDs instantaneously.',
      whereUsed: 'Used at application initialization and in candidate retrieval for search acceleration across the repository.'
    },
    {
      id: 'prefix-trie',
      name: 'Prefix Trie & Fuzzy Autocomplete',
      role: 'Real-Time Autocomplete & Search Suggestions',
      timeComplexity: 'O(L) Exact Prefix, O(L + B) Fuzzy',
      spaceComplexity: 'O(Alphabet × Nodes)',
      badgeType: 'trie',
      whatItDoes: 'Constructs an in-memory prefix tree (Trie) over the corpus vocabulary during initialization. Each node maintains character transitions, word termination flags, and occurrence frequencies. Employs PriorityQueue BFS traversal for frequency-ranked suggestions alongside bounded transposition checks for instant, typo-resilient autocomplete as users type.',
      whyUsed: 'Linear scanning through thousands of corpus vocabulary words on every keystroke incurs noticeable latency. The Prefix Trie guarantees sub-millisecond retrieval by traversing only the character path matching the user prefix.',
      whereUsed: 'Powers real-time search autocomplete across the Home page, Global Search, and Advanced Search keyword entry.'
    }
  ];

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ maxWidth: '800px', margin: '0 auto 3rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary">Theoretical & Engineering Reference</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Algorithms Used in Research Connect
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
            A comprehensive reference explaining the design, implementation, and application of the Data Structures & Algorithms powering Research Connect.
          </p>
        </div>

        {/* Algorithm Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {algorithmsList.map(algo => (
            <div key={algo.id} id={algo.id} className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {algo.name}
                  </h2>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                    Primary Role: {algo.role}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <AlgorithmBadge type={algo.badgeType} />
                  <span className="badge badge-category">Time: {algo.timeComplexity}</span>
                  <span className="badge badge-category">Space: {algo.spaceComplexity}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    What It Does
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                    {algo.whatItDoes}
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Why Research Connect Uses It
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                    {algo.whyUsed}
                  </p>
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>
                    Where It Is Used in Application
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.6 }}>
                    {algo.whereUsed}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
