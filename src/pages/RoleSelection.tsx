import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useSettings } from '../contexts/SettingsContext';

import courseSellerImg from 'figma:asset/dfec884a8f45deb8f7b161ea9113d5f4b86ecb71.png';
import learnerImg from 'figma:asset/f3a4180cc222fc56bccad94863d774dd5cea2137.png';

export function RoleSelection() {
  const navigate = useNavigate();
  const { t } = useSettings();

  const handleSignIn = (role: 'learner' | 'seller') => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" onClick={() => navigate('/login', { state: { mode: 'signup' } })}>
          Sign Up
        </Button>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 justify-center items-center">
        
        {/* Learner Card */}
        <Card className="w-full max-w-[380px] bg-card border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center gap-6">
            <div className="w-full rounded-sm overflow-hidden bg-muted/10">
              <ImageWithFallback
                src={learnerImg}
                alt="Learner"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            
            <h2 className="text-xl font-medium tracking-wide uppercase">learner</h2>
            
            <Button 
              onClick={() => handleSignIn('learner')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-md"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>

        {/* Course Seller Card */}
        <Card className="w-full max-w-[380px] bg-card border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center gap-6">
            <div className="w-full rounded-sm overflow-hidden bg-muted/10">
              <ImageWithFallback
                src={courseSellerImg}
                alt="Course Seller"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            
            <h2 className="text-xl font-medium tracking-wide uppercase">course seller</h2>
            
            <Button 
              onClick={() => handleSignIn('seller')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-md"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
