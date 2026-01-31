
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, LayoutDashboard, ListTodo, Plus, BrainCircuit, CheckCircle2, Clock, AlertCircle, Bell, BellOff, Search } from 'lucide-react';
import { Task, Status, Priority } from './types';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import AIAnalysis from './components/AIAnalysis';
import ConfirmModal from './components/ConfirmModal';
import { requestNotificationPermission, checkDueTasks } from './services/notificationService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'ai'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial dummy data
  useEffect(() => {
    const saved = localStorage.getItem('zentask_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      const initial: Task[] = [
        {
          id: '1',
          title: 'โครงงานวิทยาศาสตร์',
          description: 'จัดทำบอร์ดและรายงานสรุปผลการทดลอง',
          assignedDate: '2024-05-10',
          dueDate: '2024-05-25',
          assigner: 'อ.สมชาย',
          priority: Priority.HIGH,
          status: Status.IN_PROGRESS,
          subTasks: [
            { id: 'st1', title: 'เตรียมอุปกรณ์ทดลอง', isCompleted: true },
            { id: 'st2', title: 'สรุปผลการวิจัย', isCompleted: false },
            { id: 'st3', title: 'จัดบอร์ดนิทรรศการ', isCompleted: false }
          ]
        },
        {
          id: '2',
          title: 'การบ้านคณิตศาสตร์ บทที่ 3',
          description: 'แบบฝึกหัดท้ายบทข้อ 1-20',
          assignedDate: '2024-05-15',
          dueDate: '2024-05-20',
          assigner: 'อ.วิภา',
          priority: Priority.MEDIUM,
          status: Status.NOT_STARTED,
          subTasks: [
            { id: 'st4', title: 'ทำข้อ 1-10', isCompleted: false },
            { id: 'st5', title: 'ทำข้อ 11-20', isCompleted: false }
          ]
        }
      ];
      setTasks(initial);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zentask_tasks', JSON.stringify(tasks));
    if (notificationsEnabled) {
      checkDueTasks(tasks);
    }
  }, [tasks, notificationsEnabled]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: crypto.randomUUID() };
    setTasks(prev => [...prev, newTask]);
    setIsFormOpen(false);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteClick = (id: string) => {
    const task = tasks.find(t => id === t.id);
    if (task) setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    }
  };

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      checkDueTasks(tasks);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query && activeTab !== 'list') {
      setActiveTab('list');
    }
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === Status.COMPLETED).length,
    inProgress: tasks.filter(t => t.status === Status.IN_PROGRESS).length,
    urgent: tasks.filter(t => t.priority === Priority.HIGH && t.status !== Status.COMPLETED).length,
  }), [tasks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-4 py-2 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg">
              <CheckCircle2 className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-slate-100 tracking-tight hidden sm:block">ZenTask <span className="text-blue-500">AI</span></h1>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="ค้นหางาน..."
              className="block w-full pl-10 pr-4 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-full text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all focus:bg-slate-900"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <button 
              onClick={handleToggleNotifications}
              title={notificationsEnabled ? "เปิดแจ้งเตือนอยู่" : "ปิดแจ้งเตือน"}
              className={`p-1.5 md:p-2 rounded-full border transition-all ${notificationsEnabled ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4 md:w-5 md:h-5" /> : <BellOff className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            <button 
              onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-full transition-all shadow-lg active:scale-95 text-xs md:text-sm"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline font-medium">เพิ่มงาน</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 pb-28 md:pb-8">
        {activeTab === 'dashboard' && <Dashboard tasks={tasks} stats={stats} />}
        {activeTab === 'list' && (
          <TaskList 
            tasks={tasks} 
            searchQuery={searchQuery}
            onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }} 
            onDelete={handleDeleteClick}
            onUpdateTask={updateTask}
          />
        )}
        {activeTab === 'ai' && <AIAnalysis tasks={tasks} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 flex justify-around md:justify-center md:gap-12 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-20 transition-all">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard />} 
          label="หน้าหลัก" 
        />
        <NavButton 
          active={activeTab === 'list'} 
          onClick={() => setActiveTab('list')} 
          icon={<ListTodo />} 
          label="งานทั้งหมด" 
        />
        <NavButton 
          active={activeTab === 'ai'} 
          onClick={() => setActiveTab('ai')} 
          icon={<BrainCircuit />} 
          label="วิเคราะห์ AI" 
        />
      </nav>

      {/* Modals */}
      {isFormOpen && (
        <TaskForm 
          onClose={() => { setIsFormOpen(false); setEditingTask(undefined); }} 
          onSubmit={editingTask ? updateTask : addTask} 
          initialData={editingTask}
        />
      )}

      {taskToDelete && (
        <ConfirmModal 
          title="ยืนยันการลบงาน"
          message={`คุณแน่ใจหรือไม่ว่าต้องการลบงาน "${taskToDelete.title}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
          onConfirm={confirmDelete}
          onCancel={() => setTaskToDelete(null)}
          confirmLabel="ลบงาน"
          cancelLabel="ยกเลิก"
          variant="danger"
        />
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-1.5 md:p-2 rounded-xl transition-all min-w-[64px] md:min-w-[72px] ${active ? 'text-blue-500 bg-blue-500/10 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5 md:w-6 md:h-6' }) : icon}
    <span className="text-[10px] md:text-xs mt-1 font-medium">{label}</span>
  </button>
);

export default App;
