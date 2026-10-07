package com.researchconnect.service;

import com.researchconnect.algorithm.CitationGraph;
import com.researchconnect.model.Paper;
import com.researchconnect.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CitationService {

    private final PaperService paperService;
    private final PaperRepository repository;

    @Autowired
    public CitationService(PaperService paperService, PaperRepository repository) {
        this.paperService = paperService;
        this.repository = repository;
    }

    public Map<String, Object> getPaperCitations(int paperId) {
        Map<String, Object> response = new HashMap<>();
        Paper target = repository.getPaperById(paperId);
        if (target == null) {
            response.put("error", "Paper with ID " + paperId + " not found");
            return response;
        }

        CitationGraph graph = paperService.getCitationGraph();
        List<Integer> citedIds = graph.getCitedPapers(paperId);
        List<Integer> citingIds = graph.getCitingPapers(paperId);

        List<Paper> citedPapers = new ArrayList<>();
        for (int id : citedIds) {
            Paper p = repository.getPaperById(id);
            if (p != null) citedPapers.add(p);
        }

        List<Paper> citingPapers = new ArrayList<>();
        for (int id : citingIds) {
            Paper p = repository.getPaperById(id);
            if (p != null) citingPapers.add(p);
        }

        response.put("paper", target);
        response.put("algorithm", "Directed Citation Graph");
        response.put("citedCount", citedPapers.size());
        response.put("citingCount", citingPapers.size());
        response.put("citedPapers", citedPapers);
        response.put("citingPapers", citingPapers);

        return response;
    }

    public Map<String, Object> getCitationPath(int sourceId, int targetId) {
        Map<String, Object> response = new HashMap<>();
        Paper source = repository.getPaperById(sourceId);
        Paper target = repository.getPaperById(targetId);

        if (source == null || target == null) {
            response.put("error", "Source or target paper not found");
            return response;
        }

        CitationGraph graph = paperService.getCitationGraph();
        List<Integer> pathIds = graph.findShortestCitationPath(sourceId, targetId);

        List<Paper> pathPapers = new ArrayList<>();
        for (int id : pathIds) {
            Paper p = repository.getPaperById(id);
            if (p != null) pathPapers.add(p);
        }

        response.put("source", source);
        response.put("target", target);
        response.put("algorithm", "Breadth-First Search (BFS) Shortest Path");
        response.put("hasPath", !pathIds.isEmpty());
        response.put("pathLength", pathIds.isEmpty() ? 0 : pathIds.size() - 1);
        response.put("path", pathPapers);

        return response;
    }

    public Map<String, Object> getBfsTraversal(int paperId) {
        Map<String, Object> response = new HashMap<>();
        Paper start = repository.getPaperById(paperId);
        if (start == null) {
            response.put("error", "Paper with ID " + paperId + " not found");
            return response;
        }

        CitationGraph graph = paperService.getCitationGraph();
        List<int[]> bfsLevels = graph.bfsTraversal(paperId);

        List<Map<String, Object>> levels = new ArrayList<>();
        for (int[] entry : bfsLevels) {
            int level = entry[0];
            int id = entry[1];
            Paper p = repository.getPaperById(id);
            if (p != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("level", level);
                item.put("paper", p);
                levels.add(item);
            }
        }

        response.put("startPaper", start);
        response.put("algorithm", "Breadth-First Search (BFS) Level Order Traversal");
        response.put("visitedCount", levels.size());
        response.put("traversal", levels);

        return response;
    }

    public Map<String, Object> getDfsTraversal(int paperId) {
        Map<String, Object> response = new HashMap<>();
        Paper start = repository.getPaperById(paperId);
        if (start == null) {
            response.put("error", "Paper with ID " + paperId + " not found");
            return response;
        }

        CitationGraph graph = paperService.getCitationGraph();
        List<Integer> dfsIds = graph.dfsTraversal(paperId);

        List<Paper> papers = new ArrayList<>();
        for (int id : dfsIds) {
            Paper p = repository.getPaperById(id);
            if (p != null) papers.add(p);
        }

        response.put("startPaper", start);
        response.put("algorithm", "Depth-First Search (DFS) Traversal");
        response.put("visitedCount", papers.size());
        response.put("chain", papers);

        return response;
    }

    public Map<String, Object> addCitation(int fromId, int toId) {
        Map<String, Object> response = new HashMap<>();
        Paper from = repository.getPaperById(fromId);
        Paper to = repository.getPaperById(toId);

        if (from == null || to == null) {
            response.put("success", false);
            response.put("message", "Both source and target papers must exist");
            return response;
        }

        if (fromId == toId) {
            response.put("success", false);
            response.put("message", "A paper cannot cite itself");
            return response;
        }

        CitationGraph graph = paperService.getCitationGraph();
        graph.addEdge(fromId, toId);

        response.put("success", true);
        response.put("message", "Citation added successfully: Paper " + fromId + " -> Paper " + toId);
        return response;
    }
}
