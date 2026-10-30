import { useState, type FormEvent } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Modal from '../../../../shared/components/ui/Modal';
import { PageTitle } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import useToast from '../../../../shared/hooks/useToast';

interface StaffRecord {
  id: string;
  name: string;
  designation: string;
  shift: string;
  attendance: string;
  mobile: string;
  status: 'On duty' | 'Off duty';
}

const initialStaff: StaffRecord[] = [
  { id: 'ST001', name: 'Sunita Patil', designation: 'Society Manager', shift: 'Day · 9 AM–6 PM', attendance: '96%', mobile: '+91 90000 00002', status: 'On duty' },
  { id: 'ST002', name: 'Vikram Singh', designation: 'Security Guard', shift: 'Day · Main Gate', attendance: '98%', mobile: '+91 90000 00003', status: 'On duty' },
  { id: 'ST003', name: 'Anil Kulkarni', designation: 'Chairman', shift: 'Committee', attendance: '—', mobile: '+91 90000 00004', status: 'Off duty' },
  { id: 'ST004', name: 'Ramesh Pawar', designation: 'Housekeeping', shift: 'Morning · 6 AM–2 PM', attendance: '94%', mobile: '+91 90000 00008', status: 'On duty' },
];

export default function StaffList() {
  const [staff, setStaff] = useState(initialStaff);
  const [createOpen, setCreateOpen] = useState(false);
  const { success, error } = useToast();
  const columns: TableColumn<StaffRecord>[] = [
    { key: 'name', header: 'Staff member', render: (row) => <div className="font-medium">{row.name}<p className="text-xs font-normal text-text-secondary">{row.mobile}</p></div> },
    { key: 'designation', header: 'Designation' },
    { key: 'shift', header: 'Shift' },
    { key: 'attendance', header: 'Attendance', align: 'right' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'On duty' ? 'success' : 'neutral'}>{row.status}</Badge> },
  ];
  const createStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const designation = String(data.get('designation') ?? '').trim();
    const shift = String(data.get('shift') ?? '').trim();
    const mobile = String(data.get('mobile') ?? '').trim();
    if (!name || !designation || !shift || !/^\+?[0-9\s-]{10,16}$/.test(mobile)) {
      error('Enter a name, designation, shift and valid contact number.');
      return;
    }
    setStaff((current) => [{ id: `ST-DEMO-${String(current.length + 1).padStart(3, '0')}`, name, designation, shift, mobile, attendance: '—', status: 'Off duty' }, ...current]);
    event.currentTarget.reset();
    setCreateOpen(false);
    success('Staff record added to this demo directory. No login credentials were created.');
  };
  return (
    <div>
      <PageTitle title="Staff & committee" description="Society staff directory, shift details and attendance overview." action={<Button onClick={() => setCreateOpen(true)}>Add staff record</Button>} />
      <Card><Table columns={columns} data={staff} rowKey="id" caption="Society staff directory" /></Card>
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add staff record" description="This adds a directory entry only; account provisioning is not connected." footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" form="new-staff">Save staff record</Button></>}>
        <form id="new-staff" onSubmit={createStaff} className="grid gap-4 sm:grid-cols-2">
          <Input name="name" label="Full name" required autoFocus />
          <Input name="designation" label="Designation" placeholder="e.g. Maintenance supervisor" required />
          <Input name="shift" label="Shift / assignment" placeholder="e.g. Day · 9 AM–6 PM" required />
          <Input name="mobile" label="Contact number" type="tel" inputMode="tel" pattern="\+?[0-9\s\-]{10,16}" required />
        </form>
      </Modal>
    </div>
  );
}
