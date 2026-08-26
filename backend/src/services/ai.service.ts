import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUPPORT_PROMPT = `You are a helpful Customer Service Platform Assistant for an educational platform. You MUST answer questions related to education, courses, diamonds (currency), refunds, and platform settings. If the user asks about ANYTHING else not related to this platform, you MUST reply EXACTLY with: 'I can't help you with that.'

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

const ORCHESTRATOR_PROMPT = `You are a Router Agent. Your ONLY job is to analyze the user's latest message and classify their intent into one of three categories:
1. TUTOR - User wants to learn a topic, understand a concept, or needs general teaching.
2. EXAMINER - User wants to take a quiz, be tested on a topic, or have their answers evaluated.
3. PLANNER - User wants a study plan, a roadmap, or asks about their learning progress/history.

Respond EXACTLY and ONLY with one of the three words: TUTOR, EXAMINER, or PLANNER. Do not add any punctuation or extra text.`;

const TUTOR_PROMPT = `You are a Tutor Agent. Your goal is to teach the user, explain complex educational topics clearly, and answer curriculum questions. Be patient, encouraging, and clear.`;

const EXAMINER_PROMPT = `You are an Examiner Agent. Your goal is to strictly test the user. Create personalized quizzes, evaluate their answers critically, and point out their mistakes to help them improve.`;

const PLANNER_PROMPT = `You are a Study Planner Agent. Your goal is to analyze the user's progress and formulate custom study roadmaps. Give them strategic advice on what to study next based on their history.`;

export class AiService {
  static async ollamaCall(systemPrompt: string, messages: any[]) {
    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API returned ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || "";
  }

  static async getChatCompletion(messages: any[], pageContext: string, userId: string) {
    try {
      // Filter out old invalid responses so they don't confuse the model in-context
      const cleanMessages = messages.filter(m => m.content !== "(invalid question)");
      
      let finalResponse = "";
      let agentUsed = "support";

      if (pageContext === 'CustomerService') {
        finalResponse = await this.ollamaCall(SUPPORT_PROMPT, cleanMessages);
      } else {
        // Fetch AgentMemory and Progress
        const memories = await prisma.agentMemory.findMany({ where: { userId } });
        const memoryContext = memories.length > 0 
          ? `\n\nUser Profile/Memory:\n${memories.map(m => `- [${m.agentName}] ${m.summary}`).join('\n')}`
          : "";

        // Orchestrator Step
        const userLatestMessage = cleanMessages[cleanMessages.length - 1]?.content || "";
        const intent = await this.ollamaCall(ORCHESTRATOR_PROMPT, [{ role: "user", content: userLatestMessage }]);
        
        let selectedPrompt = TUTOR_PROMPT;
        agentUsed = "tutor";
        
        if (intent.includes("EXAMINER")) {
          selectedPrompt = EXAMINER_PROMPT;
          agentUsed = "examiner";
        } else if (intent.includes("PLANNER")) {
          selectedPrompt = PLANNER_PROMPT;
          agentUsed = "planner";
        }

        // Add memory context to the selected prompt
        selectedPrompt += memoryContext;

        // Final Agent Step
        finalResponse = await this.ollamaCall(selectedPrompt, cleanMessages);

        // Async save memory summary (run in background)
        this.updateAgentMemory(userId, agentUsed, cleanMessages, finalResponse).catch(console.error);
      }

      return finalResponse || "No response generated.";
    } catch (error: any) {
      console.error("Error calling native Ollama API:", error);
      throw new Error("Failed to get AI response");
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
    const prompt = `You are a Course Generator Agent. The user wants to create a course about: "${topicName}".
    Generate a highly engaging syllabus and exactly 5 draft quiz questions to test learners.
    
    You MUST respond with valid JSON matching this exact structure, with no markdown formatting or extra text outside the JSON:
    {
      "courseName": "An engaging title based on the topic",
      "syllabus": ["Module 1: ...", "Module 2: ...", "Module 3: ..."],
      "questions": [
        {
          "questionText": "The question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0
        }
      ]
    }`;

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
      console.error("Error generating course:", error);
      throw new Error("Failed to generate course");
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
      console.error("Error evaluating quiz:", error);
      return {
        weaknesses: "Unable to analyze weaknesses at this time.",
        aiPlan: "Review the course materials and try again!"
      };
    }
  }
}
