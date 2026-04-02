
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Loader2, Users, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';

export default function Header() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: userProfile } = useDoc(userProfileRef);

  const adminsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'roles_admin');
  }, [db]);
  
  const managersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'roles_manager');
  }, [db]);
  
  const { data: admins } = useCollection(adminsQuery);
  const { data: managers } = useCollection(managersQuery);
  
  const isAdmin = !!(user && admins && admins.some(a => a.id === user.uid));
  const isManager = !!(user && managers && managers.some(m => m.id === user.uid));
  const hasSettingsAccess = isAdmin || isManager;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.");
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("로그아웃 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">M</div>
            <span className="text-xl font-headline font-bold text-primary">민원 대응 지식 플랫폼</span>
          </Link>
          
          {hasSettingsAccess && (
            <nav className="hidden md:flex items-center gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
                  <Settings className="h-4 w-4 mr-1" />
                  설정
                  <ChevronDown className="h-4 w-4 ml-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/users" className="flex w-full items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4" />
                        사용자 관리
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/system" className="flex w-full items-center gap-2 cursor-pointer">
                      <SlidersHorizontal className="h-4 w-4" />
                      시스템 설정
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {isUserLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">
                    {userProfile?.name || userProfile?.displayName || user?.displayName || '사용자'}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({user?.email})
                  </span>
                </div>
                
                {isAdmin && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    관리자
                  </span>
                )}

                <div className="flex items-center gap-1.5 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">로그인</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
