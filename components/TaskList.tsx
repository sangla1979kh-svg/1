
import React, { useState } from 'react';
import { Task, Status, Priority, SubTask } from '../types';
import { Calendar, User, MoreVertical, Edit3, Trash2, Filter, CheckCircle, AlertCircle, Clock, Search, ChevronDown, ChevronUp, Square, CheckSquare, RotateCcw, ArrowUpDown } from 'lucide-react';

interface Props {
  tasks: Task[];
  searchQuery?: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (task: Task) => void;
}

type SortOption = 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'priorityAsc';

const TaskList: React.FC<Props> = ({ tasks, searchQuery = '', onEdit, onDelete, onUpdateTask }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDateAsc');

  const isToday = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isThisWeek = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isThisMonth = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isOverdue = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(task.dueDate);
    date.setHours(0, 0, 0, 0);
    return date < today && task.status !== Status.COMPLETED;
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterDateRange('all');
    setSortBy('dueDateAsc');
  };

  const hasActiveFilters = filterStatus !== 'all' || filterPriority !== 'all' || filterDateRange !== 'all' || sortBy !== 'dueDateAsc';

  const priorityWeight = {
    [Priority.HIGH]: 3,
    [Priority.MEDIUM]: 2,
    [Priority.LOW]: 1,
  };

  const filteredTasks = tasks
    .filter(t => {
      const sMatch = filterStatus === 'all' || t.status === filterStatus;
      const pMatch = filterPriority === 'all' || t.priority === filterPriority;
      
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const searchMatch = !normalizedQuery || 
        t.title.toLowerCase().includes(normalizedQuery) || 
        t.description.toLowerCase().includes(normalizedQuery);
      
      let dMatch = true;
      if (filterDateRange === 'today') {
        dMatch = isToday(t.dueDate);
      } else if (filterDateRange === 'week') {
        dMatch = isThisWeek(t.dueDate);
      } else if (filterDateRange === 'month') {
        dMatch = isThisMonth(t.dueDate);
      } else if (filterDateRange === 'overdue') {
        dMatch = isOverdue(t);
      }
      
      return sMatch && pMatch && dMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'dueDateDesc') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === 'priorityDesc') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (sortBy === 'priorityAsc') {
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      }
      return 0;
    });

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filter Bar */}
      <div className="bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold tracking-tight text-sm md:text-base truncate">ตัวกรองและเรียงลำดับ</span>
              {searchQuery && (
                <span className="text-[10px] text-blue-400 font-medium truncate">ผลการค้นหา: "{searchQuery}"</span>
              )}
            </div>
          </div>
          
          {hasActiveFilters && (
            <button 
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-all border border-slate-700 active:scale-95 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างค่า
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase px-1">ช่วงเวลา</label>
            <select 
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none hover:border-slate-600 transition-all cursor-pointer w-full"
            >
              <option value="all">ทั้งหมด</option>
              <option value="today">ส่งวันนี้</option>
              <option value="week">สัปดาห์นี้</option>
              <option value="month">เดือนนี้</option>
              <option value="overdue">ค้างส่ง</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase px-1">สถานะ</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none hover:border-slate-600 transition-all cursor-pointer w-full"
            >
              <option value="all">ทั้งหมด</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase px-1">ความสำคัญ</label>
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none hover:border-slate-600 transition-all cursor-pointer w-full"
            >
              <option value="all">ทั้งหมด</option>
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase px-1 flex items-center gap-1">
              <ArrowUpDown className="w-2 h-2" /> เรียงตาม
            </label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 outline-none hover:border-slate-600 transition-all cursor-pointer w-full font-medium"
            >
              <option value="dueDateAsc">วันส่ง (ใกล้ที่สุด)</option>
              <option value="dueDateDesc">วันส่ง (ไกลที่สุด)</option>
              <option value="priorityDesc">ความสำคัญ (สูง - ต่ำ)</option>
              <option value="priorityAsc">ความสำคัญ (ต่ำ - สูง)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            {searchQuery ? <Search className="w-10 h-10 mb-4 opacity-20" /> : <Clock className="w-10 h-10 mb-4 opacity-20" />}
            <p className="italic font-medium text-sm">ไม่พบรายการงาน</p>
            <button 
              onClick={() => { resetFilters(); }}
              className="mt-2 text-blue-500 text-xs font-bold hover:underline"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={() => onEdit(task)} 
              onDelete={() => onDelete(task.id)}
              onUpdate={(updatedTask) => onUpdateTask(updatedTask)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; onEdit: () => void; onDelete: () => void; onUpdate: (t: Task) => void }> = ({ task, onEdit, onDelete, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'text-red-400 bg-red-400/10 border-red-400/20';
      case Priority.MEDIUM: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case Priority.LOW: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  const getStatusColor = (s: Status) => {
    switch (s) {
      case Status.NOT_STARTED: return 'bg-slate-800 text-slate-400';
      case Status.IN_PROGRESS: return 'bg-blue-500/20 text-blue-400';
      case Status.COMPLETED: return 'bg-emerald-500/20 text-emerald-400';
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDueDate = new Date(task.dueDate);
  taskDueDate.setHours(0, 0, 0, 0);
  
  const isOverdue = taskDueDate < today && task.status !== Status.COMPLETED;
  const isHighPriority = task.priority === Priority.HIGH;

  const completedSubTasks = (task.subTasks || []).filter(st => st.isCompleted).length;
  const totalSubTasks = (task.subTasks || []).length;
  const progressPercent = totalSubTasks === 0 ? 0 : Math.round((completedSubTasks / totalSubTasks) * 100);

  const toggleSubTask = (subTaskId: string) => {
    const updatedSubTasks = (task.subTasks || []).map(st => 
      st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdate({ ...task, subTasks: updatedSubTasks });
  };

  const handleStatusChange = (status: Status) => {
    onUpdate({ ...task, status });
  };

  return (
    <div className={`transition-all duration-300 group relative overflow-hidden rounded-2xl p-4 md:p-6 border ${
      isHighPriority && task.status !== Status.COMPLETED 
        ? 'bg-slate-900 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)] ring-1 ring-red-500/10' 
        : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
    } hover:scale-[1.015] hover:shadow-2xl hover:shadow-black/40 z-0 hover:z-10`}>
      {isHighPriority && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-80"></div>
      )}

      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className="flex flex-col gap-1.5 md:gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className={`text-[8px] md:text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-wider flex items-center gap-1 ${getPriorityColor(task.priority)} shrink-0`}>
              {isHighPriority && <AlertCircle className="w-2.5 h-2.5" />}
              {task.priority}
            </div>
            {isHighPriority && task.status !== Status.COMPLETED && (
              <span className="flex items-center gap-1 text-[8px] md:text-[10px] font-black text-red-500 animate-pulse bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10 shrink-0">
                ด่วน
              </span>
            )}
          </div>
          <h3 className={`text-base md:text-xl font-bold text-slate-100 flex items-center gap-2 truncate ${task.status === Status.COMPLETED ? 'line-through text-slate-600 opacity-60' : ''}`}>
            {task.title}
          </h3>
        </div>
        
        <div className="relative shrink-0">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
          >
            <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
              <div className="absolute right-0 top-10 bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl z-20 w-36 py-1.5 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { onEdit(); setShowActions(false); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                </button>
                <div className="h-px bg-slate-700 mx-2 my-1"></div>
                <button onClick={() => { onDelete(); setShowActions(false); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> ลบรายการ
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-slate-400 text-xs md:text-sm mb-4 md:mb-6 leading-relaxed line-clamp-2 min-h-[2.5rem]">
        {task.description || <span className="italic opacity-30">ไม่มีคำอธิบาย</span>}
      </p>

      {/* Sub-tasks Section */}
      {totalSubTasks > 0 && (
        <div className="mb-4 md:mb-6 space-y-2 md:space-y-3">
          <div className="flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5">
               ความคืบหน้า ({completedSubTasks}/{totalSubTasks})
            </span>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {isExpanded ? 'ซ่อน' : 'งานย่อย'}
              {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          </div>
          
          <div className="w-full bg-slate-800 h-1 md:h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {isExpanded && (
            <div className="grid grid-cols-1 gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {(task.subTasks || []).map(st => (
                <button 
                  key={st.id}
                  onClick={() => toggleSubTask(st.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    st.isCompleted 
                    ? 'bg-blue-500/5 border-blue-500/10 text-slate-500' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {st.isCompleted ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={`text-xs ${st.isCompleted ? 'line-through opacity-50' : ''}`}>
                    {st.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 md:gap-4 text-[10px] md:text-xs text-slate-400">
        <div className="flex items-center gap-2 bg-slate-950/40 p-2 md:p-3 rounded-xl border border-slate-800/30 min-w-0">
          <Calendar className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? 'text-red-500' : 'text-blue-500'}`} />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] text-slate-600 uppercase font-bold truncate">กำหนดส่ง</span>
            <span className={`truncate ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
              {new Date(task.dueDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/40 p-2 md:p-3 rounded-xl border border-slate-800/30 min-w-0">
          <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] text-slate-600 uppercase font-bold truncate">ผู้สั่ง</span>
            <span className="text-slate-200 truncate">{task.assigner}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-3">
        <div className="relative inline-block shrink-0">
          <select 
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            className={`text-[9px] md:text-[10px] font-black px-3 py-1.5 rounded-full border-none cursor-pointer outline-none appearance-none ${getStatusColor(task.status)} transition-all uppercase tracking-widest`}
          >
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {task.status === Status.COMPLETED ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[9px] md:text-[10px] bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10 shrink-0">
            <CheckCircle className="w-3 h-3" />
            เสร็จสิ้น
          </div>
        ) : isOverdue ? (
          <div className="flex items-center gap-1.5 text-red-400 font-bold text-[9px] md:text-[10px] bg-red-400/5 px-2 py-1 rounded-full border border-red-400/10 shrink-0">
            <AlertCircle className="w-3 h-3" />
            เกินกำหนด
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TaskList;
