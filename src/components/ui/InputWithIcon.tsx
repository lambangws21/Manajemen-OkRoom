// src/components/ui/InputWithIcon.tsx

// PERUBAHAN: Impor 'isValidElement' dari React
import React, { ReactNode, isValidElement } from 'react';
import { Input } from '@/components/ui/Input'; // Pastikan path ke Input shadcn benar

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
}

export default function InputWithIcon({ icon, ...props }: InputWithIconProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {/* PERUBAHAN: Tambahkan pengecekan sebelum cloneElement.
          Ini adalah cara paling aman untuk menangani error TypeScript ini.
        */}
        {isValidElement(icon) && React.cloneElement(icon, {
        
        })}
      </div>
      <Input
        className="pl-10" // Beri padding kiri agar teks tidak tumpang tindih dengan ikon
        {...props}
      />
    </div>
  );
}