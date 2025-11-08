// Ganti nama file ini ke: src/app/api/room-assignments/route.ts
// (Anda salah eja "assigments" di nama file)

import { NextResponse, NextRequest } from "next/server";
// Pastikan path ini benar
import { adminDb } from "@/lib/firebaseAdmin"; 

// --- Konfigurasi Database ---
const ROOM_ASSIGNMENTS_COLLECTION = "roomAssigments";
const DOC_ID = "dailyPlan"; 

/**
 * ----------------------------------------------------
 * @method GET
 * @description Mengambil data penugasan kamar operasi (OK) yang aktif.
 * ----------------------------------------------------
 * Endpoint: GET /api/room-assignments
 */
export async function GET() {
    try {
        const docRef = adminDb.collection(ROOM_ASSIGNMENTS_COLLECTION).doc(DOC_ID);
        const docSnap = await docRef.get();

        // --- PERBAIKAN ADA DI SINI ---
        // 'exists' di Admin SDK adalah properti boolean, bukan fungsi.
        // Hapus tanda kurung ()
        if (!docSnap.exists) {
            // Jika dokumen belum ada, kirim objek kosong
            return NextResponse.json({});
        }

        // Kirim data yang ada di dokumen
        return NextResponse.json(docSnap.data());

    } catch (error) {
        console.error("Error fetching room assignments [GET]:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data penugasan kamar" }, 
            { status: 500 }
        );
    }
}

/**
 * ----------------------------------------------------
 * @method PUT
 * @description Menyimpan (menimpa) data penugasan kamar operasi (OK) yang baru.
 * ----------------------------------------------------
 * Endpoint: PUT /api/room-assignments
 */
export async function PUT(req: NextRequest) {
    try {
        const newAssignments = await req.json();

        if (!newAssignments || typeof newAssignments !== 'object') {
            return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
        }

        const docRef = adminDb.collection(ROOM_ASSIGNMENTS_COLLECTION).doc(DOC_ID);
        
        // .set() akan menimpa seluruh data di dokumen
        await docRef.set(newAssignments);

        return NextResponse.json(
            { message: "Penugasan kamar berhasil diperbarui" }, 
            { status: 200 }
        );

    } catch (error) {
        console.error("Error saving room assignments [PUT]:", error);
        return NextResponse.json(
            { error: "Gagal menyimpan penugasan kamar" }, 
            { status: 500 }
        );
    }
}