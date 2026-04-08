require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { analyzeGoal } = require("./ai-agents");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// api endpoints

app.post("/api/goals", async (req, res) => {
  try {
    const { goalText, duration } = req.body;
    if (!goalText || !duration) {
      return res
        .status(400)
        .json({ error: "goalText and duration are required" });
    }

    const plan = await analyzeGoal(goalText, duration);

    res.status(200).json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============ SERVER START ============

app.listen(PORT, () => {
  console.log(`🚀 AI Task Agent running on http://localhost:${PORT}`);
});
