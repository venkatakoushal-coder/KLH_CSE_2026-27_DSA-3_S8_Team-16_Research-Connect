import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

/**
 * Aho-Corasick algorithm for multi-keyword searching using Trie and BFS failure links.
 */
public class AhoCorasick {

    // Node in Trie
    public static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        TrieNode fail = null; // failure pointer
        List<String> output = new ArrayList<>(); // matched keywords at this state
    }

    public static class Match {
        public String keyword;
        public int lineNumber;
        public int columnIndex;
        public String snippet;

        public Match(String keyword, int lineNumber, int columnIndex, String snippet) {
            this.keyword = keyword;
            this.lineNumber = lineNumber;
            this.columnIndex = columnIndex;
            this.snippet = snippet;
        }

        @Override
        public String toString() {
            return String.format("[%s] Line %d, Col %d: \"...%s...\"", keyword, lineNumber, columnIndex, snippet);
        }
    }

    public static class PaperMultiResult {
        public Paper paper;
        public List<Match> matches = new ArrayList<>();
        public Map<String, Integer> keywordCounts = new HashMap<>();

        public PaperMultiResult(Paper paper) {
            this.paper = paper;
        }

        public void addMatch(String keyword, int line, int col, String snippet) {
            matches.add(new Match(keyword, line, col, snippet));
            keywordCounts.put(keyword, keywordCounts.getOrDefault(keyword, 0) + 1);
        }

        public int getTotalMatchCount() {
            return matches.size();
        }
    }

    private TrieNode root;
    private List<String> keywords;

    public AhoCorasick(List<String> keywords) {
        this.keywords = new ArrayList<>();
        this.root = new TrieNode();

        // 1. Insert keywords into Trie
        for (String kw : keywords) {
            if (kw != null && !kw.trim().isEmpty()) {
                String clean = kw.trim().toLowerCase();
                this.keywords.add(clean);
                insertPattern(clean);
            }
        }

        // 2. Build failure links using BFS
        buildFailureLinks();
    }

    // Insert single pattern into Trie
    private void insertPattern(String pattern) {
        TrieNode curr = root;
        for (int i = 0; i < pattern.length(); i++) {
            char c = pattern.charAt(i);
            if (!curr.children.containsKey(c)) {
                curr.children.put(c, new TrieNode());
            }
            curr = curr.children.get(c);
        }
        curr.output.add(pattern);
    }

    // Build failure links level by level using a queue
    private void buildFailureLinks() {
        Queue<TrieNode> queue = new LinkedList<>();

        for (Map.Entry<Character, TrieNode> entry : root.children.entrySet()) {
            TrieNode child = entry.getValue();
            child.fail = root;
            queue.add(child);
        }

        while (!queue.isEmpty()) {
            TrieNode current = queue.poll();

            for (Map.Entry<Character, TrieNode> entry : current.children.entrySet()) {
                char ch = entry.getKey();
                TrieNode child = entry.getValue();

                TrieNode f = current.fail;
                while (f != null && !f.children.containsKey(ch)) {
                    f = f.fail;
                }

                if (f == null) {
                    child.fail = root;
                } else {
                    child.fail = f.children.get(ch);
                    child.output.addAll(child.fail.output); // merge matching outputs
                }

                queue.add(child);
            }
        }
    }

    // Search text for all patterns in one pass
    public List<int[]> searchInString(String text) {
        List<int[]> occurrences = new ArrayList<>();
        if (text == null || text.isEmpty()) return occurrences;

        TrieNode curr = root;
        for (int i = 0; i < text.length(); i++) {
            char c = Character.toLowerCase(text.charAt(i));

            while (curr != null && !curr.children.containsKey(c)) {
                curr = curr.fail;
            }

            if (curr == null) {
                curr = root;
                continue;
            }

            curr = curr.children.get(c);

            if (!curr.output.isEmpty()) {
                for (String matchedPattern : curr.output) {
                    int startIdx = i - matchedPattern.length() + 1;
                    occurrences.add(new int[]{startIdx, matchedPattern.length(), matchedPattern.hashCode()});
                }
            }
        }
        return occurrences;
    }

    // Search a paper line-by-line
    public PaperMultiResult searchPaper(Paper paper) {
        PaperMultiResult result = new PaperMultiResult(paper);
        if (paper == null) return result;

        // Search in title
        searchLine(paper.getTitle(), 1, result);

        // Search in content lines
        List<String> lines = paper.getContentLines();
        for (int i = 0; i < lines.size(); i++) {
            searchLine(lines.get(i), i + 6, result);
        }

        return result;
    }

    private void searchLine(String line, int lineNum, PaperMultiResult result) {
        if (line == null || line.isEmpty()) return;

        TrieNode curr = root;
        for (int i = 0; i < line.length(); i++) {
            char c = Character.toLowerCase(line.charAt(i));

            while (curr != null && !curr.children.containsKey(c)) {
                curr = curr.fail;
            }

            if (curr == null) {
                curr = root;
                continue;
            }

            curr = curr.children.get(c);

            if (!curr.output.isEmpty()) {
                for (String matchedPattern : curr.output) {
                    int startCol = i - matchedPattern.length() + 1;
                    String snippet = extractSnippet(line, startCol, matchedPattern.length());
                    result.addMatch(matchedPattern, lineNum, startCol + 1, snippet);
                }
            }
        }
    }

    private static String extractSnippet(String line, int startIdx, int patternLen) {
        int window = 20;
        int s = Math.max(0, startIdx - window);
        int e = Math.min(line.length(), startIdx + patternLen + window);
        StringBuilder sb = new StringBuilder();
        if (s > 0) sb.append("...");
        sb.append(line.substring(s, e));
        if (e < line.length()) sb.append("...");
        return sb.toString();
    }
}
