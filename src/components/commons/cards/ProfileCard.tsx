import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemedText from '@/components/commons/typography/ThemedText';

interface UserProps {
  id: number;
  name: string;
  matricule?: string;
  imageUri: string;
}

const ProfileCard: React.FC<{ user: UserProps; type: 'student' | 'teacher' }> = ({ user, type }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/user/${user.id}`)}
      className="flex items-center py-4 rounded-lg"
    >
      <img
        src={user.imageUri}
        alt={user.name}
        className="w-10 h-10 rounded-full mr-2 bg-background-neutral text-[10px]"
      />
      <div>
        <ThemedText variant="h4">
          {user.name}
        </ThemedText>
        {type === 'student' && (
          <ThemedText className="text-neutral-text-primary">
            {user.matricule}
          </ThemedText>
        )}
      </div>
    </button>
  );
};

export default ProfileCard;