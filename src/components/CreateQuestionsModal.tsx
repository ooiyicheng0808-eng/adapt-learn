import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner@2.0.3';
import { products } from '../data/products';

interface CreateQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuestionForm {
  questionText: string;
  options: string[];
  correctAnswer: number;
}

export function CreateQuestionsModal({ isOpen, onClose }: CreateQuestionsModalProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      setCourses(products);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error("Please select a course first");
      return;
    }

    // Validate
    for (const q of questions) {
      if (!q.questionText || q.options.some(opt => !opt.trim())) {
        toast.error("Please fill out all question text and options");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const selectedCourseName = courses.find(c => c.id === selectedCourseId)?.name || '';
      await api.post(`/course/${selectedCourseId}/questions`, { questions, courseName: selectedCourseName });
      toast.success("Questions successfully added to course!");
      onClose();
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      setSelectedCourseId('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quiz Questions</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Course</label>
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>-- Choose a course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg bg-muted/20 relative space-y-4">
                  {questions.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Question {qIndex + 1}</label>
                    <Textarea 
                      value={q.questionText}
                      onChange={(e) => {
                        const newQ = [...questions];
                        newQ[qIndex].questionText = e.target.value;
                        setQuestions(newQ);
                      }}
                      placeholder="Enter question text here..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`} 
                          checked={q.correctAnswer === oIndex}
                          onChange={() => {
                            const newQ = [...questions];
                            newQ[qIndex].correctAnswer = oIndex;
                            setQuestions(newQ);
                          }}
                          className="h-4 w-4"
                        />
                        <Input 
                          value={opt}
                          onChange={(e) => {
                            const newQ = [...questions];
                            newQ[qIndex].options[oIndex] = e.target.value;
                            setQuestions(newQ);
                          }}
                          placeholder={`Option ${oIndex + 1}`}
                          required
                          className={q.correctAnswer === oIndex ? 'border-primary ring-1 ring-primary' : ''}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" className="w-full border-dashed" onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" /> Add Another Question
            </Button>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Questions
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
