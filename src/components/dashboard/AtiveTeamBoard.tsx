'use client'; // <-- Perbaiki salah ketik dari 'use aclient'

import { OperatingRoomShift } from '@/types';
import Card from '@/components/ui/Card';
import { Stethoscope, Users } from 'lucide-react';
import { motion, Variants } from 'framer-motion'; // Impor motion & Variants

interface ActiveTeamBoardProps {
  activeShift: 'Pagi' | 'Siang' | 'Malam';
  assignments: OperatingRoomShift[];
}

// Varian animasi untuk kontainer grid
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Jeda antar animasi anak
    },
  },
};

// Varian animasi untuk setiap kartu di dalam grid
const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

export default function ActiveTeamBoard({ activeShift, assignments }: ActiveTeamBoardProps) {
  const activeAssignments = assignments.filter(a => a.shift === activeShift);

  if (activeAssignments.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-bold mb-2 dark:text-gray-100">Tim Jaga Shift {activeShift}</h2>
        <p className="text-gray-500 dark:text-gray-400">Tidak ada tim yang ditugaskan untuk shift ini.</p>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Tim Jaga Aktif (Shift {activeShift})
      </h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {activeAssignments.map(shift => (
          // Bungkus setiap Card dengan motion.div untuk animasi individual
          <motion.div key={shift.operatingRoom} variants={cardVariants}>
            <Card className="h-full">
              <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 border-b dark:border-gray-700 pb-2 mb-3">
                {shift.operatingRoom}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex text-gray-800 dark:text-gray-200">
                  <Stethoscope size={16} className="mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700">Anestesi:{shift.anesthesiologist.name}</span> 
                  </div>
                </div>
                <div className="flex text-gray-800 dark:text-gray-200">
                  <Users size={16} className="mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700">Perawat: {shift.nurses.map(n => n.name).join(', ')}</span> 
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}