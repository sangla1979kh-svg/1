
import { Task, Priority, Status } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png', // Fallback icon
      ...options,
    });
  }
};

export const checkDueTasks = (tasks: Task[]) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().split('T')[0];
  
  // ใช้ tags เพื่อระบุว่าเหตุการณ์ใดของงานชิ้นไหนที่แจ้งเตือนไปแล้ว
  const notifiedEvents = JSON.parse(localStorage.getItem('notified_tasks_events') || '[]');
  const updatedNotifiedEvents = [...notifiedEvents];

  tasks.forEach(task => {
    if (task.status === Status.COMPLETED) return;

    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);

    const isOverdue = taskDate < now;
    const isDueToday = task.dueDate === todayStr;
    const isHighPriority = task.priority === Priority.HIGH;

    // 1. แจ้งเตือนงานค้างส่ง (Overdue)
    const overdueTag = `overdue-${task.id}`;
    if (isOverdue && !updatedNotifiedEvents.includes(overdueTag)) {
      showNotification(`งานค้างส่ง: ${task.title}`, {
        body: `งานนี้เกินกำหนดส่งเมื่อวันที่ ${new Date(task.dueDate).toLocaleDateString('th-TH')} กรุณารีบดำเนินการ`,
        tag: overdueTag,
      });
      updatedNotifiedEvents.push(overdueTag);
    }

    // 2. แจ้งเตือนงานที่ต้องส่งวันนี้ (Due Today)
    const dueTodayTag = `due-${task.id}`;
    if (isDueToday && !updatedNotifiedEvents.includes(dueTodayTag)) {
      showNotification(`กำหนดส่งวันนี้: ${task.title}`, {
        body: `อย่าลืม! งาน "${task.title}" มีกำหนดส่งวันนี้ กรุณาตรวจสอบความคืบหน้า`,
        tag: dueTodayTag,
      });
      updatedNotifiedEvents.push(dueTodayTag);
    }

    // 3. แจ้งเตือนงานด่วนใหม่ (New High Priority)
    const priorityTag = `priority-${task.id}`;
    if (isHighPriority && !updatedNotifiedEvents.includes(priorityTag)) {
      showNotification(`งานด่วนใหม่: ${task.title}`, {
        body: `ความสำคัญสูง: ${task.description || 'ไม่มีรายละเอียดเพิ่มเติม'}`,
        tag: priorityTag,
      });
      updatedNotifiedEvents.push(priorityTag);
    }
  });

  localStorage.setItem('notified_tasks_events', JSON.stringify(updatedNotifiedEvents));
};
