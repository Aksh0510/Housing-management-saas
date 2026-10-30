import { useMemo, useState, type FormEvent } from 'react';
import Badge from '../../shared/components/ui/Badge';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import { PageTitle } from '../../shared/components/ui/DashboardWidgets';
import useAuth from '../../shared/hooks/useAuth';
import useToast from '../../shared/hooks/useToast';
import { noticeService, type Audience } from '../../shared/services/noticeService';

export default function NoticesPolls() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const [revision, setRevision] = useState(0);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const refresh = () => setRevision((value) => value + 1);
  const data = useMemo(() => user?.role === 'admin' ? noticeService.getForAdmin(user) : user?.role === 'member' ? noticeService.getForResident(user) : { notices: [], polls: [] }, [user, revision]);
  const audienceOptions: Audience[] = ['All residents', 'A Wing', 'B Wing', 'C Wing'];

  const createNotice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || user.role !== 'admin') return;
    const form = new FormData(event.currentTarget);
    try { noticeService.createDraft(user, { title: String(form.get('title') ?? ''), body: String(form.get('body') ?? ''), audience: String(form.get('audience') ?? 'All residents') as Audience }); event.currentTarget.reset(); refresh(); success('Notice saved as a draft.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Notice could not be saved.'); }
  };
  const publish = (id: string) => {
    if (!user) return;
    try { noticeService.publish(user, id); refresh(); success('Notice published to its selected audience.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Notice could not be published.'); }
  };
  const createPoll = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || user.role !== 'admin') return;
    const form = new FormData(event.currentTarget);
    try { noticeService.createPoll(user, { question: String(form.get('question') ?? ''), options: [String(form.get('option1') ?? ''), String(form.get('option2') ?? '')], audience: String(form.get('poll-audience') ?? 'All residents') as Audience }); event.currentTarget.reset(); refresh(); success('Poll created. Residents can vote once.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Poll could not be created.'); }
  };
  const vote = (pollId: string) => {
    if (!user || user.role !== 'member') return;
    try { noticeService.vote(user, pollId, choice[pollId] ?? ''); refresh(); success('Your vote has been recorded.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Vote could not be recorded.'); }
  };
  const read = (id: string) => {
    if (!user || user.role !== 'member') return;
    try { noticeService.markRead(user, id); refresh(); success('Notice marked as read.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Read receipt could not be saved.'); }
  };

  return <div className="mx-auto max-w-5xl"><PageTitle title="Notices & polls" description={user?.role === 'admin' ? 'Draft and publish announcements to targeted resident audiences.' : `Published announcements for ${user?.wing ?? 'your'} Wing.`} />
    {user?.role === 'admin' && <div className="mb-4 grid gap-4 md:grid-cols-2">
      <Card title="Create notice"><form onSubmit={createNotice} className="space-y-3"><Input name="title" label="Notice title" required /><label className="block space-y-1.5 text-sm font-medium">Message<textarea name="body" minLength={5} required rows={3} className="w-full rounded-md border border-border p-2" /></label><label className="block space-y-1.5 text-sm font-medium">Audience<select name="audience" className="min-h-10 w-full rounded-md border border-border bg-white px-3">{audienceOptions.map((item) => <option key={item}>{item}</option>)}</select></label><Button type="submit">Save draft</Button></form></Card>
      <Card title="Create poll"><form onSubmit={createPoll} className="space-y-3"><Input name="question" label="Question" required /><Input name="option1" label="Option 1" required /><Input name="option2" label="Option 2" required /><label className="block space-y-1.5 text-sm font-medium">Audience<select name="poll-audience" className="min-h-10 w-full rounded-md border border-border bg-white px-3">{audienceOptions.map((item) => <option key={item}>{item}</option>)}</select></label><Button type="submit" variant="outline">Create poll</Button></form></Card>
    </div>}
    <div className="space-y-3">{data.notices.map((notice) => <Card key={notice.id} title={notice.title} description={`${notice.audience} · ${notice.status === 'Published' ? new Date(notice.publishedAt ?? '').toLocaleDateString('en-IN') : 'Draft'}`}>
      <p className="whitespace-pre-wrap text-sm">{notice.body}</p>
      {user?.role === 'admin' && <div className="mt-3 flex items-center gap-3"><Badge variant={notice.status === 'Published' ? 'success' : 'warning'}>{notice.status}</Badge>{notice.status === 'Draft' ? <Button size="sm" onClick={() => publish(notice.id)}>Publish notice</Button> : <span className="text-xs text-text-secondary">{notice.readBy.length} resident read receipts</span>}</div>}
      {user?.role === 'member' && <Button size="sm" variant="outline" className="mt-3" disabled={notice.readBy.includes(user.id)} onClick={() => read(notice.id)}>{notice.readBy.includes(user.id) ? 'Read' : 'Mark as read'}</Button>}
    </Card>)}{data.notices.length === 0 && <Card><p className="text-sm text-text-secondary">No published notices for your audience.</p></Card>}</div>
    <h2 className="mb-3 mt-6 text-lg font-semibold">Polls</h2><div className="space-y-3">{data.polls.map((poll) => <Card key={poll.id} title={poll.question} description={`${poll.audience} · ${poll.votedBy.length} votes`}>
      <div className="space-y-2">{poll.options.map((option) => <label key={option} className="flex items-center gap-2 text-sm"><input type="radio" name={poll.id} value={option} checked={choice[poll.id] === option} onChange={() => setChoice((current) => ({ ...current, [poll.id]: option }))} disabled={user?.role !== 'member' || poll.votedBy.includes(user.id)} />{option}<span className="ml-auto text-xs text-text-secondary">{poll.votes[option]}</span></label>)}</div>
      {user?.role === 'member' && <Button className="mt-3" size="sm" disabled={poll.votedBy.includes(user.id)} onClick={() => vote(poll.id)}>{poll.votedBy.includes(user.id) ? 'Vote recorded' : 'Submit vote'}</Button>}
    </Card>)}{data.polls.length === 0 && <Card><p className="text-sm text-text-secondary">No polls are available for this wing.</p></Card>}</div>
  </div>;
}
