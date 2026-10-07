# Research Connect — Algorithm-Based Research Paper Discovery and Analysis System

> **A Complete Full-Stack Web Application for Research Paper Discovery, Textual Search, Document Similarity, and Citation Graph Analysis powered by Data Structures & Algorithms.**

---

## 1. Project Overview & Purpose

**Research Connect** is an algorithm-based research paper discovery and analysis system designed to help students, academicians, and researchers discover, explore, and analyze scholarly articles.

Traditional research platforms often rely on opaque machine learning embeddings or external proprietary APIs. In contrast, **Research Connect** implements foundational **Data Structures and Algorithms (DSA) from first principles** to power:
- **Search**: High-speed, deterministic single-keyword string matching via Knuth-Morris-Pratt (KMP).
- **Multi-Keyword Search**: Simultaneous multi-pattern extraction across entire documents via Aho-Corasick.
- **Typo Tolerance**: Dynamic programming fuzzy search via Levenshtein Edit Distance with "Did you mean?" suggestions.
- **Document Similarity**: Substring overlap and common phrase detection via Generalized Suffix Array and Kasai's LCP (Longest Common Prefix) array.
- **Citation Relationships**: Directed Graph modeling with Breadth-First Search (BFS) for shortest citation paths and Depth-First Search (DFS) for dependency chains.
- **Corpus Indexing**: Rapid candidate filtering via in-memory Inverted Index hashing.

---

## 2. Core DSA Algorithms Used

| Algorithm | Role in Research Connect | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Knuth-Morris-Pratt (KMP)** | Exact single-keyword search with LPS failure table; in-document occurrence tracking. | $O(N + M)$ | $O(M)$ |
| **Aho-Corasick Automaton** | Multi-keyword simultaneous search across all papers using Trie + BFS failure links. | $O(N + \sum M_i + Z)$ | $O(\sum M_i)$ |
| **Levenshtein Edit Distance** | 2D Dynamic Programming typo detection and genuine vocabulary suggestions ($\le 2$ distance). | $O(M \times N)$ | $O(M \times N)$ |
| **Suffix Array + Kasai's LCP** | Document similarity scoring and similar paper recommendations based on shared text overlap. | $O(N \log N)$ SA, $O(N)$ LCP | $O(N)$ |
| **Directed Citation Graph** | Models academic citations with adjacency lists; BFS shortest paths & DFS traversal chains. | $O(V + E)$ | $O(V + E)$ |
| **Inverted Index Hashing** | $O(1)$ candidate paper retrieval mapping vocabulary tokens to sets of paper IDs. | $O(1)$ average | $O(\text{Terms})$ |

---

## 3. Technology Stack

- **Backend**:
  - Java 21+ / Java 24
  - Spring Boot 3.3.4 (`spring-boot-starter-web`)
  - Maven Wrapper (`mvnw`)
  - Pure Java Standard Library implementations for all algorithms (zero external search/graph libraries)
  - File-based persistence (`Corpus/` directory and `citations.txt`)
- **Frontend**:
  - React 18
  - Vite 5
  - React Router DOM 6
  - Lucide React (academic SVG icons)
  - Responsive Academic Light UI Theme (Clean CSS, responsive grid/flexbox)

---

## 4. Project Structure

```text
Research Connect/
├── Corpus/                                      # File-based repository (180 research papers)
│   ├── attention_transformers_nlp.txt           # Foundational Paper #101
│   ├── blockchain_sharding_consensus.txt        # Foundational Paper #102
│   ├── deep_residual_learning_resnet.txt       # Foundational Paper #103
│   ├── ... (15 original foundational papers)
│   ├── synthetic_116_diffusion_models_video.txt # Synthetic demo papers #116 to #280
│   └── citations.txt                            # Directed citation edges (415 relationships)
│
├── backend/                                     # Spring Boot REST API
│   ├── pom.xml
│   ├── mvnw & mvnw.cmd
│   └── src/main/
│       ├── java/com/researchconnect/
│       │   ├── ResearchConnectApplication.java  # Spring Boot Main
│       │   ├── model/Paper.java                 # Paper data model
│       │   ├── algorithm/
│       │   │   ├── KMPSearch.java               # KMP string matching
│       │   │   ├── AhoCorasick.java             # Aho-Corasick multi-pattern
│       │   │   ├── EditDistance.java            # Levenshtein DP
│       │   │   ├── SuffixArray.java             # Suffix Array & Kasai LCP
│       │   │   └── CitationGraph.java           # Directed graph & traversals
│       │   ├── repository/PaperRepository.java  # File loader & Inverted Index
│       │   ├── service/                         # Service layer
│       │   │   ├── PaperService.java
│       │   │   ├── SearchService.java
│       │   │   ├── SimilarityService.java
│       │   │   ├── CitationService.java
│       │   │   └── StatisticsService.java
│       │   ├── controller/                      # REST API controllers
│       │   │   ├── PaperController.java
│       │   │   ├── SearchController.java
│       │   │   ├── SimilarityController.java
│       │   │   ├── CitationController.java
│       │   │   └── StatisticsController.java
│       │   └── config/CorsConfig.java           # Global CORS configuration
│       └── resources/
│           ├── application.properties
│           └── Corpus/                          # Bundled corpus backup
│
├── frontend/                                    # React + Vite Application
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css                            # Academic UI stylesheet
│       ├── services/api.js                      # Axios API communication
│       ├── components/
│       │   ├── Navbar.jsx                       # Academic header navigation
│       │   ├── Footer.jsx                       # Footer with synthetic notice
│       │   ├── AlgorithmBadge.jsx               # Algorithm badge pill
│       │   └── PaperCard.jsx                    # Paper presentation card
│       └── pages/
│           ├── Home.jsx                         # Landing page with hero & search
│           ├── SearchResults.jsx                # KMP search + typo suggestions
│           ├── PaperDetail.jsx                  # Reader with occurrence navigation
│           ├── AdvancedSearch.jsx               # Aho-Corasick multi-pattern search
│           ├── Papers.jsx                       # Filterable & paginated catalog
│           ├── Statistics.jsx                   # Visual analytics dashboard
│           └── Algorithms.jsx                   # Educational DSA documentation
│
├── Paper.java                                   # Root source (console compatibility)
├── PaperRepository.java
├── KMPSearch.java
├── AhoCorasick.java
├── EditDistance.java
├── SuffixArray.java
├── CitationGraph.java
├── Main.java                                    # Standalone CLI entrypoint
└── README.md
```

