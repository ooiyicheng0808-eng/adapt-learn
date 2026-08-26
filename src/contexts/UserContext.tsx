import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { useSettings } from './SettingsContext';
import { api } from '../lib/api';

export interface UserProfile {
  username: string;
  email: string;
  phone: string;
  role?: 'learner' | 'seller';
  profilePic?: string;
}

interface UserContextType {
  diamonds: number;
  userProfile: UserProfile | null;
  unlockedCourses: string[];
  unlockCourse: (courseId: string, price: number) => boolean;
  hasUnlocked: (courseId: string) => boolean;
  login: (profile: UserProfile, token: string) => void;
  logout: () => void;
  updateProfilePic: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [diamonds, setDiamonds] = useState(5000);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { language } = useSettings();

  useEffect(() => {
    const keySuffix = userProfile?.email || 'guest';
    const savedDiamonds = localStorage.getItem(`user_diamonds_${keySuffix}`);
    if (savedDiamonds) setDiamonds(parseInt(savedDiamonds, 10));
    else setDiamonds(5000);

    const savedCourses = localStorage.getItem(`user_unlocked_courses_${keySuffix}`);
    if (savedCourses) setUnlockedCourses(JSON.parse(savedCourses));
    else setUnlockedCourses([]);
  }, [userProfile?.email]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
  }, []);

  const login = (profile: UserProfile, token: string) => {
    setUserProfile(profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  };
  
  const updateProfilePic = async (url: string) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, profilePic: url };
      setUserProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      try {
        await api.put('/auth/update-profile', { profilePic: url });
      } catch (err) {
        console.error('Failed to save profile pic to backend', err);
      }
    }
  };

  const logout = () => {
    setUserProfile(null);
    localStorage.removeItem('user_profile');
    localStorage.removeItem('auth_token');
  };

  const unlockCourse = (courseId: string, price: number) => {
    if (unlockedCourses.includes(courseId)) {
      return true;
    }
    
    if (diamonds >= price) {
      const newDiamonds = diamonds - price;
      const newUnlocked = [...unlockedCourses, courseId];
      
      setDiamonds(newDiamonds);
      setUnlockedCourses(newUnlocked);
      
      const keySuffix = userProfile?.email || 'guest';
      localStorage.setItem(`user_diamonds_${keySuffix}`, newDiamonds.toString());
      localStorage.setItem(`user_unlocked_courses_${keySuffix}`, JSON.stringify(newUnlocked));
      return true;
    } else {
      const msgs = {
        english: "Not enough diamonds!",
        bahasa: "Berlian tidak mencukupi!",
        mandarin: "钻石不足！"
      };
      toast.error(msgs[language] || msgs.english);
      return false;
    }
  };

  const hasUnlocked = (courseId: string) => {
    return unlockedCourses.includes(courseId);
  };

  return (
    <UserContext.Provider value={{ 
      diamonds, 
      userProfile, 
      unlockedCourses, 
      unlockCourse, 
      hasUnlocked,
      login,
      logout,
      updateProfilePic
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
