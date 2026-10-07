import java.util.ArrayList;
import java.util.List;

/**
 * KMP (Knuth-Morris-Pratt) algorithm for exact keyword searching.
 */
public class KMPSearch {

    // Store match details inside a file
    public static class MatchLocation {
        public int lineNumber;
        public int columnIndex;
        public String snippet;

        public MatchLocation(int lineNumber, int columnIndex, String snippet) {
            this.lineNumber = lineNumber;
            this.columnIndex = columnIndex;
            this.snippet = snippet;
        }

        @Override
        public String toString() {
            return String.format("Line %d, Col %d: \"...%s...\"", lineNumber, columnIndex, snippet);
        }
    }

    // Result object holding all matches found in a paper
    public static class PaperSearchResult {
        public Paper paper;
        public int totalOccurrences;
        public List<MatchLocation> matches;

        public PaperSearchResult(Paper paper) {
            this.paper = paper;
            this.totalOccurrences = 0;
            this.matches = new ArrayList<>();
        }

        public void addMatch(int line, int col, String snippet) {
            matches.add(new MatchLocation(line, col, snippet));
            totalOccurrences++;
        }
    }

    // Compute LPS (Longest Prefix Suffix) table
    public static int[] computeLPS(String pattern) {
        int m = pattern.length();
        int[] lps = new int[m];
        int len = 0;
        int i = 1;

        lps[0] = 0;

        while (i < m) {
            if (toLowerChar(pattern.charAt(i)) == toLowerChar(pattern.charAt(len))) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len != 0) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    }

    // KMP pattern search over text
    public static List<Integer> searchIndices(String text, String pattern) {
        List<Integer> occurrences = new ArrayList<>();
        if (text == null || pattern == null || pattern.isEmpty() || text.length() < pattern.length()) {
            return occurrences;
        }

        int n = text.length();
        int m = pattern.length();
        int[] lps = computeLPS(pattern);

        int i = 0; // text index
        int j = 0; // pattern index

        while (i < n) {
            if (toLowerChar(text.charAt(i)) == toLowerChar(pattern.charAt(j))) {
                i++;
                j++;
            }

            if (j == m) {
                occurrences.add(i - j); // match found
                j = lps[j - 1];
            } else if (i < n && toLowerChar(text.charAt(i)) != toLowerChar(pattern.charAt(j))) {
                if (j != 0) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }
        return occurrences;
    }

    // Search inside a paper (title and content lines)
    public static PaperSearchResult searchPaper(Paper paper, String keyword) {
        PaperSearchResult result = new PaperSearchResult(paper);
        if (paper == null || keyword == null || keyword.trim().isEmpty()) {
            return result;
        }

        String pattern = keyword.trim();

        // 1. Search in title
        List<Integer> titleMatches = searchIndices(paper.getTitle(), pattern);
        for (int idx : titleMatches) {
            String snippet = extractSnippet(paper.getTitle(), idx, pattern.length());
            result.addMatch(1, idx + 1, "[In Title] " + snippet);
        }

        // 2. Search line-by-line in content
        List<String> lines = paper.getContentLines();
        for (int lineNum = 0; lineNum < lines.size(); lineNum++) {
            String line = lines.get(lineNum);
            List<Integer> lineMatches = searchIndices(line, pattern);
            for (int colIdx : lineMatches) {
                String snippet = extractSnippet(line, colIdx, pattern.length());
                result.addMatch(lineNum + 6, colIdx + 1, snippet);
            }
        }

        return result;
    }

    // Helper to get surrounding text context
    private static String extractSnippet(String line, int matchStart, int patternLen) {
        int window = 25;
        int start = Math.max(0, matchStart - window);
        int end = Math.min(line.length(), matchStart + patternLen + window);

        StringBuilder sb = new StringBuilder();
        if (start > 0) sb.append("...");
        sb.append(line.substring(start, end));
        if (end < line.length()) sb.append("...");
        return sb.toString();
    }

    // Convert char to lowercase manually
    private static char toLowerChar(char c) {
        if (c >= 'A' && c <= 'Z') {
            return (char) (c + ('a' - 'A'));
        }
        return c;
    }
}
