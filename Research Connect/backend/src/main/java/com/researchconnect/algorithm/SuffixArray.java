package com.researchconnect.algorithm;

import com.researchconnect.model.Paper;
import java.util.*;

/**
 * Suffix Array and LCP (Longest Common Prefix) array implementation
 * for computing document similarity and prototype plagiarism detection
 * across research papers using first-principles Data Structures & Algorithms.
 */
public class SuffixArray {

    public static class SimilarityScore {
        public Paper paper;
        public double similarityPercentage;
        public int sharedOverlapLength;
        public int maxCommonSubstringLength;

        public SimilarityScore() {}

        public SimilarityScore(Paper paper, double similarityPercentage, int sharedOverlapLength, int maxCommonSubstringLength) {
            this.paper = paper;
            this.similarityPercentage = similarityPercentage;
            this.sharedOverlapLength = sharedOverlapLength;
            this.maxCommonSubstringLength = maxCommonSubstringLength;
        }

        public Paper getPaper() {
            return paper;
        }

        public double getSimilarityPercentage() {
            return similarityPercentage;
        }

        public int getSharedOverlapLength() {
            return sharedOverlapLength;
        }

        public int getMaxCommonSubstringLength() {
            return maxCommonSubstringLength;
        }

        @Override
        public String toString() {
            return String.format("[%d] %s -> Similarity: %.2f%% (Max Match: %d chars)",
                    paper.getId(), paper.getTitle(), similarityPercentage, maxCommonSubstringLength);
        }
    }

    /**
     * Data structure representing matching text intervals for non-overlapping coverage calculation.
     */
    public static class TextInterval {
        public int start;
        public int end;

        public TextInterval(int start, int end) {
            this.start = start;
            this.end = end;
        }
    }

    /**
     * Source match details for plagiarism detection.
     */
    public static class PlagiarismMatch {
        public Paper paper;
        public double similarityPercentage;
        public int matchedCharacters;
        public int totalCharacters;
        public List<String> matchingSnippets = new ArrayList<>();

        public PlagiarismMatch() {}

        public PlagiarismMatch(Paper paper, double similarityPercentage, int matchedCharacters, int totalCharacters, List<String> matchingSnippets) {
            this.paper = paper;
            this.similarityPercentage = similarityPercentage;
            this.matchedCharacters = matchedCharacters;
            this.totalCharacters = totalCharacters;
            this.matchingSnippets = matchingSnippets;
        }

        public Paper getPaper() { return paper; }
        public double getSimilarityPercentage() { return similarityPercentage; }
        public int getMatchedCharacters() { return matchedCharacters; }
        public int getTotalCharacters() { return totalCharacters; }
        public List<String> getMatchingSnippets() { return matchingSnippets; }
    }

    /**
     * Full plagiarism verification report.
     */
    public static class PlagiarismReport {
        public double overallSimilarity = 0.0;
        public boolean potentialPlagiarism = false;
        public String verdict = "No Significant Match Detected";
        public String primaryDisclaimer = "Potential plagiarism detected based on textual similarity.";
        public String secondaryDisclaimer = "This is a prototype similarity check and should not be treated as a definitive plagiarism determination.";
        public String formulaExplanation = "Similarity = (Total Non-Overlapping Matched Characters in New Paper via Suffix Array + Kasai LCP / Total Normalized Length of New Paper) * 100";
        public List<PlagiarismMatch> potentialSources = new ArrayList<>();
    }

    // Build Suffix Array by sorting suffix start indices
    public static Integer[] buildSuffixArray(final String text) {
        int n = text.length();
        Integer[] sa = new Integer[n];
        for (int i = 0; i < n; i++) {
            sa[i] = i;
        }

        // Sort suffixes alphabetically
        Arrays.sort(sa, new Comparator<Integer>() {
            @Override
            public int compare(Integer i, Integer j) {
                int a = i;
                int b = j;
                while (a < text.length() && b < text.length()) {
                    char c1 = text.charAt(a);
                    char c2 = text.charAt(b);
                    if (c1 != c2) {
                        return Character.compare(c1, c2);
                    }
                    a++;
                    b++;
                }
                return Integer.compare(text.length() - i, text.length() - j);
            }
        });

        return sa;
    }

