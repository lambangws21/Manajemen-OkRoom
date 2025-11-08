import { Room } from '@/types/';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/Badge';

interface RoomCardProps {
  room: Room;
}

type StatusConfig = {
    [key in Room['status']]: { color: 'green' | 'blue' | 'yellow' | 'red'; label: string };
};

export default function RoomCard({ room }: RoomCardProps) {
  const statusConfig: StatusConfig = {
    Available: { color: 'green', label: 'Tersedia' },
    Occupied: { color: 'blue', label: 'Terisi' },
    Dirty: { color: 'yellow', label: 'Kotor' },
    'Out of Order': { color: 'red', label: 'Rusak' },
  };

  const config = statusConfig[room.status];

  return (
    <Card>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">Kamar {room.number}</h3>
        <Badge colorScheme={config.color}>{config.label}</Badge>
      </div>
      <p className="text-sm text-gray-600">{room.type}</p>
    </Card>
  );
}