
export enum Priority {
  HIGH = 'สูง (เร่งด่วน)',
  MEDIUM = 'ปานกลาง',
  LOW = 'ต่ำ'
}

export enum Status {
  NOT_STARTED = 'ยังไม่เริ่ม',
  IN_PROGRESS = 'กำลังดำเนินการ',
  COMPLETED = 'เสร็จสิ้น'
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  assigner: string; // Teacher or Assigner
  priority: Priority;
  status: Status;
  subTasks: SubTask[];
}

export interface AIAnalysisResult {
  summary: string;
  priorityTasks: string[];
  suggestedSchedule: { taskTitle: string; reason: string }[];
  workloadScore: number; // 1-10
}
