import { useMemo } from 'react';
import Card from '../../../shared/components/ui/Card';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';
import useAuth from '../../../shared/hooks/useAuth';
import { auditService, type AuditEvent } from '../../../shared/services/auditService';

export default function AuditLog() {
  const { user } = useAuth();
  const events = useMemo(() => user ? auditService.getForAdmin(user) : [], [user]);
  const columns: TableColumn<AuditEvent>[] = [
    { key: 'at', header: 'Time', render: (row) => new Date(row.at).toLocaleString('en-IN') },
    { key: 'actor', header: 'Actor' },
    { key: 'action', header: 'Action' },
    { key: 'entity', header: 'Record', render: (row) => `${row.entity} · ${row.entityId}` },
    { key: 'before', header: 'Before → after', render: (row) => <details><summary className="cursor-pointer text-primary">View diff</summary><pre className="mt-2 whitespace-pre-wrap text-xs">Before: {row.before}{'\n'}After: {row.after}</pre></details> },
  ];
  return <div><PageTitle title="Audit log" description="Admin-only history of sensitive approval and allocation changes." /><Card title="Sensitive actions" description="Approval decisions include before/after snapshots."><Table columns={columns} data={events} rowKey="id" caption="Sensitive action audit log" emptyMessage="No audited actions yet. Approvals and allocation changes will appear here." /></Card></div>;
}
