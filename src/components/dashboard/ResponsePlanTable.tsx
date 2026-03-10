'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ResponsePlanTableProps {
  data: any[] | null;
  isLoading: boolean;
  isFilterActive: boolean;
}

export default function ResponsePlanTable({ data, isLoading, isFilterActive }: ResponsePlanTableProps) {
  // --- Render Search Result View ---
  if (isFilterActive) {
    return (
      <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm h-full">
        <CardHeader className="bg-white border-b py-4">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-primary rounded-full" />
            대응 방안
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table className="border-collapse">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="font-bold border-r text-slate-700 text-center w-[100px]">지역</TableHead>
                  <TableHead className="font-bold border-r text-slate-700 text-center w-[100px]">단계</TableHead>
                  <TableHead className="font-bold border-r text-slate-700 text-center w-[150px]">유형</TableHead>
                  <TableHead className="font-bold border-r text-slate-700 text-center">원인</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">조치사항</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="border-r text-center align-top p-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                        {row.region}
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4 text-sm font-bold text-primary whitespace-nowrap">
                        {row.phase}
                      </TableCell>
                      <TableCell className="border-r text-center align-top p-4">
                        <div className="flex flex-wrap justify-center gap-1">
                          {Array.isArray(row.type) ? row.type.map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-[10px] px-1 font-bold whitespace-nowrap">{t}</Badge>
                          )) : <Badge variant="secondary" className="text-[10px] px-1 font-bold whitespace-nowrap">{row.type}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="border-r align-top p-4 text-sm leading-relaxed">
                        {row.cause}
                      </TableCell>
                      <TableCell className="align-top p-4 text-sm leading-relaxed">
                        {row.action}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24 text-slate-400">
                      등록된 대응 방안 데이터가 없습니다.
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

  // --- Render Default Process Flow View ---
  return (
    <Card className="rounded-xl border-slate-200 overflow-hidden shadow-sm">
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <div className="h-5 w-1 bg-primary rounded-full" />
          민원 대응 프로세스
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#F1F5F9] border-b">
              <th className="p-4 text-center font-bold border-r text-slate-700">사전업무</th>
              <th className="p-4 text-center font-bold border-r text-slate-700">민원접수</th>
              <th className="p-4 text-center font-bold border-r text-slate-700">민원대응</th>
              <th className="p-4 text-center font-bold border-r text-slate-700">협상 전략</th>
              <th className="p-4 text-center font-bold text-slate-700">보상협의</th>
            </tr>
          </thead>
          <tbody>
            <tr className="align-top">
              {/* 사전업무 */}
              <td className="p-5 border-r min-w-[200px]">
                <div className="space-y-4">
                  <div>
                    <p className="font-bold mb-1">① 주변 환경 조사</p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 거주자 조사 <span className="text-[#6B7280]">(BM)</span></li>
                      <li>• 예상 소음도 조사 <span className="text-[#6B7280]">(공사)</span></li>
                      <li>• 사전 건물 조사 <span className="text-[#6B7280]">(공사)</span></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">② 환경 인허가<span className="text-[#6B7280]">(공무)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 비산먼지 발생사업 신고</li>
                      <li>• 특정공사 사전 신고</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">③ 사전업무 진행절차 <span className="text-[#6B7280]">(CM, 공무)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 민원 보상 예산비용</li>
                      <li>• 소음, 비산먼지 대책 수립</li>
                      <li>• 환경 인허가 신청 및 착공</li>
                    </ul>
                  </div>
                </div>
              </td>
              
              {/* 민원접수 */}
              <td className="p-5 border-r min-w-[200px]">
                <div className="space-y-4">
                  <div>
                    <p className="font-bold mb-1">① 민원 접수<span className="text-[#6B7280]">(최초 대면자)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 대표번호, 지자체, 방문 등</li>
                      <li>• 초기 기록 : 일시, 민원인 정보</li>
                      <li>• 긴급도 판단 : <span className="text-[#6B7280]">BM</span></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">② 민원 분석 및 보고<span className="text-[#6B7280]">(BM)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 민원인 면담 및 현장확인</li>
                      <li>• 원인 파악 및 CM 현황보고</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">③ 민원 분류 및 담당자 지정<span className="text-[#6B7280]">(CM)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 일반민원</li>
                      <li>• 특이민원</li>
                    </ul>
                  </div>
                </div>
              </td>

              {/* 민원대응 */}
              <td className="p-5 border-r min-w-[200px]">
                <div className="space-y-4">
                  <div>
                    <p className="font-bold mb-1">① 내부 보고<span className="text-[#6B7280]">(접수자 → CM)</span></p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">② 공사협의<span className="text-[#6B7280]">(공사)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 소음민원 대응</li>
                      <li>• 분진민원 대응</li>
                      <li>• 진동민원 대응</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">③ 기관협의<span className="text-[#6B7280]">(공무)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 조치계획서</li>
                      <li>• 환경인허가 변경</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">④ 노조/언론 협의 <span className="text-[#6B7280]">(공무, CM)</span></p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">⑤ 지역 거주민 협의 <span className="text-[#6B7280]">(BM)</span></p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">⑥ 민원일지 관리 <span className="text-[#6B7280]">(BM)</span></p>
                  </div>
                </div>
              </td>

              {/* 협상 전략 */}
              <td className="p-5 border-r min-w-[200px]">
                <div className="space-y-4">
                  <div>
                    <p className="font-bold mb-1">① 보상 방안 결정<span className="text-[#6B7280]">(CM)</span></p>
                    <ul className="text-sm text-slate-600 space-y-1 pl-1">
                      <li>• 공법 및 작업시간 협상 <span className="text-[#6B7280]">(공사)</span></li>
                      <li>• 시설보수 범위 협상 <span className="text-[#6B7280]">(공무)</span></li>
                      <li>• 현금보상 범위 협상 <span className="text-[#6B7280]">(BM)</span></li>
                      <li>• 분쟁조정 및 소송 <span className="text-[#6B7280]">(BM)</span></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold mb-1">② 보험접수<span className="text-[#6B7280]">(BM)</span></p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">③ 회계처리 / 집행<span className="text-[#6B7280]">(BM)</span></p>
                  </div>
                </div>
              </td>

              {/* 보상협의 */}
              <td className="p-5 min-w-[200px]">
                <div className="space-y-4">
                  <div>
                    <p className="font-bold mb-1">① 합의서 작성<span className="text-[#6B7280]">(BM)</span></p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">② 민원 보상 품의<span className="text-[#6B7280]">(공무)</span></p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
