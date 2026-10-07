package com.researchconnect.service;

import com.researchconnect.algorithm.SuffixArray;
import com.researchconnect.model.Paper;
import com.researchconnect.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SimilarityService {

    private final PaperRepository repository;

    @Autowired
    public SimilarityService(PaperRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> getSimilarPapers(int paperId, int topN) {
        Map<String, Object> response = new HashMap<>();
        Paper target = repository.getPaperById(paperId);
        if (target == null) {
            response.put("error", "Paper with ID " + paperId + " not found");
            return response;
        }

        List<Paper> allPapers = repository.getAllPapers();
        List<SuffixArray.SimilarityScore> recommendations = SuffixArray.recommendSimilar(target, allPapers, topN > 0 ? topN : 5);

        response.put("targetPaper", target);
        response.put("algorithm", "Suffix Array + LCP (Kasai Algorithm)");
        response.put("recommendations", recommendations);

        return response;
    }

    /**
     * Plagiarism & textual similarity detection using Suffix Array + LCP.
     */
    public SuffixArray.PlagiarismReport checkPlagiarism(String title, String author, Integer year, String category, String content) {
        if (content == null || content.trim().isEmpty()) {
            SuffixArray.PlagiarismReport emptyReport = new SuffixArray.PlagiarismReport();
            emptyReport.verdict = "No Content Provided";
            return emptyReport;
        }

        List<Paper> allPapers = repository.getAllPapers();
        return SuffixArray.evaluatePlagiarism(content, allPapers);
    }
}
