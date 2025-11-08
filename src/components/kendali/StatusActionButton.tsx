'use client';

import React from 'react';
import {Button} from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { 
  Hand, PhoneCall, ClipboardCheck, LogIn, 
  Play, StopCircle, Bed, Loader2 
} from 'lucide-react';
import { ScheduledSurgery } from '@/types';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/ui/tooltip';

interface Props {
  surgery: ScheduledSurgery;
  onUpdateStatus: (surgery: ScheduledSurgery, nextStatus: string) => void;
  isUpdating: boolean;
}

const  StatusActionButton: React.FC<Props> = ({ surgery, onUpdateStatus, isUpdating }) => {
  const getNextStep = () => {
    switch (surgery.status) {
      case 'Terkonfirmasi':
        return { label: 'Siap Panggil', icon: Hand, nextStatus: 'Siap Panggil', variant: 'success', disabledReason: !surgery.assignedOR ? 'Belum ada Ruang OK' : null };
      case 'Siap Panggil':
        return { label: 'Panggil Pasien', icon: PhoneCall, nextStatus: 'Dipanggil', variant: 'success' };
      case 'Dipanggil':
        return { label: 'Terima Pasien (OK)', icon: ClipboardCheck, nextStatus: 'Pasien Diterima', variant: 'primary' };
      case 'Pasien Diterima':
        return { label: 'Mulai Persiapan', icon: LogIn, nextStatus: 'Persiapan Operasi', variant: 'primary' };
      case 'Persiapan Operasi':
        return { label: 'Mulai Operasi', icon: Play, nextStatus: 'Operasi Berlangsung', variant: 'primary' };
      case 'Operasi Berlangsung':
        return { label: 'Selesai Operasi', icon: StopCircle, nextStatus: 'Operasi Selesai', variant: 'danger' };
      case 'Operasi Selesai':
        return { label: 'Pindah RR', icon: Bed, nextStatus: 'Ruang Pemulihan', variant: 'secondary' };
      case 'Ruang Pemulihan':
        return { label: 'Selesai', icon: Bed, nextStatus: '', variant: 'secondary', disabledReason: 'Pasien sudah di Ruang Pemulihan' };
      default:
        return null;
    }
  };

  const step = getNextStep();
  if (!step) return <Badge >{surgery.status}</Badge>;

  const { label, icon: Icon, nextStatus, variant, disabledReason } = step;
  const disabled = Boolean(disabledReason) || isUpdating;

  const handleClick = () => {
    if (!nextStatus) return;
    onUpdateStatus(surgery, nextStatus);
  };

  const buttonClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : variant === 'success'
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : variant === 'secondary'
      ? 'bg-gray-400 hover:bg-gray-500 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            disabled={disabled}
            className={`w-full md:w-auto ${buttonClass}`}
          >
            {isUpdating ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <Icon size={14} className="mr-2" />
            )}
            {label}
          </Button>
        </TooltipTrigger>
        {disabledReason && <TooltipContent>{disabledReason}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusActionButton;
