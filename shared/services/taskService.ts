import type { User } from '../types/models';

export type WorkTaskStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Verified';

export interface WorkTask {
  id: string;
  societyId: string;
  staffId: string;
  title: string;
  location: string;
  description: string;
  dueAt: string;
  status: WorkTaskStatus;
  notes: string[];
  history: { status: WorkTaskStatus; at: string; actor: string }[];
}

const seededTasks: WorkTask[] = [
  { id: 'TSK-5101', societyId: 'SOC001', staffId: 'ST001', title: 'Inspect water leakage report', location: 'B-504', description: 'Inspect bathroom pipe joint and record findings.', dueAt: '2026-10-30T16:00:00', status: 'Assigned', notes: [], history: [{ status: 'Assigned', at: '2026-10-29T08:30:00', actor: 'Society office' }] },
  { id: 'TSK-5102', societyId: 'SOC001', staffId: 'ST001', title: 'Replace corridor light', location: 'A Wing, 12th floor', description: 'Replace the faulty corridor bulb and confirm operation.', dueAt: '2026-10-28T15:00:00', status: 'In Progress', notes: ['Replacement part requested'], history: [{ status: 'Assigned', at: '2026-10-27T09:00:00', actor: 'Society office' }, { status: 'In Progress', at: '2026-10-28T09:10:00', actor: 'Sunita Patil' }] },
];

let tasks = seededTasks.map((task) => ({ ...task, notes: [...task.notes], history: [...task.history] }));
let revision = 0;
const listeners = new Set<() => void>();

function assertStaff(user: User, roles: User['role'][] = ['staff']) {
  if (!roles.includes(user.role) || !user.societyId || (user.role === 'staff' && !user.id.startsWith('ST'))) throw new Error('You do not have permission to access staff tasks.');
  return user.societyId;
}

function copy(task: WorkTask): WorkTask {
  return { ...task, notes: [...task.notes], history: task.history.map((item) => ({ ...item })) };
}

function publish() {
  revision += 1;
  listeners.forEach((listener) => listener());
}

export const taskService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRevision() {
    return revision;
  },
  reset() {
    tasks = seededTasks.map((task) => ({ ...task, notes: [...task.notes], history: [...task.history] }));
    publish();
  },
  getAssigned(user: User): WorkTask[] {
    const societyId = assertStaff(user);
    return tasks.filter((task) => task.societyId === societyId && task.staffId === user.id).map(copy);
  },
  getForManager(user: User): WorkTask[] {
    const societyId = assertStaff(user, ['admin', 'staff']);
    if (user.role === 'staff' && user.staffType !== 'Manager' && user.staffType !== 'Chairman') throw new Error('Only a manager or society admin can view team tasks.');
    return tasks.filter((task) => task.societyId === societyId).map(copy);
  },
  createFollowUp(user: User, input: { title: string; description: string; location: string }): WorkTask {
    const societyId = assertStaff(user, ['admin', 'staff']);
    if (user.role === 'staff' && user.staffType !== 'Manager' && user.staffType !== 'Chairman') throw new Error('Only a manager or society admin can assign follow-up tasks.');
    const task: WorkTask = {
      id: `TSK-${String(Date.now()).slice(-6)}`,
      societyId,
      staffId: 'ST001',
      title: input.title.trim(),
      location: input.location.trim(),
      description: input.description.trim(),
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'Assigned',
      notes: [],
      history: [{ status: 'Assigned', at: new Date().toISOString(), actor: user.name }],
    };
    tasks = [task, ...tasks];
    publish();
    return copy(task);
  },
  createIncidentFollowUp(user: User, input: { title: string; description: string; location: string }): WorkTask {
    const societyId = assertStaff(user);
    const task: WorkTask = {
      id: `TSK-${String(Date.now()).slice(-6)}`,
      societyId,
      staffId: 'ST001',
      title: input.title.trim(),
      location: input.location.trim(),
      description: input.description.trim(),
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'Assigned',
      notes: [],
      history: [{ status: 'Assigned', at: new Date().toISOString(), actor: 'Society incident workflow' }],
    };
    tasks = [task, ...tasks];
    publish();
    return copy(task);
  },
  transition(user: User, taskId: string, status: WorkTaskStatus, note = ''): WorkTask {
    const societyId = assertStaff(user, ['admin', 'staff']);
    const task = tasks.find((item) => item.id === taskId && item.societyId === societyId && (user.role === 'admin' || (status === 'Verified' ? user.staffType === 'Manager' || user.staffType === 'Chairman' : item.staffId === user.id)));
    if (!task) throw new Error('The task was not found in your assigned work.');
    const next: Record<WorkTaskStatus, WorkTaskStatus | undefined> = {
      Assigned: 'In Progress',
      'In Progress': 'Completed',
      Completed: 'Verified',
      Verified: undefined,
    };
    if (next[task.status] !== status) throw new Error(`The task cannot move from ${task.status} to ${status}.`);
    if (status === 'Verified' && user.role === 'staff' && user.staffType !== 'Manager' && user.staffType !== 'Chairman') throw new Error('Only a manager can verify completed work.');
    if (status === 'Completed' && note.trim().length < 5) throw new Error('Add a completion note of at least 5 characters.');
    task.status = status;
    if (note.trim()) task.notes.push(note.trim());
    task.history.push({ status, at: new Date().toISOString(), actor: user.name });
    publish();
    return copy(task);
  },
};
