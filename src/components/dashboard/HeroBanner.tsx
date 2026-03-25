"use client";

export default function HeroBanner() {

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] py-8 text-white">
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-headline font-bold leading-tight md:text-5xl">
            건설 현장 민원을<br />쉽게 관리하세요
          </h1>
          <p className="text-lg text-blue-100">
            진행중 · 유보 · 완료 상태를 한눈에 확인하고,<br />
            체계적인 대응 방안과 보상 사례를 공유하여 효율적인 민원 관리를 지원합니다.
          </p>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />
    </section>
  );
}
