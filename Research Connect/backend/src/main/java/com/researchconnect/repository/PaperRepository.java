package com.researchconnect.repository;

import com.researchconnect.algorithm.PrefixTrie;
import com.researchconnect.model.Paper;
import org.springframework.stereotype.Repository;

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
@Repository
public class PaperRepository {

    private List<Paper> paperList = new ArrayList<>();
    private Map<Integer, Paper> paperMap = new HashMap<>();
    private Map<String, Set<Integer>> invertedIndex = new HashMap<>();
    private Set<String> vocabulary = new HashSet<>();
    private PrefixTrie prefixTrie = new PrefixTrie();

    public PaperRepository() {}

    // Load all .txt paper files from directory in deterministic canonical order
    public void loadFromDirectory(String corpusDirPath) {
        paperList.clear();
        paperMap.clear();
        invertedIndex.clear();
        vocabulary.clear();
        prefixTrie = new PrefixTrie();

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

        // Separate original papers from synthetic papers for deterministic ID assignment
        List<File> originalFiles = new ArrayList<>();
        List<File> syntheticFiles = new ArrayList<>();

        for (File file : files) {
            if (file.isFile() && file.getName().endsWith(".txt") && !file.getName().equalsIgnoreCase("citations.txt")) {
                if (file.getName().startsWith("synthetic_")) {
                    syntheticFiles.add(file);
                } else {
                    originalFiles.add(file);
                }
            }
        }

        // Canonical order for original 15 papers (IDs 101 to 115)
        List<String> canonicalOriginals = Arrays.asList(
            "attention_transformers_nlp.txt",
            "blockchain_sharding_consensus.txt",
            "deep_residual_learning_resnet.txt",
            "edge_computing_iot_orchestration.txt",
            "federated_learning_privacy_preservation.txt",
            "generative_adversarial_networks_synthesis.txt",
            "graph_neural_networks_classification.txt",
            "homomorphic_encryption_cloud_privacy.txt",
            "quantum_error_correction_fault_tolerance.txt",
            "quantum_key_distribution_optical_networks.txt",
            "reinforcement_learning_autonomous_navigation.txt",
            "software_defined_networking_5g_core.txt",
            "transformer_vision_object_detection.txt",
            "zero_trust_cloud_security_architecture.txt",
            "zero_knowledge_proofs_privacy.txt"
        );

        originalFiles.sort(new Comparator<File>() {
            @Override
            public int compare(File f1, File f2) {
                int idx1 = canonicalOriginals.indexOf(f1.getName());
                int idx2 = canonicalOriginals.indexOf(f2.getName());
                if (idx1 != -1 && idx2 != -1) return Integer.compare(idx1, idx2);
                if (idx1 != -1) return -1;
                if (idx2 != -1) return 1;
                return f1.getName().compareToIgnoreCase(f2.getName());
            }
        });

        syntheticFiles.sort(new Comparator<File>() {
            @Override
            public int compare(File f1, File f2) {
                int id1 = extractSyntheticId(f1.getName());
                int id2 = extractSyntheticId(f2.getName());
                return Integer.compare(id1, id2);
            }
        });

        int loadedCount = 0;
        int origId = 101;
        for (File file : originalFiles) {
            Paper paper = parsePaperFile(file, origId++);
            if (paper != null) {
                addPaper(paper);
                loadedCount++;
            }
        }

        for (File file : syntheticFiles) {
            int id = extractSyntheticId(file.getName());
            if (id <= 0) id = origId++;
            Paper paper = parsePaperFile(file, id);
            if (paper != null) {
                addPaper(paper);
                loadedCount++;
            }
        }

        // Build inverted index and vocabulary
        buildIndexAndVocabulary();

        System.out.printf("Successfully loaded %d research paper(s) into memory.\n", loadedCount);
    }

    private int extractSyntheticId(String name) {
        try {
            if (name.startsWith("synthetic_")) {
                int secondUnderscore = name.indexOf('_', 10);
                if (secondUnderscore > 10) {
                    return Integer.parseInt(name.substring(10, secondUnderscore));
                }
            }
        } catch (Exception ignored) {}
        return -1;
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

    // Build inverted index (token -> set of paper IDs) and populate Prefix Trie
    private void buildIndexAndVocabulary() {
        Map<String, Integer> termFrequencies = new HashMap<>();

        for (Paper p : paperList) {
            String fullText = p.getTitle() + " " + p.getAuthor() + " " + p.getCategory() + " " + p.getContent();
            List<String> tokens = manualTokenize(fullText);

            for (String token : tokens) {
                vocabulary.add(token);

                if (!invertedIndex.containsKey(token)) {
                    invertedIndex.put(token, new HashSet<Integer>());
                }
                invertedIndex.get(token).add(p.getId());

                termFrequencies.put(token, termFrequencies.getOrDefault(token, 0) + 1);
            }
        }

        // Insert vocabulary words and their frequency into the Prefix Trie for instant autocomplete
        for (Map.Entry<String, Integer> entry : termFrequencies.entrySet()) {
            prefixTrie.insert(entry.getKey(), entry.getValue());
        }
    }

    public List<String> getAutocompleteSuggestions(String prefix, int limit) {
        return prefixTrie.getSuggestions(prefix, limit > 0 ? limit : 6);
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

    // Filter by author name
    public List<Paper> filterByAuthor(String author) {
        List<Paper> filtered = new ArrayList<>();
        if (author == null) return filtered;
        String query = author.trim().toLowerCase();

        for (Paper p : paperList) {
            if (p.getAuthor().toLowerCase().contains(query)) {
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

    public Set<Integer> getAllYears() {
        Set<Integer> years = new HashSet<>();
        for (Paper p : paperList) {
            years.add(p.getYear());
        }
        return years;
    }

    public Set<String> getAllAuthors() {
        Set<String> authors = new HashSet<>();
        for (Paper p : paperList) {
            String[] parts = p.getAuthor().split(",");
            for (String a : parts) {
                if (!a.trim().isEmpty()) {
                    authors.add(a.trim());
                }
            }
        }
        return authors;
    }
}
