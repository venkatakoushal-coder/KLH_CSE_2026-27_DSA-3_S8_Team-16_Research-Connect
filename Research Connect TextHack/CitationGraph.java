import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

/**
 * Directed Graph for managing research paper citations.
 */
public class CitationGraph {

    // Forward adjacency list: paperId -> list of papers it CITES
    private Map<Integer, List<Integer>> adjList = new HashMap<>();

    // Reverse adjacency list: paperId -> list of papers that CITE it
    private Map<Integer, List<Integer>> reverseAdjList = new HashMap<>();

    private Set<Integer> allPaperIds = new HashSet<>();

    public CitationGraph() {}

    public void registerPaper(int paperId) {
        allPaperIds.add(paperId);
        adjList.putIfAbsent(paperId, new ArrayList<Integer>());
        reverseAdjList.putIfAbsent(paperId, new ArrayList<Integer>());
    }

    // Load citation edges from file (Corpus/citations.txt)
    public void loadCitations(String filePath) {
        File file = new File(filePath);
        if (!file.exists()) {
            return;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            int count = 0;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;

                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    try {
                        int fromId = Integer.parseInt(parts[0].trim());
                        int toId = Integer.parseInt(parts[1].trim());
                        addEdge(fromId, toId);
                        count++;
                    } catch (NumberFormatException e) {
                        // Skip malformed lines
                    }
                }
            }
            System.out.printf("Loaded %d citation link(s) from %s\n", count, file.getName());
        } catch (IOException e) {
            System.out.println("Error reading citation file: " + e.getMessage());
        }
    }

    // Add directed edge (fromId -> toId)
    public void addEdge(int fromId, int toId) {
        registerPaper(fromId);
        registerPaper(toId);

        List<Integer> forward = adjList.get(fromId);
        if (!forward.contains(toId)) {
            forward.add(toId);
        }

        List<Integer> reverse = reverseAdjList.get(toId);
        if (!reverse.contains(fromId)) {
            reverse.add(fromId);
        }
    }

    // Add citation in memory and write to citations.txt
    public boolean addCitationAndPersist(int fromId, int toId, String filePath) {
        addEdge(fromId, toId);

        try (BufferedWriter bw = new BufferedWriter(new FileWriter(filePath, true))) {
            bw.write(fromId + "," + toId);
            bw.newLine();
            return true;
        } catch (IOException e) {
            System.out.println("Error writing citation to file: " + e.getMessage());
            return false;
        }
    }

    // Papers that this paper cites
    public List<Integer> getCitedPapers(int paperId) {
        return adjList.getOrDefault(paperId, Collections.<Integer>emptyList());
    }

    // Papers that cite this paper
    public List<Integer> getCitingPapers(int paperId) {
        return reverseAdjList.getOrDefault(paperId, Collections.<Integer>emptyList());
    }

    // BFS level-by-level traversal using a queue
    public List<int[]> bfsTraversal(int startId) {
        List<int[]> result = new ArrayList<>();
        if (!allPaperIds.contains(startId)) return result;

        Queue<Integer> queue = new LinkedList<>();
        Map<Integer, Integer> visitedLevel = new HashMap<>();

        queue.add(startId);
        visitedLevel.put(startId, 0);

        while (!queue.isEmpty()) {
            int curr = queue.poll();
            int currLevel = visitedLevel.get(curr);
            result.add(new int[]{currLevel, curr});

            for (int neighbor : adjList.getOrDefault(curr, Collections.<Integer>emptyList())) {
                if (!visitedLevel.containsKey(neighbor)) {
                    visitedLevel.put(neighbor, currLevel + 1);
                    queue.add(neighbor);
                }
            }
        }
        return result;
    }

    // DFS traversal for deep citation path
    public List<Integer> dfsTraversal(int startId) {
        List<Integer> order = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        dfsHelper(startId, visited, order);
        return order;
    }

    private void dfsHelper(int current, Set<Integer> visited, List<Integer> order) {
        visited.add(current);
        order.add(current);

        for (int neighbor : adjList.getOrDefault(current, Collections.<Integer>emptyList())) {
            if (!visited.contains(neighbor)) {
                dfsHelper(neighbor, visited, order);
            }
        }
    }

    // Shortest citation path between two papers using BFS
    public List<Integer> findShortestCitationPath(int srcId, int dstId) {
        if (!allPaperIds.contains(srcId) || !allPaperIds.contains(dstId)) {
            return Collections.emptyList();
        }

        Queue<Integer> queue = new LinkedList<>();
        Map<Integer, Integer> parentMap = new HashMap<>();
        Set<Integer> visited = new HashSet<>();

        queue.add(srcId);
        visited.add(srcId);
        parentMap.put(srcId, -1);

        boolean found = false;
        while (!queue.isEmpty()) {
            int curr = queue.poll();
            if (curr == dstId) {
                found = true;
                break;
            }

            for (int neighbor : adjList.getOrDefault(curr, Collections.<Integer>emptyList())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    parentMap.put(neighbor, curr);
                    queue.add(neighbor);
                }
            }
        }

        if (!found) return Collections.emptyList();

        // Reconstruct path
        List<Integer> path = new ArrayList<>();
        int curr = dstId;
        while (curr != -1) {
            path.add(curr);
            curr = parentMap.get(curr);
        }
        Collections.reverse(path);
        return path;
    }

    public int getTotalNodes() {
        return allPaperIds.size();
    }

    public int getTotalEdges() {
        int count = 0;
        for (List<Integer> targets : adjList.values()) {
            count += targets.size();
        }
        return count;
    }

    // Find paper with highest citations received
    public int getMostCitedPaperId() {
        int maxId = -1;
        int maxCount = -1;
        for (Map.Entry<Integer, List<Integer>> entry : reverseAdjList.entrySet()) {
            if (entry.getValue().size() > maxCount) {
                maxCount = entry.getValue().size();
                maxId = entry.getKey();
            }
        }
        return maxId;
    }
}
