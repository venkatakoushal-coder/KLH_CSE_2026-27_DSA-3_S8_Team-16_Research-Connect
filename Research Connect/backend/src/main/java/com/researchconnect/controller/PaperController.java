package com.researchconnect.controller;

import com.researchconnect.model.Paper;
import com.researchconnect.service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/papers")
@CrossOrigin(origins = "*")
public class PaperController {

    private final PaperService paperService;

    @Autowired
    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPapers(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        Map<String, Object> result = paperService.getFilteredPapers(category, year, author, query, page, limit);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaperById(@PathVariable int id) {
        Map<String, Object> paper = paperService.getPaperDetail(id);
        if (paper == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(paper);
    }

    @GetMapping("/meta/categories")
    public ResponseEntity<Set<String>> getCategories() {
        return ResponseEntity.ok(paperService.getCategories());
    }

    @GetMapping("/meta/years")
    public ResponseEntity<Set<Integer>> getYears() {
        return ResponseEntity.ok(paperService.getYears());
    }

    @GetMapping("/meta/authors")
    public ResponseEntity<Set<String>> getAuthors() {
        return ResponseEntity.ok(paperService.getAuthors());
    }
}
