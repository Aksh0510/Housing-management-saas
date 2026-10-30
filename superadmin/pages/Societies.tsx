import { useMemo, useRef, useState, type FormEvent } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import Modal from '../../../shared/components/ui/Modal';
import StepWizard from '../../../shared/components/ui/StepWizard';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import Table, { type TableColumn } from '../../../shared/components/ui/Table';
import useToast from '../../../shared/hooks/useToast';
import { getDemoUsers } from '../../../shared/services/authService';
import { societyService } from '../../../shared/services/societyService';
import type { Society } from '../../../shared/types/models';

const wizardSteps = ['Details', 'Govt IDs', 'Admin Account', 'Billing', 'Review'];
const initialWizardData = {
  name: '',
  registrationNo: '',
  city: '',
  pincode: '',
  pan: '',
  gstin: '',
  tan: '',
  adminName: '',
  adminEmail: '',
  mobile: '',
  plan: 'Pro',
  financialYearStart: '2026-04-01',
  billingCycle: 'Monthly',
  interestRate: '12% P.A.',
};

export default function Societies() {
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState('');
  const [wizardData, setWizardData] = useState(initialWizardData);
  const [societies, setSocieties] = useState(societyService.getAll());
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { success, error } = useToast();
  const demoUsers = getDemoUsers();
  const rows = useMemo(() => societies.filter((society) =>
    `${society.name} ${society.address} ${society.subscriptionPlan}`.toLowerCase().includes(search.toLowerCase()),
  ), [search, societies]);

  const columns: TableColumn<Society>[] = [
    { key: 'name', header: 'Society name', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'address', header: 'City', render: (row) => row.id === 'SOC001' ? 'Mumbai' : row.id === 'SOC002' ? 'Pune' : row.address },
    { key: 'subscriptionPlan', header: 'Plan' },
    { key: 'totalFlats', header: 'Flats', align: 'right' },
    { key: 'adminUserId', header: 'Admin', render: (row) => demoUsers.find((user) => user.id === row.adminUserId)?.name ?? 'Invite pending' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => <Button size="sm" variant="outline" onClick={() => setSelectedSociety(row)}>View details</Button>,
    },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step !== wizardSteps.length - 1) {
      return;
    }

    const cycles: Society['billingCycle'][] = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
    const billingCycle = cycles.find((cycle) => cycle === wizardData.billingCycle);
    if (!billingCycle) {
      error('Choose a valid billing cycle before creating the society.');
      setStep(3);
      return;
    }
    try {
      const { society } = societyService.create({
        ...wizardData,
        billingCycle,
      });
      setSocieties(societyService.getAll());
      success(`${society.name} created in demo mode. Its admin is available in the demo account selector.`);
      setWizardOpen(false);
      setStep(0);
      setWizardData(initialWizardData);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'Society setup could not be saved.');
    }
  };

  return (
    <div>
      <PageTitle
        title="Societies"
        description="Manage society onboarding, subscription plans and administrator access."
        action={<Button onClick={() => { setWizardData(initialWizardData); setStep(0); setWizardOpen(true); }}>Add Society</Button>}
      />
      <Card contentClassName="space-y-4">
        <div className="max-w-sm">
          <Input label="Search societies" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, city or plan" />
        </div>
        <Table columns={columns} data={rows} rowKey="id" caption="Society portfolio" emptyMessage="No societies match your search." />
        <p className="text-xs text-text-secondary">Showing {rows.length} of {societies.length} demo societies.</p>
      </Card>

      <Modal
        isOpen={isWizardOpen}
        onClose={() => { setWizardOpen(false); setStep(0); }}
        title="Add a society"
        description="Create a demo society and a selectable society-admin account."
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => step === 0 ? (setWizardOpen(false), setStep(0)) : setStep((current) => current - 1)}>
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < wizardSteps.length - 1
              ? <Button type="button" onClick={(event) => { event.preventDefault(); if (formRef.current?.reportValidity()) setStep((current) => current + 1); }}>Continue</Button>
              : <Button type="submit" form="society-wizard">Save review</Button>}
          </>
        }
      >
        <StepWizard steps={wizardSteps} currentStep={step} onStepChange={(index) => setStep(index)}>
          <form id="society-wizard" ref={formRef} onSubmit={handleSubmit}>
            {step === 0 && <div className="grid gap-4 sm:grid-cols-2"><Input label="Society name" value={wizardData.name} onChange={(event) => setWizardData((data) => ({ ...data, name: event.target.value }))} required /><Input label="Registration number" value={wizardData.registrationNo} onChange={(event) => setWizardData((data) => ({ ...data, registrationNo: event.target.value }))} required /><Input label="City" value={wizardData.city} onChange={(event) => setWizardData((data) => ({ ...data, city: event.target.value }))} required /><Input label="Pincode" inputMode="numeric" pattern="[0-9]{6}" value={wizardData.pincode} onChange={(event) => setWizardData((data) => ({ ...data, pincode: event.target.value }))} required /></div>}
            {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><Input label="PAN" value={wizardData.pan} onChange={(event) => setWizardData((data) => ({ ...data, pan: event.target.value.toUpperCase() }))} /><Input label="GSTIN" value={wizardData.gstin} onChange={(event) => setWizardData((data) => ({ ...data, gstin: event.target.value.toUpperCase() }))} /><Input label="TAN" value={wizardData.tan} onChange={(event) => setWizardData((data) => ({ ...data, tan: event.target.value.toUpperCase() }))} /><p className="self-center text-sm text-text-secondary">Document upload is a prototype stub.</p></div>}
            {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><Input label="Administrator name" value={wizardData.adminName} onChange={(event) => setWizardData((data) => ({ ...data, adminName: event.target.value }))} required /><Input label="Administrator email" type="email" value={wizardData.adminEmail} onChange={(event) => setWizardData((data) => ({ ...data, adminEmail: event.target.value }))} required /><Input label="Mobile number" type="tel" pattern="[0-9]{10,15}" value={wizardData.mobile} onChange={(event) => setWizardData((data) => ({ ...data, mobile: event.target.value }))} required /><p className="self-center text-sm text-text-secondary">Invitation delivery is not connected.</p></div>}
            {step === 3 && <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Subscription plan<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={wizardData.plan} onChange={(event) => setWizardData((data) => ({ ...data, plan: event.target.value }))}><option>Starter</option><option>Pro</option><option>Enterprise</option></select></label><Input label="Financial year starts" type="date" value={wizardData.financialYearStart} onChange={(event) => setWizardData((data) => ({ ...data, financialYearStart: event.target.value }))} /><label className="space-y-1.5 text-sm font-medium">Billing cycle<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={wizardData.billingCycle} onChange={(event) => setWizardData((data) => ({ ...data, billingCycle: event.target.value }))}><option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Yearly</option></select></label><Input label="Interest rate" value={wizardData.interestRate} onChange={(event) => setWizardData((data) => ({ ...data, interestRate: event.target.value }))} /></div>}
            {step === 4 && <div className="space-y-4 rounded-lg bg-surface-light p-4"><div><h3 className="font-semibold">Review society details</h3><p className="mt-1 text-sm text-text-secondary">{wizardData.name} · {wizardData.registrationNo} · {wizardData.city}, {wizardData.pincode}</p></div><div><h4 className="text-sm font-semibold">Administrator</h4><p className="mt-1 text-sm text-text-secondary">{wizardData.adminName} · {wizardData.adminEmail} · {wizardData.mobile}</p></div><div><h4 className="text-sm font-semibold">Billing setup</h4><p className="mt-1 text-sm text-text-secondary">{wizardData.plan} · {wizardData.billingCycle} · FY begins {wizardData.financialYearStart} · Interest {wizardData.interestRate}</p></div><p className="text-xs text-text-secondary">This demo does not create a real society or send invitations.</p></div>}
          </form>
        </StepWizard>
      </Modal>
      <Modal isOpen={selectedSociety !== null} onClose={() => setSelectedSociety(null)} title={selectedSociety?.name ?? 'Society details'} description="Platform portfolio record · Demo mode" footer={<Button onClick={() => setSelectedSociety(null)}>Close</Button>}>
        {selectedSociety && <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-text-secondary">Society ID</dt><dd className="mt-1 font-medium">{selectedSociety.id}</dd></div>
          <div><dt className="text-xs text-text-secondary">Registration number</dt><dd className="mt-1 font-medium">{selectedSociety.regNo}</dd></div>
          <div><dt className="text-xs text-text-secondary">Location</dt><dd className="mt-1 font-medium">{selectedSociety.address}</dd></div>
          <div><dt className="text-xs text-text-secondary">Plan / status</dt><dd className="mt-1 font-medium">{selectedSociety.subscriptionPlan} · {selectedSociety.status}</dd></div>
          <div><dt className="text-xs text-text-secondary">Linked administrator</dt><dd className="mt-1 font-medium">{demoUsers.find((user) => user.id === selectedSociety.adminUserId)?.email ?? 'Invitation pending'}</dd></div>
          <div><dt className="text-xs text-text-secondary">Flats configured</dt><dd className="mt-1 font-medium">{selectedSociety.totalFlats} · setup incomplete</dd></div>
        </dl>}
      </Modal>
    </div>
  );
}
