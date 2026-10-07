import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;

/**
 * Research Connect - Smart Research Paper Discovery System.
 */
public class Main {

    private static final String CORPUS_DIR = "Corpus";
    private static final String CITATIONS_FILE = "Corpus/citations.txt";

    private static PaperRepository repository = new PaperRepository();
    private static CitationGraph citationGraph = new CitationGraph();
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        printBanner();
        initSystem();

        boolean running = true;
        while (running) {
            printMainMenu();
            int choice = readIntInput("Enter choice (1-10): ", 1, 10);
            System.out.println();

            switch (choice) {
                case 1:
                    handleKmpSearch();
                    break;
                case 2:
                    handleAhoCorasickSearch();
                    break;
                case 3:
                    handleFuzzySearch();
                    break;
                case 4:
                    handleViewAllPapers();
                    break;
                case 5:
                    handleFilterPapers();
                    break;
                case 6:
                    handlePaperRecommendations();
                    break;
                case 7:
                    handleCitationAnalysis();
                    break;
                case 8:
                    handleAddCitation();
                    break;
                case 9:
                    handleIndexInspection();
                    break;
                case 10:
                    running = false;
                    System.out.println("Thank you for using Research Connect! Goodbye.");
                    break;
            }
            if (running) {
                System.out.println("\nPress ENTER to return to main menu...");
                scanner.nextLine();
            }
        }
    }

    private static void printBanner() {
        System.out.println("================================================================================");
        System.out.println("   ____  _____ ____  _____    _    ____   ____ _   _    ____ ___  _   _ ");
        System.out.println("  |  _ \\| ____/ ___|| ____|  / \\  |  _ \\ / ___| | | |  / ___/ _ \\| \\ | |");
        System.out.println("  | |_) |  _| \\___ \\|  _|   / _ \\ | |_) | |   | |_| | | |  | | | |  \\| |");
        System.out.println("  |  _ <| |___ ___) | |___ / ___ \\|  _ <| |___|  _  | | |__| |_| | |\\  |");
        System.out.println("  |_| \\_\\_____|____/|_____/_/   \\_\\_| \\_\\\\____|_| |_|  \\____\\___/|_| \\_|");
        System.out.println("                   Smart Research Paper Discovery System                        ");
        System.out.println("================================================================================");
    }

    private static void initSystem() {
        System.out.println("\n[SYSTEM INITIALIZATION]");
        System.out.println("Loading corpus from: " + CORPUS_DIR + "/");
        repository.loadFromDirectory(CORPUS_DIR);

        System.out.println("Loading citation graph from: " + CITATIONS_FILE);
        for (Paper p : repository.getAllPapers()) {
            citationGraph.registerPaper(p.getId());
        }
        citationGraph.loadCitations(CITATIONS_FILE);
        System.out.println("[READY] System initialized successfully.\n");
    }

    private static void printMainMenu() {
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("                              MAIN MENU");
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println(" 1. Search Papers by Keyword (KMP Algorithm)");
        System.out.println(" 2. Multi-Keyword Search across Corpus (Aho-Corasick Algorithm)");
        System.out.println(" 3. Fuzzy / Typo Search (Levenshtein Edit Distance)");
        System.out.println(" 4. View All Papers & Read Full Abstract");
        System.out.println(" 5. Filter Papers (By Year / Category)");
        System.out.println(" 6. Recommend Similar Papers (Suffix Array + LCP)");
        System.out.println(" 7. Citation Graph & Network Analysis");
        System.out.println(" 8. Add New Citation");
        System.out.println(" 9. Inverted Index Inspection");
        System.out.println(" 10. Exit");
        System.out.println("--------------------------------------------------------------------------------");
    }

    // 1. KMP Search (Case-Independent + Paper Selection + In-Paper Aho-Corasick Scan)
    private static void handleKmpSearch() {
        System.out.println("--- [1. KMP Exact Keyword Search] ---");
        System.out.print("Enter search keyword (case-independent): ");
        String keyword = scanner.nextLine().trim();

        if (keyword.isEmpty()) {
            System.out.println("Keyword cannot be empty.");
            return;
        }

        System.out.println("\nRunning KMP Search...");
        int[] lps = KMPSearch.computeLPS(keyword);
        System.out.print("LPS Table for \"" + keyword + "\": [");
        for (int i = 0; i < lps.length; i++) {
            System.out.print(lps[i] + (i < lps.length - 1 ? ", " : ""));
        }
        System.out.println("]\n");

        List<KMPSearch.PaperSearchResult> results = new ArrayList<>();
        int totalMatchesAcrossCorpus = 0;

        for (Paper paper : repository.getAllPapers()) {
            KMPSearch.PaperSearchResult res = KMPSearch.searchPaper(paper, keyword);
            if (res.totalOccurrences > 0) {
                results.add(res);
                totalMatchesAcrossCorpus += res.totalOccurrences;
            }
        }

        if (results.isEmpty()) {
            System.out.println("No exact matches found for \"" + keyword + "\".");
            System.out.println("\n[Checking for typos using Edit Distance...]");
            List<EditDistance.Suggestion> suggestions = EditDistance.getSuggestions(keyword, repository.getVocabulary(), 2);
            if (!suggestions.isEmpty()) {
                System.out.println("Did you mean:");
                for (int i = 0; i < Math.min(5, suggestions.size()); i++) {
                    System.out.printf("  (%d) %s (edit distance: %d)\n", i + 1, suggestions.get(i).candidate, suggestions.get(i).distance);
                }
            } else {
                System.out.println("No close vocabulary suggestions found.");
            }
            return;
        }

        System.out.printf("Found %d match(es) in %d paper(s):\n\n", totalMatchesAcrossCorpus, results.size());
        for (KMPSearch.PaperSearchResult r : results) {
            System.out.printf("📄 [Paper %d] \"%s\" | %s (%d) | Category: %s | Matches: %d\n",
                    r.paper.getId(), r.paper.getTitle(), r.paper.getAuthor(), r.paper.getYear(), r.paper.getCategory(), r.totalOccurrences);
            for (KMPSearch.MatchLocation loc : r.matches) {
                System.out.printf("    • %s\n", loc.toString());
            }
            System.out.println();
        }

        // Allow selecting a paper to inspect & run in-paper Aho-Corasick scan
        System.out.print("Enter Paper ID to select and inspect (or 0 to return): ");
        int selectedId = readIntInput("", 0, 9999);
        if (selectedId != 0) {
            Paper selectedPaper = repository.getPaperById(selectedId);
            if (selectedPaper != null) {
                handlePaperDetailWithAhoCorasick(selectedPaper);
            } else {
                System.out.println("Paper with ID " + selectedId + " not found.");
            }
        }
    }

    // Helper to view a paper and run in-paper Aho-Corasick multi-keyword search
    private static void handlePaperDetailWithAhoCorasick(Paper paper) {
        System.out.println();
        paper.printDetailed();

        System.out.print("\nWould you like to search within this paper using Aho-Corasick multi-keyword scanner? (y/n): ");
        String ans = scanner.nextLine().trim().toLowerCase();
        if (ans.equals("y") || ans.equals("yes")) {
            System.out.println("Enter keyword(s) to search inside this paper (comma-separated, e.g. 'neural, layers, accuracy, model'):");
            System.out.print("> ");
            String input = scanner.nextLine().trim();

            if (!input.isEmpty()) {
                String[] rawKeywords = input.split(",");
                List<String> keywords = new ArrayList<>();
                for (String k : rawKeywords) {
                    if (!k.trim().isEmpty()) {
                        keywords.add(k.trim());
                    }
                }

                if (!keywords.isEmpty()) {
                    System.out.printf("\nRunning Aho-Corasick search inside Paper %d: \"%s\" for %s...\n\n",
                            paper.getId(), paper.getTitle(), keywords.toString());
                    AhoCorasick ac = new AhoCorasick(keywords);
                    AhoCorasick.PaperMultiResult res = ac.searchPaper(paper);

                    if (res.getTotalMatchCount() == 0) {
                        System.out.println("None of the specified keywords were found in this paper.");
                    } else {
                        System.out.printf("Found %d occurrence(s) in this paper:\n", res.getTotalMatchCount());
                        System.out.print("Keyword breakdown: ");
                        for (Map.Entry<String, Integer> entry : res.keywordCounts.entrySet()) {
                            System.out.printf("[%s: %d] ", entry.getKey(), entry.getValue());
                        }
                        System.out.println("\n");
                        for (AhoCorasick.Match m : res.matches) {
                            System.out.printf("  • %s\n", m.toString());
                        }
                    }
                }
            }
        }
    }

    // 2. Aho-Corasick Multi Search across corpus
    private static void handleAhoCorasickSearch() {
        System.out.println("--- [2. Aho-Corasick Multi-Keyword Search] ---");
        System.out.println("Enter keywords separated by commas (e.g. neural, quantum, security, privacy):");
        System.out.print("> ");
        String input = scanner.nextLine().trim();

        if (input.isEmpty()) {
            System.out.println("Input cannot be empty.");
            return;
        }

        String[] rawKeywords = input.split(",");
        List<String> keywords = new ArrayList<>();
        for (String k : rawKeywords) {
            if (!k.trim().isEmpty()) {
                keywords.add(k.trim());
            }
        }

        if (keywords.isEmpty()) {
            System.out.println("No valid keywords entered.");
            return;
        }

        System.out.printf("\nBuilding Aho-Corasick Trie for %d keywords...\n", keywords.size());
        AhoCorasick ac = new AhoCorasick(keywords);

        int papersWithMatches = 0;
        List<Paper> matchedPapers = new ArrayList<>();

        for (Paper paper : repository.getAllPapers()) {
            AhoCorasick.PaperMultiResult res = ac.searchPaper(paper);
            if (res.getTotalMatchCount() > 0) {
                papersWithMatches++;
                matchedPapers.add(paper);
                System.out.printf("📄 [Paper %d] \"%s\" | Domain: %s | Matches: %d\n",
                        paper.getId(), paper.getTitle(), paper.getCategory(), res.getTotalMatchCount());
                System.out.print("   Matched Keywords: ");
                for (Map.Entry<String, Integer> entry : res.keywordCounts.entrySet()) {
                    System.out.printf("[%s: %d] ", entry.getKey(), entry.getValue());
                }
                System.out.println();
                for (AhoCorasick.Match m : res.matches) {
                    System.out.printf("    • %s\n", m.toString());
                }
                System.out.println();
            }
        }

        if (papersWithMatches == 0) {
            System.out.println("No matches found in corpus for the given keywords.");
        } else {
            System.out.printf("Search completed: %d paper(s) matched.\n", papersWithMatches);
            System.out.print("\nEnter Paper ID to select and inspect (or 0 to return): ");
            int selectedId = readIntInput("", 0, 9999);
            if (selectedId != 0) {
                Paper selectedPaper = repository.getPaperById(selectedId);
                if (selectedPaper != null) {
                    handlePaperDetailWithAhoCorasick(selectedPaper);
                } else {
                    System.out.println("Paper ID not found.");
                }
            }
        }
    }

    // 3. Levenshtein Fuzzy Search
    private static void handleFuzzySearch() {
        System.out.println("--- [3. Fuzzy / Typo Search (Levenshtein Distance)] ---");
        System.out.print("Enter search term (e.g. 'residaul', 'artifical', 'federatd'): ");
        String query = scanner.nextLine().trim();

        if (query.isEmpty()) {
            System.out.println("Query cannot be empty.");
            return;
        }

        int maxDist = 2;
        List<EditDistance.Suggestion> suggestions = EditDistance.getSuggestions(query, repository.getVocabulary(), maxDist);

        if (suggestions.isEmpty()) {
            System.out.println("No vocabulary terms found within distance " + maxDist + ".");
            return;
        }

        System.out.println("Closest vocabulary terms found:");
        for (EditDistance.Suggestion sug : suggestions) {
            System.out.printf("   • \"%s\" -> Edit Distance: %d\n", sug.candidate, sug.distance);
        }

        System.out.println("\nPapers containing suggested words:");
        Set<Integer> matchedPaperIds = new java.util.HashSet<>();
        for (EditDistance.Suggestion sug : suggestions) {
            Set<Integer> paperIds = repository.getCandidatePaperIds(sug.candidate);
            for (int pid : paperIds) {
                if (!matchedPaperIds.contains(pid)) {
                    matchedPaperIds.add(pid);
                    Paper p = repository.getPaperById(pid);
                    if (p != null) {
                        System.out.printf("📄 [Paper %d] \"%s\" (%d) | Category: %s\n",
                                p.getId(), p.getTitle(), p.getYear(), p.getCategory());
                    }
                }
            }
        }

        System.out.print("\nEnter Paper ID to select and inspect (or 0 to return): ");
        int selectedId = readIntInput("", 0, 9999);
        if (selectedId != 0) {
            Paper selectedPaper = repository.getPaperById(selectedId);
            if (selectedPaper != null) {
                handlePaperDetailWithAhoCorasick(selectedPaper);
            }
        }
    }

    // 4. View All Papers
    private static void handleViewAllPapers() {
        System.out.println("--- [4. All Loaded Research Papers] ---");
        List<Paper> papers = repository.getAllPapers();
        if (papers.isEmpty()) {
            System.out.println("No papers found.");
            return;
        }

        System.out.printf("Total Papers: %d\n\n", papers.size());
        for (Paper p : papers) {
            p.printSummary();
        }

        System.out.print("\nEnter Paper ID to select and inspect (or 0 to return): ");
        int id = readIntInput("", 0, 9999);
        if (id != 0) {
            Paper p = repository.getPaperById(id);
            if (p != null) {
                handlePaperDetailWithAhoCorasick(p);
            } else {
                System.out.println("Paper ID " + id + " not found.");
            }
        }
    }

    // 5. Filter Papers
    private static void handleFilterPapers() {
        System.out.println("--- [5. Filter Papers] ---");
        System.out.println(" 1. Filter by Exact Year");
        System.out.println(" 2. Filter by Year Range");
        System.out.println(" 3. Filter by Category");
        int choice = readIntInput("Select option (1-3): ", 1, 3);
        System.out.println();

        List<Paper> filtered = new ArrayList<>();

        switch (choice) {
            case 1: {
                int yr = readIntInput("Enter year: ", 1900, 2100);
                filtered = repository.filterByYear(yr);
                break;
            }
            case 2: {
                int start = readIntInput("Enter start year: ", 1900, 2100);
                int end = readIntInput("Enter end year: ", start, 2100);
                filtered = repository.filterByYearRange(start, end);
                break;
            }
            case 3: {
                System.out.println("Available categories: " + repository.getAllCategories());
                System.out.print("Enter category keyword: ");
                String cat = scanner.nextLine().trim();
                filtered = repository.filterByCategory(cat);
                break;
            }
        }

        if (filtered.isEmpty()) {
            System.out.println("No papers matched criteria.");
        } else {
            System.out.printf("Matched %d paper(s):\n\n", filtered.size());
            for (Paper p : filtered) {
                p.printSummary();
            }
            System.out.print("\nEnter Paper ID to select and inspect (or 0 to return): ");
            int id = readIntInput("", 0, 9999);
            if (id != 0) {
                Paper p = repository.getPaperById(id);
                if (p != null) {
                    handlePaperDetailWithAhoCorasick(p);
                }
            }
        }
    }

    // 6. Suffix Array Recommendations
    private static void handlePaperRecommendations() {
        System.out.println("--- [6. Recommend Similar Papers (Suffix Array + LCP)] ---");
        List<Paper> papers = repository.getAllPapers();
        for (Paper p : papers) {
            System.out.printf("[%d] %s (%s)\n", p.getId(), p.getTitle(), p.getCategory());
        }

        int targetId = readIntInput("\nEnter Target Paper ID: ", 1, 9999);
        Paper target = repository.getPaperById(targetId);

        if (target == null) {
            System.out.println("Paper ID not found.");
            return;
        }

        System.out.printf("\nCalculating similarity for Paper %d: \"%s\"...\n", target.getId(), target.getTitle());
        List<SuffixArray.SimilarityScore> recommendations = SuffixArray.recommendSimilar(target, papers, 4);

        if (recommendations.isEmpty()) {
            System.out.println("No recommendations found.");
            return;
        }

        System.out.println("Top Recommended Similar Papers:");
        System.out.println("--------------------------------------------------------------------------------");
        int rank = 1;
        for (SuffixArray.SimilarityScore score : recommendations) {
            System.out.printf(" #%d [Paper %d] \"%s\"\n", rank++, score.paper.getId(), score.paper.getTitle());
            System.out.printf("    Domain: %s | Year: %d\n", score.paper.getCategory(), score.paper.getYear());
            System.out.printf("    Similarity Score: %.2f%% | Max Common Match: %d chars\n",
                    score.similarityPercentage, score.maxCommonSubstringLength);
            System.out.println();
        }
    }

    // 7. Citation Graph Analysis
    private static void handleCitationAnalysis() {
        System.out.println("--- [7. Citation Graph Analysis] ---");
        System.out.println(" 1. View Citations & References for a Paper");
        System.out.println(" 2. BFS Citation Traversal");
        System.out.println(" 3. DFS Citation Chain");
        System.out.println(" 4. Find Shortest Citation Path");
        System.out.println(" 5. Citation Graph Stats");
        int choice = readIntInput("Select option (1-5): ", 1, 5);
        System.out.println();

        switch (choice) {
            case 1: {
                int id = readIntInput("Enter Paper ID: ", 1, 9999);
                Paper p = repository.getPaperById(id);
                if (p == null) {
                    System.out.println("Paper ID not found.");
                    return;
                }
                System.out.println("\nSelected Paper: [" + p.getId() + "] " + p.getTitle());

                List<Integer> cited = citationGraph.getCitedPapers(id);
                System.out.println("\n[References / Cites " + cited.size() + " paper(s)]:");
                if (cited.isEmpty()) {
                    System.out.println("  (None)");
                } else {
                    for (int cId : cited) {
                        Paper cp = repository.getPaperById(cId);
                        System.out.printf("  → [%d] %s\n", cId, cp != null ? cp.getTitle() : "Unknown");
                    }
                }

                List<Integer> citing = citationGraph.getCitingPapers(id);
                System.out.println("\n[Cited By " + citing.size() + " paper(s)]:");
                if (citing.isEmpty()) {
                    System.out.println("  (None)");
                } else {
                    for (int cId : citing) {
                        Paper cp = repository.getPaperById(cId);
                        System.out.printf("  ← [%d] %s\n", cId, cp != null ? cp.getTitle() : "Unknown");
                    }
                }
                break;
            }
            case 2: {
                int startId = readIntInput("Enter Starting Paper ID for BFS: ", 1, 9999);
                Paper p = repository.getPaperById(startId);
                if (p == null) {
                    System.out.println("Paper ID not found.");
                    return;
                }
                System.out.println("\nRunning BFS from [" + startId + "] " + p.getTitle() + "...\n");
                List<int[]> bfsLevels = citationGraph.bfsTraversal(startId);
                for (int[] entry : bfsLevels) {
                    int lvl = entry[0];
                    int pid = entry[1];
                    Paper pp = repository.getPaperById(pid);
                    String indent = "  ".repeat(Math.max(0, lvl));
                    System.out.printf("%s[Level %d] -> Paper %d: %s\n", indent, lvl, pid, pp != null ? pp.getTitle() : "ID " + pid);
                }
                break;
            }
            case 3: {
                int startId = readIntInput("Enter Starting Paper ID for DFS: ", 1, 9999);
                Paper p = repository.getPaperById(startId);
                if (p == null) {
                    System.out.println("Paper ID not found.");
                    return;
                }
                System.out.println("\nRunning DFS from [" + startId + "] " + p.getTitle() + "...\n");
                List<Integer> dfsPath = citationGraph.dfsTraversal(startId);
                System.out.print("Citation Chain: ");
                for (int i = 0; i < dfsPath.size(); i++) {
                    System.out.print(dfsPath.get(i) + (i < dfsPath.size() - 1 ? " -> " : ""));
                }
                System.out.println();
                break;
            }
            case 4: {
                int src = readIntInput("Enter Source Paper ID: ", 1, 9999);
                int dst = readIntInput("Enter Destination Paper ID: ", 1, 9999);
                List<Integer> path = citationGraph.findShortestCitationPath(src, dst);
                if (path.isEmpty()) {
                    System.out.println("No citation path exists from Paper " + src + " to Paper " + dst + ".");
                } else {
                    System.out.printf("Shortest Path (Length %d hops):\n", path.size() - 1);
                    for (int i = 0; i < path.size(); i++) {
                        int pid = path.get(i);
                        Paper pp = repository.getPaperById(pid);
                        System.out.printf("  Step %d: [%d] %s\n", i, pid, pp != null ? pp.getTitle() : "ID " + pid);
                    }
                }
                break;
            }
            case 5: {
                System.out.println("Citation Graph Stats:");
                System.out.println("  • Total Paper Nodes : " + citationGraph.getTotalNodes());
                System.out.println("  • Total Citation Edges: " + citationGraph.getTotalEdges());
                int mostCited = citationGraph.getMostCitedPaperId();
                if (mostCited != -1) {
                    Paper p = repository.getPaperById(mostCited);
                    System.out.printf("  • Most Cited Paper: [%d] %s (%d citations)\n",
                            mostCited, p != null ? p.getTitle() : "ID " + mostCited, citationGraph.getCitingPapers(mostCited).size());
                }
                break;
            }
        }
    }

    // 8. Add Citation
    private static void handleAddCitation() {
        System.out.println("--- [8. Add New Citation] ---");
        int fromId = readIntInput("Enter Source Paper ID: ", 1, 9999);
        int toId = readIntInput("Enter Target Paper ID: ", 1, 9999);

        if (fromId == toId) {
            System.out.println("Paper cannot cite itself.");
            return;
        }

        Paper fromPaper = repository.getPaperById(fromId);
        Paper toPaper = repository.getPaperById(toId);

        if (fromPaper == null || toPaper == null) {
            System.out.println("Both Paper IDs must exist in the corpus.");
            return;
        }

        boolean success = citationGraph.addCitationAndPersist(fromId, toId, CITATIONS_FILE);
        if (success) {
            System.out.printf("Added citation: Paper %d cites Paper %d.\n", fromId, toId);
        }
    }

    // 9. Inverted Index
    private static void handleIndexInspection() {
        System.out.println("--- [9. Inverted Index Inspection] ---");
        Map<String, Set<Integer>> index = repository.getInvertedIndex();
        System.out.println("• Inverted Index Size: " + index.size() + " terms.");

        System.out.print("\nEnter word to lookup: ");
        String term = scanner.nextLine().trim().toLowerCase();

        Set<Integer> postingList = index.get(term);
        if (postingList == null || postingList.isEmpty()) {
            System.out.println("Term \"" + term + "\" not found in index.");
        } else {
            System.out.printf("Paper IDs containing \"%s\": %s\n", term, postingList.toString());
            for (int pid : postingList) {
                Paper p = repository.getPaperById(pid);
                if (p != null) {
                    System.out.printf("  • [%d] %s (%d)\n", pid, p.getTitle(), p.getYear());
                }
            }
        }
    }

    private static int readIntInput(String prompt, int min, int max) {
        while (true) {
            System.out.print(prompt);
            String line = scanner.nextLine().trim();
            try {
                int val = Integer.parseInt(line);
                if (val >= min && val <= max) {
                    return val;
                }
                System.out.printf("Please enter a number between %d and %d.\n", min, max);
            } catch (NumberFormatException e) {
                System.out.printf("Invalid number. Please enter between %d and %d.\n", min, max);
            }
        }
    }
}
