import java.util.ArrayList;
import java.util.List;

/**
 * Paper model class storing metadata and content of a research paper.
 */
public class Paper {
    private int id;
    private String title;
    private String author;
    private int year;
    private String category;
    private String content;
    private int wordCount;

    public Paper(int id, String title, String author, int year, String category, String content) {
        this.id = id;
        this.title = title != null ? title.trim() : "";
        this.author = author != null ? author.trim() : "";
        this.year = year;
        this.category = category != null ? category.trim() : "General";
        this.content = content != null ? content.trim() : "";
        this.wordCount = computeWordCount(this.content);
    }

    // Manual word counter
    private int computeWordCount(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        int count = 0;
        boolean inWord = false;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (Character.isWhitespace(c)) {
                inWord = false;
            } else if (!inWord) {
                inWord = true;
                count++;
            }
        }
        return count;
    }

    public int getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public int getYear() {
        return year;
    }

    public String getCategory() {
        return category;
    }

    public String getContent() {
        return content;
    }

    public int getWordCount() {
        return wordCount;
    }

    // Split content line by line
    public List<String> getContentLines() {
        List<String> lines = new ArrayList<>();
        if (content == null || content.isEmpty()) {
            return lines;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (c == '\r') {
                continue;
            }
            if (c == '\n') {
                lines.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        if (sb.length() > 0) {
            lines.add(sb.toString());
        }
        return lines;
    }

    public void printSummary() {
        System.out.printf("[%d] \"%s\" | %s (%d) | Category: %s | Words: %d\n",
                id, title, author, year, category, wordCount);
    }

    public void printDetailed() {
        System.out.println("================================================================================");
        System.out.println(" Paper ID    : " + id);
        System.out.println(" Title       : " + title);
        System.out.println(" Author(s)   : " + author);
        System.out.println(" Year        : " + year);
        System.out.println(" Domain      : " + category);
        System.out.println(" Word Count  : " + wordCount + " words");
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println(" Abstract / Content Preview:");
        System.out.println(" " + content);
        System.out.println("================================================================================");
    }

    @Override
    public String toString() {
        return String.format("Paper[ID=%d, Title=\"%s\", Year=%d, Category=\"%s\"]", id, title, year, category);
    }
}
