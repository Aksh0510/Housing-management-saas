import { useState, type FormEvent } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Modal from '../../../../shared/components/ui/Modal';
import { PageTitle } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import { mockExpenseHeads, mockIncomeHeads, type AccountHead } from '../../../../shared/data/mockAccountHeads';
import useToast from '../../../../shared/hooks/useToast';

export default function AccountHeads() {
  const [activeTab, setActiveTab] = useState<'Income' | 'Expense'>('Income');
  const [incomeHeads, setIncomeHeads] = useState(mockIncomeHeads.map((head) => ({ ...head })));
  const [expenseHeads, setExpenseHeads] = useState(mockExpenseHeads.map((head) => ({ ...head })));
  const [addOpen, setAddOpen] = useState(false);
  const [selectedHead, setSelectedHead] = useState<AccountHead | null>(null);
  const { success, error } = useToast();
  const currentHeads = activeTab === 'Income' ? incomeHeads : expenseHeads;
  const columns: TableColumn<AccountHead>[] = [
    { key: 'srNo', header: 'Sr. no.', align: 'right' },
    { key: 'acHead', header: 'A/C head', render: (row) => <span className="font-medium">{row.acHead}</span> },
    { key: 'group', header: 'Group' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks === 'Statutory' ? <Badge variant="info">Configured · verify applicability</Badge> : row.remarks || '—' },
    { key: 'id', header: 'Action', render: (row) => <Button size="sm" variant="ghost" onClick={() => setSelectedHead(row)}>View</Button> },
  ];

  const downloadTemplate = () => {
    const blob = new Blob(['Account head,Group,Remarks\r\nNew account,Direct Incomes,\r\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab.toLowerCase()}-account-head-template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addHead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const acHead = String(data.get('acHead') ?? '').trim();
    const group = String(data.get('group') ?? '').trim();
    const remarks = String(data.get('remarks') ?? '').trim();
    if (acHead.length < 3 || !group) {
      error('Enter an account head name and group.');
      return;
    }
    if (currentHeads.some((head) => head.acHead.toLocaleLowerCase() === acHead.toLocaleLowerCase())) {
      error('An account head with this name already exists.');
      return;
    }
    const prefix = activeTab === 'Income' ? 'IH-DEMO' : 'EH-DEMO';
    const head: AccountHead = { id: `${prefix}-${Date.now()}`, srNo: currentHeads.length + 1, acHead, group, remarks, type: activeTab };
    if (activeTab === 'Income') setIncomeHeads((current) => [...current, head]);
    else setExpenseHeads((current) => [...current, head]);
    setAddOpen(false);
    event.currentTarget.reset();
    success(`${activeTab} account head added to this demo session.`);
  };

  return (
    <div>
      <PageTitle title="Account heads" description="Configure society-specific income and expense groups. Rates and statutory applicability require verification." action={<Button variant="outline" onClick={downloadTemplate}>Download CSV template</Button>} />
      <div className="mb-5 flex gap-2" role="tablist" aria-label="Account head type">
        {(['Income', 'Expense'] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === tab ? 'bg-primary text-white' : 'border border-border bg-white text-text-secondary hover:text-text'}`}>{tab} heads</button>)}
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-semibold">{activeTab} heads</h3><p className="mt-1 text-xs text-text-secondary">{currentHeads.length} configured heads</p></div>
          <Button onClick={() => setAddOpen(true)}>Add {activeTab} head</Button>
        </div>
        <Table columns={columns} data={currentHeads} rowKey="id" caption={`${activeTab} account heads`} />
      </Card>
      <p className="mt-3 text-xs text-text-secondary">Account head changes are local to this session and do not alter statutory or billing rules.</p>
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={`Add ${activeTab.toLowerCase()} account head`} description="Create a society-specific category for future configuration." footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button type="submit" form="new-account-head">Save account head</Button></>}>
        <form id="new-account-head" onSubmit={addHead} className="space-y-4">
          <Input name="acHead" label="Account head name" minLength={3} required autoFocus />
          <Input name="group" label="Group" placeholder={activeTab === 'Income' ? 'e.g. Direct Incomes' : 'e.g. Indirect Expenses'} required />
          <Input name="remarks" label="Remarks (optional)" />
        </form>
      </Modal>
      <Modal isOpen={selectedHead !== null} onClose={() => setSelectedHead(null)} title={selectedHead?.acHead ?? 'Account head'} description="Society chart of accounts entry" footer={<Button onClick={() => setSelectedHead(null)}>Close</Button>}>
        {selectedHead && <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-text-secondary">Type</dt><dd className="mt-1 font-medium">{selectedHead.type}</dd></div><div><dt className="text-xs text-text-secondary">Group</dt><dd className="mt-1 font-medium">{selectedHead.group}</dd></div><div><dt className="text-xs text-text-secondary">Remarks</dt><dd className="mt-1 font-medium">{selectedHead.remarks || 'None'}</dd></div><div><dt className="text-xs text-text-secondary">Status</dt><dd className="mt-1 font-medium">Active in demo session</dd></div></dl>}
      </Modal>
    </div>
  );
}
