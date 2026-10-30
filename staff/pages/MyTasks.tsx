import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import useAuth from '../../../shared/hooks/useAuth';
import useToast from '../../../shared/hooks/useToast';
import { taskService, type WorkTask, type WorkTaskStatus } from '../../../shared/services/taskService';

const nextStatus: Partial<Record<WorkTaskStatus, WorkTaskStatus>> = { Assigned: 'In Progress', 'In Progress': 'Completed' };

export default function MyTasks() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const revision = useSyncExternalStore(taskService.subscribe, taskService.getRevision);
  const tasks = useMemo(() => user && user.role === 'staff' ? taskService.getAssigned(user) : [], [user, revision]);
  const [selected, setSelected] = useState<WorkTask | null>(null);

  const transition = (status: WorkTaskStatus, event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!user || !selected) return;
    const formData = event ? new FormData(event.currentTarget) : null;
    try {
      taskService.transition(user, selected.id, status, String(formData?.get('note') ?? ''));
      setSelected(null);
      success(`Task updated to ${status}.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'Task update failed.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title="My tasks" description="Assigned work orders with due dates, notes and status history." />
      <div className="space-y-3">
        {tasks.map((task) => {
          const overdue = task.status !== 'Completed' && task.status !== 'Verified' && new Date(task.dueAt).getTime() < Date.now();
          return <Card key={task.id} title={task.title} description={`${task.id} · ${task.location}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><Badge variant={overdue ? 'danger' : task.status === 'Verified' ? 'success' : 'info'}>{overdue ? 'Overdue' : task.status}</Badge><p className={`mt-2 text-sm ${overdue ? 'font-semibold text-red-700' : 'text-text-secondary'}`}>Due {new Date(task.dueAt).toLocaleDateString('en-IN')} · {task.description}</p></div>
              <Button variant="outline" onClick={() => setSelected(task)}>View details</Button>
            </div>
          </Card>;
        })}
        {tasks.length === 0 && <Card><p className="text-sm text-text-secondary">No tasks are assigned to you.</p></Card>}
      </div>
      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl">
          <h2 id="task-dialog-title" className="text-lg font-semibold">{selected.title}</h2><p className="mt-1 text-sm text-text-secondary">{selected.location} · Due {new Date(selected.dueAt).toLocaleDateString('en-IN')}</p>
          <p className="mt-4 text-sm">{selected.description}</p>
          <h3 className="mt-5 text-sm font-semibold">Completion notes & history</h3>
          <ul className="mt-2 space-y-2 text-sm">{selected.history.map((item, index) => <li key={`${item.status}-${index}`} className="border-l-2 border-primary/30 pl-3">{item.status} · {item.actor}<span className="block text-xs text-text-secondary">{new Date(item.at).toLocaleString('en-IN')}</span></li>)}</ul>
          {selected.notes.map((note, index) => <p key={`${note}-${index}`} className="mt-2 rounded bg-surface-light p-2 text-sm">{note}</p>)}
          <form onSubmit={(event) => transition('Completed', event)} className="mt-5 space-y-3">
            {nextStatus[selected.status] === 'Completed' && <Input name="note" label="Completion note" minLength={5} required />}
            <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSelected(null)}>Close</Button>{nextStatus[selected.status] && <Button type={nextStatus[selected.status] === 'Completed' ? 'submit' : 'button'} onClick={nextStatus[selected.status] === 'In Progress' ? () => transition('In Progress') : undefined}>Mark {nextStatus[selected.status]}</Button>}</div>
          </form>
        </section>
      </div>}
    </div>
  );
}
