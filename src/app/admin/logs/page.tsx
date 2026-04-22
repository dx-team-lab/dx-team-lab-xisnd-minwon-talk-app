'use client';

import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { ActivityLog } from '@/lib/types';
import { Loader2, History, User, Tag, Clock, HelpCircle, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogsPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Admin check
  const adminsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_admin');
  }, [db, user]);
  const { data: admins, isLoading: isAdminLoading } = useCollection(adminsQuery);

  useEffect(() => {
    if (!isAdminLoading && admins) {
      const isUserAdmin = admins.some(a => a.id === user?.uid);
      setIsAdmin(isUserAdmin);
      if (!isUserAdmin && user) {
        // Not an admin, redirect or show error
        console.warn('Unauthorized access to admin logs');
      }
    }
  }, [admins, isAdminLoading, user, router]);

  const logsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'activity_logs'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  }, [db]);

  const { data: logs, isLoading: isLogsLoading } = useCollection(logsQuery);

  if (isUserLoading || isAdminLoading || isAdmin === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">관리자 권한 확인 중...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">접근 권한이 없습니다</h1>
          <p className="text-slate-500 max-w-md">
            시스템 로그 페이지는 최고 관리자만 접근할 수 있습니다. 권한이 필요하시면 시스템 관리자에게 문의해 주세요.
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-[11px] font-bold">생성</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-[11px] font-bold">수정</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[11px] font-bold">삭제</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-[11px] font-bold">{action}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <History className="h-5 w-5" />
            <span className="font-bold tracking-tight">System Administration</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-slate-900">사용자 활동 로그</h1>
          <p className="text-slate-500 text-sm">시스템 내 주요 변경 사항을 추적합니다. (최근 100건)</p>
        </div>
      </div>

      {isLogsLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          <p className="text-slate-400 text-sm">로그 데이터를 불러오는 중...</p>
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">액션</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">수행자</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">대상 현장</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">세부 내용</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {log.actorName}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-5">{log.actorEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                        <Tag className="h-3.5 w-3.5 text-primary/40" />
                        {log.targetSiteName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-sm font-medium">{log.details}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {log.createdAt ? format(log.createdAt.toDate(), 'yyyy.MM.dd HH:mm:ss', { locale: ko }) : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lg border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">기록된 활동이 없습니다</h3>
            <p className="text-slate-400 text-sm">시스템에서 발생하는 주요 액션들이 여기에 기록됩니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}
