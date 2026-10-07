package com.researchconnect.service;

import com.researchconnect.algorithm.CitationGraph;
import com.researchconnect.model.Paper;
import com.researchconnect.repository.PaperRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PaperService {

    private final PaperRepository repository;
    private final CitationGraph citationGraph = new CitationGraph();

    @Autowired
    public PaperService(PaperRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void init() {
        // Try multiple paths: classpath resources, current dir Corpus, parent dir Corpus
        String[] candidatePaths = {
            "src/main/resources/Corpus",
            "backend/src/main/resources/Corpus",
            "Corpus",
            "../Corpus"
        };

        String foundPath = null;
        for (String path : candidatePaths) {
            File f = new File(path);
            if (f.exists() && f.isDirectory()) {
                foundPath = f.getAbsolutePath();
                break;
            }
        }

        if (foundPath != null) {
            System.out.println("[PaperService] Loading corpus from: " + foundPath);
            repository.loadFromDirectory(foundPath);

            // Load citations
            File citationsFile = new File(foundPath, "citations.txt");
            if (citationsFile.exists()) {
                for (Paper p : repository.getAllPapers()) {
                    citationGraph.registerPaper(p.getId());
                }
                citationGraph.loadCitations(citationsFile.getAbsolutePath());
                System.out.println("[PaperService] Loaded citation graph with " + citationGraph.getTotalNodes() + " nodes and " + citationGraph.getTotalEdges() + " edges.");
            }
        } else {
            System.err.println("[PaperService] Warning: Corpus directory could not be located in candidate paths.");
        }
    }

    public List<Paper> getAllPapers() {
        return repository.getAllPapers();
    }

    public Paper getPaperById(int id) {
        return repository.getPaperById(id);
    }

    public Map<String, Object> getPaperDetail(int id) {
        Paper p = repository.getPaperById(id);
        if (p == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("title", p.getTitle());
        map.put("author", p.getAuthor());
        map.put("year", p.getYear());
        map.put("category", p.getCategory());
        map.put("content", p.getContent());
        map.put("wordCount", p.getWordCount());

        List<Integer> citedIds = citationGraph.getCitedPapers(id);
        List<Map<String, Object>> references = new ArrayList<>();
        for (int cid : citedIds) {
            Paper ref = repository.getPaperById(cid);
            if (ref != null) {
                Map<String, Object> refMap = new HashMap<>();
                refMap.put("id", ref.getId());
                refMap.put("title", ref.getTitle());
                refMap.put("author", ref.getAuthor());
                refMap.put("year", ref.getYear());
                refMap.put("category", ref.getCategory());
                references.add(refMap);
            }
        }

        List<Integer> citingIds = citationGraph.getCitingPapers(id);
        List<Map<String, Object>> citedBy = new ArrayList<>();
        for (int cid : citingIds) {
            Paper c = repository.getPaperById(cid);
            if (c != null) {
                Map<String, Object> cMap = new HashMap<>();
                cMap.put("id", c.getId());
                cMap.put("title", c.getTitle());
                cMap.put("author", c.getAuthor());
                cMap.put("year", c.getYear());
                cMap.put("category", c.getCategory());
                citedBy.add(cMap);
            }
        }

        map.put("references", references);
        map.put("citedBy", citedBy);
        return map;
    }

    public Map<String, Object> getFilteredPapers(String category, Integer year, String author, String query, int page, int limit) {
        List<Paper> all = repository.getAllPapers();
        List<Paper> filtered = new ArrayList<>();

        String normCategory = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) ? category.trim().toLowerCase() : null;
        String normAuthor = (author != null && !author.trim().isEmpty()) ? author.trim().toLowerCase() : null;
        String normQuery = (query != null && !query.trim().isEmpty()) ? query.trim().toLowerCase() : null;

        for (Paper p : all) {
            if (normCategory != null && !p.getCategory().toLowerCase().contains(normCategory)) {
                continue;
            }
            if (year != null && p.getYear() != year) {
                continue;
            }
            if (normAuthor != null && !p.getAuthor().toLowerCase().contains(normAuthor)) {
                continue;
            }
            if (normQuery != null) {
                boolean inTitle = p.getTitle().toLowerCase().contains(normQuery);
                boolean inAuthor = p.getAuthor().toLowerCase().contains(normQuery);
                boolean inCategory = p.getCategory().toLowerCase().contains(normQuery);
                if (!inTitle && !inAuthor && !inCategory) {
                    continue;
                }
            }
            filtered.add(p);
        }

        // Sort by ID
        filtered.sort(Comparator.comparingInt(Paper::getId));

        int total = filtered.size();
        int startIndex = (page - 1) * limit;
        int endIndex = Math.min(startIndex + limit, total);

        List<Paper> pageResults = (startIndex < total) ? filtered.subList(startIndex, endIndex) : Collections.emptyList();

        Map<String, Object> response = new HashMap<>();
        response.put("papers", pageResults);
        response.put("total", total);
        response.put("page", page);
        response.put("limit", limit);
        response.put("totalPages", (int) Math.ceil((double) total / limit));

        return response;
    }

    public Set<String> getCategories() {
        return repository.getAllCategories();
    }

    public Set<Integer> getYears() {
        return repository.getAllYears();
    }

    public Set<String> getAuthors() {
        return repository.getAllAuthors();
    }

    public CitationGraph getCitationGraph() {
        return citationGraph;
    }

    public PaperRepository getRepository() {
        return repository;
    }
}
