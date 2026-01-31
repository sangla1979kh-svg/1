
import React, { useState, useEffect } from 'react';
import { Task, Status, Priority, SubTask } from '../types';
import { X, Plus, Trash2, ListChecks, Calendar, User, AlignLeft } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (task: any) => void;
  initialData?: Task;
}

const TaskForm: React.FC<Props> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    assigner: '',
    priority: Priority.MEDIUM,
    status: Status.NOT_STARTED,
    subTasks: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        assignedDate: initialData.assignedDate,
        dueDate: initialData.dueDate,
        assigner: initialData.assigner,
        priority: initialData.priority,
        status: initialData.status,
        subTasks: initialData.subTasks || []
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  const addSubTask = () => {
    const newSubTask: SubTask = {
      id: crypto.randomUUID(),
      title: '',
      isCompleted: false
    };
    setFormData({ ...formData, subTasks: [...formData.subTasks, newSubTask] });
  };

  const updateSubTaskTitle = (id: string, title: string) => {
    const updated = formData.subTasks.map(st => st.id === id ? { ...st, title } : st);
    setFormData({ ...formData, subTasks: updated });
  };

  const removeSubTask = (id: string) => {
    setFormData({ ...formData, subTasks: formData.subTasks.filter(st => st.id !== id) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-slate-100">{initialData ? 'แก้ไขข้อมูลงาน' : 'เพิ่มงานใหม่'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">ชื่องาน</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="ชื่องานของคุณ..."
              className="w-full px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
              <AlignLeft className="w-3 h-3" /> รายละเอียด
            </label>
            <textarea 
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="ระบุรายละเอียดเพิ่มเติม..."
              className="w-full px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 placeholder:text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none text-sm"
            />
          </div>

          {/* Sub-tasks Management */}
          <div className="space-y-2 bg-slate-950/30 p-3 rounded-2xl border border-slate-800/50">
             <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                   <ListChecks className="w-3 h-3 text-blue-500" /> รายการย่อย ({formData.subTasks.length})
                </label>
                <button 
                  type="button" 
                  onClick={addSubTask}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors uppercase tracking-wider"
                >
                  <Plus className="w-3 h-3" /> เพิ่ม
                </button>
             </div>
             <div className="space-y-1.5">
                {formData.subTasks.map((st, index) => (
                  <div key={st.id} className="flex items-center gap-2 animate-in slide-in-from-left-1 duration-200">
                     <div className="text-[9px] font-black text-slate-700 w-3 shrink-0">{index + 1}</div>
                     <input 
                       type="text"
                       value={st.title}
                       onChange={(e) => updateSubTaskTitle(st.id, e.target.value)}
                       placeholder="สิ่งที่ต้องทำ..."
                       className="flex-1 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-200 focus:border-blue-500 outline-none transition-all"
                     />
                     <button 
                       type="button" 
                       onClick={() => removeSubTask(st.id)}
                       className="p-1.5 text-slate-600 hover:text-red-500 transition-colors"
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
                ))}
                {formData.subTasks.length === 0 && (
                  <p className="text-[10px] text-slate-600 italic ml-1">ยังไม่มีงานย่อย</p>
                )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> วันที่สั่ง
              </label>
              <input 
                required
                type="date"
                value={formData.assignedDate}
                onChange={(e) => setFormData({...formData, assignedDate: e.target.value})}
                className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 focus:border-blue-500 outline-none text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-red-500 uppercase ml-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> กำหนดส่ง
              </label>
              <input 
                required
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-red-900/30 text-slate-100 focus:border-red-500 outline-none text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
              <User className="w-3 h-3" /> ผู้มอบหมาย
            </label>
            <input 
              type="text"
              value={formData.assigner}
              onChange={(e) => setFormData({...formData, assigner: e.target.value})}
              placeholder="ชื่อผู้สั่งงาน..."
              className="w-full px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 placeholder:text-slate-700 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">ความสำคัญ</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as Priority})}
                className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 focus:border-blue-500 outline-none text-xs appearance-none cursor-pointer"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">สถานะ</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as Status})}
                className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 focus:border-blue-500 outline-none text-xs appearance-none cursor-pointer"
              >
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </form>

        <div className="px-5 py-4 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-900/50 backdrop-blur-md">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-colors text-sm"
          >
            ยกเลิก
          </button>
          <button 
            type="submit"
            onClick={(e) => {
               const form = (e.target as HTMLButtonElement).closest('div')?.previousElementSibling as HTMLFormElement;
               if (form) form.requestSubmit();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98] text-sm uppercase tracking-wide"
          >
            {initialData ? 'บันทึก' : 'สร้างงาน'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
