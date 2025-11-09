'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/ui/dialog';
import { Copy, Share2, QrCode, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';


interface ShareStatusButtonProps {
  mrn: string;
}

export default function ShareStatusButton({ mrn }: ShareStatusButtonProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/';

  const shareUrl = `${baseUrl}/share/status/${mrn}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return; // 🚫 cegah double click
    setIsSharing(true);
  
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Status Operasi Pasien',
          text: 'Cek status operasi pasien melalui tautan berikut:',
          url: shareUrl,
        });
      } else {
        await handleCopy();
      }
    } catch (err) {
      console.error('Share gagal:', err);
    } finally {
      // ✅ beri jeda agar UI tidak langsung aktif lagi
      setTimeout(() => setIsSharing(false), 1000);
    }
  };
  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button  size="sm" className="flex items-center gap-2">
          <Share2 size={16} className='text-green-500 text-shadow-2xs'/> 
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Bagikan Status Pasien
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 flex flex-col items-center gap-4">
        <QRCodeCanvas value={shareUrl} size={140}  />


          <p className="text-sm text-gray-600 break-all">{shareUrl}</p>

          <div className="flex gap-2 justify-center">
            <Button onClick={handleCopy} variant="secondary" size="sm"  disabled={isSharing} >
              {copied ? (
                <>
                  <Check size={14} className="mr-1" /> Disalin
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" /> Salin Link
                </>
              )}
            </Button>

            <Button onClick={handleShare} variant="default" size="sm">
              <QrCode size={14} className="mr-1" /> Bagikan
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Link ini aman dan hanya menampilkan status operasi berdasarkan MRN.
        </p>
      </DialogContent>
    </Dialog>
  );
}
