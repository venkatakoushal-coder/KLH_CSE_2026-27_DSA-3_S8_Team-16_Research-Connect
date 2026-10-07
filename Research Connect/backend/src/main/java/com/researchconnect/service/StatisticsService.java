package com.researchconnect.service;

import com.researchconnect.algorithm.CitationGraph;
import com.researchconnect.model.Paper;
import com.researchconnect.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class StatisticsService {

    private final PaperService paperService;
    private final PaperRepository repository;

    @Autowired
    public StatisticsService(PaperService paperService, PaperRepository repository) {
        this.paperService = paperService;
        this.repository = repository;
    }

    public Map<String, Object> getCorpusStatistics() {
        Map<String, Object> stats = new HashMap<>();

        List<Paper> allPapers = repository.getAllPapers();
        CitationGraph graph = paperService.getCitationGraph();

        int totalPapers = allPapers.size();
        int totalCitations = graph.getTotalEdges();
        int totalNodesInGraph = graph.getTotalNodes();

        // Papers by Category
        Map<String, Integer> categoryCounts = new HashMap<>();
        for (Paper p : allPapers) {
            String cat = p.getCategory();
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0) + 1);
        }

        // Papers by Year (Sorted)
        Map<Integer, Integer> yearCounts = new TreeMap<>();
        for (Paper p : allPapers) {
            int y = p.getYear();
            yearCounts.put(y, yearCounts.getOrDefault(y, 0) + 1);
        }

        // Authors set
        int totalAuthors = repository.getAllAuthors().size();

        // Most cited papers (in-degree ranking)
        List<Map<String, Object>> mostCited = new ArrayList<>();
        for (Paper p : allPapers) {
            int count = graph.getCitingPapers(p.getId()).size();
            if (count > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("paper", p);
                item.put("citationsCount", count);
                mostCited.add(item);
            }
        }
        mostCited.sort((a, b) -> Integer.compare((int) b.get("citationsCount"), (int) a.get("citationsCount")));

        List<Map<String, Object>> topCited = mostCited.subList(0, Math.min(10, mostCited.size()));

        stats.put("totalPapers", totalPapers);
        stats.put("totalCategories", categoryCounts.size());
        stats.put("totalCitations", totalCitations);
        stats.put("totalAuthors", totalAuthors);
        stats.put("vocabularySize", repository.getVocabulary().size());
        stats.put("invertedIndexTerms", repository.getInvertedIndex().size());
        stats.put("papersByCategory", categoryCounts);
        stats.put("papersByYear", yearCounts);
        stats.put("mostCitedPapers", topCited);

        return stats;
    }
}
