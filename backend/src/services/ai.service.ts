import { PrismaClient } from "@prisma/client";
import { sendQuizResultsEmail } from "../utils/email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SUPPORT_PROMPT = `You are a helpful Customer Service Platform Assistant for an educational platform. You MUST answer questions related to education, courses, diamonds (currency), payments, payment methods, refunds, and platform settings. If the user asks about ANYTHING else completely unrelated to this platform, you MUST reply EXACTLY with: 'I can't help you with that.'

Platform Knowledge:
- Currency: Diamonds (♦) are the platform currency used to purchase courses. The exchange rate varies between 0.077 MYR and 0.12 MYR per diamond depending on the payment method.
- Payment Methods: We support a wide range of payment methods including PayPal, Bank Transfer, VISA/Master Card, FPX, Google Wallet, Touch 'n Go eWallet, Duitnow, U Mobile, Shopeepay wallet, digi, Grabpay, celcom, Boost eWallet, and ATOME.
- Features: The platform has an "AI Learning" feature that provides adaptive quizzes and study plans for learners, and a "Seller Copilot" that helps sellers generate course syllabus and quiz questions using AI.
- VIP Membership: Users can upgrade to VIP for 150 Diamonds per month. VIP benefits include: Unlimited AI Agent calls, Special promotional discounts, Reduced diamond costs, and entry into Lucky draws for purchases over 1000 diamonds. The standard free tier includes 3 Planner uses/month, Tutor & Examiner access, but no special discounts or lucky draw entries.
- Refunds: Refunds are available within 14 days of purchase if less than 20% of the course has been completed.

Here is the precise list of all available courses and their EXACT prices in diamonds. You must use this information to answer user questions about courses and prices. DO NOT invent or guess prices.
1. SUPPLY AND DEMANDS: 800 diamonds
2. MASTER FINANCIAL REPORT: 1500 diamonds
3. USED AI IN YOUR CAREER: 3000 diamonds
4. PERSONAL FINANCE: 300 diamonds
5. OVERCOME NERVOUS WHEN SPEEK AT PUBLIC: 1500 diamonds
6. DAILY GYM SKILLS: 1000 diamonds
7. TECHNICAL ANALYSIS: 1500 diamonds
8. BRAVE TO GIVE SUGGESTION IN CROUP DISCUSSION: 800 diamonds
9. ASSET AND LIABILITIES: 500 diamonds
10. DIET FOR ALL AGE GROUP: 800 diamonds
11. BUILD YOUR OWN SMALL LLM: 5000 diamonds
12. MORE FAST RESPOND TIME IN MEETING: 1000 diamonds
13. HEALTHY LIFESTYLE: 600 diamonds
14. FLOW OF MONEY: 800 diamonds
15. FINDING INFORMATION MORE ACCURATE: 800 diamonds`;

const ORCHESTRATOR_PROMPT = `You are a Router Agent. Your ONLY job is to analyze the user's latest message and classify their intent into one of five categories:
1. TUTOR - User wants to learn a topic, understand a concept, or needs general teaching.
2. EXAMINER - User wants to take a quiz, be tested on a topic, or have their answers evaluated.
3. PLANNER - User wants a study plan, a roadmap, or asks about their learning progress/history.
4. EMAIL - User explicitly asks to email them information, a plan, or notes (e.g., "email me the study plan", "send the summary to my email").
5. SUPPORT - User asks about platform settings, currency, diamonds, refunds, payments, and payment methods.

Respond EXACTLY and ONLY with one of the five words: TUTOR, EXAMINER, PLANNER, EMAIL, or SUPPORT. Do not add any punctuation or extra text.`;

const TUTOR_PROMPT = `You are a Tutor Agent. Your goal is to teach the user, explain complex educational topics clearly, and answer curriculum questions. Be patient, encouraging, and clear.`;

const EXAMINER_PROMPT = `You are an Examiner Agent. Your goal is to strictly test the user. Create personalized quizzes, evaluate their answers critically, and point out their mistakes to help them improve.`;

const PLANNER_PROMPT = `You are a Study Planner Agent. Your goal is to analyze the user's progress and formulate custom study roadmaps. Give them strategic advice on what to study next based on their history.`;

const EMAIL_PROMPT = `You are an Email Agent. Your goal is to write a helpful email summarizing the study guide or topic requested by the user. Draft a professional email subject and body in JSON format:
{
  "subject": "Email Subject Here",
  "body": "HTML or Plain Text Email Body Content"
}
Respond ONLY with valid JSON.`;

