import { useState, type FormEvent } from 'react';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import { mockSocieties } from '../../../shared/data/mockSocieties';
import useToast from '../../../shared/hooks/useToast';
import type { Society } from '../../../shared/types/models';

const tabs = ['Details', 'Security', 'Billing', 'Govt IDs', 'Comm Setup', 'FY'] as const;
type ProfileTab = typeof tabs[number];

export default function SocietyProfile() {
  const [society, setSociety] = useState<Society>(mockSocieties[0]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('Details');
  const [interestHead, setInterestHead] = useState('Late Payment Charges');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { success } = useToast();
  const update = (key: keyof Society, value: string) => {
    setHasUnsavedChanges(true);
    setSociety((current) => ({ ...current, [key]: value }));
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasUnsavedChanges(false);
    success('Society profile changes saved to this page session.');
  };

  const textInput = (label: string, key: keyof Society, options: { type?: string; required?: boolean } = {}) => (
    <Input label={label} type={options.type ?? 'text'} value={String(society[key] ?? '')} required={options.required} onChange={(event) => update(key, event.target.value)} />
  );

  return (
    <div>
      <PageTitle title="Society profile" description="Manage the society information and operating defaults used across the platform." />
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Society profile sections">
        {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'}`}>{tab}</button>)}
      </div>
      <Card>
        <form onSubmit={save}>
        {activeTab === 'Details' && <div className="grid gap-4 sm:grid-cols-2">{textInput('Society name', 'name', { required: true })}{textInput('Registration number', 'regNo')}{textInput('Registration date', 'regDate', { type: 'date' })}{textInput('Address', 'address')}{textInput('State', 'state')}{textInput('Country', 'country')}{textInput('Pincode', 'pincode')}{textInput('Contact', 'contact')}{textInput('Email', 'email', { type: 'email' })}{textInput('Website', 'website')}</div>}
        {activeTab === 'Security' && <div className="grid gap-4 sm:grid-cols-2"><Input label="Administrator username" defaultValue="rajesh@shreeganeshchs.in" /><Input label="Password policy" value="Strong password required" readOnly /><label className="flex items-center gap-3 rounded-lg border border-border p-4 text-sm sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-primary" defaultChecked onChange={() => setHasUnsavedChanges(true)} />Require multi-factor authentication for administrator accounts</label><p className="text-xs text-text-secondary sm:col-span-2">Authentication controls are presentation-only in this UI prototype.</p></div>}
        {activeTab === 'Billing' && <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Interest head<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={interestHead} onChange={(event) => { setInterestHead(event.target.value); setHasUnsavedChanges(true); }}><option>Late Payment Charges</option><option>Other Charges</option></select></label>{textInput('Rate / year', 'interestRate')}<label className="space-y-1.5 text-sm font-medium">Interest type<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={society.typeOfInterest} onChange={(event) => update('typeOfInterest', event.target.value)}><option>Simple</option><option>Compound</option></select></label><label className="space-y-1.5 text-sm font-medium">Billing cycle<select className="min-h-10 w-full rounded-md border border-border bg-white px-3" value={society.billingCycle} onChange={(event) => update('billingCycle', event.target.value)}>{['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].map((cycle) => <option key={cycle}>{cycle}</option>)}</select></label></div>}
        {activeTab === 'Govt IDs' && <div className="grid gap-4 sm:grid-cols-2">{(['pan', 'gst', 'tan', 'ptrc', 'ptec'] as const).map((field) => <div key={field} className="space-y-2"><Input label={field.toUpperCase()} value={society[field] ?? ''} onChange={(event) => update(field, event.target.value)} /><label className="block text-xs text-text-secondary">Attach document (prototype)<input type="file" className="mt-1 block w-full text-xs" accept=".pdf,.jpg,.jpeg,.png" /></label></div>)}</div>}
        {activeTab === 'Comm Setup' && <div className="grid gap-4 sm:grid-cols-3">{['Email', 'WhatsApp', 'SMS'].map((channel) => <div key={channel} className="rounded-lg border border-border p-4"><p className="font-medium">{channel}</p><p className="mt-2 text-xs text-text-secondary">Configuration not connected</p><span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-900">Setup required</span></div>)}</div>}
        {activeTab === 'FY' && <div className="grid max-w-md gap-4">{textInput('Financial year begins', 'financialYearStart', { type: 'date' })}{textInput('Books opening date', 'openingDate', { type: 'date' })}</div>}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-text-secondary">{hasUnsavedChanges ? 'Unsaved changes · Demo environment' : 'Saved in this page session · Demo environment'}</p>
          <Button type="submit" disabled={!hasUnsavedChanges}>Save changes</Button>
        </div>
        </form>
      </Card>
    </div>
  );
}
