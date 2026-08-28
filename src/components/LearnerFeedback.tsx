import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star } from 'lucide-react';
import { cn } from './ui/utils';
import { products } from '../data/products';

// Mock learners data
const MOCK_LEARNERS = [
  { id: '1', name: 'Alena', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: '2', name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150' },
  { id: '3', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  { id: '4', name: 'David', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: '5', name: 'Emma', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150' },
  { id: '6', name: 'James', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { id: '7', name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: '8', name: 'Tyson', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' },
];

const MOCK_COMMENTS = [
  "Good",
  "Easy understand",
  "Have learn new thing",
  "Very helpful for my career",
  "Amazing content and well structured!",
  "Highly recommended",
  "The concepts are explained perfectly.",
  "I was able to apply this immediately.",
];

// Generate some fake feedback based on the actual products
const MOCK_FEEDBACK = Array.from({ length: 12 }).map((_, i) => ({
  id: `feedback-${i}`,
  learner: MOCK_LEARNERS[i % MOCK_LEARNERS.length],
  comment: MOCK_COMMENTS[i % MOCK_COMMENTS.length],
  rating: 5 - (i % 2), // 4 or 5 stars
  courseName: products[i % products.length].name,
  date: i === 0 ? "Today" : i < 3 ? "Yesterday" : `${i} days ago`
}));

export function LearnerFeedback() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Learner Feedback</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_FEEDBACK.map((feedback) => (
          <div key={feedback.id} className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border shadow-sm">
                  <AvatarImage src={feedback.learner.avatar} alt={feedback.learner.name} />
                  <AvatarFallback className="font-semibold">{feedback.learner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{feedback.learner.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{feedback.courseName}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{feedback.date}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < feedback.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              
              <p className="text-sm text-foreground/90">
                "{feedback.comment}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
