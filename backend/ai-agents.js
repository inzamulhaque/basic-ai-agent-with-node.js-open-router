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
  // const duration = " 7 days";

  const propmt = `User want to ${goalText} in ${duration}. Analyze the goal and break it down into smaller steps. return as JSON output`;

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

    // if (jsonMatch) {
    //   return JSON.parse(jsonMatch);
    // }

    return JSON.parse(jsonMatch);
  } catch (error) {
    console.error("Error analyzing goal:", error);
  }
};

module.exports = { analyzeGoal };
