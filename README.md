<div align="center">
  <h1 align="center">AdaptLearn platform 🤖🎓</h1>
  <p align="center">
    <strong>A next-generation Multi-Agent AI educational marketplace connecting learners and course sellers powered by Local LLMs (Ollama / Llama 3.2).</strong>
  </p>
</div>

---

## 🌟 Overview

**AdaptLearn platform** is a full-stack, multi-agent AI-driven educational platform built to revolutionize how people learn and how creators sell content. 

Rather than relying on a simple chatbot, AdaptLearn utilizes a sophisticated **7-Agent Backend Architecture** that dynamically classifies user intent, routes requests to domain-specialized agents, maintains persistent cross-session memory, and runs **100% locally via Ollama (Llama 3.2 model)** for maximum privacy, zero API costs, and low-latency responses.

---

## 🧠 7-Agent Autonomous Architecture

The system features an autonomous multi-agent orchestration layer (`AiService`) powered by **Ollama / Llama 3.2**. Depending on the user's questions or page context, an **Orchestrator Agent** dynamically routes execution to specialized sub-agents:

1. **🧭 Router / Orchestrator Agent:** Classifies user intent in real-time to select the appropriate specialized agent.
2. **📖 Tutor Agent:** Patiently explains complex educational concepts, breaks down curriculum, and answers technical learning questions.
3. **📝 Examiner Agent:** Strictly evaluates learner answers, generates adaptive quizzes on the fly, and highlights weaknesses.
4. **📅 Study Planner Agent:** Analyzes user mastery history to generate custom 30-day study roadmaps and strategic learning paths.
5. **📧 Email Agent:** Automatically formulates structured HTML/Text study guides and executes background tools to email users directly via Nodemailer.
6. **🎧 Customer Support Agent:** Trained on platform domain knowledge (diamond currency exchange rates, 14-day refund policies, eWallet payments) to handle user support.
7. **💼 Seller Copilot Agent:** Assists course creators on their dashboard by generating syllabus topics, structuring quiz questions, and writing marketing copy.

---

## ✨ Core Features & Special Capabilities

### 🧑‍🎓 For Learners

*   **🧠 Adaptive AI Self-Learning System:** Dynamic quiz evaluation that tracks accuracy, pinpoints weak areas, and updates your persistent learning profile.
*   **💾 Long-Term Agent Memory:** Features an `AgentMemory` system in Prisma that records user strengths, weaknesses, and learning styles across sessions so agents provide personalized guidance over time.
*   **⚡ Context Compression:** Automatic context window summarization when chat history grows long, preserving token context without quality degradation.
*   **🛒 Interactive Course Catalogue:** Browse, filter, and purchase courses across diverse categories using platform currency.
*   **💎 Virtual Wallet (Diamond Recharge):** Integrated diamond virtual currency with support for eWallets (TnG eWallet, GrabPay, Boost, ShopeePay), DuitNow, FPX, and credit cards.
*   **✉️ Direct Seller Messaging & Automated Email Summaries:** Send direct messages to sellers or ask the Email Agent to send study summaries directly to your inbox.

### 💼 For Course Sellers

*   **📊 Advanced Analytics Dashboard:** Monitor real-time sales metrics, revenue growth, and student course completion progress.
*   **🤖 Seller Copilot Agent:** Generate full course syllabuses and assessment question banks powered by local Llama 3.2 reasoning.
*   **📚 Dynamic Course & Quiz Builder:** Create, edit, and publish courses with customizable pricing (in Diamonds) and built-in interactive quizzes.
*   **📥 Seller Inbox:** Centralized messaging center to answer student inquiries and build an active learning community.

---

## 🛠️ Tech Stack & Architecture

### **AI Engine (100% Local & Privacy-Focused)**
*   **LLM Provider:** [Ollama](https://ollama.com/) running **Llama 3.2** (`llama3.2` model).
*   **Orchestration:** Custom TypeScript Multi-Agent Router & Context Window Compressor (`AiService`).
*   **Email Tool Execution:** Integrated Nodemailer background job executor triggered by the Email Agent.

### **Frontend (Client)**
*   **Framework:** React 18 powered by [Vite](https://vitejs.dev/).
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/).
*   **UI Components:** [Radix UI](https://www.radix-ui.com/) accessible primitives & Lucide React icons.
*   **Data Visualization:** [Recharts](https://recharts.org/) for analytics graphs.
*   **State & Routing:** React Router.

### **Backend (Server & Database)**
*   **Runtime:** Node.js with Express.js (TypeScript).
*   **Database:** SQLite managed via [Prisma ORM](https://www.prisma.io/) (`User`, `AgentMemory`, `ChatSession`, `QuizAttempt`, `Topic`, `Course`, `DirectMessage`).
*   **Security:** JWT (JSON Web Tokens) & Bcrypt password hashing.
*   **Validation:** Zod schema validation.

---

## 📁 Project Structure

```text
📦 adaptlearn-platform
 ┣ 📂 backend                 # Express Server & Local AI Multi-Agent Service
 ┃ ┣ 📂 prisma              # Prisma Schema (AgentMemory, ChatSession, UserProgress, etc.)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 controllers       # API Controllers
 ┃ ┃ ┣ 📂 routes            # Routes (auth, chat, course, message, progress)
 ┃ ┃ ┣ 📂 services          # Multi-Agent Router & Ollama Llama 3.2 Integration (ai.service.ts)
 ┃ ┃ ┗ 📜 index.ts          # Express entry point
 ┃ ┗ 📜 package.json
 ┣ 📂 src                     # React Frontend
 ┃ ┣ 📂 components          # Reusable UI components & dialogs
 ┃ ┣ 📂 contexts            # User & System React Contexts
 ┃ ┣ 📂 pages               # Views (AiLearning, SellerCopilot, CustomerService, Catalogue)
 ┃ ┣ 📜 App.tsx             # Root Component
 ┃ ┗ 📜 main.tsx            # Entry point
 ┣ 📂 image                   # Assets & mockups
 ┗ 📜 README.md
```

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Ollama](https://ollama.com/) installed and running locally with the `llama3.2` model pulled:
    ```bash
    ollama pull llama3.2
    ```

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo 'DATABASE_URL="file:./dev.db"' > .env

# Initialize database schema with Prisma
npx prisma db push

# Start the server (connects to http://127.0.0.1:11434 Ollama API)
npm run dev
```

### 2. Frontend Setup

Open a new terminal window in the root directory:

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### 3. Access Application
Navigate to `http://localhost:5173` in your browser. Ensure Ollama is running in the background (`ollama serve`).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
