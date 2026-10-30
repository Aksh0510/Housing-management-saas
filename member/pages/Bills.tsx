import { useMemo, useState, useSyncExternalStore } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Modal from '../../../shared/components/ui/Modal';
import { PageTitle, StatCard } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';
import useAuth from '../../../shared/hooks/useAuth';
import useToast from '../../../shared/hooks/useToast';
import { billingService, type MockReceipt, type SocietyBill } from '../../../shared/services/billingService';

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export default function MemberBills() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const revision = useSyncExternalStore(billingService.subscribe, billingService.getRevision);
  const bills = useMemo(() => user ? billingService.getBillsForUser(user) : [], [user, revision]);
  const [billToPay, setBillToPay] = useState<SocietyBill | null>(null);
  const [receipt, setReceipt] = useState<MockReceipt | null>(null);
  const dueTotal = bills.reduce((total, bill) => total + bill.amount - bill.paidAmount, 0);

  const recordPayment = () => {
    if (!user || !billToPay) return;
    try {
      const result = billingService.recordDemoPayment(user, billToPay.id);
      setReceipt(result.receipt);
      setBillToPay(null);
      success(`Demo receipt ${result.receipt.id} recorded. No payment gateway was contacted.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The demo payment could not be recorded.');
    }
  };

  const showReceipt = (bill: SocietyBill) => {
    if (!user) return;
    try {
      const matchingReceipt = billingService.getReceipt(user, bill.id);
      if (!matchingReceipt) {
        error('A receipt is not available for this bill yet.');
        return;
      }
      setReceipt(matchingReceipt);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'The receipt could not be opened.');
    }
  };

  const columns: TableColumn<SocietyBill>[] = [
    { key: 'id', header: 'Bill', render: (bill) => <span className="font-medium">{bill.id}<span className="block text-xs font-normal text-text-secondary">{bill.period}</span></span> },
    { key: 'issuedOn', header: 'Issued / due', render: (bill) => <span>{bill.issuedOn}<span className="block text-xs text-text-secondary">Due {bill.dueDate}</span></span> },
    { key: 'amount', header: 'Bill amount', align: 'right', render: (bill) => money(bill.amount) },
    { key: 'paidAmount', header: 'Balance due', align: 'right', render: (bill) => money(bill.amount - bill.paidAmount) },
    { key: 'status', header: 'Status', render: (bill) => <Badge variant={bill.status === 'Paid' ? 'success' : bill.status === 'Overdue' ? 'danger' : bill.status === 'Partially paid' ? 'info' : 'warning'}>{bill.status}</Badge> },
    { key: 'id', header: 'Action', render: (bill) => bill.status === 'Paid'
      ? <Button size="sm" variant="outline" onClick={() => showReceipt(bill)}>View receipt</Button>
      : <Button size="sm" onClick={() => setBillToPay(bill)}>Pay balance</Button> },
  ];

  return (
    <div>
      <PageTitle title="Bills & payments" description="Your flat's maintenance bills, payment history and receipts." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total due" value={money(dueTotal)} detail="Across your open bills" tone={dueTotal ? 'amber' : 'green'} />
        <StatCard label="Bills this period" value={String(bills.length)} detail="Society maintenance ledger" tone="primary" />
        <StatCard label="Paid bills" value={String(bills.filter((bill) => bill.status === 'Paid').length)} detail="Receipts available in demo mode" tone="green" />
      </div>
      <Card>
        <Table columns={columns} data={bills} rowKey="id" caption="Bills and payments for your flat" />
        {bills.length === 0 && <p className="p-5 text-sm text-text-secondary">There are no bills linked to your flat yet.</p>}
      </Card>
      <p className="mt-3 text-xs text-text-secondary">Demo payment only. No money is transferred; a successful demo receipt updates this bill and the society ledger.</p>

      <Modal isOpen={billToPay !== null} onClose={() => setBillToPay(null)} title="Confirm demo payment" description="This records a simulated payment and updates the shared society ledger." footer={<><Button variant="outline" onClick={() => setBillToPay(null)}>Cancel</Button><Button onClick={recordPayment}>Record demo payment</Button></>}>
        {billToPay && <div className="space-y-2 rounded-lg bg-surface-light p-4 text-sm">
          <p className="font-semibold">{billToPay.id} · {billToPay.period}</p>
          <p className="text-text-secondary">{billToPay.flat} · due {billToPay.dueDate}</p>
          <p>Bill total: <strong>{money(billToPay.amount)}</strong></p>
          <p>Already paid: <strong>{money(billToPay.paidAmount)}</strong></p>
          <p>Pay now: <strong className="text-primary">{money(billToPay.amount - billToPay.paidAmount)}</strong></p>
        </div>}
      </Modal>
      <Modal isOpen={receipt !== null} onClose={() => setReceipt(null)} title="Demo payment receipt" description="A local demonstration receipt; this is not a bank or gateway confirmation." footer={<Button onClick={() => setReceipt(null)}>Done</Button>}>
        {receipt && <div className="rounded-lg border border-dashed border-border p-5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">SocietyDesk · Demo mode</p>
          <p className="mt-4 font-semibold">{receipt.id}</p>
          <p className="mt-2 text-text-secondary">Bill {receipt.billId}</p>
          <p className="mt-1 text-text-secondary">Received from {user?.name} · {receipt.paidOn}</p>
          <p className="mt-4 text-2xl font-semibold text-primary">{money(receipt.amount)}</p>
          <p className="mt-1 text-xs text-text-secondary">Method: {receipt.method}. No real payment was processed.</p>
        </div>}
      </Modal>
    </div>
  );
}
