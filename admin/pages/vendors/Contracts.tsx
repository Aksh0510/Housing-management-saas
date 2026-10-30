import { useMemo, useState } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';
import { PageTitle } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import useAuth from '../../../../shared/hooks/useAuth';
import useToast from '../../../../shared/hooks/useToast';
import { vendorService, type VendorContract } from '../../../../shared/services/vendorService';

export default function Contracts() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const [revision, setRevision] = useState(0);
  const contracts = useMemo(() => user ? vendorService.getAll(user) : [], [user, revision]);
  const addWorkOrder = (id: string) => {
    if (!user) return;
    try { vendorService.createWorkOrder(user, id); setRevision((value) => value + 1); success('AMC work order linked to the manager task list.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Work order could not be created.'); }
  };
  const columns: TableColumn<VendorContract>[] = [
    { key: 'vendor', header: 'Vendor', render: (row) => <span>{row.vendor}<span className="block text-xs text-text-secondary">{row.service}</span></span> },
    { key: 'contact', header: 'Contact' },
    { key: 'contractEnd', header: 'Contract ends', render: (row) => new Date(`${row.contractEnd}T00:00:00`).toLocaleDateString('en-IN') },
    { key: 'id', header: 'Alert', render: (row) => {
      const days = Math.ceil((new Date(`${row.contractEnd}T00:00:00`).getTime() - Date.now()) / 86400000);
      return <Badge variant={days <= 30 ? 'warning' : 'success'}>{days < 0 ? 'Expired' : days <= 30 ? `Expires in ${days} days` : 'Active'}</Badge>;
    } },
    { key: 'workOrderTaskId', header: 'Work order', render: (row) => row.workOrderTaskId ? `Task ${row.workOrderTaskId}` : <Button size="sm" variant="outline" onClick={() => addWorkOrder(row.id)}>Create task</Button> },
  ];
  return <div><PageTitle title="Vendors & AMC contracts" description="Contract expiry alerts with linked work-order task creation." /><Card title="Vendor register" description="Contract records and work orders are local demo data."><Table columns={columns} data={contracts} rowKey="id" caption="Vendor contracts" /></Card></div>;
}
