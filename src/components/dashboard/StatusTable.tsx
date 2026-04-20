
'use client';

import React, { useState, useEffect } from 'react';
import { Site, SiteImage } from '@/lib/types';
import { Loader2, SearchX, ChevronRight, ChevronDown, X } from 'lucide-react';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatusTableProps {
  data: Site[] | null;
  isLoading: boolean;
}

const SiteImagesRowContent = ({ siteId, siteName }: { siteId: string, siteName: string }) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const db = useFirestore();

  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
      try {
        if (!db) return;
        const q = query(collection(db, `sites/${siteId}/siteImages`), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        if (isMounted) {
          setImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as SiteImage)));
        }
      } catch (e) {
        console.error("Failed to fetch site images", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchImages();
    return () => { isMounted = false; };
  }, [siteId]);

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  }

  return (
    <>
      {images.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-6">
          {images.map((img, idx) => (
            <div key={img.id || idx} className="block max-w-full cursor-zoom-in" onClick={() => setFullscreenImage(img.base64)}>
              <img 
                src={img.base64} 
                alt={`${siteName} 이미지 ${idx + 1}`} 
                className="rounded-lg shadow-sm border border-slate-200 max-h-[400px] object-contain hover:shadow-md transition-shadow"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <p className="mb-1 text-base">등록된 이미지가 없습니다.</p>
          <p className="text-sm">[설정] &gt; [현장 관리]에서 이미지를 추가해 주세요.</p>
        </div>
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 text-center cursor-zoom-out" onClick={() => setFullscreenImage(null)}>
          <button className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white" onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}>
            <X className="h-8 w-8" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="원본 이미지" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default function StatusTable({ data, isLoading }: StatusTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

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
                  <React.Fragment key={site.id}>
                    <TableRow 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedId === site.id ? 'bg-blue-50/30' : ''}`}
                      onClick={() => toggleExpand(site.id)}
                    >
                      <TableCell className={`border-r text-center align-middle p-4 font-bold text-slate-700 ${expandedId === site.id ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}>
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
                      <TableCell className="align-middle p-4 pl-6 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-4">
                          <span className="leading-relaxed max-w-[400px] line-clamp-2">
                            {site.mainContent || '-'}
                          </span>
                          <div className="text-slate-400">
                            {expandedId === site.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === site.id && (
                      <TableRow className="bg-slate-50/20">
                        <TableCell colSpan={5} className="p-0 border-b-0 border-l-4 border-l-primary">
                          <div className="p-6 md:p-8 animate-in fade-in slide-in-from-top-2 duration-300">
                            <SiteImagesRowContent siteId={site.id} siteName={site.siteName} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