---

## 5. How to Run the Application

### Prerequisites
- **Java**: JDK 17, 21, or 24 installed
- **Node.js**: Node.js v18+ and npm installed

### Step 1: Start the Spring Boot Backend
Open a terminal in the `backend/` directory:

```bash
cd backend
set JAVA_HOME=C:\Program Files\Java\jdk-24   # (Windows cmd if needed)
./mvnw spring-boot:run
```

The backend starts at: `http://localhost:8080`.  
Verification: Open `http://localhost:8080/api/statistics` in your browser.

### Step 2: Start the React Frontend
Open a second terminal in the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at: `http://localhost:5173`.

---

## 6. REST API Reference

| Method | Endpoint | Description | Algorithm |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/papers` | Get all papers (with category, year, query, page, limit filters). | Inverted Index / Filtering |
| `GET` | `/api/papers/{id}` | Get single paper by ID with full content and metadata. | HashMap $O(1)$ |
| `GET` | `/api/search?keyword=transformer` | Exact single-keyword search across entire corpus. | **Knuth-Morris-Pratt (KMP)** |
| `GET` | `/api/papers/{id}/search?keyword=transformer` | Search inside one paper with line/col positions. | **KMP In-Document** |
| `GET` | `/api/search/suggestions?keyword=transfomer` | Fuzzy search suggestions for misspelled terms. | **Levenshtein Edit Distance** |
| `GET` | `/api/search/multiple?keywords=transformer,attention,NLP` | Multi-keyword simultaneous extraction. | **Aho-Corasick Automaton** |
| `GET` | `/api/papers/{id}/similar?limit=5` | Recommend top $N$ most similar research papers. | **Suffix Array + Kasai LCP** |
| `GET` | `/api/papers/{id}/citations` | Get references (cited) and citations received (citing). | **Directed Citation Graph** |
| `GET` | `/api/papers/{id}/citation-path/{targetId}` | Find shortest citation path between two papers. | **BFS Shortest Path** |
| `GET` | `/api/papers/{id}/bfs` | Explore level-by-level citation tree. | **BFS Traversal** |
| `GET` | `/api/papers/{id}/dfs` | Explore deep citation dependency chain. | **DFS Traversal** |
| `POST` | `/api/citations?fromId={id}&toId={id}` | Add a new citation link to the graph. | Graph Adjacency List |
| `GET` | `/api/statistics` | Corpus analytics (papers, categories, citations, authors). | Graph & Index Metrics |

---

## 7. Corpus Format & Synthetic Dataset Notice

Each paper in `Corpus/` is formatted as:
```text
Line 1: Paper Title
Line 2: Author Name(s)
Line 3: Publication Year
Line 4: Research Category / Domain
Line 5: (blank line)
Line 6+: Abstract & Research Content
```

> **Note**: *Research Connect uses synthetic research-paper data (165 synthetic papers alongside 15 foundational papers, totaling 180 papers) for prototype and algorithm demonstration purposes. The synthetic papers are generated across realistic domains (Deep Learning, NLP, Quantum Computing, Cybersecurity, Robotics, 5G/6G, Cloud, etc.) to ensure authentic search, similarity, and citation network density.*

---

## 8. Example Demonstration Workflows

1. **Exact Search (KMP)**:
   - Search `transformer` on Home page.
   - See matching papers, occurrence counts, and snippet previews.
   - Inspect the LPS failure table.
2. **In-Paper Occurrence Navigation**:
   - Click a search result.
   - See every occurrence of `transformer` highlighted in yellow.
   - Click **Next** / **Prev** buttons to cycle through occurrences with smooth scrolling (`Occurrence 3 of 10`).
3. **Typo Suggestions (Edit Distance)**:
   - Search an intentional typo: `transfomer` or `artifical`.
   - See "No exact results found" with the prompt: `Did you mean "transformer"? (edit distance: 1)`.
   - Click the suggestion to execute the search immediately.
4. **Multi-Keyword Search (Aho-Corasick)**:
   - Open **Advanced Search**.
   - Search: `transformer, attention, NLP`.
   - See matched papers with individual occurrence breakdowns per keyword.
5. **Similar Papers (Suffix Array + LCP)**:
   - Open Paper #101 (*Attention Is All You Need*).
   - Switch to the **Similar Papers** tab.
   - View top similar papers ranked by textual similarity score and longest common substring length.
6. **Citation Network Analysis (Graph)**:
   - Switch to the **Citations & Graph** tab on any paper.
   - View references and citing papers.
   - Enter a target ID (e.g. `103`) to find the **Shortest Citation Path** via BFS.
   - Run **BFS Level Order** or **DFS Chain** traversals.
7. **Analytics Dashboard**:
   - Open **Statistics** to view real-time metrics, category distribution bars, timeline, and in-degree citation hubs.
8. **Educational Reference**:
   - Open **Algorithms** to review academic explanations and complexities for viva voce.
