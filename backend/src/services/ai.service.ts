export class AiService {
  static async getChatCompletion(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
    try {
      // Filter out old invalid responses so they don't confuse the model in-context
      const cleanMessages = messages.filter(m => m.content !== "(invalid question)");

      const response = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [
            { 
              role: "system", 
              content: `You are a helpful Customer Service Platform Assistant for an educational platform. You MUST answer questions related to education, courses, diamonds (currency), and learning on this platform. If the user asks about ANYTHING else not related to this platform, you MUST reply EXACTLY with: 'I can't help you with that.'

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
15. FINDING INFORMATION MORE ACCURATE: 800 diamonds`
            },
            ...cleanMessages
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || "No response generated.";
    } catch (error: any) {
      console.error("Error calling native Ollama API:", error);
      throw new Error("Failed to get AI response");
    }
  }
}
