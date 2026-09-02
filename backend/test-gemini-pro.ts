import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await geminiModel.generateContent("Hello!");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}
testGemini();
