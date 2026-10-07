package com.researchconnect.controller;

import com.researchconnect.service.CitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CitationController {

    private final CitationService citationService;

    @Autowired
    public CitationController(CitationService citationService) {
        this.citationService = citationService;
    }

    /**
     * Get citation information for a paper.
     * GET /api/papers/{id}/citations
     */
    @GetMapping("/papers/{id}/citations")
    public ResponseEntity<Map<String, Object>> getPaperCitations(@PathVariable int id) {
        Map<String, Object> result = citationService.getPaperCitations(id);
        if (result.containsKey("error")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get shortest citation path between two papers using BFS.
     * GET /api/papers/{id}/citation-path/{targetId}
     */
    @GetMapping("/papers/{id}/citation-path/{targetId}")
    public ResponseEntity<Map<String, Object>> getCitationPath(
            @PathVariable int id,
            @PathVariable int targetId) {
        Map<String, Object> result = citationService.getCitationPath(id, targetId);
        if (result.containsKey("error")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get BFS traversal from a paper.
     * GET /api/papers/{id}/bfs
     */
    @GetMapping("/papers/{id}/bfs")
    public ResponseEntity<Map<String, Object>> getBfsTraversal(@PathVariable int id) {
        Map<String, Object> result = citationService.getBfsTraversal(id);
        if (result.containsKey("error")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Get DFS traversal chain from a paper.
     * GET /api/papers/{id}/dfs
     */
    @GetMapping("/papers/{id}/dfs")
    public ResponseEntity<Map<String, Object>> getDfsTraversal(@PathVariable int id) {
        Map<String, Object> result = citationService.getDfsTraversal(id);
        if (result.containsKey("error")) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Add a citation link between two papers.
     * POST /api/citations?fromId=101&toId=104
     */
    @PostMapping("/citations")
    public ResponseEntity<Map<String, Object>> addCitation(
            @RequestParam int fromId,
            @RequestParam int toId) {
        Map<String, Object> result = citationService.addCitation(fromId, toId);
        return ResponseEntity.ok(result);
    }
}
