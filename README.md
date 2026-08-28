<div align="center">
  <img src="./image/favicon.png" alt="Logo" width="80" height="80">
  <h1 align="center">Course Seller Agent 🤖🎓</h1>
  <p align="center">
    <strong>A next-generation AI-powered educational marketplace connecting learners and course sellers.</strong>
  </p>
</div>

---

## 🌟 Overview

**Course Seller Agent** is a full-stack, AI-driven educational platform built to revolutionize how people learn and how creators sell content. It goes beyond a simple marketplace by integrating **Adaptive AI Assessments**, **Personalized Study Plans**, and **Intelligent AI Assistants** tailored for both the Learner and the Seller.

Built with modern web technologies (React 18, Vite, Node.js, Prisma) and enhanced with OpenAI integrations, this platform offers a seamless, beautiful, and highly interactive user experience.

---

## ✨ Core Features & Special Capabilities

### 🧑‍🎓 For Learners

*   **🧠 AI Self-Learning System (Adaptive Quizzes):** Take intelligent quizzes that evaluate your knowledge dynamically. The system tracks your accuracy, identifies weak spots, and uses AI to generate a **Personalized Study Plan** based on your performance.
*   **🛒 Interactive Course Catalogue:** Browse, filter, and discover new courses across various topics. Once unlocked, track your progress directly from your dashboard.
*   **💬 AI Customer Service Chatbot:** An intelligent, context-aware AI assistant ready to help learners troubleshoot technical issues, understand platform mechanics, or recommend courses.
*   **💎 Virtual Wallet (Diamond Recharge):** A built-in virtual currency system. Recharge "Diamonds" to unlock premium courses effortlessly.
*   **📈 Real-time Progress Tracking:** Monitor your learning streaks, attempt history, and topic mastery through beautiful, interactive charts.
*   **✉️ Direct Messaging:** Communicate directly with course sellers for personalized feedback and Q&A.

### 💼 For Course Sellers

*   **📊 Advanced Analytics Dashboard:** Get a bird's-eye view of your business. Track today's sales, revenue growth, and detailed learner progress across your published courses.
*   **🤖 Seller Copilot (AI Assistant):** A dedicated AI agent just for sellers! Use the Copilot to brainstorm course topics, generate marketing copy, or analyze your sales data.
*   **📚 Dynamic Course Creation:** Easily upload new courses, define syllabuses, and set pricing.
*   **📝 Automated Assessment Builder:** Create interactive quizzes for your courses with a streamlined question builder to test your learners effectively.
*   **📥 Seller Inbox:** Manage direct messages from your students, answer their queries, and build a loyal learning community.

---

## 🛠️ Tech Stack & Architecture

This project is built using a modern, scalable, and type-safe architecture.

### **Frontend (Client)**
*   **Framework:** React 18 powered by [Vite](https://vitejs.dev/) for lightning-fast HMR and building.
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling.
*   **UI Components:** [Radix UI](https://www.radix-ui.com/) (Headless, accessible components) combined with Lucide React for beautiful iconography.
*   **Data Visualization:** [Recharts](https://recharts.org/) for dynamic sales and progress charts.
*   **State & Routing:** React Router for seamless SPA navigation.

### **Backend (Server & Database)**
*   **Runtime:** Node.js with Express.js.
*   **Database:** SQLite, fully managed and typed via [Prisma ORM](https://www.prisma.io/).
*   **AI Integration:** OpenAI API (`openai` SDK) powering the Learner Chatbot, Seller Copilot, and Adaptive Study Plan generator.
*   **Authentication & Security:** JWT (JSON Web Tokens) for session management and Bcrypt for secure password hashing.
*   **Validation:** Zod for robust runtime type checking and API payload validation.

---

## 📁 Project Structure

```text
📦 course-seller-agent
 ┣ 📂 backend                 # Node.js Express Server
 ┃ ┣ 📂 prisma              # Database schema & migrations (schema.prisma)
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 controllers       # API logic
 ┃ ┃ ┣ 📂 routes            # Express routes (auth, chat, course, message, progress)
 ┃ ┃ ┗ 📜 index.ts          # Server entry point
 ┃ ┗ 📜 package.json
 ┣ 📂 src                     # React Frontend
 ┃ ┣ 📂 assets              # Static assets
 ┃ ┣ 📂 components          # Reusable UI components (ProductCard, RechargeModal, etc.)
 ┃ ┣ 📂 contexts            # Global React Contexts
 ┃ ┣ 📂 lib                 # Utility functions & API clients
 ┃ ┣ 📂 pages               # Main views (AiLearning, Catalogue, SellerCopilot, etc.)
 ┃ ┣ 📜 App.tsx             # Root component
 ┃ ┗ 📜 main.tsx            # React DOM entry
 ┣ 📂 image                   # Mockups, icons, and platform images
 ┣ 📜 index.html              # Main HTML template
 ┗ 📜 package.json            # Frontend dependencies
```

---

## 🚀 Getting Started

Follow these steps to run the platform locally.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   An [OpenAI API Key](https://platform.openai.com/)

### 1. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend

# Install dependencies
npm install

# Create a .env file based on the environment requirements
# You will need to set DATABASE_URL (for SQLite) and OPENAI_API_KEY
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'OPENAI_API_KEY="your-openai-api-key-here"' >> .env

# Initialize the database schema
npx prisma db push

# Start the development server (runs on port 3000 by default)
npm run dev
```

### 2. Frontend Setup

Open a new terminal window and navigate to the project root:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 3. Access the Application
Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
