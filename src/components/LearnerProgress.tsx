import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BookOpen, Calendar, Target, RotateCw } from 'lucide-react';
import { api } from '../lib/api';

interface QuizAttempt {
  id: string;
  score: number;
  total: number;
  weaknesses: string;
  aiPlan: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    profilePic: string | null;
  };
  course: {
    name: string;
  };
}

export function LearnerProgress() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProgress() {
      try {
        const data = await api.get('/progress/quiz-attempts');
        setAttempts(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RotateCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Syncing Learner Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive font-medium border border-destructive/20 rounded-lg bg-destructive/5">
        Failed to fetch progress: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold tracking-tight">Learner Quiz Attempts & AI Evaluation</h2>
        <p className="text-sm text-muted-foreground">Track how learners are performing on your courses and see their AI-generated weaknesses.</p>
      </div>

      {attempts.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground font-medium">No progress tracked in the database yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {attempts.map((p) => {
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            const accuracySafe = p.total > 0 ? Math.min(100, Math.max(0, (p.score / p.total) * 100)) : 0;
            const strokeDashoffset = circumference - (accuracySafe / 100) * circumference;

            return (
              <div key={p.id} className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6 justify-between">
                
                <div className="flex flex-col gap-5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 border">
                      <AvatarImage src={p.user?.profilePic || undefined} alt={p.user?.username || 'Learner'} />
                      <AvatarFallback>{(p.user?.username || 'A').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm truncate">{p.user?.username || 'Deleted User'}</span>
                      <span className="text-xs text-muted-foreground truncate">{p.user?.email || 'No email'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Course</span>
                      <div className="flex items-start gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-md shrink-0 mt-0.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-sm font-semibold truncate" title={p.course?.name}>
                             {p.course?.name || 'Unknown Course'}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 pt-1">
                       <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Attempted On</span>
                       <div className="flex items-center gap-2">
                         <div className="bg-muted p-1.5 rounded-md shrink-0">
                           <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                         </div>
                         <span className="text-sm font-medium text-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center shrink-0 border-t sm:border-t-0 sm:border-l pt-5 sm:pt-0 sm:pl-5">
                   <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                         <circle
                           cx="48"
                           cy="48"
                           r={radius}
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="8"
                           className="text-muted/30"
                         />
                         <circle
                           cx="48"
                           cy="48"
                           r={radius}
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="8"
                           strokeDasharray={circumference}
                           strokeDashoffset={strokeDashoffset}
                           strokeLinecap="round"
                           className={`transition-all duration-1000 ease-out ${
                             accuracySafe >= 80 ? 'text-green-500' :
                             accuracySafe >= 60 ? 'text-yellow-500' :
                             'text-destructive'
                           }`}
                         />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                         <span className="text-xl font-bold tracking-tighter">{p.score}/{p.total}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 text-sm">
                  <p className="font-bold mb-1 text-destructive flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> 
                    Weaknesses
                  </p>
                  <p className="text-muted-foreground leading-snug line-clamp-3">{p.weaknesses || 'N/A'}</p>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
