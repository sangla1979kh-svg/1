
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Task, Status, Priority } from '../types';
import { AlertCircle, Clock, CheckCircle, List, Bell } from 'lucide-react';

interface Props {
  tasks: Task[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    urgent: number;
  };
}

const Dashboard: React.FC<Props> = ({ tasks, stats }) => {
  const priorityData = [
    { name: 'สูง', value: tasks.filter(t => t.priority === Priority.HIGH).length, color: '#ef4444' },
    { name: 'ปานกลาง', value: tasks.filter(t => t.priority === Priority.MEDIUM).length, color: '#f59e0b' },
    { name: 'ต่ำ', value: tasks.filter(t => t.priority === Priority.LOW).length, color: '#10b981' },
  ];

  const statusData = [
    { name: 'ยังไม่เริ่ม', value: tasks.filter(t => t.status === Status.NOT_STARTED).length, color: '#475569' },
    { name: 'ดำเนินการ', value: tasks.filter(t => t.status === Status.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'เสร็จสิ้น', value: tasks.filter(t => t.status === Status.COMPLETED).length, color: '#10b981' },
  ];

  const hasPermission = 'Notification' in window && Notification.permission === 'granted';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {!hasPermission && (
        <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Bell className="text-blue-400 w-5 h-5 shrink-0" />
            <p className="text-sm text-blue-200">เปิดการแจ้งเตือนเพื่อไม่ให้พลาดกำหนดส่งงานสำคัญ!</p>
          </div>
          <button 
            onClick={() => Notification.requestPermission()}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider whitespace-nowrap"
          >
            ตั้งค่าเดี๋ยวนี้
          </button>
        </div>
      )}

      <section>
        <h2 className="text-base md:text-lg font-semibold text-slate-300 mb-4 px-1">ภาพรวมของงาน</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={<List className="text-blue-500" />} label="ทั้งหมด" value={stats.total} color="bg-blue-500/10" borderColor="border-blue-500/20" />
          <StatCard icon={<AlertCircle className="text-red-500" />} label="เร่งด่วน" value={stats.urgent} color="bg-red-500/10" borderColor="border-red-500/20" />
          <StatCard icon={<Clock className="text-amber-500" />} label="กำลังทำ" value={stats.inProgress} color="bg-amber-500/10" borderColor="border-amber-500/20" />
          <StatCard icon={<CheckCircle className="text-emerald-500" />} label="เสร็จสิ้น" value={stats.completed} color="bg-emerald-500/10" borderColor="border-emerald-500/20" />
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <section className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-sm md:text-md font-semibold text-slate-300 mb-6">ระดับความสำคัญ</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#0f172a'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-sm md:text-md font-semibold text-slate-300 mb-6">สถานะการทำงาน</h3>
          <div className="h-48 md:h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-[10px] md:text-xs font-medium text-slate-500 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Fixed TypeScript error: Added generic type <any> to React.ReactElement cast to ensure 'className' property is recognized during cloneElement
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; borderColor: string }> = ({ icon, label, value, color, borderColor }) => (
  <div className={`${color} p-3 md:p-4 rounded-2xl border ${borderColor} flex items-center gap-3 md:gap-4 transition-all hover:scale-[1.02] shadow-sm`}>
    <div className="bg-slate-900 p-1.5 md:p-2 rounded-xl shadow-inner shrink-0">
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4 md:w-5 md:h-5' })}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{label}</p>
      <p className="text-xl md:text-2xl font-bold text-slate-100 truncate">{value}</p>
    </div>
  </div>
);

export default Dashboard;
