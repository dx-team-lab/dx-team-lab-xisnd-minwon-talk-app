
'use client';

import { Site } from '@/lib/types';
import { Loader2, SearchX } from 'lucide-react';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatusTableProps {
  data: Site[] | null;
  isLoading: boolean;
}

export default function StatusTable({ data, isLoading }: StatusTableProps) {
  return (
    <Card className="rounded-[24px] border-slate-200 overflow-hidden shadow-sm h-full">
      <CardContent className="p-0 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Table className="border-collapse min-w-[1000px]">
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[180px] text-sm">지역</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[200px] text-sm">현장명</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[200px] text-sm">단계</TableHead>
                <TableHead className="h-12 font-bold border-r text-slate-700 w-[240px] text-sm text-center">민원 처리 현황</TableHead>
                <TableHead className="h-12 font-bold text-slate-700 text-sm pl-6">주요 내용</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((site) => (
                  <TableRow key={site.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="border-r text-center align-middle p-4 font-bold text-slate-700">
                      <div className="flex items-center justify-center gap-2">
                        <span>{site.region}</span>
                        <CategoryBadge category="regionType">{site.regionType?.replace('지역', '')}</CategoryBadge>
                      </div>
                    </TableCell>
                    <TableCell className="border-r text-center align-middle p-4 font-bold text-slate-900">
                      {site.siteName}
                    </TableCell>
                    <TableCell className="border-r text-center align-middle p-4">
                      <div className="flex flex-row flex-wrap justify-center gap-1.5">
                        {(Array.isArray(site.phase) ? site.phase : [site.phase]).filter(Boolean).map((p: string) => (
                          <CategoryBadge key={p} category="phase">{p}</CategoryBadge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="border-r align-middle p-4 text-sm">
                      <div className="flex items-center justify-center gap-4">
                        <span className="flex items-center gap-1.5 text-[#2E7D32] font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
                          완료 {site.completedCount}건
                        </span>
                        <span className="flex items-center gap-1.5 text-[#1565C0] font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1565C0]" />
                          진행중 {site.inProgressCount}건
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle p-4 pl-6 text-sm text-slate-600 leading-relaxed max-w-[400px]">
                      {site.mainContent || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <SearchX className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-slate-600 font-bold text-lg">등록된 현장 정보가 없습니다.</p>
                      <p className="text-slate-500 text-sm mt-1">[설정] 메뉴에서 현장을 추가해 주세요.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
