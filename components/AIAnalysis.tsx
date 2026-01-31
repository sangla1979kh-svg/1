
import React, { useState, useCallback } from 'react';
import { Task, AIAnalysisResult } from '../types';
import { analyzeTasks } from '../services/aiService';
import { BrainCircuit, Sparkles, Loader2, AlertTriangle, CalendarCheck, BarChart2 } from 'lucide-react';

interface Props {
  tasks: Task[];
}

const AIAnalysis: React.FC<Props> = ({ tasks }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeTasks(tasks);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-6 md:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-blue-500/30">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <BrainCircuit size={100} className="md:w-[120px] md:h-[120px]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-blue-100 font-medium tracking-widest uppercase text-[10px] md:text-xs">AI Assistant</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">วิเคราะห์ภาระงาน</h2>
          <p className="text-blue-100/80 max-w-sm mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
            ให้ปัญญาประดิษฐ์ช่วยวิเคราะห์ความเร่งด่วน และจัดแผนการทำงานที่เหมาะสมสำหรับคุณ
          </p>
          <button 
            onClick={handleAnalyze}
            disabled={loading || tasks.length === 0}
            className="bg-white text-blue-900 px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm md:text-base font-bold shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <BrainCircuit className="w-4 h-4 md:w-5 md:h-5" />}
            {loading ? 'กำลังวิเคราะห์...' : 'เริ่มวิเคราะห์ข้อมูล'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="grid md:grid-cols-12 gap-4 md:gap-6 animate-in slide-in-from-bottom-6 duration-500">
          {/* Workload Score Card */}
          <div className="md:col-span-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center">
             <BarChart2 className="text-blue-500 w-8 h-8 mb-2" />
             <h3 className="text-slate-400 font-semibold text-sm mb-2">คะแนนภาระงานรวม</h3>
             <div className="text-5xl md:text-6xl font-black text-slate-100 mb-2 leading-none">
                {result.workloadScore}<span className="text-xl md:text-2xl text-slate-600">/10</span>
             </div>
             <div className={`px-4 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide ${
               result.workloadScore > 7 ? 'bg-red-500/10 text-red-400' : 
               result.workloadScore > 4 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
             }`}>
               {result.workloadScore > 7 ? 'งานล้นมือ' : result.workloadScore > 4 ? 'ปานกลาง' : 'เบาบาง'}
             </div>
          </div>

          {/* AI Summary Card */}
          <div className="md:col-span-8 bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-3 text-blue-400 shrink-0">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-bold uppercase tracking-wide text-[10px]">สรุปจาก AI</h3>
             </div>
             <p className="text-slate-200 leading-relaxed italic text-base md:text-lg">"{result.summary}"</p>
          </div>

          {/* Priority Checklist */}
          <div className="md:col-span-12 lg:col-span-6 bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-800 shadow-xl">
             <div className="flex items-center gap-2 mb-4 md:mb-6 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-bold text-sm md:text-base uppercase tracking-tight">งานที่ต้องทำทันที</h3>
             </div>
             <ul className="space-y-3">
               {result.priorityTasks.map((t, i) => (
                 <li key={i} className="flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-red-950/20 border border-red-900/10">
                    <div className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                    <span className="font-bold text-red-100 text-xs md:text-sm line-clamp-1">{t}</span>
                 </li>
               ))}
               {result.priorityTasks.length === 0 && <li className="text-slate-600 italic text-xs md:text-sm px-1">ไม่มีงานเร่งด่วนพิเศษในขณะนี้</li>}
             </ul>
          </div>

          {/* Suggested Schedule */}
          <div className="md:col-span-12 lg:col-span-6 bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-800 shadow-xl">
             <div className="flex items-center gap-2 mb-4 md:mb-6 text-emerald-400">
                <CalendarCheck className="w-4 h-4" />
                <h3 className="font-bold text-sm md:text-base uppercase tracking-tight">แผนการทำงานแนะนำ</h3>
             </div>
             <div className="relative space-y-4 md:space-y-6 ml-1">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-800/50"></div>
                {result.suggestedSchedule.map((item, i) => (
                  <div key={i} className="relative flex gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-slate-950 border-[3px] border-emerald-600 z-10 shrink-0"></div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs md:text-sm">{item.taskTitle}</h4>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 leading-relaxed">{item.reason}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="py-16 md:py-20 text-center space-y-4 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-full flex items-center justify-center">
            <BrainCircuit className="text-slate-600 w-6 h-6 md:w-8 md:h-8" />
          </div>
          <p className="text-slate-500 text-sm px-4">กดปุ่ม "เริ่มวิเคราะห์ข้อมูล" เพื่อรับคำแนะนำรายบุคคลจาก AI</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
