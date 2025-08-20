export interface Developer {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  experience: number;
  status: 'active' | 'pending' | 'inactive';
  email: string;
  phone: string;
  location: string;
  skills: string[];
  hourlyRate: number;
  projectsCompleted: number;
}

export interface DeveloperCardProps {
  developer: Developer;
  onViewProfile?: (developerId: string) => void;
  onContact?: (developerId: string) => void;
  className?: string;
}