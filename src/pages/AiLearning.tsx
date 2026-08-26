import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Target, Zap, ChevronRight, CheckCircle2, AlertTriangle, BookOpen, Activity, Play, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { useNavigate, useSearchParams } from 'react-router';
import { useUser } from '../contexts/UserContext';
import { products } from '../data/products';
import { api } from '../lib/api';
import { toast } from 'sonner@2.0.3';

const getQuizQuestions = (courseName: string) => [
  {
    question: `What is the primary foundation of ${courseName}?`,
    options: [
      "Understanding its fundamental concepts",
      "Memorizing all potential applications",
      "Using complex tools instead of basics",
      "Ignoring the context of the problem"
    ],
    correctAnswer: 0,
    topic: "Fundamentals",
    difficulty: "Medium"
  },
  {
    question: `When applying ${courseName} principles, what must be prioritized?`,
    options: [
      "Quick execution over careful planning",
      "Consistency and strategic analysis",
      "Isolated tasks without overall vision",
      "Relying solely on external intuition"
    ],
    correctAnswer: 1,
    topic: "Strategic Application",
    difficulty: "Medium"
  },
  {
    question: `Which methodology best evaluates success in ${courseName}?`,
    options: [
      "Anecdotal reports from unverified sources",
      "Looking at the highest single performance",
      "Measuring metrics against established benchmarks",
      "Guessing based on short-term results"
    ],
    correctAnswer: 2,
    topic: "Performance Metrics",
    difficulty: "Hard"
  }
];