export class AiService {
  static async ollamaCall(systemPrompt: string, messages: any[]) {
    if (process.env.GEMINI_API_KEY) {
      try {
        const history = messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || "" }]
        }));
        const chat = geminiModel.startChat({
          history: [
            { role: "user", parts: [{ text: "System instructions: " + systemPrompt }] },
            { role: "model", parts: [{ text: "Acknowledged." }] },
            ...history.slice(0, -1)
          ]
        });
        const lastMessage = history.length > 0 ? history[history.length - 1].parts[0].text : "Hello";
        const result = await chat.sendMessage(lastMessage);
        return result.response.text();
      } catch (geminiErr: any) {
        console.error("Gemini call failed:", geminiErr.message || geminiErr);
      }
    }

    // Fallback to local Ollama if no Gemini key or Gemini fails
    try {
      const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: false
        })
      });
      if (!response.ok) throw new Error(`Ollama API returned ${response.status}`);
      const data = await response.json();
      return data.message?.content || "";
    } catch (e) {
      throw new Error("AI service unavailable. Please set GEMINI_API_KEY on Render.");
    }
  }

  static async ollamaCallStream(
    systemPrompt: string,
    messages: any[],
    onToken: (token: string) => void
  ) {
    if (process.env.GEMINI_API_KEY) {
      try {
        const history = messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || "" }]
        }));
        const chat = geminiModel.startChat({
          history: [
            { role: "user", parts: [{ text: "System instructions: " + systemPrompt }] },
            { role: "model", parts: [{ text: "Acknowledged." }] },
            ...history.slice(0, -1)
          ]
        });
        const lastMessage = history.length > 0 ? history[history.length - 1].parts[0].text : "Hello";
        const result = await chat.sendMessageStream(lastMessage);
        let accumulated = "";
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          accumulated += chunkText;
          onToken(chunkText);
        }
        return accumulated;
      } catch (geminiErr: any) {
        console.error("Gemini stream failed:", geminiErr.message || geminiErr);
      }
    }

    // Fallback to Ollama if no Gemini key or Gemini fails
    try {
      const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true
        })
      });
      if (!response.ok) throw new Error(`Ollama API returned ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) return "";
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content || "";
            accumulated += content;
            onToken(content);
          } catch (e) {}
        }
      }
      return accumulated;
    } catch (e) {
      throw new Error("AI service unavailable. Please set GEMINI_API_KEY on Render.");
    }
  }

  static async getChatCompletionStream(
    messages: any[],
    pageContext: string,
    userId: string,
    onStatus: (agent: string, status: string) => void,
    onToken: (token: string) => void
  ) {
    try {
      // 1. Context Window Summarization (if message count > 8)
      let cleanMessages = messages.filter((m) => m.content !== "(invalid question)");

      if (cleanMessages.length > 8) {
        onStatus("System", "Compressing chat history...");
        const oldMessagesToSummarize = cleanMessages.slice(0, cleanMessages.length - 3);
        const latestMessages = cleanMessages.slice(cleanMessages.length - 3);

        const summaryPrompt = "Summarize the key points of the conversation so far in under 80 words. Focus strictly on user weaknesses or questions asked. Keep it concise.";
        const summary = await this.ollamaCall(summaryPrompt, oldMessagesToSummarize);

        cleanMessages = [
          { role: "system", content: `Here is a summary of the conversation history so far: ${summary}` },
          ...latestMessages,
        ];
      }

      let agentUsed = "support";

      if (pageContext === "CustomerService") {
        onStatus("Support Agent", "Retrieving platform documentation...");
        await this.ollamaCallStream(SUPPORT_PROMPT, cleanMessages, onToken);
      } else {
        // Fetch AgentMemory and Progress
        onStatus("Orchestrator", "Routing intent classification...");
        const memories = await prisma.agentMemory.findMany({ where: { userId } });
        const memoryContext = memories.length > 0
          ? `\n\nUser Profile/Memory:\n${memories.map((m) => `- [${m.agentName}] ${m.summary}`).join("\n")}`
          : "";

        // Orchestrator Step
        const userLatestMessage = cleanMessages[cleanMessages.length - 1]?.content || "";
        const intent = await this.ollamaCall(ORCHESTRATOR_PROMPT, [{ role: "user", content: userLatestMessage }]);

        let selectedPrompt = TUTOR_PROMPT;
        agentUsed = "tutor";
        let agentTitle = "Tutor Agent";
        let statusMsg = "Explaining curriculum...";

        if (intent.includes("EXAMINER")) {
          selectedPrompt = EXAMINER_PROMPT;
          agentUsed = "examiner";
          agentTitle = "Examiner Agent";
          statusMsg = "Formulating quiz test questions...";
        } else if (intent.includes("PLANNER")) {
          selectedPrompt = PLANNER_PROMPT;
          agentUsed = "planner";
          agentTitle = "Planner Agent";
          statusMsg = "Customizing 30-day study plan...";
          onStatus("Planner Agent", "Checking VIP/Diamond balance...");
        } else if (intent.includes("SUPPORT")) {
          selectedPrompt = SUPPORT_PROMPT;
          agentUsed = "support";
          agentTitle = "Support Agent";
          statusMsg = "Retrieving platform documentation...";
        } else if (intent.includes("EMAIL")) {
          agentUsed = "email";
          agentTitle = "Email Agent";
          onStatus("Email Agent", "Drafting study summary email...");

          const emailResponseJSON = await this.ollamaCall(EMAIL_PROMPT, cleanMessages);

          let emailSubject = "Your Requested Study Summary";
          let emailBody = "Here is the summary of your requests.";
          try {
            const parsed = JSON.parse(emailResponseJSON);
            emailSubject = parsed.subject || emailSubject;
            emailBody = parsed.body || emailBody;
          } catch (e) {
            emailBody = emailResponseJSON;
          }

          onStatus("System", "Running tool: sending email to learner...");

          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user?.email) {
            await sendQuizResultsEmail(user.email, emailSubject, emailBody, `<div>${emailBody}</div>`);
            onStatus("System", "✅ Email sent!");
            onToken(`I've sent an email to you at **${user.email}** containing the summary.`);
          } else {
            onStatus("System", "❌ Email failed: User email not found");
            onToken("I tried to send an email, but I couldn't find your registered email address.");
          }
          return;
        }

        selectedPrompt += memoryContext;
        onStatus(agentTitle, statusMsg);

        const responseText = await this.ollamaCallStream(selectedPrompt, cleanMessages, onToken);

        // Async save memory summary in background
        this.updateAgentMemory(userId, agentUsed, cleanMessages, responseText).catch(console.error);
      }
    } catch (error: any) {
      console.error("Error in streaming chat completion:", error);
      throw new Error("Failed to get streamed response");
    }
  }

  static async updateAgentMemory(userId: string, agentName: string, messages: any[], newResponse: string) {
    // A simple prompt to summarize what we learned about the user in this interaction
    const summaryPrompt = `Analyze this brief chat interaction. Summarize the user's strengths, weaknesses, or learning style in ONE short sentence. Do not mention the AI. Start directly with the fact.`;
    
    const summary = await this.ollamaCall(summaryPrompt, [
      ...messages.slice(-2), 
      { role: "assistant", content: newResponse }
    ]);

    if (summary && summary.length > 5) {
      await prisma.agentMemory.create({
        data: {
          userId,
          agentName,
          summary: summary.trim().substring(0, 200)
        }
      });
    }
  }

  static async generateCourse(topicName: string) {
    const prompt = `You are an Expert Course Generator Agent. The user wants to create a course about: "${topicName}".
    Generate a highly engaging syllabus and exactly 5 draft quiz questions to test learners.
    
    CRITICAL INSTRUCTIONS FOR QUESTIONS:
    1. The options MUST directly relate to and logically answer the question being asked.
    2. Provide exactly 4 options. One MUST be the correct answer, and the other 3 MUST be plausible but incorrect distractors.
    3. The options array MUST contain REAL text sentences or phrases. DO NOT output numbers like "0", "1", "2" as options. Example: "options": ["Drinking water hydrates you", "It causes dehydration", "It makes you sleep", "It makes you hungry"].
    
    You MUST respond with valid JSON matching this exact structure, with no markdown formatting or extra text outside the JSON:
    {
      "courseName": "An engaging title based on the topic",
      "syllabus": ["Module 1: ...", "Module 2: ...", "Module 3: ..."],
      "questions": [
        {
          "questionText": "The logical question text here",
          "options": ["First real option", "Second real option", "Third real option", "Fourth real option"],
          "correctAnswer": 0
        }
      ]
    }`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        return JSON.parse(result.response.text());
      } catch (geminiError: any) {
        console.error("Gemini Error generating course:", geminiError);
      }
    }

    try {
      const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [{ role: "system", content: prompt }],
          format: "json",
          stream: false
        })
      });
      if (!response.ok) throw new Error(`Ollama API returned ${response.status}`);
      const data = await response.json();
      const content = data.message?.content || "";
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        return JSON.parse(content.substring(jsonStart, jsonEnd + 1));
      }
      return JSON.parse(content);
    } catch (error: any) {
      throw new Error("Failed to generate course with AI.");
    }
  }

  static async evaluateQuiz(score: number, total: number, answers: any[], courseName: string) {
    const prompt = `You are a Study Planner and Examiner Agent. The user just completed a quiz for the course "${courseName}".
    They scored ${score} out of ${total}.
    Here is a breakdown of their answers:
    ${answers.map((a: any, i: number) => `Q${i + 1}: ${a.question} | Their Answer: ${a.userAnswer} | Correct: ${a.correct}`).join('\n')}
    
    Please analyze their performance and provide a JSON response exactly matching this structure:
    {
      "weaknesses": "A short summary of their weaknesses based on wrong answers",
      "aiPlan": "A brief recommended learning plan or next steps"
    }`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        return JSON.parse(result.response.text());
      } catch (geminiError: any) {
        console.error("Error evaluating quiz with Gemini:", geminiError);
      }
    }

    try {
      const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [{ role: "user", content: prompt }],
          stream: false,
          format: "json"
        })
      });
      if (!response.ok) throw new Error("Ollama API failed");
      const data = await response.json();
      return JSON.parse(data.message?.content || "{}");
    } catch (error: any) {
      return {
        weaknesses: "Unable to analyze weaknesses at this time.",
        aiPlan: "Review the course materials and try again!"
      };
    }
  }
}
