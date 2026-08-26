public class KMP {

    public static boolean search(String text, String pattern) {

        int n = text.length();
        int m = pattern.length();

        int[] lps = new int[m];

        int j = 0;

        // Create LPS array
        for (int i = 1; i < m; i++) {

            while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) {
                j = lps[j - 1];
            }

            if (pattern.charAt(i) == pattern.charAt(j)) {
                j++;
            }

            lps[i] = j;
        }

        // Search pattern
        j = 0;

        for (int i = 0; i < n; i++) {

            while (j > 0 && text.charAt(i) != pattern.charAt(j)) {
                j = lps[j - 1];
            }

            if (text.charAt(i) == pattern.charAt(j)) {
                j++;
            }

            if (j == m) {
                return true;
            }
        }

        return false;
    }
}
