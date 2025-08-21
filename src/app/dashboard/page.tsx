'use client';

import { useState, useEffect } from 'react';
import { mockScheduledSurgeries, mockShiftAssignments, mockStaffMembers } from '@/lib/mock-data';
import { ScheduledSurgery, OperatingRoomShift, StaffMember } from '@/types';
import { getGreeting, getCurrentShift } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Impor komponen dengan path dan nama yang benar
import ControlBoard from '@/components/dashboard/ControlBoard';
import TeamShiftCards from '@/components/dashboard/TeamShiftCard';
import RoomGrid from '@/components/dashboard/RoomGrid';
import FilterControls, { Filters } from '@/components/dashboard/FilterControls';
import DashboardHeader from '@/components/dashboard/DashboardHeaders';

type ActiveTab = 'pasien' | 'tim' | 'kamar';

export default function DashboardPage() {
  // State dan handler sekarang diletakkan di sini untuk diberikan ke ControlBoard
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [schedule, setSchedule] = useState<ScheduledSurgery[]>(
    mockScheduledSurgeries.filter(s => s.scheduledAt.startsWith(todayStr) && s.status !== "Dibatalkan")
  );

  const [assignments] = useState<OperatingRoomShift[]>(mockShiftAssignments);
  const [anesthesiaTeam] = useState<StaffMember[]>(mockStaffMembers.filter(s => s.role === 'Dokter Anestesi').slice(0, 3));
  const [activeShift] = useState<'Pagi' | 'Siang' | 'Malam'>(getCurrentShift());
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('pasien');
  const [roomFilters, setRoomFilters] = useState<Filters>({ search: '', status: 'All' });
  
  useEffect(() => { setGreeting(getGreeting()); }, []);

  const handleUpdateSchedule = (updatedSchedule: ScheduledSurgery[]) => {
    setSchedule(updatedSchedule);
  }
  
  const tabs = [
    { id: 'pasien', label: `Papan Kendali Pasien (${schedule.length})` },
    { id: 'tim', label: 'Tim Jaga' },
    { id: 'kamar', label: 'Status Kamar' },
  ];

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{greeting}, PJ Ruang Operasi!</h1>
        <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
          Saat ini shift <span className="font-semibold text-green-600 dark:text-green-400">{activeShift}</span> sedang berlangsung.
        </p>
      </header>
      
      <DashboardHeader />
      
      <div className="mt-8 mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as ActiveTab)} className={cn('relative py-4 px-1 text-sm sm:text-base font-medium whitespace-nowrap', activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" layoutId="underline" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'pasien' && (
            // Panggil komponen ControlBoard dan berikan data serta handler
            <ControlBoard 
              initialSchedule={schedule}
              onScheduleUpdate={handleUpdateSchedule}
            />
          )}
          {activeTab === 'tim' && (
            <TeamShiftCards 
              shiftName={activeShift} 
              assignments={assignments}
              anesthesiaTeam={anesthesiaTeam}
            />
          )}
          {activeTab === 'kamar' && (
            <div className="space-y-4">
              <FilterControls filters={roomFilters} onFilterChange={setRoomFilters} />
              <RoomGrid filters={roomFilters} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}