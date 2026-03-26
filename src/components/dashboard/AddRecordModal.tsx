'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FILTER_OPTIONS, 
  REQUEST_TYPE_OPTIONS, 
  COMPENSATION_STATUS_OPTIONS,
  PROGRESS_OPTIONS 
} from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRecordModal({ isOpen, onClose }: AddRecordModalProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('guide');

  // Form states for Response Guide (기존 5개 필드 유지)
  const [guideForm, setGuideForm] = useState({
    region: '',
    phase: '',
    type: '',
    cause: '',
    action: '',
  });

  // Form states for Case Example (12개 필드로 확장)
  const [caseForm, setCaseForm] = useState({
    siteName: '',
    region: '',
    type: '',
    complaintContent: '',
    phase: '',
    complainant: '',
    requestContent: '',
    occurrenceDate: '',
    progress: '',
    details: '',
    compensationMethod: '',
    compensationAmount: '',
  });

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'responseGuides'), {
        ...guideForm,
        type: [guideForm.type],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: '대응 방안이 등록되었습니다.' });
      onClose();
      setGuideForm({ region: '', phase: '', type: '', cause: '', action: '' });
    } catch (error) {
      console.error('Error adding guide:', error);
      toast({ title: '등록 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'caseExamples'), {
        ...caseForm,
        type: [caseForm.type],
        requestContent: [caseForm.requestContent],
        compensationAmount: Number(caseForm.compensationAmount) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: '보상 사례가 등록되었습니다.' });
      onClose();
      // Reset form
      setCaseForm({
        siteName: '',
        region: '',
        type: '',
        complaintContent: '',
        phase: '',
        complainant: '',
        requestContent: '',
        occurrenceDate: '',
        progress: '',
        details: '',
        compensationMethod: '',
        compensationAmount: '',
      });
    } catch (error) {
      console.error('Error adding case:', error);
      toast({ title: '등록 중 오류가 발생했습니다.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline text-slate-900">새 데이터 등록</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="guide" className="rounded-lg">대응 방안</TabsTrigger>
            <TabsTrigger value="case" className="rounded-lg">보상 사례</TabsTrigger>
          </TabsList>

          {/* Response Guide Form */}
          <TabsContent value="guide" className="space-y-4 pt-4">
            <form onSubmit={handleGuideSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">지역</Label>
                  <Select 
                    onValueChange={(val) => setGuideForm(prev => ({ ...prev, region: val }))}
                    value={guideForm.region}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.region.options.filter(o => o !== '전체').map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">단계</Label>
                  <Select 
                    onValueChange={(val) => setGuideForm(prev => ({ ...prev, phase: val }))}
                    value={guideForm.phase}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="단계 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.phase.options.filter(o => o !== '전체').map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">유형</Label>
                <Select 
                    onValueChange={(val) => setGuideForm(prev => ({ ...prev, type: val }))}
                    value={guideForm.type}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.type.options.filter(o => o !== '전체').map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">원인</Label>
                <Input 
                  value={guideForm.cause}
                  onChange={(e) => setGuideForm(prev => ({ ...prev, cause: e.target.value }))}
                  placeholder="민원 발생 원인을 입력하세요"
                  required
                  className="bg-white border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">조치방안</Label>
                <Textarea 
                  value={guideForm.action}
                  onChange={(e) => setGuideForm(prev => ({ ...prev, action: e.target.value }))}
                  placeholder="조치 방안을 상세히 입력하세요 (번호형)"
                  className="min-h-[120px] bg-white border-slate-200"
                  required
                />
              </div>

              <DialogFooter className="pt-4 border-t gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6">취소</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 rounded-xl px-8">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  등록하기
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Case Example Form - 12개 필드 */}
          <TabsContent value="case" className="space-y-4 pt-4">
            <form onSubmit={handleCaseSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* 1. 현장명 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">현장명</Label>
                  <Input 
                    value={caseForm.siteName}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="현장명을 입력하세요"
                    required
                    className="bg-white border-slate-200"
                  />
                </div>
                
                {/* 2. 지역 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">지역</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, region: val }))}
                    value={caseForm.region}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.region.options.filter(o => o !== '전체').map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. 유형 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">유형</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, type: val }))}
                    value={caseForm.type}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.type.options.filter(o => o !== '전체').map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 5. 단계 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">단계</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, phase: val }))}
                    value={caseForm.phase}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="단계 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTER_OPTIONS.phase.options.filter(o => o !== '전체').map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 6. 민원인 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">민원인</Label>
                  <Input 
                    value={caseForm.complainant}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, complainant: e.target.value }))}
                    placeholder="민원인 구분 (예: 00상가 번영회)"
                    required
                    className="bg-white border-slate-200"
                  />
                </div>

                {/* 8. 발생 일시 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">발생 일시</Label>
                  <Input 
                    type="date"
                    value={caseForm.occurrenceDate}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, occurrenceDate: e.target.value }))}
                    required
                    className="bg-white border-slate-200"
                  />
                </div>

                {/* 9. 진행경과 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">진행경과</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, progress: val }))}
                    value={caseForm.progress}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="진행 상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRESS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 7. 요구사항 (기존 requestType 매핑) */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">요구사항</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, requestContent: val }))}
                    value={caseForm.requestContent}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="요구 사항 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 11. 보상방식 (기존 compensationStatus 매핑) */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">보상방식</Label>
                  <Select 
                    onValueChange={(val) => setCaseForm(prev => ({ ...prev, compensationMethod: val }))}
                    value={caseForm.compensationMethod}
                    required
                  >
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue placeholder="보상 방식 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPENSATION_STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 12. 보상금액 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">보상금액(원)</Label>
                  <Input 
                    type="number"
                    value={caseForm.compensationAmount}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, compensationAmount: e.target.value }))}
                    placeholder="숫자만 입력 (예: 1000000)"
                    className="bg-white border-slate-200"
                  />
                </div>
              </div>

              {/* 4. 민원 내용 (Full Width) */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">민원 내용</Label>
                <Textarea 
                  value={caseForm.complaintContent}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, complaintContent: e.target.value }))}
                  placeholder="민원 발생 배경과 내용을 입력하세요"
                  required
                  className="bg-white border-slate-200 min-h-[80px]"
                />
              </div>

              {/* 10. 상세내용 (Full Width) */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">상세내용 (합의내용/링크 등)</Label>
                <Textarea 
                  value={caseForm.details}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="조치 상세 내역 또는 관련 자료 링크를 입력하세요"
                  className="bg-white border-slate-200 min-h-[80px]"
                />
              </div>

              <DialogFooter className="pt-4 border-t gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6">취소</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-8">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  등록하기
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
