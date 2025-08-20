'use client';

import { StaffMember } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface StaffMemberCardProps {
  staff: StaffMember;
  // Prop opsional untuk mobile, agar bisa diklik
  onClick?: () => void;
}

export default function StaffMemberCard({ staff, onClick }: StaffMemberCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `staff-${staff.id}`,
    data: { staff },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="p-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-xl shadow-md flex items-center"
      // Tambahkan onClick untuk mobile, tapi nonaktifkan jika sedang di-drag
      onClick={!isDragging ? onClick : undefined}
    >
      {/* Sembunyikan handle drag di mobile, karena kita akan menggunakan 'tap' */}
      <div {...listeners} {...attributes} className="cursor-grab touch-none p-1 hidden sm:block">
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <div className="ml-2">
        <p className="font-semibold text-md text-gray-800 dark:text-gray-200">{staff.name}</p>
        <p className="text-xs text-gray-800 dark:text-gray-400">{staff.role}</p>
      </div>
    </div>
  );
}