// src/app/api/activity-logs/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  const snapshot = await adminDb
    .collection("activityLogs")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(data);
}