    // Build LCP array using Kasai's algorithm
    public static int[] buildLCPArray(String text, Integer[] sa) {
        int n = text.length();
        int[] lcp = new int[n];
        int[] rank = new int[n];

        for (int i = 0; i < n; i++) {
            rank[sa[i]] = i;
        }

        int h = 0;
        for (int i = 0; i < n; i++) {
            if (rank[i] > 0) {
                int k = sa[rank[i] - 1]; // previous suffix in sorted order

                while (i + h < n && k + h < n && text.charAt(i + h) == text.charAt(k + h)) {
                    h++;
                }

                lcp[rank[i]] = h;

                if (h > 0) {
                    h--;
                }
            } else {
                lcp[0] = 0;
            }
        }
        return lcp;
    }

    // Compute similarity between two papers using generalized suffix array
    public static SimilarityScore computePaperSimilarity(Paper p1, Paper p2) {
        if (p1 == null || p2 == null || p1.getId() == p2.getId()) {
            return new SimilarityScore(p2, 0.0, 0, 0);
        }

        String s1 = normalize(p1.getTitle() + " " + p1.getContent());
        String s2 = normalize(p2.getTitle() + " " + p2.getContent());

        if (s1.isEmpty() || s2.isEmpty()) {
            return new SimilarityScore(p2, 0.0, 0, 0);
        }

        int len1 = s1.length();
        String combined = s1 + "$" + s2 + "#";
        int totalLen = combined.length();

        Integer[] sa = buildSuffixArray(combined);
        int[] lcp = buildLCPArray(combined, sa);

        int maxLCP = 0;
        int totalCommonOverlap = 0;
        int minSignificantLength = 4; // ignore short matches

        for (int i = 1; i < totalLen; i++) {
            int posA = sa[i];
            int posB = sa[i - 1];

            boolean aInDoc1 = posA < len1;
            boolean bInDoc1 = posB < len1;
            boolean aInDoc2 = posA > len1;
            boolean bInDoc2 = posB > len1;

            if ((aInDoc1 && bInDoc2) || (aInDoc2 && bInDoc1)) {
                int commonLen = lcp[i];
                if (commonLen >= minSignificantLength) {
                    totalCommonOverlap += commonLen;
                    if (commonLen > maxLCP) {
                        maxLCP = commonLen;
                    }
                }
            }
        }

        double avgLen = (len1 + s2.length()) / 2.0;
        double similarityScore = Math.min(100.0, ((double) totalCommonOverlap / avgLen) * 100.0);

        if (p1.getCategory() != null && p2.getCategory() != null && p1.getCategory().equalsIgnoreCase(p2.getCategory())) {
            similarityScore = Math.min(100.0, similarityScore + 5.0);
        }

        return new SimilarityScore(p2, Math.round(similarityScore * 10.0) / 10.0, totalCommonOverlap, maxLCP);
    }

