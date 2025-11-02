'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth';
import { Modal } from '@/components/ui/Modal';

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    router.push('/');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Suspense fallback={<div className="w-full p-8 text-center">Loading...</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </Modal>
  );
}
