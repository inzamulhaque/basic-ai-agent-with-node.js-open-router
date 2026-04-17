const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "stepfun/step-3.5-flash:free",
//     messages: [{ role: "user", content: "Say this is a test" }],
//   });

//   console.log(completion.choices[0].message);
// }
// main();

const analyzeGoal = async (goalText, duration) => {
  // const goalText = "Learn Python";
  // const duration = 7;

  const propmt = `User wants to ${goalText} within ${duration} days. 
    create a structured learning/execution plan with:
    1. main milestones for each week.
    2. success matrices
    3. potential challenges
    4. motivational approch

    Return as JSON with this structure:
    {
      "milestones": ["milestone1", "milestone2", "milestone3"],
      "dailyTasks": [{"day": 1, "title": "....", "description": "..."}],
      "successMetrics": ["metric 1", "metric 2", "metric 3"],
      "challenges": ["challenge 1"],
      "motivationalApproach": "...."
    } 
  `;

  try {
    const completion = await openai.chat.completions.create({
      // model: "stepfun/step-3.5-flash:free",
      model: "openai/gpt-oss-120b:free",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in personal productivity coach and learning specialist.",
        },
        { role: "user", content: propmt },
      ],
      temperature: 0.7,
    });

    // console.log(completion.choices[0].message);

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    console.log(jsonMatch);

    // if (jsonMatch) {
    //   return JSON.parse(jsonMatch);
    // }

    return JSON.parse(jsonMatch);
  } catch (error) {
    console.error("Error analyzing goal:", error);
  }
};

const evaluateProgress = async (goal, completedTasks, totalTasks, days) => {
  try {
    const completionRate = ((completedTasks / totalTasks) * 100).toFixed(2);
    const expectedRate = ((days / goal.duration) * 100).toFixed(2);
    const onTrack = completionRate >= expectedRate - 10; // Allowing a 10% margin

    const prompt = `Learning Goal: ${goal.title}
  Duration: ${goal.durationDays} days
  Days Elapsed: ${days} days
  Task Completion Rate: ${completionRate}  
  Expected Task completion rate: ${expectedRate}
  status: ${onTrack ? "ON TRACK" : "BEHIND"}

  Generate: 
  1. Performance analysis
  2. Specific encouragement 
  3. Recommend next action (just 1-3 lines)
  4. Weekly tips

  Return as JSON: 
  {
    "analysis": ".....",
    "encourgement": ".....",
    "nextAction": ".....",
    "tip": "....."
  }
  `;
  } catch (error) {
    console.error("Error analyzing goal:", error);
  }
};

module.exports = { analyzeGoal, evaluateProgress };
