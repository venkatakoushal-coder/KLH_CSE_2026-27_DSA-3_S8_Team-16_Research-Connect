package com.researchconnect.controller;

import com.researchconnect.service.SimilarityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/papers")
@CrossOrigin(origins = "*")
public class SimilarityController {

    private final SimilarityService similarityService;

    @Autowired
    public SimilarityController(SimilarityService similarityService) {
        this.similarityService = similarityService;
    }

    /**
     * Similar papers recommendation using Suffix Array + LCP.
     * GET /api/papers/{id}/similar?limit=5
     */
    @GetMapping("/{id}/similar")
    public ResponseEntity<Map<String, Object>> getSimilarPapers(
            @PathVariable int id,
            @RequestParam(defaultValue = "5") int limit) {
        Map<String, Object> result = similarityService.getSimilarPapers(id, limit);
        if (result.containsKey("error")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Plagiarism & Textual Similarity Check using Suffix Array + LCP.
     * POST /api/plagiarism/check
     */
    @PostMapping("/plagiarism/check")
    public ResponseEntity<?> checkPlagiarism(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("title", "");
        String author = (String) payload.getOrDefault("author", "");
        Integer year = null;
        if (payload.containsKey("year") && payload.get("year") != null) {
            try {
                year = Integer.parseInt(payload.get("year").toString());
            } catch (Exception ignored) {}
        }
        String category = (String) payload.getOrDefault("category", "");
        String content = (String) payload.getOrDefault("content", "");

        if (content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Research paper content is required for plagiarism analysis"));
        }

        return ResponseEntity.ok(similarityService.checkPlagiarism(title, author, year, category, content));
    }
}