    /**
     * Compute comprehensive plagiarism similarity between a newly pasted paper and an existing corpus paper.
     * Uses Generalized Suffix Array and Kasai's LCP Array to find common substrings.
     * Aggregates meaningful non-overlapping matching text regions in the new paper (minimum phrase length 18 chars),
     * and normalizes strictly against the new paper's total length.
     *
     * Exact Formula:
     * Similarity (%) = (Total Non-Overlapping Matched Characters in New Paper / Length of New Paper) * 100
     */
    public static PlagiarismMatch compareForPlagiarism(String newDocText, Paper existingPaper) {
        String s1 = normalize(newDocText);
        String s2 = normalize(existingPaper.getTitle() + " " + existingPaper.getContent());

        if (s1.length() < 20 || s2.length() < 20) {
            return new PlagiarismMatch(existingPaper, 0.0, 0, s1.length(), Collections.emptyList());
        }

        int len1 = s1.length();
        String combined = s1 + "$" + s2 + "#";
        int totalLen = combined.length();

        Integer[] sa = buildSuffixArray(combined);
        int[] lcp = buildLCPArray(combined, sa);

        int minPhraseLength = 18; // Meaningful non-trivial phrase threshold
        List<TextInterval> intervals = new ArrayList<>();
        List<String> rawSnippets = new ArrayList<>();

        for (int i = 1; i < totalLen; i++) {
            int posA = sa[i];
            int posB = sa[i - 1];

            boolean aInDoc1 = posA < len1;
            boolean bInDoc1 = posB < len1;
            boolean aInDoc2 = posA > len1;
            boolean bInDoc2 = posB > len1;

            if ((aInDoc1 && bInDoc2) || (aInDoc2 && bInDoc1)) {
                int commonLen = lcp[i];
                if (commonLen >= minPhraseLength) {
                    int startInDoc1 = aInDoc1 ? posA : posB;
                    int endInDoc1 = Math.min(len1, startInDoc1 + commonLen);
                    intervals.add(new TextInterval(startInDoc1, endInDoc1));

                    String snippet = s1.substring(startInDoc1, endInDoc1);
                    if (snippet.length() >= 25) {
                        rawSnippets.add(snippet);
                    }
                }
            }
        }

        // 1. Sort intervals by start index
        intervals.sort(Comparator.comparingInt(a -> a.start));

        // 2. Merge overlapping intervals to aggregate strictly non-overlapping matched coverage
        List<TextInterval> merged = new ArrayList<>();
        for (TextInterval interval : intervals) {
            if (merged.isEmpty()) {
                merged.add(new TextInterval(interval.start, interval.end));
            } else {
                TextInterval last = merged.get(merged.size() - 1);
                if (interval.start <= last.end) {
                    last.end = Math.max(last.end, interval.end);
                } else {
                    merged.add(new TextInterval(interval.start, interval.end));
                }
            }
        }

        int totalMatchedChars = 0;
        for (TextInterval interval : merged) {
            totalMatchedChars += (interval.end - interval.start);
        }

        // 3. Normalized Similarity Formula against the new paper's text length
        double similarityScore = Math.min(100.0, ((double) totalMatchedChars / (double) len1) * 100.0);
        similarityScore = Math.round(similarityScore * 10.0) / 10.0;

        // 4. Select top distinct representative matching snippets
        rawSnippets.sort((a, b) -> Integer.compare(b.length(), a.length()));
        List<String> cleanSnippets = new ArrayList<>();
        for (String snip : rawSnippets) {
            boolean alreadySubsumed = false;
            for (String kept : cleanSnippets) {
                if (kept.contains(snip)) {
                    alreadySubsumed = true;
                    break;
                }
            }
            if (!alreadySubsumed) {
                cleanSnippets.add(snip);
                if (cleanSnippets.size() >= 5) break;
            }
        }

        return new PlagiarismMatch(existingPaper, similarityScore, totalMatchedChars, len1, cleanSnippets);
    }

    /**
     * Run full plagiarism check against all papers in the repository.
     */
    public static PlagiarismReport evaluatePlagiarism(String newDocText, List<Paper> allPapers) {
        PlagiarismReport report = new PlagiarismReport();
        if (newDocText == null || newDocText.trim().isEmpty() || allPapers == null || allPapers.isEmpty()) {
            return report;
        }

        List<PlagiarismMatch> matches = new ArrayList<>();
        for (Paper candidate : allPapers) {
            PlagiarismMatch match = compareForPlagiarism(newDocText, candidate);
            if (match.similarityPercentage > 5.0) {
                matches.add(match);
            }
        }

        matches.sort((a, b) -> Double.compare(b.similarityPercentage, a.similarityPercentage));

        if (!matches.isEmpty()) {
            report.overallSimilarity = matches.get(0).similarityPercentage;
            report.potentialSources = matches.subList(0, Math.min(5, matches.size()));
        }

        // Threshold check: 60%
        if (report.overallSimilarity > 60.0) {
            report.potentialPlagiarism = true;
            report.verdict = "Potential Plagiarism Detected";
        } else {
            report.potentialPlagiarism = false;
            report.verdict = "No Significant Match Detected";
        }

        return report;
    }

    // Recommend top N similar papers
    public static List<SimilarityScore> recommendSimilar(Paper target, List<Paper> allPapers, int topN) {
        List<SimilarityScore> scores = new ArrayList<>();

        for (Paper candidate : allPapers) {
            if (candidate.getId() == target.getId()) {
                continue;
            }
            SimilarityScore score = computePaperSimilarity(target, candidate);
            scores.add(score);
        }

        Collections.sort(scores, new Comparator<SimilarityScore>() {
            @Override
            public int compare(SimilarityScore o1, SimilarityScore o2) {
                return Double.compare(o2.similarityPercentage, o1.similarityPercentage);
            }
        });

        List<SimilarityScore> topResults = new ArrayList<>();
        int count = Math.min(topN, scores.size());
        for (int i = 0; i < count; i++) {
            topResults.add(scores.get(i));
        }

        return topResults;
    }

    private static String normalize(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isLetterOrDigit(c) || Character.isWhitespace(c)) {
                sb.append(Character.toLowerCase(c));
            }
        }
        return sb.toString().trim();
    }
}
