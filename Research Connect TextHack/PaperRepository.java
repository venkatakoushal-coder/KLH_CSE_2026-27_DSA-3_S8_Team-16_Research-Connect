import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Repository to load papers from Corpus/ and manage Inverted Index & Hashing.
 */
public class PaperRepository {

    private List<Paper> paperList = new ArrayList<>();
    private Map<Integer, Paper> paperMap = new HashMap<>();
    private Map<String, Set<Integer>> invertedIndex = new HashMap<>();
    private Set<String> vocabulary = new HashSet<>();

    public PaperRepository() {}

    // Load all .txt paper files from directory in deterministic alphabetical order
    public void loadFromDirectory(String corpusDirPath) {
        paperList.clear();
        paperMap.clear();
        invertedIndex.clear();
        vocabulary.clear();

        File dir = new File(corpusDirPath);
        if (!dir.exists() || !dir.isDirectory()) {
            System.out.println("(!) Corpus directory not found at: " + corpusDirPath);
            return;
        }

        File[] files = dir.listFiles();
        if (files == null || files.length == 0) {
            System.out.println("(!) No files found in corpus directory.");
            return;
        }

        // Sort files alphabetically to ensure stable ID assignment
        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File f1, File f2) {
                return f1.getName().compareToIgnoreCase(f2.getName());
            }
        });

        int idCounter = 101;
        int loadedCount = 0;

        for (File file : files) {
            if (file.isFile() && file.getName().endsWith(".txt") && !file.getName().equalsIgnoreCase("citations.txt")) {
                Paper paper = parsePaperFile(file, idCounter++);
                if (paper != null) {
                    addPaper(paper);
                    loadedCount++;
                }
            }
        }

        // Build inverted index and vocabulary
        buildIndexAndVocabulary();

        System.out.printf("Successfully loaded %d research paper(s) into memory.\n", loadedCount);
    }

    // Read paper file format (Line 1: Title, Line 2: Author, Line 3: Year, Line 4: Category, Line 6+: Content)
    private Paper parsePaperFile(File file, int assignedId) {
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String title = br.readLine();
            String author = br.readLine();
            String yearStr = br.readLine();
            String category = br.readLine();

            if (title == null || author == null || yearStr == null) {
                return null;
            }

            int year = 2024;
            try {
                year = Integer.parseInt(yearStr.trim());
            } catch (NumberFormatException e) {
                // Default fallback
            }

            StringBuilder contentBuilder = new StringBuilder();
            String line;
            boolean firstContentLine = true;
            while ((line = br.readLine()) != null) {
                if (firstContentLine && line.trim().isEmpty()) {
                    continue; // skip blank line after category
                }
                firstContentLine = false;
                contentBuilder.append(line).append("\n");
            }

            return new Paper(assignedId, title, author, year, category, contentBuilder.toString());
        } catch (IOException e) {
            System.out.println("Error parsing file " + file.getName() + ": " + e.getMessage());
            return null;
        }
    }

    private void addPaper(Paper paper) {
        paperList.add(paper);
        paperMap.put(paper.getId(), paper);
    }

    // Build inverted index (token -> set of paper IDs)
    private void buildIndexAndVocabulary() {
        for (Paper p : paperList) {
            String fullText = p.getTitle() + " " + p.getAuthor() + " " + p.getCategory() + " " + p.getContent();
            List<String> tokens = manualTokenize(fullText);

            for (String token : tokens) {
                vocabulary.add(token);

                if (!invertedIndex.containsKey(token)) {
                    invertedIndex.put(token, new HashSet<Integer>());
                }
                invertedIndex.get(token).add(p.getId());
            }
        }
    }

    // Split text into words manually
    public static List<String> manualTokenize(String text) {
        List<String> tokens = new ArrayList<>();
        if (text == null || text.isEmpty()) return tokens;

        StringBuilder current = new StringBuilder();
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                current.append(Character.toLowerCase(c));
            } else {
                if (current.length() > 0) {
                    tokens.add(current.toString());
                    current.setLength(0);
                }
            }
        }
        if (current.length() > 0) {
            tokens.add(current.toString());
        }
        return tokens;
    }

    public Paper getPaperById(int id) {
        return paperMap.get(id);
    }

    public List<Paper> getAllPapers() {
        return paperList;
    }

    public Set<String> getVocabulary() {
        return vocabulary;
    }

    public Map<String, Set<Integer>> getInvertedIndex() {
        return invertedIndex;
    }

    public Set<Integer> getCandidatePaperIds(String word) {
        if (word == null) return Collections.emptySet();
        return invertedIndex.getOrDefault(word.trim().toLowerCase(), Collections.<Integer>emptySet());
    }

    // Filter by year
    public List<Paper> filterByYear(int year) {
        List<Paper> filtered = new ArrayList<>();
        for (Paper p : paperList) {
            if (p.getYear() == year) {
                filtered.add(p);
            }
        }
        return filtered;
    }

    // Filter by year range
    public List<Paper> filterByYearRange(int startYear, int endYear) {
        List<Paper> filtered = new ArrayList<>();
        for (Paper p : paperList) {
            if (p.getYear() >= startYear && p.getYear() <= endYear) {
                filtered.add(p);
            }
        }
        return filtered;
    }

    // Filter by research category
    public List<Paper> filterByCategory(String category) {
        List<Paper> filtered = new ArrayList<>();
        if (category == null) return filtered;
        String query = category.trim().toLowerCase();

        for (Paper p : paperList) {
            if (p.getCategory().toLowerCase().contains(query)) {
                filtered.add(p);
            }
        }
        return filtered;
    }

    public Set<String> getAllCategories() {
        Set<String> categories = new HashSet<>();
        for (Paper p : paperList) {
            categories.add(p.getCategory());
        }
        return categories;
    }
}
