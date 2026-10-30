import { useState, type FormEvent } from 'react';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import useToast from '../../../../shared/hooks/useToast';
import type { Member } from '../../../../shared/types/models';

const tabs = ['Ledger', 'Mailing', 'Occupancy', 'Opening Balance'] as const;
type MemberTab = typeof tabs[number];

interface MemberFormProps {
  onSave?: (member: Member) => void;
  onCancel?: () => void;
}

export default function MemberForm({ onSave, onCancel }: MemberFormProps) {
  const [activeTab, setActiveTab] = useState<MemberTab>('Ledger');
  const [form, setForm] = useState({
    name: '', wing: 'A', unitNo: '', email: '', mobile: '', memberType: 'Owner' as 'Owner' | 'Tenant',
    mailingAddress: '', occupancy: 'Owner Occupied' as Member['occupancy'], areaSqFt: '', openingBalance: '0',
    memberRegNo: '', admissionDate: '',
  });
  const [formError, setFormError] = useState('');
  const { error, success } = useToast();
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.unitNo.trim()) {
      setActiveTab('Ledger');
      setFormError('Member name and flat number are required.');
      error('Add a member name and flat number before saving.');
      return;
    }
    const member: Member = {
      id: `MB${Date.now()}`,
      societyId: 'SOC001',
      name: form.name.trim(),
      wing: form.wing,
      unitNo: form.unitNo.trim(),
      email: form.email.trim() || undefined,
      mobile: form.mobile.trim() || undefined,
      memberType: form.memberType,
      occupancy: form.occupancy,
      mailingAddress: form.mailingAddress || undefined,
      areaSqFt: form.areaSqFt ? Number(form.areaSqFt) : undefined,
      openingBalance: Number(form.openingBalance || 0),
      memberRegNo: form.memberRegNo || undefined,
      admissionDate: form.admissionDate || undefined,
      isActive: true,
    };
    if (!Number.isFinite(member.openingBalance) || (member.areaSqFt !== undefined && !Number.isFinite(member.areaSqFt))) {
      setFormError('Enter valid numeric values for area and opening balance.');
      error('Enter valid numeric values for area and opening balance.');
      return;
    }
    setFormError('');
    onSave?.(member);
    success('Member saved to this prototype session.');
  };

  return (
    <form onSubmit={submit}>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Member form sections">
        {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}>{tab}</button>)}
      </div>
      {formError && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{formError}</p>}
      {activeTab === 'Ledger' && <div className="grid gap-4 sm:grid-cols-2"><Input label="Member name" value={form.name} onChange={(event) => { update('name', event.target.value); setFormError(''); }} required /><Input label="Print name" value={form.name} onChange={(event) => update('name', event.target.value)} /><Input label="Member registration number" value={form.memberRegNo} onChange={(event) => update('memberRegNo', event.target.value)} /><label className="space-y-1.5 text-sm font-medium">Member type<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={form.memberType} onChange={(event) => update('memberType', event.target.value)}><option>Owner</option><option>Tenant</option></select></label></div>}
      {activeTab === 'Mailing' && <div className="grid gap-4 sm:grid-cols-2"><Input label="Email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /><Input label="Mobile" type="tel" value={form.mobile} onChange={(event) => update('mobile', event.target.value)} /><div className="sm:col-span-2"><Input label="Mailing address" value={form.mailingAddress} onChange={(event) => update('mailingAddress', event.target.value)} /></div></div>}
      {activeTab === 'Occupancy' && <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Wing<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={form.wing} onChange={(event) => update('wing', event.target.value)}>{['A', 'B', 'C'].map((wing) => <option key={wing}>{wing}</option>)}</select></label><Input label="Flat / unit number" value={form.unitNo} onChange={(event) => { update('unitNo', event.target.value); setFormError(''); }} required /><label className="space-y-1.5 text-sm font-medium">Occupancy<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={form.occupancy} onChange={(event) => update('occupancy', event.target.value)}><option>Owner Occupied</option><option>Tenant</option><option>Vacant</option></select></label><Input label="Area (sq. ft.)" type="number" min="0" value={form.areaSqFt} onChange={(event) => update('areaSqFt', event.target.value)} /><Input label="Admission date" type="date" value={form.admissionDate} onChange={(event) => update('admissionDate', event.target.value)} /></div>}
      {activeTab === 'Opening Balance' && <div className="max-w-sm"><Input label="Opening balance (₹)" type="number" step="0.01" value={form.openingBalance} onChange={(event) => update('openingBalance', event.target.value)} required /><p className="mt-2 text-xs text-text-secondary">Amounts are stored as numbers, not formatted display strings.</p></div>}
      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4"><Button variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Save member</Button></div>
    </form>
  );
}
