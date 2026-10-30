import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Modal from '../../../../shared/components/ui/Modal';
import { PageTitle } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import useAuth from '../../../../shared/hooks/useAuth';
import useToast from '../../../../shared/hooks/useToast';
import { billingService, type SocietyBill } from '../../../../shared/services/billingService';

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export default function Bills() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const revision = useSyncExternalStore(billingService.subscribe, billingService.getRevision);
  const bills = useMemo(() => user ? billingService.getBillsForUser(user) : [], [user, revision]);
  const chargeHeads = billingService.getChargeHeads();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState('2026-11');
  const [dueDate, setDueDate] = useState('2026-11-10');
  const [selectedHeads, setSelectedHeads] = useState<string[]>(chargeHeads.map((head) => head.id));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  const preview = useMemo(() => {
    if (!user || step !== 2) return { rows: [], issue: '' };
    try {
      return { rows: billingService.previewBills(user, { period, dueDate, chargeHeads: selectedHeads }), issue: '' };
    } catch (reason) {
      return { rows: [], issue: reason instanceof Error ? reason.message : 'The bill preview could not be calculated.' };
    }
  }, [user, period, dueDate, selectedHeads, step, revision]);

  const filteredBills = bills.filter((bill) => {
    const matchesQuery = `${bill.id} ${bill.member} ${bill.flat} ${bill.period}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
    return matchesQuery && (statusFilter === 'All statuses' || bill.status === statusFilter);
  });

  const columns: TableColumn<SocietyBill>[] = [
    { key: 'id', header: 'Bill no.', render: (bill) => <span className="font-medium">{bill.id}</span> },
    { key: 'member', header: 'Member / flat', render: (bill) => <div>{bill.member}<p className="text-xs text-text-secondary">{bill.flat}</p></div> },
    { key: 'period', header: 'Period' },
    { key: 'amount', header: 'Amount', align: 'right', render: (bill) => money(bill.amount) },
    { key: 'paidAmount', header: 'Balance', align: 'right', render: (bill) => money(bill.amount - bill.paidAmount) },
    { key: 'dueDate', header: 'Due date' },
    { key: 'status', header: 'Status', render: (bill) => <Badge variant={bill.status === 'Paid' ? 'success' : bill.status === 'Overdue' ? 'danger' : bill.status === 'Partially paid' ? 'info' : 'warning'}>{bill.status}</Badge> },
  ];

  const closeModal = () => {
    setOpen(false);
    setStep(0);
  };

  const continueWizard = () => {
    if (step === 0 && (!/^\d{4}-\d{2}$/.test(period) || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))) {
      error('Choose a billing period and due date before continuing.');
      return;
    }
    if (step === 1 && selectedHeads.length === 0) {
      error('Select at least one charge head.');
      return;
    }
    setStep((current) => Math.min(current + 1, 2));
  };

  const generate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    try {
      const generated = billingService.generateBills(user, { period, dueDate, chargeHeads: selectedHeads });
      success(`${generated.length} bills generated. They are now visible in each resident's ledger.`);
      closeModal();
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'Bills could not be generated.');
    }
  };

  return (
    <div>
      <PageTitle title="Bills & maintenance" description="Generate society bills and review each flat's balance." action={<Button onClick={() => setOpen(true)}>Generate bills</Button>} />
      <Card contentClassName="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="success">Paid · {bills.filter((bill) => bill.status === 'Paid').length}</Badge>
          <Badge variant="warning">Pending · {bills.filter((bill) => bill.status === 'Pending').length}</Badge>
          <Badge variant="info">Part paid · {bills.filter((bill) => bill.status === 'Partially paid').length}</Badge>
          <Badge variant="danger">Overdue · {bills.filter((bill) => bill.status === 'Overdue').length}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
          <Input label="Search bills" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Bill, member or flat" />
          <label className="space-y-1.5 text-sm font-medium">Status
            <select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {['All statuses', 'Paid', 'Partially paid', 'Pending', 'Overdue'].map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
        </div>
        <Table columns={columns} data={filteredBills} rowKey="id" caption="Society maintenance bills" />
        {filteredBills.length === 0 && <p className="p-4 text-sm text-text-secondary">{bills.length ? 'No bills match your search and status filters.' : 'No bills have been generated for this society.'}</p>}
      </Card>
      <p className="mt-3 text-xs text-text-secondary">Demo billing data is held in memory. Generated bills are shared with linked resident accounts; statutory charges and policies must be configured and verified by the society.</p>

      <Modal isOpen={open} onClose={closeModal} title="Generate maintenance bills" description="Review a per-flat preview before creating bills." size="lg" footer={<><Button variant="outline" onClick={closeModal}>Cancel</Button>{step < 2 ? <Button onClick={continueWizard}>Continue</Button> : <Button type="submit" form="generate-bill" disabled={Boolean(preview.issue) || preview.rows.length === 0}>Generate {preview.rows.length || ''} bills</Button>}</>}>
        <div className="mb-5 flex items-center gap-2 text-xs font-medium" aria-label="Billing generation steps">
          {['Period', 'Charge heads', 'Review'].map((label, index) => <div key={label} className={`flex-1 rounded px-2 py-2 text-center ${step === index ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary'}`}>{index + 1}. {label}</div>)}
        </div>
        <form id="generate-bill" onSubmit={generate} className="space-y-4">
          {step === 0 && <div className="grid gap-4 sm:grid-cols-2"><Input label="Billing period" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} required /><Input label="Due date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required /></div>}
          {step === 1 && <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold">Select applicable charge heads</legend>{chargeHeads.map((head) => <label key={head.id} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition hover:border-primary/40"><input type="checkbox" className="h-4 w-4 accent-primary" checked={selectedHeads.includes(head.id)} onChange={(event) => setSelectedHeads((current) => event.target.checked ? [...current, head.id] : current.filter((id) => id !== head.id))} />{head.label}</label>)}</fieldset>}
          {step === 2 && <div className="space-y-4">
            {preview.issue
              ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{preview.issue}</p>
              : <>
                <p className="text-sm text-text-secondary">{preview.rows.length} active member bills · {period} · due {dueDate}</p>
                <div className="max-h-64 overflow-auto rounded-lg border border-border">
                  <table className="w-full min-w-[28rem] text-left text-sm"><thead className="sticky top-0 bg-surface-light"><tr><th className="px-3 py-2">Flat</th><th className="px-3 py-2">Member</th><th className="px-3 py-2 text-right">Amount</th></tr></thead><tbody>{preview.rows.map((row) => <tr key={row.memberId} className="border-t border-border"><td className="px-3 py-2">{row.flat}</td><td className="px-3 py-2">{row.member}</td><td className="px-3 py-2 text-right">{money(row.amount)}</td></tr>)}</tbody></table>
                </div>
                <p className="rounded-lg bg-primary-light p-3 text-sm font-semibold text-primary">Total to generate: {money(preview.rows.reduce((total, row) => total + row.amount, 0))}</p>
              </>}
          </div>}
        </form>
      </Modal>
    </div>
  );
}
