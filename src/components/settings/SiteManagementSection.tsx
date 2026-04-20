
'use client';

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy, deleteDoc, getDocs, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2, Edit2, PlusCircle, RotateCcw, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Site, SiteImage } from '@/lib/types';
import { compressImageToBase64 } from '@/lib/imageUtils';

const REGION_OPTIONS = [
  '서울', '경기도', '인천', '대전', '대구', '부산', '울산', '광주', '세종', 
  '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주도'
];

const PHASE_OPTIONS = ['착공전', '토공', '골조', '마감', '준공'];
const REGION_TYPE_OPTIONS = ['주거', '상업', '공업', '민감'];

export default function SiteManagementSection() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Site>>({
    region: '',
    regionType: '주거',
    siteName: '',
    phase: [],
    completedCount: 0,
    inProgressCount: 0,
    mainContent: '',
    order: 0
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [images, setImages] = useState<{fileName: string, base64: string}[]>([]);
  const [existingImages, setExistingImages] = useState<SiteImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const sitesQuery = useMemoFirebase(() => query(collection(db, 'sites'), orderBy('order', 'asc')), [db]);
  const { data: sites, isLoading } = useCollection(sitesQuery);

  const handleInputChange = (field: keyof Site, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      region: '',
      regionType: '주거',
      siteName: '',
      phase: [],
      completedCount: 0,
      inProgressCount: 0,
      mainContent: '',
      order: sites ? sites.length : 0
    });
    setEditingId(null);
    setImages([]);
    setExistingImages([]);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingQuota = 5 - existingImages.length - images.length;
      const filesToProcess = newFiles.slice(0, remainingQuota);
      
      setIsUploading(true);
      try {
        const compressed = await Promise.all(
          filesToProcess.map(async file => {
            const base64 = await compressImageToBase64(file);
            return { fileName: file.name, base64 };
          })
        );
        setImages(prev => [...prev, ...compressed]);
      } catch (e) {
        console.error(e);
        toast({ title: '오류', description: '이미지 압축 중 오류가 발생했습니다.', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeNewImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!editingId) return;
    try {
      await deleteDoc(doc(db, `sites/${editingId}/siteImages`, imageId));
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: '이미지 삭제', description: '기존 이미지가 삭제되었습니다.' });
    } catch (e) {
      console.error(e);
      toast({ title: '오류', description: '이미지 삭제에 실패했습니다.', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { region, siteName, phase, completedCount = 0, inProgressCount = 0 } = formData;

    if (!region || !siteName || !phase || (Array.isArray(phase) && phase.length === 0)) {
      toast({ title: "입력 오류", description: "필수 항목을 모두 입력해 주세요.", variant: "destructive" });
      return;
    }

    if (Number(completedCount) < 0 || Number(inProgressCount) < 0) {
      toast({ title: "입력 오류", description: "건수는 0 이상의 숫자여야 합니다.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    const payload = {
      ...formData,
      completedCount: Number(completedCount),
      inProgressCount: Number(inProgressCount),
      order: Number(formData.order || 0),
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid
    };

    try {
      let targetSiteId = editingId;
      if (editingId) {
        updateDocumentNonBlocking(doc(db, 'sites', editingId), payload);
        toast({ title: "성공", description: "현장 정보가 수정되었습니다." });
      } else {
        const docRef = await addDoc(collection(db, 'sites'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user?.uid
        });
        targetSiteId = docRef.id;
        toast({ title: "성공", description: "현장 정보가 등록되었습니다." });
      }
      
      // Handle new subcollection images
      if (targetSiteId && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await addDoc(collection(db, `sites/${targetSiteId}/siteImages`), {
            base64: images[i].base64,
            fileName: images[i].fileName,
            order: existingImages.length + i,
            createdAt: serverTimestamp()
          });
        }
      }
      
      setIsUploading(false);
      handleReset();
    } catch (e) {
      console.error(e);
      toast({ title: '오류', description: '현장 정보를 저장하는 중 오류가 발생했습니다.', variant: 'destructive' });
      setIsUploading(false);
    }
  };

  const handleEdit = async (site: Site) => {
    setFormData({
      region: site.region,
      regionType: site.regionType,
      siteName: site.siteName,
      phase: site.phase,
      completedCount: site.completedCount,
      inProgressCount: site.inProgressCount,
      mainContent: site.mainContent,
      order: site.order
    });
    setEditingId(site.id);
    setImages([]);
    
    // Fetch existing images from subcollection
    const imagesQuery = query(collection(db, `sites/${site.id}/siteImages`), orderBy('order', 'asc'));
    getDocs(imagesQuery).then(snap => {
      setExistingImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as SiteImage)));
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmId) {
      try {
        // Cascade delete subcollection images
        const imagesQuery = query(collection(db, `sites/${deleteConfirmId}/siteImages`));
        const snap = await getDocs(imagesQuery);
        for (const docSnap of snap.docs) {
          await deleteDoc(docSnap.ref);
        }
      } catch (e) {
        console.warn('Failed to delete subcollection images', e);
      }
      
      deleteDocumentNonBlocking(doc(db, 'sites', deleteConfirmId));
      toast({ title: "삭제 완료", description: "현장 정보가 삭제되었습니다." });
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {editingId ? <Edit2 className="h-5 w-5 text-amber-500" /> : <PlusCircle className="h-5 w-5 text-primary" />}
            현장 {editingId ? '수정' : '신규 추가'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">지역 *</label>
                <Select value={formData.region} onValueChange={(val) => handleInputChange('region', val)}>
                  <SelectTrigger><SelectValue placeholder="지역 선택" /></SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">지역 유형 *</label>
                <Select value={formData.regionType} onValueChange={(val) => handleInputChange('regionType', val)}>
                  <SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger>
                  <SelectContent>
                    {REGION_TYPE_OPTIONS.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">현장명 *</label>
                <Input
                  placeholder="현장명 입력 (예: 강릉자이르네 디오션)"
                  value={formData.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600">단계 (복수 선택) *</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  {PHASE_OPTIONS.map(o => (
                    <div key={o} className="flex items-center space-x-2">
                      <Checkbox
                        id={`phase-${o}`}
                        checked={Array.isArray(formData.phase) ? formData.phase.includes(o) : formData.phase === o}
                        onCheckedChange={(checked) => {
                          const currentPhase = Array.isArray(formData.phase) ? formData.phase : (formData.phase ? [formData.phase] : []);
                          if (checked) {
                            handleInputChange('phase', [...currentPhase, o]);
                          } else {
                            handleInputChange('phase', currentPhase.filter(p => p !== o));
                          }
                        }}
                      />
                      <label htmlFor={`phase-${o}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        {o}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">완료 건수</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.completedCount}
                  onChange={(e) => handleInputChange('completedCount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">진행중 건수</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.inProgressCount}
                  onChange={(e) => handleInputChange('inProgressCount', e.target.value)}
                />
              </div>

              <div className="space-y-2 lg:col-span-2 text-sm">
                <label className="font-bold text-slate-600">주요 내용</label>
                <Textarea
                  placeholder="주요 내용을 입력하세요"
                  value={formData.mainContent}
                  onChange={(e) => handleInputChange('mainContent', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2 lg:col-span-3 pb-2 z-10 w-full relative h-[border-box]">
                <label className="text-sm font-bold text-slate-600 block">관련 이미지 첨부 (최대 5장)</label>
                <div className="border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-6 text-center cursor-pointer relative">
                  <Input type="file" multiple accept="image/jpeg, image/png, image/gif, image/webp" onChange={handleImageChange} disabled={isUploading || (images.length + existingImages.length) >= 5} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <p className="text-sm text-slate-600">이미지를 드래그하여 놓거나 클릭하여 선택하세요 (최대 5장, JPG/PNG 형식만)</p>
                </div>
                {(images.length > 0 || existingImages.length > 0) && (
                  <div className="flex flex-wrap gap-4 mt-4 p-4 border rounded-lg bg-slate-50 relative">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${img.id || idx}`} className="relative group w-24 h-24 border rounded shadow-sm bg-white overflow-hidden">
                        <img src={img.base64} alt={`기존 첨부 ${idx}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.map((img, idx) => (
                      <div key={`new-${idx}`} className="relative group w-24 h-24 border rounded shadow-sm bg-white overflow-hidden flex items-center justify-center">
                        <img src={img.base64} alt={`새 첨부 ${idx}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">표시 순서</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2" disabled={isUploading}>
                <RotateCcw className="h-4 w-4" /> 초기화
              </Button>
              <Button type="submit" className="gap-2 px-8" disabled={isUploading}>
                {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> 업로드 중...</> : editingId ? <><Save className="h-4 w-4" /> 저장</> : <><PlusCircle className="h-4 w-4" /> 등록</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white py-4">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <div className="h-5 w-1 bg-primary rounded-full" />
            현장 목록
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table className="border-collapse min-w-[800px]">
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[60px] text-sm">순서</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 w-[180px] text-sm">지역</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-sm">현장명</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[160px] text-sm">단계</TableHead>
                  <TableHead className="h-12 font-bold border-r text-slate-700 text-center w-[160px] text-sm">민원 건수(완료/진행)</TableHead>
                  <TableHead className="h-12 font-bold text-slate-700 text-sm text-center w-[120px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites && sites.length > 0 ? (
                  sites.map((site) => (
                    <TableRow key={site.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="border-r text-center text-sm text-slate-500">{site.order}</TableCell>
                      <TableCell className="border-r p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-900">{site.region}</span>
                          <span className="text-xs text-slate-500">{site.regionType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="border-r p-4 font-medium text-slate-800">
                        {site.siteName}
                      </TableCell>
                      <TableCell className="border-r text-center p-4">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {(Array.isArray(site.phase) ? site.phase : [site.phase]).filter(Boolean).map((p: string) => (
                            <Badge key={p} variant="outline" className="rounded-full bg-slate-50 border-slate-200">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="border-r text-center p-4">
                        <div className="flex justify-center gap-2 text-xs font-bold">
                          <span className="text-emerald-600">{site.completedCount}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-blue-600">{site.inProgressCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(site as Site)} className="text-slate-400 hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(site.id)} className="text-slate-400 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                      등록된 현장 정보가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="현장 정보 삭제"
        description="정말 이 현장 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </div>
  );
}
