// src/app/api/staffs/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin"; // Import Admin SDK instance
import { Staff, StaffPayload } from "@/types/index"; 
import admin from 'firebase-admin'; // Perlu diimpor untuk FieldValue

const STAFFS_COLLECTION = "staff";

// --- GET All Staffs ---
// Endpoint: GET /api/staffs
export async function GET() {
  try {
    const collectionRef = adminDb.collection(STAFFS_COLLECTION);
    const snapshot = await collectionRef.get();
    
    // Mapping dokumen Firestore ke interface Staff
    const staffs: Staff[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Staff));

    return NextResponse.json(staffs);
  } catch (error) {
    console.error("Error fetching all staffs:", error);
    return NextResponse.json({ error: "Failed to fetch staffs list" }, { status: 500 });
  }
}

// --- POST Create Staff ---
// Endpoint: POST /api/staffs
export async function POST(req: Request) {
  try {
    const data: StaffPayload = await req.json();

    if (!data.name || !data.role) {
      return NextResponse.json({ error: "Nama dan Role wajib diisi." }, { status: 400 });
    }

    const collectionRef = adminDb.collection(STAFFS_COLLECTION);
    
    const docRef = await collectionRef.add({
      ...data,
      // Hapus properti undefined jika department tidak dikirim
      department: data.department || admin.firestore.FieldValue.delete(), 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, message: "Staff created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}