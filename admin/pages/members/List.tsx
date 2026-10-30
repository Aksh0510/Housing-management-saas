import { useMemo, useState } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Modal from '../../../../shared/components/ui/Modal';
import { PageTitle } from '../../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../../shared/components/ui/Table';
import { mockMembers } from '../../../../shared/data/mockMembers';
import type { Member } from '../../../../shared/types/models';
import MemberForm from './MemberForm';

export default function MemberList() {
  const [members, setMembers] = useState(mockMembers);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<{ rowCount: number; errors: string[] } | null>(null);
  const rows = useMemo(() => members.filter((member) => `${member.name} ${member.wing}-${member.unitNo} ${member.email}`.toLowerCase().includes(search.toLowerCase())), [members, search]);

  const columns: TableColumn<Member>[] = [
    { key: 'name', header: 'Member', render: (member) => <div><p className="font-semibold">{member.name}</p><p className="text-xs text-text-secondary">{member.email ?? 'No email on file'}</p></div> },
    { key: 'unitNo', header: 'Wing / Flat', render: (member) => `${member.wing} · ${member.unitNo}` },
    { key: 'memberType', header: 'Type', render: (member) => member.memberType ?? member.occupancy ?? 'Owner' },
    { key: 'mobile', header: 'Contact', render: (member) => member.mobile ?? '—' },
    { key: 'openingBalance', header: 'Opening balance', align: 'right', render: (member) => `₹${member.openingBalance.toLocaleString('en-IN')}` },
    { key: 'isActive', header: 'Status', render: (member) => <Badge variant={member.isActive ? 'success' : 'neutral'}>{member.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'id', header: 'Action', render: (member) => <Button size="sm" variant="ghost" onClick={() => setSelectedMember(member)}>View</Button> },
  ];

  const validateCsv = async () => {
    if (!uploadFile) {
      setUploadPreview({ rowCount: 0, errors: ['Choose a CSV file first.'] });
      return;
    }
    if (!uploadFile.name.toLowerCase().endsWith('.csv') || uploadFile.size > 10 * 1024 * 1024) {
      setUploadPreview({ rowCount: 0, errors: ['Choose a CSV file smaller than 10 MB. XLSX parsing is not available in this demo.'] });
      return;
    }
    try {
      const contents = await uploadFile.text();
      const lines = contents.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setUploadPreview({ rowCount: 0, errors: ['The CSV needs a header row and at least one member row.'] });
        return;
      }
      const header = lines[0].split(',').map((column) => column.trim().replace(/^"|"$/g, '').toLowerCase());
      const requiredColumns = ['name', 'wing', 'unitno'];
      const missingColumns = requiredColumns.filter((column) => !header.includes(column));
      if (missingColumns.length) {
        setUploadPreview({ rowCount: lines.length - 1, errors: [`Missing required columns: ${missingColumns.join(', ')}.`] });
        return;
      }
      const nameIndex = header.indexOf('name');
      const wingIndex = header.indexOf('wing');
      const flatIndex = header.indexOf('unitno');
      const existingFlats = new Set(members.map((member) => `${member.wing}-${member.unitNo}`.toLowerCase()));
      const seenFlats = new Set<string>();
      const errors: string[] = [];
      lines.slice(1).forEach((line, index) => {
        const values = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
        const name = values[nameIndex] ?? '';
        const wing = values[wingIndex] ?? '';
        const unit = values[flatIndex] ?? '';
        const flatKey = `${wing}-${unit}`.toLowerCase();
        if (!name || !wing || !unit) errors.push(`Row ${index + 2}: member name, wing and flat are required.`);
        else if (existingFlats.has(flatKey) || seenFlats.has(flatKey)) errors.push(`Row ${index + 2}: duplicate flat ${wing}-${unit}.`);
        seenFlats.add(flatKey);
      });
      setUploadPreview({ rowCount: lines.length - 1, errors: errors.slice(0, 5) });
    } catch (reason) {
      setUploadPreview({ rowCount: 0, errors: [reason instanceof Error ? `Could not read the file: ${reason.message}` : 'Could not read the selected file.'] });
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob(['name,wing,unitNo,email,mobile\r\nSample Resident,A,101,resident@example.in,9000000000\r\n'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'society-members-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageTitle title="Members" description="Member ledger, occupancy and contact details for your society." action={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setShowUpload(true)}>Bulk Upload</Button><Button onClick={() => setShowMemberForm(true)}>Add Member</Button></div>} />
      <Card contentClassName="space-y-4">
        <div className="max-w-sm"><Input label="Search members" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, flat or email" /></div>
        <Table columns={columns} data={rows} rowKey="id" caption="Society members" />
        <p className="text-xs text-text-secondary">Showing {rows.length} of {members.length} active sample records.</p>
      </Card>

      <Modal isOpen={showUpload} onClose={() => { setShowUpload(false); setUploadFile(null); setUploadPreview(null); }} title="Validate member CSV" description="Review file structure and duplicate flats before importing. XLSX import is not connected in this demo." size="lg" footer={<><Button variant="outline" onClick={() => { setShowUpload(false); setUploadFile(null); setUploadPreview(null); }}>Close</Button><Button onClick={validateCsv}>Validate CSV</Button></>}>
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-primary/40 bg-primary-light/40 p-6 text-center">
            <p className="font-medium">Choose a member CSV file</p>
            <p className="mt-1 text-xs text-text-secondary">CSV only · maximum 10 MB · required columns: name, wing, unitNo</p>
            <input aria-label="Member CSV file" type="file" accept=".csv,text/csv" className="mx-auto mt-4 block max-w-full text-sm" onChange={(event) => { setUploadFile(event.target.files?.[0] ?? null); setUploadPreview(null); }} />
            {uploadFile && <p className="mt-2 text-xs text-text-secondary">Selected: {uploadFile.name} · {(uploadFile.size / 1024).toFixed(1)} KB</p>}
          </div>
          <div className="rounded-lg bg-surface-light p-4 text-sm">
            <p className="font-semibold">Validation result</p>
            {uploadPreview
              ? <div className="mt-2"><p>{uploadPreview.rowCount} data rows scanned. No rows were imported.</p>{uploadPreview.errors.length ? <ul className="mt-2 list-inside list-disc space-y-1 text-red-700">{uploadPreview.errors.map((message) => <li key={message}>{message}</li>)}</ul> : <p className="mt-1 text-secondary">Required columns and flat uniqueness checks passed.</p>}</div>
              : <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary"><li>Member name, wing and flat are required</li><li>Duplicate flats within this society are flagged</li><li>Validation is a preview; no records are committed</li></ul>}
          </div>
          <Button variant="outline" onClick={downloadTemplate}>Download CSV template</Button>
        </div>
      </Modal>

      <Modal isOpen={showMemberForm} onClose={() => setShowMemberForm(false)} title="Add member" description="Create a member ledger record." size="xl">
        <MemberForm
          onCancel={() => setShowMemberForm(false)}
          onSave={(member) => { setMembers((current) => [member, ...current]); setShowMemberForm(false); }}
        />
      </Modal>
      <Modal isOpen={selectedMember !== null} onClose={() => setSelectedMember(null)} title={selectedMember?.name ?? 'Member details'} description={selectedMember ? `${selectedMember.wing}-${selectedMember.unitNo} · ${selectedMember.memberType ?? selectedMember.occupancy ?? 'Member'}` : undefined} footer={<Button onClick={() => setSelectedMember(null)}>Close</Button>}>
        {selectedMember && <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-text-secondary">Member ID</dt><dd className="mt-1 font-medium">{selectedMember.id}</dd></div>
          <div><dt className="text-xs text-text-secondary">Registration</dt><dd className="mt-1 font-medium">{selectedMember.memberRegNo ?? 'Not recorded'}</dd></div>
          <div><dt className="text-xs text-text-secondary">Email</dt><dd className="mt-1 font-medium">{selectedMember.email ?? 'Not recorded'}</dd></div>
          <div><dt className="text-xs text-text-secondary">Mobile</dt><dd className="mt-1 font-medium">{selectedMember.mobile ?? 'Not recorded'}</dd></div>
          <div><dt className="text-xs text-text-secondary">Occupancy</dt><dd className="mt-1 font-medium">{selectedMember.occupancy ?? 'Not recorded'}</dd></div>
          <div><dt className="text-xs text-text-secondary">Opening balance</dt><dd className="mt-1 font-medium">₹{selectedMember.openingBalance.toLocaleString('en-IN')}</dd></div>
        </dl>}
      </Modal>
    </div>
  );
}
