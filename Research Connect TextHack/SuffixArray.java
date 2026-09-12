import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Suffix Array and LCP (Longest Common Prefix) array implementation
 * for computing document similarity between research papers.
 */
public class SuffixArray {

    public static class SimilarityScore {
        public Paper paper;
        public double similarityPercentage;
        public int sharedOverlapLength;
        public int maxCommonSubstringLength;

        public SimilarityScore(Paper paper, double similarityPercentage, int sharedOverlapLength, int maxCommonSubstringLength) {
            this.paper = paper;
            this.similarityPercentage = similarityPercentage;
            this.sharedOverlapLength = sharedOverlapLength;
            this.maxCommonSubstringLength = maxCommonSubstringLength;
        }

        @Override
        public String toString() {
            return String.format("[%d] %s -> Similarity: %.2f%% (Max Match: %d chars)",
                    paper.getId(), paper.getTitle(), similarityPercentage, maxCommonSubstringLength);
        }
    }

    // Build Suffix Array by sorting suffix start indices
    public static Integer[] buildSuffixArray(final String text) {
        int n = text.length();
        Integer[] sa = new Integer[n];
        for (int i = 0; i < n; i++) {
            sa[i] = i;
        }

        // Sort suffixes alphabetically
        java.util.Arrays.sort(sa, new Comparator<Integer>() {
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
        // Combine documents with delimiters
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

            // Check if one suffix is from doc1 and the other from doc2
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

        // Same category boost
        if (p1.getCategory().equalsIgnoreCase(p2.getCategory())) {
            similarityScore = Math.min(100.0, similarityScore + 5.0);
        }

        return new SimilarityScore(p2, similarityScore, totalCommonOverlap, maxLCP);
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

        // Sort descending
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
