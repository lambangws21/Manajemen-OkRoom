import { BedDouble, LogIn, LogOut, Wind } from 'lucide-react';
import Card from '@/components/ui/Card';
import { mockDashboardStats } from '@/lib/mock-data';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <Card className="flex items-center p-4">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </Card>
);

export default function DashboardHeader() {
  // Data ini nantinya akan Anda dapatkan dari API
//   const stats = {
//     occupancy: '85%',
//     arrivals: 12,
//     departures: 8,
//     dirty: 4,
//   };

  const stats = mockDashboardStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard icon={<BedDouble size={24} className="text-blue-800"/>} label="Okupansi" value={stats.occupancy} color="bg-blue-100" />
      <StatCard icon={<LogIn size={24} className="text-green-800"/>} label="Tamu Tiba" value={stats.arrivals} color="bg-green-100" />
      <StatCard icon={<LogOut size={24} className="text-orange-800"/>} label="Tamu Berangkat" value={stats.departures} color="bg-orange-100" />
      <StatCard icon={<Wind size={24} className="text-yellow-800"/>} label="Kamar Kotor" value={stats.dirty} color="bg-yellow-100" />
    </div>
  );
}