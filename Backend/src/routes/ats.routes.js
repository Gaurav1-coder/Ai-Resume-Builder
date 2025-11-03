import express from "express";
import multer from "multer";
import pdf from "pdf-parse";
import natural from "natural";
import stopword from "stopword";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Tokenizer function
function tokenize(text) {
  if (!text) return [];
  const tokenizer = new natural.WordTokenizer();
  let tokens = tokenizer.tokenize(text.replace(/[\W_]+/g, " ").toLowerCase());
  tokens = stopword.removeStopwords(tokens);
  tokens = tokens.filter((t) => t.length > 2 && !/^\d+$/.test(t));
  return Array.from(new Set(tokens));
}

// POST /api/ats/score
router.post("/score", upload.single("resume"), async (req, res) => {
  try {
    const jobDesc = req.body.jobDesc || "";
    if (!jobDesc) {
      return res.status(400).json({ error: "Job description required" });
    }

    let resumeText = "";

    if (req.file) {
      const pdfData = await pdf(req.file.buffer);
      resumeText = pdfData.text || "";
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    const jobTokens = tokenize(jobDesc);
    const resumeTokens = tokenize(resumeText);

    const matched = jobTokens.filter((t) => resumeTokens.includes(t));
    const missing = jobTokens.filter((t) => !resumeTokens.includes(t));

    const rawScore = (matched.length / jobTokens.length) * 100;
    const score = Math.round(rawScore * 100) / 100;

    const feedback = [];
    if (score < 40)
      feedback.push("Your resume has low keyword match. Add more job-relevant keywords.");
    if (missing.length > 0)
      feedback.push(`Missing keywords: ${missing.slice(0, 10).join(", ")}`);

    res.json({
      ats_score: score,
      matched_keywords: matched,
      missing_keywords: missing,
      feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
