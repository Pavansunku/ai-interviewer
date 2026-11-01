const config = require("../config");
const mockAi = require("./mockAiService");
const groqAI = require("./groqAiService");

async function generateWelcomeAndFirstQuestion(params) {
  switch (config.AI_PROVIDER) {
    case "groq":
      return groqAI.generateWelcomeAndFirstQuestion(params);
    case "mock":
    default:
      return mockAi.generateWelcomeAndFirstQuestion(params);
  }
}

async function evaluateAnswer(params) {
  switch (config.AI_PROVIDER) {
    case "groq":
      return groqAI.evaluateAnswer(params);
    case "mock":
    default:
      return mockAi.evaluateAnswer(params);
  }
}

async function generateReport(params) {
  switch (config.AI_PROVIDER) {
    case "groq":
      return groqAI.generateReport(params);
    case "mock":
    default:
      return mockAi.generateReport(params);
  }
}

module.exports = {
  generateWelcomeAndFirstQuestion,
  evaluateAnswer,
  generateReport,
};