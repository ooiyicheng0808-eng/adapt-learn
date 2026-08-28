# Course Seller Agent

A full-stack AI-powered educational platform designed to enhance the learning experience with adaptive AI assessments, personalized study plans, and intelligent customer service. It caters to both learners and course sellers.

## 🚀 Features

### For Learners
- **Course Catalogue & Unlocked Courses**: Browse available courses and track the ones you have unlocked.
- **AI Self-Learning System**: An adaptive quiz system that evaluates your knowledge on specific courses, tracks your accuracy, identifies weak areas, and generates a personalized study plan.
- **AI Customer Service**: A smart AI-powered chatbot to assist you with inquiries about the platform, technical issues, and course-related questions.
- **Diamond Recharge**: Recharge your virtual currency (Diamonds) seamlessly to purchase new courses and unlock features.
- **Progress Tracking**: Real-time progress monitoring showing your accuracy, streak, and performance metrics.

### For Course Sellers
- **Dashboard & Analytics**: Monitor learner progress, attempts, and overall performance across different courses.
- **Course Management**: Platform capability to handle dynamic courses and their related AI assessments.

## 🛠️ Tech Stack

**Frontend:**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Components**: Radix UI (accessible, unstyled components)
- **Routing**: React Router
- **Icons**: Lucide React
- **Charts**: Recharts

**Backend:**
- **Server**: Node.js & Express
- **Database**: SQLite (managed via Prisma ORM)
- **AI Integration**: OpenAI API (for chatbot and potential personalized content)
- **Security**: JWT (JSON Web Tokens) & Bcrypt

## 📁 Project Structure

- `/src`: Frontend React application.
  - `/pages`: Main application views (e.g., `AiLearning`, `Catalogue`, `Login`, `CustomerService`).
  - `/components`: Reusable UI components.
  - `/contexts`: React contexts for state management (`UserContext`, `SettingsContext`).
  - `/lib`: Utility functions and API integrations.
- `/backend`: Node.js/Express server and database.
  - `/src`: Backend API routes and logic.
  - `/prisma`: Prisma schema defining the database models (`User`, `ChatSession`, `Message`, `Topic`, `UserProgress`, `Attempt`).

## ⚙️ Getting Started

### Prerequisites
- Node.js
- npm or yarn

### Installation & Setup

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Set up your environment variables
   # Create a .env file and configure DATABASE_URL and OPENAI_API_KEY
   
   # Run database migrations
   npx prisma db push
   
   # Start the backend development server
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   # From the root directory
   npm install
   
   # Start the frontend development server
   npm run dev
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173` (or the port Vite provides).

## 📄 License
This project is licensed under the ISC License.
