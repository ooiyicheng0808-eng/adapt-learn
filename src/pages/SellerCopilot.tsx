import { useState } from 'react';
import { ArrowLeft, Bot, Sparkles, Send, BookOpen, FileQuestion, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useNavigate } from 'react-router';
import { api } from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
}

interface CourseData {
  courseName: string;
  syllabus: string[];
  questions: Question[];
}

export function SellerCopilot() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setCourseData(null);
    try {
      const response = await api.post('/chat/generate-course', { topicName: topic });
      setCourseData(response);
      toast.success("Course generated successfully!");
    } catch (error) {
      toast.error("Failed to generate course");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (index: number, text: string) => {
    if (!courseData) return;
    const newQuestions = [...courseData.questions];
    newQuestions[index].questionText = text;
    setCourseData({ ...courseData, questions: newQuestions });
  };

  const handlePublish = async () => {
    if (!courseData) return;
    setIsPublishing(true);
    try {
      await api.post('/course/create', {
        name: courseData.courseName,
        syllabus: courseData.syllabus,
        questions: courseData.questions,
        price: 500
      });
      toast.success("Course published! Email notifications sent to learners.");
      setTimeout(() => navigate('/catalogue'), 2000);
    } catch (error) {
      toast.error("Failed to publish course");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <header className="h-16 border-b flex items-center px-4 bg-card shrink-0 gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <span className="font-bold tracking-tight text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Seller Copilot
        </span>
      </header>

      <main className="flex-1 px-4 max-w-4xl mx-auto w-full pb-12">
        {!courseData && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20 shadow-lg">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Course Generator Agent</h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Tell me what you want to teach, and I'll generate a complete syllabus and a 5-question interactive quiz. 
              </p>
            </div>
            
            <div className="w-full max-w-xl flex flex-col sm:flex-row gap-2 shadow-sm">
              <Input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. React Hooks, Advanced Finance, Fitness Diet..." 
                className="h-14 text-lg bg-card w-full"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <Button onClick={handleGenerate} size="lg" className="h-14 px-8 text-lg font-semibold rounded-md w-full sm:w-auto shrink-0">
                Generate
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in duration-500">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <div className="space-y-2 text-center">
              <p className="text-xl font-bold animate-pulse text-primary">Synthesizing Curriculum...</p>
              <p className="text-sm text-muted-foreground">Our AI is designing the syllabus and writing quiz questions.</p>
            </div>
          </div>
        )}

        {courseData && !isLoading && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-primary">{courseData.courseName}</h2>
              <p className="text-muted-foreground">Review and edit your generated course below before publishing.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Syllabus Section */}
              <Card className="border-2 shadow-sm">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Generated Syllabus
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {courseData.syllabus.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Questions Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-primary" />
                  Review Draft Questions
                </h3>
                {courseData.questions.map((q, idx) => (
                  <Card key={idx} className="border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Question {idx + 1}</label>
                        <Textarea 
                          value={q.questionText}
                          onChange={(e) => handleQuestionChange(idx, e.target.value)}
                          className="font-medium resize-none"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-2 rounded border text-sm flex items-center gap-2 ${oIdx === q.correctAnswer ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-muted/20 text-muted-foreground'}`}>
                            {oIdx === q.correctAnswer && <CheckCircle2 className="h-4 w-4" />}
                            <span className="truncate">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-8 pb-12 border-t mt-8">
              <Button onClick={handlePublish} disabled={isPublishing} size="lg" className="h-14 px-12 text-lg font-bold">
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>Publish Course & Notify Learners</>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
