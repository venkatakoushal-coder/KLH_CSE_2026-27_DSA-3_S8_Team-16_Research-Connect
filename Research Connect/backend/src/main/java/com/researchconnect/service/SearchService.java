package com.researchconnect.service;

import com.researchconnect.algorithm.AhoCorasick;
import com.researchconnect.algorithm.EditDistance;
import com.researchconnect.algorithm.KMPSearch;
import com.researchconnect.model.Paper;
import com.researchconnect.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SearchService {

    private final PaperRepository repository;

    @Autowired
    public SearchService(PaperRepository repository) {
        this.repository = repository;
    }

    /**
     * Exact single-keyword search using KMP algorithm.
     */
    public Map<String, Object> searchKMP(String keyword) {
        Map<String, Object> response = new HashMap<>();
        if (keyword == null || keyword.trim().isEmpty()) {
            response.put("error", "Keyword cannot be empty");
            return response;
        }

        String cleanKeyword = keyword.trim();
        int[] lps = KMPSearch.computeLPS(cleanKeyword);

        List<Map<String, Object>> paperResults = new ArrayList<>();
        int totalOccurrencesAcrossCorpus = 0;

        List<Paper> allPapers = repository.getAllPapers();

        for (Paper paper : allPapers) {
            KMPSearch.PaperSearchResult res = KMPSearch.searchPaper(paper, cleanKeyword);
            if (res.totalOccurrences > 0) {
                totalOccurrencesAcrossCorpus += res.totalOccurrences;

                Map<String, Object> item = new HashMap<>();
                item.put("paper", paper);
                item.put("totalOccurrences", res.totalOccurrences);
                item.put("matches", res.matches);
                paperResults.add(item);
            }
        }

        // Sort descending by occurrence count
        paperResults.sort((a, b) -> Integer.compare((int) b.get("totalOccurrences"), (int) a.get("totalOccurrences")));

        response.put("keyword", cleanKeyword);
        response.put("algorithm", "Knuth-Morris-Pratt (KMP)");
        response.put("lpsTable", lps);
        response.put("totalOccurrences", totalOccurrencesAcrossCorpus);
        response.put("papersCount", paperResults.size());
        response.put("results", paperResults);

        // If no results, provide Edit Distance suggestions
        if (paperResults.isEmpty()) {
            List<EditDistance.Suggestion> suggestions = EditDistance.getSuggestions(cleanKeyword, repository.getVocabulary(), 2);
            response.put("suggestions", suggestions);
        } else {
            response.put("suggestions", Collections.emptyList());
        }

        return response;
    }

    /**
     * Real-time autocomplete suggestions powered by Prefix Trie.
     */
    public List<String> getAutocompleteSuggestions(String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return repository.getAutocompleteSuggestions(prefix.trim(), 8);
    }

    /**
     * Search inside a single paper using KMP.
     */
    public Map<String, Object> searchInsidePaper(int paperId, String keyword) {
        Map<String, Object> response = new HashMap<>();
        Paper paper = repository.getPaperById(paperId);
        if (paper == null) {
            response.put("error", "Paper with ID " + paperId + " not found");
            return response;
        }

        if (keyword == null || keyword.trim().isEmpty()) {
            response.put("error", "Keyword cannot be empty");
            return response;
        }

        String cleanKeyword = keyword.trim();
        int[] lps = KMPSearch.computeLPS(cleanKeyword);
        KMPSearch.PaperSearchResult res = KMPSearch.searchPaper(paper, cleanKeyword);

        response.put("paperId", paperId);
        response.put("keyword", cleanKeyword);
        response.put("algorithm", "Knuth-Morris-Pratt (KMP)");
        response.put("lpsTable", lps);
        response.put("totalOccurrences", res.totalOccurrences);
        response.put("matches", res.matches);

        return response;
    }

    /**
     * Typo-tolerant suggestions using Levenshtein Edit Distance.
     */
    public List<EditDistance.Suggestion> getSuggestions(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return EditDistance.getSuggestions(keyword.trim(), repository.getVocabulary(), 2);
    }

    /**
     * Multi-keyword search across corpus using Aho-Corasick algorithm.
     * AND semantics: only papers containing ALL keywords are returned.
     */
    public Map<String, Object> searchAhoCorasick(List<String> keywords) {
        Map<String, Object> response = new HashMap<>();
        if (keywords == null || keywords.isEmpty()) {
            response.put("error", "Keyword list cannot be empty");
            return response;
        }

        // Deduplicate and clean keywords
        List<String> cleanKeywords = new ArrayList<>();
        Set<String> seen = new java.util.LinkedHashSet<>();
        for (String k : keywords) {
            if (k != null && !k.trim().isEmpty()) {
                String lower = k.trim().toLowerCase();
                if (seen.add(lower)) {
                    cleanKeywords.add(k.trim());
                }
            }
        }

        if (cleanKeywords.isEmpty()) {
            response.put("error", "No valid keywords provided");
            return response;
        }

        AhoCorasick ac = new AhoCorasick(cleanKeywords);
        List<Map<String, Object>> results = new ArrayList<>();
        int totalMatchesCorpus = 0;

        for (Paper paper : repository.getAllPapers()) {
            AhoCorasick.PaperMultiResult res = ac.searchPaper(paper);
            if (res.getTotalMatchCount() > 0) {
                // AND semantics: every keyword must appear at least once
                boolean allPresent = true;
                for (String kw : cleanKeywords) {
                    Integer count = res.keywordCounts.get(kw);
                    if (count == null || count == 0) {
                        allPresent = false;
                        break;
                    }
                }
                if (!allPresent) continue;

                totalMatchesCorpus += res.getTotalMatchCount();
                Map<String, Object> item = new HashMap<>();
                item.put("paper", paper);
                item.put("totalMatches", res.getTotalMatchCount());
                item.put("keywordCounts", res.keywordCounts);
                item.put("matches", res.matches);
                results.add(item);
            }
        }

        // Sort descending by total match count
        results.sort((a, b) -> Integer.compare((int) b.get("totalMatches"), (int) a.get("totalMatches")));

        response.put("keywords", cleanKeywords);
        response.put("algorithm", "Aho-Corasick Multi-Pattern Automaton");
        response.put("totalMatches", totalMatchesCorpus);
        response.put("papersCount", results.size());
        response.put("results", results);

        return response;
    }
}
