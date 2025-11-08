'use client';

import { StaffMember } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface StaffMemberCardProps {
  staff: StaffMember;
  onClick?: () => void;
}

export default function StaffMemberCard({ staff, onClick }: StaffMemberCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `staff-${staff.id}`,
    data: { staff },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      onClick={!isDragging ? onClick : undefined}
      {...listeners}
      {...attributes}
      className={`
        relative flex items-center gap-3 p-3 rounded border
        bg-gray-500  dark:bg-gray-800/70 backdrop-blur-md
        border-gray-200 dark:border-gray-100
        shadow-sm hover:shadow-lg transition-all duration-200
        cursor-grab active:cursor-grabbing select-none
        ${isDragging ? 'opacity-60 scale-95' : 'opacity-100 hover:scale-[1.02]'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Drag handle */}
      <motion.div
        className="hidden sm:flex justify-center items-center p-1 rounded bg-gray-100 dark:bg-gray-700"
        whileHover={{ rotate: 5 }}
        transition={{ duration: 0.2 }}
      >
        <GripVertical size={18} className="text-gray-400" />
      </motion.div>

      {/* Avatar inisial */}
      <motion.div
        className="flex items-center justify-center w-10 h-10 rounded font-bold text-sm text-slate-700"
        style={{
          background: `linear-gradient(135deg, #3b82f6, #1e40af)`,
        }}
        whileHover={{ rotate: 5 }}
      >
        {staff.name.charAt(0).toUpperCase()}
      </motion.div>

      {/* Info staff */}
      <div className="flex flex-col">
        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
          {staff.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{staff.role}</p>
      </div>

      {/* Efek glowing border */}
      <motion.div
        className="absolute inset-0 rounded pointer-events-none"
        animate={{
          boxShadow: isDragging
            ? '0 0 20px rgba(59,130,246,0.5)'
            : '0 0 0px rgba(59,130,246,0)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
