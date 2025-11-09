'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export default function ActivityLogList() {
  const [logs, setLogs] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const res = await fetch('/api/activity-log');
      const data = await res.json();
      setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <Loader2 className="animate-spin mx-auto mt-8" />;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow">
      <h2 className="text-lg font-semibold mb-3">Log Aktivitas</h2>
      <ul className="space-y-2 text-sm">
        {logs.map((log) => (
          <li key={log.id} className="border-b border-gray-200 dark:border-gray-700 pb-1">
            <p className="font-semibold">{log.action}</p>
            <p className="text-gray-600 dark:text-gray-300">{log.description}</p>
            <p className="text-xs text-gray-400">{log.performedBy} • {new Date(log.createdAt).toLocaleString('id-ID')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
