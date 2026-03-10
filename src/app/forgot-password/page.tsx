
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("이메일 전송 중 오류가 발생했습니다. 이메일 주소를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroImage = PlaceHolderImages.find(img => img.id === 'project-1');

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4FF] items-center justify-center p-4">
      <div className="w-full max-w-[1000px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Illustration & Information */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-between relative overflow-hidden bg-white">
          <div className="z-10">
            <h1 className="text-3xl font-bold leading-tight mb-4">
              비밀번호를 잊으셨나요?<br />
              <span className="text-primary">임시 비밀번호로 계정을 재설정하세요!</span>
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              가입한 이메일을 입력하면 임시 비밀번호 링크를 보내드립니다.
            </p>
            
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-100 mt-4">
              <Image
                src={heroImage?.imageUrl || "https://picsum.photos/seed/forgot/800/600"}
                alt="Account Recovery"
                fill
                className="object-cover"
                data-ai-hint="digital security"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />
            </div>
          </div>
          
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Right Side: Reset Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center border-l border-slate-50">
          {!isSent ? (
            <form onSubmit={handleResetPassword} className="max-w-md mx-auto w-full space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@company.com"
                      className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-lg font-bold shadow-lg shadow-blue-200 transition-all"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "임시 비밀번호 전송"}
                </Button>
                
                <p className="text-center text-slate-400 text-sm">
                  메일이 오지 않으면 스팸함을 확인해 주세요.
                </p>
              </div>

              <div className="text-center pt-4">
                <span className="text-sm text-slate-500 mr-2">계정을 찾으셨나요?</span>
                <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
                  로그인
                </Link>
              </div>
            </form>
          ) : (
            <div className="max-w-md mx-auto w-full text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">이메일이 발송되었습니다!</h2>
                <p className="text-slate-500 text-sm">
                  {email} 주소로 비밀번호 재설정 링크를 보냈습니다.<br />
                  이메일을 확인하여 비밀번호를 재설정해 주세요.
                </p>
              </div>
              <Button asChild className="w-full h-14 rounded-2xl bg-[#4F46E5]">
                <Link href="/">로그인 화면으로 돌아가기</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-slate-400 text-sm font-medium">
          © XI S&D, All Rights Reserved. Designed & Developed by DX Team.
        </p>
      </footer>
    </div>
  );
}
