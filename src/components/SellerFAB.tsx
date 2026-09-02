import { useState } from 'react';
import { Plus, Bot, Upload, HelpCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner@2.0.3';
import { UploadCourseModal } from './UploadCourseModal';
import { CreateQuestionsModal } from './CreateQuestionsModal';

export function SellerFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleManualUpload = () => {
    setIsUploadModalOpen(true);
    setIsOpen(false);
  };

  const handleCreateQuestions = () => {
    setIsQuestionsModalOpen(true);
    setIsOpen(false);
  };

  const handleCopilot = () => {
    navigate('/seller-copilot');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col items-start gap-4">
      {isOpen && (
        <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <Button 
            onClick={handleManualUpload}
            variant="secondary" 
            className="flex items-center gap-2 justify-start shadow-md w-48 font-medium rounded-full"
          >
            <Upload className="h-4 w-4" />
            Upload Course
          </Button>
          <Button 
            onClick={handleCreateQuestions}
            variant="secondary" 
            className="flex items-center gap-2 justify-start shadow-md w-48 font-medium rounded-full"
          >
            <HelpCircle className="h-4 w-4" />
            Create Questions
          </Button>
          <Button 
            onClick={handleCopilot}
            className="flex items-center gap-2 justify-start shadow-md w-48 font-bold bg-primary hover:bg-primary/90 rounded-full"
          >
            <Bot className="h-4 w-4" />
            Seller Copilot (AI)
          </Button>
        </div>
      )}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        size="icon" 
        className={`h-14 w-14 rounded-full shadow-xl transition-transform duration-300 ${isOpen ? 'rotate-45 bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>

      <UploadCourseModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      
      <CreateQuestionsModal 
        isOpen={isQuestionsModalOpen} 
        onClose={() => setIsQuestionsModalOpen(false)} 
      />
    </div>
  );
}
