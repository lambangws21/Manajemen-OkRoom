import type { ScheduledSurgery, NewScheduledSurgery } from '@/types';

const API_BASE_URL = '/api/schedule'; // Sesuai dengan app/api/schedule/route.ts

/**
 * Mengambil semua data jadwal dari API
 */
export async function getSchedules(): Promise<ScheduledSurgery[]> {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error("Gagal mengambil data jadwal");
  // API Anda mengembalikan array langsung, jadi kita langsung parse
  const data: ScheduledSurgery[] = await res.json();
  return data;
}

/**
 * Menambahkan jadwal baru melalui API
 */
export async function createSchedule(schedule: NewScheduledSurgery): Promise<ScheduledSurgery> {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule),
  });
  if (!res.ok) throw new Error("Gagal menambahkan jadwal");
  return await res.json();
}

/**
 * Memperbarui jadwal yang ada melalui API
 */
export async function updateSchedule(schedule: Partial<ScheduledSurgery> & { id: string }): Promise<void> {
  const res = await fetch(API_BASE_URL, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule),
  });
  if (!res.ok) throw new Error("Gagal memperbarui jadwal");
}

/**
 * Menghapus jadwal dari API
 */
export async function deleteSchedule(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus jadwal");
}