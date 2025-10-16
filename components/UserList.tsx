import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  status: 'online' | 'watching';
  lastSeen?: number;
}

interface UserListProps {
  users: User[];
  currentUser: string;
}

export function UserList({ users, currentUser }: UserListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        <Users className="w-5 h-5" />
        <h3>시청 중</h3>
        <Badge variant="secondary" className="ml-auto">
          {users.length}
        </Badge>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className={getAvatarColor(user.name)}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate">
                  {user.name}
                  {user.name === currentUser && (
                    <span className="text-gray-400 ml-1">(나)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${user.status === 'watching' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-500">
                  {user.status === 'watching' ? '시청 중' : '온라인'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
