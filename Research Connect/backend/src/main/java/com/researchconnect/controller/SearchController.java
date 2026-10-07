package com.researchconnect.controller;

import com.researchconnect.algorithm.EditDistance;
import com.researchconnect.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SearchController {

    private final SearchService searchService;

    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Exact single-keyword search across corpus using KMP.
     * GET /api/search?keyword=transformer
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchSingle(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query parameter 'keyword' is required"));
        }
        Map<String, Object> result = searchService.searchKMP(keyword);
        return ResponseEntity.ok(result);
    }

    /**
     * Search inside one paper using KMP.
     * GET /api/papers/{id}/search?keyword=transformer
     */
    @GetMapping("/papers/{id}/search")
    public ResponseEntity<Map<String, Object>> searchInsidePaper(
            @PathVariable int id,
            @RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query parameter 'keyword' is required"));
        }
        Map<String, Object> result = searchService.searchInsidePaper(id, keyword);
        return ResponseEntity.ok(result);
    }

    /**
     * Search suggestions using Levenshtein Edit Distance.
     * GET /api/search/suggestions?keyword=transfomer
     */
    @GetMapping("/search/suggestions")
    public ResponseEntity<List<EditDistance.Suggestion>> getSuggestions(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<EditDistance.Suggestion> suggestions = searchService.getSuggestions(keyword);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Real-time autocomplete suggestions powered by Prefix Trie.
     * GET /api/search/autocomplete?prefix=nue
     */
    @GetMapping("/search/autocomplete")
    public ResponseEntity<List<String>> getAutocomplete(@RequestParam(required = false) String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<String> suggestions = searchService.getAutocompleteSuggestions(prefix);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Multiple keyword search using Aho-Corasick algorithm.
     * GET /api/search/multiple?keywords=transformer,attention,NLP
     */
    @GetMapping("/search/multiple")
    public ResponseEntity<Map<String, Object>> searchMultiple(@RequestParam(required = false) String keywords) {
        if (keywords == null || keywords.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query parameter 'keywords' is required"));
        }
        String[] parts = keywords.split(",");
        List<String> list = Arrays.stream(parts).map(String::trim).filter(s -> !s.isEmpty()).toList();
        Map<String, Object> result = searchService.searchAhoCorasick(list);
        return ResponseEntity.ok(result);
    }
}
