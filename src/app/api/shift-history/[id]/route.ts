// // src/app/api/shift-history/[id]/route.ts

// import { NextResponse } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; 

// // Konstanta Firebase
// const HISTORY_COLLECTION = 'shift-history';

// // --- Handler DELETE: Menghapus Entri Histori ---
// // Endpoint: DELETE /api/shift-history/[id]
// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   const { id } = params;

//   if (!id) {
//     return NextResponse.json({ error: 'ID histori tidak ditemukan.' }, { status: 400 });
//   }

//   try {
//     const docRef = adminDb.collection(HISTORY_COLLECTION).doc(id);
//     await docRef.delete();

//     return NextResponse.json({ message: `Histori dengan ID ${id} berhasil dihapus.` }, { status: 200 });
    
//   } catch (error) {
//     console.error("DELETE Shift History Error:", error);
//     return NextResponse.json({ error: 'Gagal menghapus entri histori.' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

const HISTORY_COLLECTION = "shiftHistory";

/**
 * ✅ DELETE — Menghapus satu entri histori shift berdasarkan ID
 * Endpoint: /api/shift-history/[id]
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Menggunakan await pada context.params

    if (!id) {
      return NextResponse.json(
        { error: "ID histori tidak ditemukan." },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection(HISTORY_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: `Histori dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    await docRef.delete();

    console.log(`🗑️ Histori shift ${id} berhasil dihapus.`);
    return NextResponse.json(
      { message: `Histori dengan ID ${id} berhasil dihapus.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE Shift History Error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal menghapus entri histori.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