export function AiLearning() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile, unlockedCourses } = useUser();
  
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [courseName, setCourseName] = useState("your registered course");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  
  // -1 = Course Selection, 0 = Intro, 1 = Quiz, 2 = Loading Analysis, 3 = Results
  const [phase, setPhase] = useState(-1);

  // 1. Fetch all available courses on mount to let user select
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.get('/course/all');
        const dbCoursesFormatted = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          questions: c.questions || []
        }));
        
        const allAvailableCourses = [...products, ...dbCoursesFormatted].filter(
          (course, index, self) => index === self.findIndex((c) => c.id === course.id)
        );
        
        setAvailableCourses(allAvailableCourses);

        // Pre-select if courseId is in URL
        const urlCourseId = searchParams.get('courseId');
        if (urlCourseId) {
          handleSelectCourse(urlCourseId, allAvailableCourses);
        }
      } catch (err) {
        console.error("Failed to load courses", err);
        setAvailableCourses(products); // fallback to hardcoded
      }
    };
    fetchCourses();
  }, []);

  const handleSelectCourse = async (courseId: string, courses: any[] = availableCourses) => {
    if (!unlockedCourses.includes(courseId)) {
      toast.error("You haven't unlocked this course yet!");
      return;
    }
    
    const selected = courses.find(c => c.id === courseId);
    if (!selected) return;

    setActiveCourseId(courseId);
    setCourseName(selected.name);

    if (courseId.length > 10) {
      // UUID (DB Course)
      try {
        const data = await api.get(`/course/${courseId}`);
        if (data && data.questions && data.questions.length > 0) {
          setQuizQuestions(data.questions.map((q: any) => {
            let options = [];
            try { options = JSON.parse(q.options); } catch (e) { options = ["A", "B", "C", "D"]; }
            return {
              question: q.questionText,
              options,
              correctAnswer: q.correctAnswer,
              topic: "Course Material",
              difficulty: "Medium"
            };
          }));
        } else {
          setQuizQuestions(getQuizQuestions(selected.name));
        }
      } catch (err) {
        console.error("Failed to load DB course", err);
        setQuizQuestions(getQuizQuestions(selected.name));
      }
    } else {
      // Hardcoded product
      setQuizQuestions(getQuizQuestions(selected.name));
    }
    
    setPhase(0);
  };

  // Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [evaluation, setEvaluation] = useState<{ weaknesses?: string, aiPlan?: string } | null>(null);
  
  // Loading State
  const [loadingText, setLoadingText] = useState("Tracking Accuracy...");

  // Calculate Progress
  const progressPercent = quizQuestions.length > 0 ? ((currentQuestionIdx) / quizQuestions.length) * 100 : 0;

  const currentQuestion = quizQuestions[currentQuestionIdx] || { question: '', options: [] };

  const handleStartQuiz = () => {
    setPhase(1);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    // Save answer
    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer: currentQuestion.options[selectedOption!],
      correct: isCorrect
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    if (currentQuestionIdx < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedOption(null);
      }, 400); 
    } else {
      setPhase(2); // Go to Analysis Mode
    }
  };

  useEffect(() => {
    if (phase === 2) {
      const evaluateAndProceed = async () => {
        setLoadingText("Identifying Weak Areas...");
        
        if (userProfile && courseName) {
          const accuracy = Math.round((score / quizQuestions.length) * 100);
          try {
            // Post general progress
            await api.post('/progress', {
              email: userProfile.email,
              username: userProfile.username,
              profilePic: userProfile.profilePic,
              courseName: courseName,
              accuracy: accuracy
            });
            
            // Post evaluation
            setLoadingText("Synthesizing Personalized Study Plan...");
            const { data } = await api.post('/chat/evaluate-quiz', {
              courseId: activeCourseId,
              courseName,
              score,
              total: quizQuestions.length,
              answers
            });
            
            setEvaluation(data);
          } catch (err) {
            console.error('Failed to post progress or evaluate', err);
          }
        }
        setPhase(3);
      };
      
      evaluateAndProceed();
    }
  }, [phase]);

  // Phase Renderer
  const renderPhaseMinus1 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12 pt-6">
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Select a Course to Evaluate</h1>
        <p className="text-muted-foreground">Choose one of the courses you've completed to take an AI-powered evaluation quiz.</p>
      </div>

      {availableCourses.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {availableCourses.map((course) => (
            <Card 
              key={course.id} 
              className={`cursor-pointer transition-all group ${unlockedCourses.includes(course.id) ? 'hover:border-primary/50 hover:shadow-md' : 'opacity-60 grayscale hover:opacity-100'}`}
              onClick={() => handleSelectCourse(course.id)}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 transition-colors ${unlockedCourses.includes(course.id) ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-muted'}`}>
                  <BookOpen className={`w-6 h-6 ${unlockedCourses.includes(course.id) ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold line-clamp-2 leading-snug">{course.name}</span>
                  </div>
                  <span className={`text-xs mt-2 flex items-center gap-1 ${unlockedCourses.includes(course.id) ? 'text-muted-foreground' : 'text-destructive font-semibold'}`}>
                    <Zap className="w-3 h-3" /> {unlockedCourses.includes(course.id) ? 'AI Quiz Available' : 'Locked'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPhase0 = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
        <Brain className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">AI Self-Learning System</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          You've completed the <strong>{courseName}</strong> course. Now, let our AI engine track your accuracy, identify weak spots, and generate a customized path forward.
        </p>
      </div>
      <Button size="lg" onClick={handleStartQuiz} className="h-14 px-8 text-lg font-semibold rounded-full group">
        Start AI Evaluation
        <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );

  const renderPhase1 = () => (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 fade-in opacity-100 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-1">AI Adaptive Quiz</h2>
          <div className="flex items-center gap-3">
             <Badge variant={streak > 1 ? "default" : "secondary"} className="flex items-center gap-1 transition-all">
                <Zap className="h-3 w-3" />
                Streak: {streak}
             </Badge>
             <Badge variant="outline" className={`transition-colors duration-500 ${streak > 1 ? 'border-orange-500 text-orange-500 bg-orange-500/10' : ''}`}>
               Difficulty: <span className="font-bold ml-1">{streak > 1 ? 'Hard' : currentQuestion.difficulty}</span>
             </Badge>
             {streak > 1 && (
               <span className="text-xs text-orange-500 font-medium animate-pulse">
                  AI Difficulty Raised
               </span>
             )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{currentQuestionIdx + 1} <span className="text-muted-foreground text-sm">/ {quizQuestions.length}</span></p>
        </div>
      </div>
      <Progress value={progressPercent} className="h-2 w-full" />
      
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <Badge variant="outline" className="w-fit mb-2 text-primary border-primary/30 bg-primary/5">
             <Target className="h-3 w-3 w-3 mr-1" />
             {currentQuestion.topic}
          </Badge>
          <CardTitle className="text-xl md:text-2xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedOption === idx 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center">
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${selectedOption === idx ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                   {selectedOption === idx && <div className="h-2 w-2 rounded-full bg-current" />}
                </div>
                <span className={`font-medium ${selectedOption === idx ? 'text-primary' : 'text-foreground'}`}>{option}</span>
              </div>
            </button>
          ))}
        </CardContent>
        <CardFooter className="pt-4 border-t bg-muted/20">
          <Button 
            className="w-full h-12 text-md" 
            disabled={selectedOption === null}
            onClick={handleNextQuestion}
          >
            {currentQuestionIdx === quizQuestions.length - 1 ? 'Analyze Results' : 'Submit & Continue'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderPhase2 = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-6 animate-in fade-in duration-500">
       <div className="relative">
         <Loader2 className="h-16 w-16 text-primary animate-spin" />
         <Brain className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" />
       </div>
       <div className="space-y-2 text-center h-16">
          <p className="text-xl font-bold animate-pulse">{loadingText}</p>
          <p className="text-sm text-muted-foreground">Our AI is crunching your performance footprint.</p>
       </div>
       <Progress value={undefined} className="w-64 h-1 mt-4" /> {/* Indeterminate */}
    </div>
  );

  const renderPhase3 = () => {
    const accuracy = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-12 fade-in duration-700 pb-12">
        {/* Header summary */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <Card className="flex-1 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
             <CardContent className="p-6 flex items-center gap-6">
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * accuracy) / 100} className="text-primary transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold">{accuracy || 0}%</span>
                  </div>
                </div>
             </CardContent>
          </Card>
          
          <div className="flex-1 bg-[#1E2532]/50 rounded-2xl p-6 border border-white/5 space-y-4 shadow-inner">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-red-400" />
              Areas for Improvement
            </h4>
            <p className="text-white/80 leading-relaxed">
              {evaluation?.weaknesses || "Analyzing your weaknesses..."}
            </p>
          </div>
        </div>
          
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            Recommended Path
          </h3>
          
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4">
            <p className="text-white/90 leading-relaxed">
              {evaluation?.aiPlan || "Generating your personalized learning plan..."}
            </p>
          </div>

          <div className="mt-8">
            <Button onClick={() => navigate('/catalogue')} className="w-full h-12 text-lg font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
              Continue Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <header className="h-16 border-b flex items-center px-4 bg-card shrink-0 gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <span className="font-bold tracking-tight text-lg">AI Assistance</span>
      </header>

      <main className="flex-1 px-4 flex items-center justify-center">
        {phase === -1 && renderPhaseMinus1()}
        {phase === 0 && renderPhase0()}
        {phase === 1 && renderPhase1()}
        {phase === 2 && renderPhase2()}
        {phase === 3 && renderPhase3()}
      </main>
    </div>
  );
}
