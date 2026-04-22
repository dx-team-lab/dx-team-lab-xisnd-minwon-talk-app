'use client';

import ApprovalGuard from '@/components/common/ApprovalGuard';
import Header from '@/components/common/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-[#F0F4FF]">
        <Header />
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
      </div>
    </ApprovalGuard>
  );
}
