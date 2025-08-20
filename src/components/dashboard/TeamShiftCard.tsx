'use client';
import { OperatingRoomShift, StaffMember } from '@/types';
import Card from '@/components/ui/Card';


interface TeamShiftCardsProps {
  shiftName: 'Pagi' | 'Siang' | 'Malam';
  assignments: OperatingRoomShift[];
  anesthesiaTeam: StaffMember[];
}

export default function TeamShiftCards({ shiftName, assignments, anesthesiaTeam }: TeamShiftCardsProps) {
  const shiftAssignments = assignments.filter(a => a.shift === shiftName);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <Card>
        <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 border-b pb-2 mb-3">Dokter Anestesi Jaga</h3>
        <ul className="space-y-1 text-sm">
          {anesthesiaTeam.map(doc => <li key={doc.id}>{doc.name}</li>)}
        </ul>
      </Card>
      {shiftAssignments.map(assignment => (
        <Card key={assignment.operatingRoom}>
          <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 border-b pb-2 mb-3">{assignment.operatingRoom}</h3>
          <div className="space-y-3 text-sm">
            <p><strong>Perawat:</strong> {assignment.nurses.map(n => n.name).join(', ')}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}