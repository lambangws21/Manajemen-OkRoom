'use client';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { LeaveData } from '../types';

import clsx from 'clsx';

const getLeaveColor = (type: string) =>
  clsx('p-3 rounded-md shadow-sm transition', {
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': type === 'Cuti',
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': type === 'Sakit',
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': type === 'Izin',
  });

export default function LeaveSection({
  leaves,
  loading,
  onApprove,
  onReject,
}: {
  leaves: LeaveData[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <CalendarClock className="text-blue-500" size={18} /> Staf Cuti, Sakit, dan Izin
        {leaves.length > 0 && (
          <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
            {leaves.length}
          </span>
        )}
      </h3>

      {loading ? (
        <div className="flex justify-center items-center py-6 text-gray-400">
          <Loader2 className="animate-spin mr-2" /> Memuat data...
        </div>
      ) : leaves.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Tidak ada staf cuti/sakit/izin.</p>
      ) : (
        <motion.div className="space-y-2">
          {leaves.map((l) => (
            <motion.div
              key={l.id}
              className={getLeaveColor(l.type)}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} />
                  <span className="font-semibold">{l.staffName}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/20">
                    {l.type}
                  </span>
                </div>
                <div className="text-xs mt-1 md:mt-0">
                  {new Date(l.startDate).toLocaleDateString('id-ID')} →{' '}
                  {new Date(l.endDate).toLocaleDateString('id-ID')}
                </div>
              </div>

              {/* tombol approve / tolak */}
              {l.status === 'Pending' && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onApprove(l.id)}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                  >
                    <CheckCircle size={14} /> Setujui
                  </button>
                  <button
                    onClick={() => onReject(l.id)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                  >
                    <XCircle size={14} /> Tolak
                  </button>
                </div>
              )}
              {l.status !== 'Pending' && (
                <p className="mt-1 text-xs italic">
                  Status: {l.status === 'Disetujui' ? '✅ Disetujui' : '❌ Ditolak'}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
