import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Levenshtein Edit Distance using Dynamic Programming for typo-tolerant search.
 */
public class EditDistance {

    public static class Suggestion {
        public String candidate;
        public int distance;

        public Suggestion(String candidate, int distance) {
            this.candidate = candidate;
            this.distance = distance;
        }

        @Override
        public String toString() {
            return candidate + " (dist: " + distance + ")";
        }
    }

    // Compute edit distance between two strings using 2D DP matrix
    public static int compute(String s1, String s2) {
        if (s1 == null && s2 == null) return 0;
        if (s1 == null || s1.isEmpty()) return s2 == null ? 0 : s2.length();
        if (s2 == null || s2.isEmpty()) return s1.length();

        int m = s1.length();
        int n = s2.length();

        // DP table
        int[][] dp = new int[m + 1][n + 1];

        // Base cases
        for (int i = 0; i <= m; i++) {
            dp[i][0] = i; // deletions
        }
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j; // insertions
        }

        // Fill table
        for (int i = 1; i <= m; i++) {
            char c1 = Character.toLowerCase(s1.charAt(i - 1));
            for (int j = 1; j <= n; j++) {
                char c2 = Character.toLowerCase(s2.charAt(j - 1));

                if (c1 == c2) {
                    dp[i][j] = dp[i - 1][j - 1]; // matching character
                } else {
                    int deleteCost = dp[i - 1][j];
                    int insertCost = dp[i][j - 1];
                    int replaceCost = dp[i - 1][j - 1];

                    dp[i][j] = 1 + min3(deleteCost, insertCost, replaceCost);
                }
            }
        }

        return dp[m][n];
    }

    private static int min3(int a, int b, int c) {
        int min = a;
        if (b < min) min = b;
        if (c < min) min = c;
        return min;
    }

    // Get closest words from vocabulary within threshold distance
    public static List<Suggestion> getSuggestions(String target, Set<String> vocabulary, int threshold) {
        List<Suggestion> results = new ArrayList<>();
        if (target == null || target.trim().isEmpty() || vocabulary == null) {
            return results;
        }

        String query = target.trim().toLowerCase();

        for (String word : vocabulary) {
            if (word == null || word.length() < 3) continue;

            // Optimization: skip words with too much length difference
            if (Math.abs(word.length() - query.length()) > threshold) {
                continue;
            }

            int dist = compute(query, word);
            if (dist <= threshold) {
                results.add(new Suggestion(word, dist));
            }
        }

        // Sort by distance
        Collections.sort(results, new Comparator<Suggestion>() {
            @Override
            public int compare(Suggestion o1, Suggestion o2) {
                return Integer.compare(o1.distance, o2.distance);
            }
        });

        return results;
    }
}
