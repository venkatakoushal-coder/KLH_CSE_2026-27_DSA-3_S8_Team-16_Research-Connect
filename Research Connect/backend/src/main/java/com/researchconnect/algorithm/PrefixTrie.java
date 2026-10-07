package com.researchconnect.algorithm;

import java.util.*;

/**
 * Prefix Trie data structure for real-time search autocomplete.
 * Supports exact prefix retrieval and efficient typo-tolerant/fuzzy prefix search
 * (e.g., character transposition such as "nue" -> "neural", "trans" -> "transformer",
 * "att" -> "attention") without scanning the corpus.
 */
public class PrefixTrie {

    public static class TrieNode {
        public Map<Character, TrieNode> children = new HashMap<>();
        public boolean isEndOfWord = false;
        public int frequency = 0;
        public String word = null;
    }

    private final TrieNode root = new TrieNode();
    private int wordCount = 0;

    public PrefixTrie() {}

    /**
     * Insert a word into the Trie with its occurrence frequency.
     */
    public void insert(String word, int frequency) {
        if (word == null || word.trim().isEmpty()) return;
        String clean = normalizeWord(word);
        if (clean.length() < 2) return; // Ignore single characters

        TrieNode curr = root;
        for (int i = 0; i < clean.length(); i++) {
            char c = clean.charAt(i);
            curr = curr.children.computeIfAbsent(c, k -> new TrieNode());
        }
        curr.isEndOfWord = true;
        curr.frequency += Math.max(1, frequency);
        curr.word = clean;
        wordCount++;
    }

    /**
     * Get autocomplete suggestions.
     * First checks exact prefix match in the Trie.
     * If results are empty or fewer than limit, uses bounded Trie-based fuzzy/transposition
     * matching (e.g. "nue" -> "neural") without scanning the corpus.
     */
    public List<String> getSuggestions(String prefix, int limit) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String clean = normalizeWord(prefix);
        if (clean.isEmpty()) return Collections.emptyList();

        Set<String> matchedWords = new LinkedHashSet<>();

        // 1. Exact prefix matching on Trie
        TrieNode prefixNode = findPrefixNode(clean);
        if (prefixNode != null) {
            collectWords(prefixNode, matchedWords, limit);
        }

        // 2. If no exact matches or fewer than limit, perform bounded fuzzy prefix search
        if (matchedWords.size() < limit && clean.length() >= 2) {
            // Check character transpositions (e.g., "nue" -> "neu" -> "neural")
            for (int i = 0; i < clean.length() - 1; i++) {
                char[] chars = clean.toCharArray();
                char temp = chars[i];
                chars[i] = chars[i + 1];
                chars[i + 1] = temp;
                String transposed = new String(chars);

                TrieNode transNode = findPrefixNode(transposed);
                if (transNode != null) {
                    collectWords(transNode, matchedWords, limit);
                    if (matchedWords.size() >= limit) break;
                }
            }

            // Check 1-edit distance prefix matching directly on the Trie (bounded to length of prefix + 1)
            if (matchedWords.size() < limit) {
                fuzzyPrefixSearch(root, clean, 0, 0, matchedWords, limit);
            }
        }

        // Sort by relevance: exact prefix match first, then shorter length
        List<String> results = new ArrayList<>(matchedWords);
        results.sort((a, b) -> {
            boolean aStarts = a.startsWith(clean);
            boolean bStarts = b.startsWith(clean);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return Integer.compare(a.length(), b.length());
        });

        if (results.size() > limit) {
            return results.subList(0, limit);
        }
        return results;
    }

    private TrieNode findPrefixNode(String prefix) {
        TrieNode curr = root;
        for (int i = 0; i < prefix.length(); i++) {
            char c = prefix.charAt(i);
            curr = curr.children.get(c);
            if (curr == null) {
                return null;
            }
        }
        return curr;
    }

    /**
     * Collect words starting from a node using BFS prioritizing higher frequency words.
     */
    private void collectWords(TrieNode startNode, Set<String> results, int limit) {
        PriorityQueue<TrieNode> pq = new PriorityQueue<>((a, b) -> Integer.compare(b.frequency, a.frequency));
        Queue<TrieNode> q = new LinkedList<>();
        q.add(startNode);

        while (!q.isEmpty()) {
            TrieNode curr = q.poll();
            if (curr.isEndOfWord && curr.word != null) {
                pq.add(curr);
            }
            for (TrieNode child : curr.children.values()) {
                q.add(child);
            }
        }

        while (!pq.isEmpty() && results.size() < limit) {
            results.add(pq.poll().word);
        }
    }

    /**
     * Bounded DFS on Trie for 1-edit distance prefix matching.
     */
    private void fuzzyPrefixSearch(TrieNode node, String target, int targetIdx, int edits, Set<String> results, int limit) {
        if (edits > 1 || results.size() >= limit) return;

        if (targetIdx == target.length()) {
            collectWords(node, results, limit);
            return;
        }

        char expected = target.charAt(targetIdx);

        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            char c = entry.getKey();
            TrieNode child = entry.getValue();

            if (c == expected) {
                fuzzyPrefixSearch(child, target, targetIdx + 1, edits, results, limit);
            } else if (edits == 0) {
                // Substitution
                fuzzyPrefixSearch(child, target, targetIdx + 1, edits + 1, results, limit);
                // Insertion in word (skip char in trie)
                fuzzyPrefixSearch(child, target, targetIdx, edits + 1, results, limit);
            }
        }

        // Deletion in word (skip char in target)
        if (edits == 0 && targetIdx < target.length()) {
            fuzzyPrefixSearch(node, target, targetIdx + 1, edits + 1, results, limit);
        }
    }

    private static String normalizeWord(String word) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < word.length(); i++) {
            char c = word.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                sb.append(Character.toLowerCase(c));
            }
        }
        return sb.toString();
    }

    public int getWordCount() {
        return wordCount;
    }
}
