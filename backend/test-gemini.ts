import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
    try {
        console.log("Key:", process.env.GEMINI_API_KEY);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await geminiModel.generateContent("Hello! Respond with a simple greeting.");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}
testGemini();
