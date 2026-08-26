public class Main {

    public static void main(String[] args) {

        String paper =
                "machine learning methods for cancer detection";

        // 1. Pattern Matching
        String keyword = "cancer";

        boolean found = KMP.search(paper, keyword);

        System.out.println("=== KMP Pattern Matching ===");

        if (found) {
            System.out.println("Keyword found: " + keyword);
        } else {
            System.out.println("Keyword not found");
        }


        // 2. Fuzzy Search
        String userInput = "machne learning";
        String actual = "machine learning";

        int distance =
                EditDistance.distance(userInput, actual);

        System.out.println("\n=== Fuzzy Search ===");

        System.out.println("User input: " + userInput);
        System.out.println("Actual text: " + actual);
        System.out.println("Edit Distance: " + distance);

        if (distance <= 2) {
            System.out.println("Close match found!");
        } else {
            System.out.println("No close match");
        }


        // 3. Similarity
        System.out.println("\n=== Paper Similarity ===");

        String paper1 =
                "machine learning methods for cancer detection";

        String paper2 =
                "machine learning methods for cancer prediction";

        Similarity.showSimilarity(paper1, paper2);
    }
}
