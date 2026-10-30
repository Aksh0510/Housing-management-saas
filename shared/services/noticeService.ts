import type { User } from '../types/models';

export type Audience = 'All residents' | 'A Wing' | 'B Wing' | 'C Wing';
export interface SocietyNotice {
  id: string;
  societyId: string;
  title: string;
  body: string;
  audience: Audience;
  status: 'Draft' | 'Published';
  publishedAt?: string;
  readBy: string[];
}
export interface SocietyPoll {
  id: string;
  societyId: string;
  question: string;
  options: string[];
  audience: Audience;
  votes: Record<string, number>;
  votedBy: string[];
}

const initialNotices: SocietyNotice[] = [
  { id: 'NOT-001', societyId: 'SOC001', title: 'Water tank cleaning', body: 'Overhead tank maintenance is scheduled for Saturday from 10:00 AM.', audience: 'B Wing', status: 'Published', publishedAt: '2026-10-28T10:00:00Z', readBy: [] },
];
const initialPolls: SocietyPoll[] = [
  { id: 'POL-001', societyId: 'SOC001', question: 'Preferred timing for the next community meeting?', options: ['Saturday morning', 'Sunday evening'], audience: 'B Wing', votes: { 'Saturday morning': 0, 'Sunday evening': 0 }, votedBy: [] },
];
let notices: SocietyNotice[] = initialNotices.map((item) => ({ ...item, readBy: [...item.readBy] }));
let polls: SocietyPoll[] = initialPolls.map((item) => ({ ...item, options: [...item.options], votes: { ...item.votes }, votedBy: [...item.votedBy] }));
let next = 2;
let failNext = false;
function mayFail() { if (failNext) { failNext = false; throw new Error('Notices demo service is temporarily unavailable.'); } }
function scope(user: User, roles: User['role'][]): string {
  if (!roles.includes(user.role) || !user.societyId) throw new Error('You do not have permission to access notices and polls.');
  return user.societyId;
}
function matches(audience: Audience, wing?: string) { return audience === 'All residents' || audience === `${wing ?? ''} Wing`; }

export const noticeService = {
  injectFailure() { failNext = true; },
  reset() { notices = initialNotices.map((item) => ({ ...item, readBy: [] })); polls = initialPolls.map((item) => ({ ...item, options: [...item.options], votes: { ...item.votes }, votedBy: [] })); next = 2; failNext = false; },
  getForResident(user: User) {
    mayFail();
    const societyId = scope(user, ['member']);
    return {
      notices: notices.filter((item) => item.societyId === societyId && item.status === 'Published' && matches(item.audience, user.wing)).map((item) => ({ ...item, readBy: [...item.readBy] })),
      polls: polls.filter((item) => item.societyId === societyId && matches(item.audience, user.wing)).map((item) => ({ ...item, options: [...item.options], votes: { ...item.votes }, votedBy: [...item.votedBy] })),
    };
  },
  getForAdmin(user: User) {
    mayFail();
    const societyId = scope(user, ['admin']);
    return {
      notices: notices.filter((item) => item.societyId === societyId).map((item) => ({ ...item, readBy: [...item.readBy] })),
      polls: polls.filter((item) => item.societyId === societyId).map((item) => ({ ...item, options: [...item.options], votes: { ...item.votes }, votedBy: [...item.votedBy] })),
    };
  },
  createDraft(user: User, input: { title: string; body: string; audience: Audience }): SocietyNotice {
    mayFail();
    const societyId = scope(user, ['admin']);
    if (input.title.trim().length < 3 || input.body.trim().length < 5) throw new Error('Enter a notice title and message.');
    const notice: SocietyNotice = { id: `NOT-${String(next++).padStart(3, '0')}`, societyId, ...input, title: input.title.trim(), body: input.body.trim(), status: 'Draft', readBy: [] };
    notices = [notice, ...notices];
    return { ...notice, readBy: [] };
  },
  publish(user: User, id: string): SocietyNotice {
    mayFail();
    const societyId = scope(user, ['admin']);
    const notice = notices.find((item) => item.id === id && item.societyId === societyId && item.status === 'Draft');
    if (!notice) throw new Error('Draft notice was not found.');
    notice.status = 'Published';
    notice.publishedAt = new Date().toISOString();
    return { ...notice, readBy: [...notice.readBy] };
  },
  createPoll(user: User, input: { question: string; options: string[]; audience: Audience }): SocietyPoll {
    mayFail();
    const societyId = scope(user, ['admin']);
    const options = input.options.map((option) => option.trim()).filter(Boolean);
    if (input.question.trim().length < 5 || options.length < 2) throw new Error('A poll needs a question and at least two options.');
    const poll: SocietyPoll = { id: `POL-${String(next++).padStart(3, '0')}`, societyId, question: input.question.trim(), options, audience: input.audience, votes: Object.fromEntries(options.map((option) => [option, 0])), votedBy: [] };
    polls = [poll, ...polls];
    return { ...poll, options: [...poll.options], votes: { ...poll.votes }, votedBy: [] };
  },
  vote(user: User, pollId: string, option: string): SocietyPoll {
    mayFail();
    const societyId = scope(user, ['member']);
    const poll = polls.find((item) => item.id === pollId && item.societyId === societyId && matches(item.audience, user.wing));
    if (!poll || !poll.options.includes(option)) throw new Error('This poll is not available to your flat.');
    if (poll.votedBy.includes(user.id)) throw new Error('You have already voted in this poll.');
    poll.votes[option] += 1;
    poll.votedBy.push(user.id);
    return { ...poll, options: [...poll.options], votes: { ...poll.votes }, votedBy: [...poll.votedBy] };
  },
  markRead(user: User, id: string): SocietyNotice {
    mayFail();
    const societyId = scope(user, ['member']);
    const notice = notices.find((item) => item.id === id && item.societyId === societyId && item.status === 'Published' && matches(item.audience, user.wing));
    if (!notice) throw new Error('Notice not found for your wing.');
    if (!notice.readBy.includes(user.id)) notice.readBy.push(user.id);
    return { ...notice, readBy: [...notice.readBy] };
  },
};
