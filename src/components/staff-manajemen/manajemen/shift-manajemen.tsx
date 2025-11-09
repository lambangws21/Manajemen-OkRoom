'use client';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { ShiftSchedule } from '@/types';

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<ShiftSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ staffName: '', date: '', shift: 'Pagi', status: 'On Duty' });

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shifts');
      const data = await res.json();
      setShifts(data);
    } catch {
      toast.error('Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShifts(); }, []);

  const addShift = async () => {
    if (!form.staffName || !form.date) return toast.error('Nama & tanggal wajib');
    try {
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      toast.success('Shift ditambahkan');
      setForm({ staffName: '', date: '', shift: 'Pagi', status: 'On Duty' });
      fetchShifts();
    } catch {
      toast.error('Gagal menambah shift');
    }
  };

  const deleteShift = async (id: string) => {
    if (!confirm('Hapus shift ini?')) return;
    try {
      await fetch('/api/shifts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast.success('Shift dihapus');
      fetchShifts();
    } catch {
      toast.error('Gagal hapus shift');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow">
      <h2 className="text-xl font-semibold mb-4">Jadwal Shift</h2>

      <div className="grid md:grid-cols-4 gap-2 mb-4">
        <input placeholder="Nama Staf" value={form.staffName} onChange={(e) => setForm({ ...form, staffName: e.target.value })} className="border rounded px-2 py-1" />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded px-2 py-1" />
        <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} className="border rounded px-2 py-1">
          <option value="Pagi">Pagi</option>
          <option value="Siang">Siang</option>
          <option value="Malam">Malam</option>
        </select>
        <button onClick={addShift} className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-green-700">
          <CalendarPlus size={14} /> Tambah
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s.id} className="border-b">
                <td>{s.staffName}</td>
                <td>{s.date}</td>
                <td>{s.shift}</td>
                <td>{s.status}</td>
                <td><button onClick={() => deleteShift(s.id)} className="text-red-500"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
