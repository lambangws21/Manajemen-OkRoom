// src/app/api/shift-history/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin"; 
import { ShiftAssignment } from "@/types/staffTypes"; 

const HISTORY_COLLECTION = "shiftHistory";


interface HistoryEntry extends ShiftAssignment {
    id: string;
    archivedAt: string; // Ini adalah ISO string
  }
  
  // --- GET All History ---
  // Endpoint: GET /api/shift-history
  export async function GET() {
    try {
      const collectionRef = adminDb.collection(HISTORY_COLLECTION);
      
      // Mengambil data, diurutkan dari yang terbaru (descending)
      const snapshot = await collectionRef.orderBy("archivedAt", "desc").get();
      
      const historyList: HistoryEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HistoryEntry)); // Pastikan tipe datanya cocok
  
      return NextResponse.json(historyList);
  
    } catch (error) {
      console.error("Error fetching shift history:", error);
      return NextResponse.json({ error: "Failed to fetch history list" }, { status: 500 });
    }
  }
export async function POST(req: Request) {
  try {
    const payload: ShiftAssignment = await req.json();

    // Validasi sederhana
    if (!payload.anesthesiaTeam && !payload.nurseTeams) {
      return NextResponse.json({ error: "Payload tidak boleh kosong." }, { status: 400 });
    }

    const historyRef = adminDb.collection(HISTORY_COLLECTION).doc(); // Buat ID unik
    
    await historyRef.set({
      ...payload,
      archivedAt: new Date().toISOString(), // Tambahkan timestamp kapan ini diarsipkan
    });

    return NextResponse.json(
      { id: historyRef.id, message: "Histori shift berhasil diarsipkan." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating shift history:", error);
    return NextResponse.json({ error: "Gagal mengarsipkan histori" }, { status: 500 });
  }
}