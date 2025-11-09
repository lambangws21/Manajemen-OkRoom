'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { LeaveData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LeaveStats({ leaves }: { leaves: LeaveData[] }) {
  const grouped = leaves.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped).map(([type, count]) => ({ type, count }));

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLeaves = leaves.filter(
      (l) =>
        new Date(l.startDate) <= new Date(today) &&
        new Date(l.endDate) >= new Date(today)
    );
    if (todayLeaves.length > 2) {
      toast.warning(`⚠️ ${todayLeaves.length} staf tidak hadir hari ini!`, {
        description: 'Pertimbangkan rotasi tim operasi.',
      });
    }
  }, [leaves]);

  return (
    <div className="mt-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-md">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Statistik Mingguan</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
