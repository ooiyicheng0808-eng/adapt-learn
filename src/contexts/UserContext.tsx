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
  isVip: boolean;
  plannerUses: number;
  buyVip: () => boolean;
  chargePlanner: () => 'vip' | 'success' | 'insufficient_diamonds' | 'insufficient_uses';
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [diamonds, setDiamonds] = useState(5000);
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isVip, setIsVip] = useState(false);
  const [plannerUses, setPlannerUses] = useState(3);
  const { language } = useSettings();

  useEffect(() => {
    const keySuffix = userProfile?.email || 'guest';
    const savedDiamonds = localStorage.getItem(`user_diamonds_${keySuffix}`);
    if (savedDiamonds) setDiamonds(parseInt(savedDiamonds, 10));
    else setDiamonds(5000);

    const savedCourses = localStorage.getItem(`user_unlocked_courses_${keySuffix}`);
    if (savedCourses) setUnlockedCourses(JSON.parse(savedCourses));
    else setUnlockedCourses([]);

    const savedVip = localStorage.getItem(`user_vip_${keySuffix}`);
    setIsVip(savedVip === 'true');

    const savedPlannerUses = localStorage.getItem(`user_planner_uses_${keySuffix}`);
    if (savedPlannerUses) setPlannerUses(parseInt(savedPlannerUses, 10));
    else setPlannerUses(3);
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

  const buyVip = () => {
    if (isVip) {
      toast.error("You are already a VIP!");
      return false;
    }
    if (diamonds >= 150) {
      const newDiamonds = diamonds - 150;
      setDiamonds(newDiamonds);
      setIsVip(true);
      const keySuffix = userProfile?.email || 'guest';
      localStorage.setItem(`user_diamonds_${keySuffix}`, newDiamonds.toString());
      localStorage.setItem(`user_vip_${keySuffix}`, 'true');
      toast.success("Successfully upgraded to VIP!");
      return true;
    } else {
      toast.error("Not enough diamonds to upgrade to VIP!");
      return false;
    }
  };

  const chargePlanner = () => {
    const keySuffix = userProfile?.email || 'guest';
    if (isVip) {
      return 'vip';
    }
    if (plannerUses <= 0) {
      return 'insufficient_uses';
    }
    if (diamonds < 50) {
      return 'insufficient_diamonds';
    }
    
    // Deduct 50 diamonds and 1 use
    const newDiamonds = diamonds - 50;
    const newUses = plannerUses - 1;
    setDiamonds(newDiamonds);
    setPlannerUses(newUses);
    localStorage.setItem(`user_diamonds_${keySuffix}`, newDiamonds.toString());
    localStorage.setItem(`user_planner_uses_${keySuffix}`, newUses.toString());
    return 'success';
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
      updateProfilePic,
      isVip,
      plannerUses,
      buyVip,
      chargePlanner
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
