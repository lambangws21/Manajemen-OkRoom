// src/lib/logActivity.ts
import { adminDb } from "./firebaseAdmin";

/**
 * Menyimpan log aktivitas ke Firestore.
 * @param action jenis aksi (contoh: "Approve Cuti", "Tambah Shift")
 * @param description deskripsi singkat
 * @param performedBy nama user/kepala ruang yang melakukan
 */
export async function logActivity(action: string, description: string, performedBy = "Kepala Ruang") {
  try {
    await adminDb.collection("activityLogs").add({
      action,
      description,
      performedBy,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Gagal mencatat log aktivitas:", err);
  }
}
