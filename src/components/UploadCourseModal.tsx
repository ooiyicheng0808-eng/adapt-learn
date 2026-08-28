import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UploadCloud, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface UploadCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadCourseModal({ isOpen, onClose }: UploadCourseModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('500');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !file) {
      toast.error("Please fill all fields and select a file.");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you'd upload the file to S3/Cloudinary and get a URL.
      // For this hackathon demo, we just create the course record in the DB
      // and pretend the file uploaded successfully.
      await api.post('/course/create', {
        name,
        price: Number(price),
        syllabus: ["Module 1: Introduction (From Uploaded File)"]
      });
      toast.success(`Successfully uploaded ${file.name} and published the course!`);
      onClose();
      setName('');
      setPrice('500');
      setFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Course File</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course Title</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Master Financial Report" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price (Diamonds)</label>
            <Input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="500" 
              required
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">Course File (Video/PDF/Image)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              {file ? (
                <p className="text-sm font-medium text-primary text-center break-all">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Click to select a file from your computer</p>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Upload & Publish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
