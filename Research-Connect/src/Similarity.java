import java.util.*;

public class Similarity {

    public static int[] buildSuffixArray(String text) {

        int n = text.length();

        Integer[] suffix = new Integer[n];

        for (int i = 0; i < n; i++) {
            suffix[i] = i;
        }

        Arrays.sort(suffix, (a, b) ->
            text.substring(a).compareTo(text.substring(b))
        );

        int[] result = new int[n];

        for (int i = 0; i < n; i++) {
            result[i] = suffix[i];
        }

        return result;
    }

    public static int lcp(String a, String b) {

        int length = 0;
        int min = Math.min(a.length(), b.length());

        while (length < min &&
               a.charAt(length) == b.charAt(length)) {

            length++;
        }

        return length;
    }

    public static void showSimilarity(String a, String b) {

        int[] suffixArray = buildSuffixArray(a);

        int maxLCP = 0;

        for (int i = 0; i < suffixArray.length; i++) {

            String suffix = a.substring(suffixArray[i]);

            int common = lcp(suffix, b);

            maxLCP = Math.max(maxLCP, common);
        }

        System.out.println("Longest Common Prefix: " + maxLCP);

        double similarity =
                (double) maxLCP /
                Math.max(a.length(), b.length());

        System.out.println("Similarity: " +
                (similarity * 100) + "%");
    }
}
