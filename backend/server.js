require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { analyzeGoal, evaluateProgress } = require("./ai-agents");
const storage = require("./storage");

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

    console.log({ plan });

    if (plan) {
      const goal = storage.saveGoal({
        title: goalText,
        duration,
        plan,
        status: "active",
      });

      const tasks = storage.saveTasks(goal?.id, plan?.dailyTasks);

      storage.saveProgress(goal.id, {
        goalId: goal.id,
        completedTasks: 0,
        totalTasks: tasks.length,
        progressParcentage: 0,
      });
    }

    res.status(200).json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

app.post("/api/goals/:goalId/evaluate", async (req, res) => {
  try {
    const { goalId } = req.params;
    const goal = storage.getGoal(goalId);

    if (!goal) {
      return res.status(404).json({ error: "Goal not found!" });
    }

    const tasks = storage.getTasksByGoal(goalId);
    const completedTasks = tasks.filter((task) => task.completed).length;
    const createDays = Math.ceil(
      (Date.now() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24),
    );

    const evaluation = await evaluateProgress(
      goal,
      completedTasks,
      tasks.length,
      createDays,
    );

    res.status(200).json({ evaluation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

// ============ SERVER START ============

app.listen(PORT, () => {
  console.log(`🚀 AI Task Agent running on http://localhost:${PORT}`);
});
