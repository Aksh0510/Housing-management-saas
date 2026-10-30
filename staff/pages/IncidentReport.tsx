import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import useToast from '../../../shared/hooks/useToast';
import useAuth from '../../../shared/hooks/useAuth';
import { incidentService } from '../../../shared/services/incidentService';

export default function IncidentReport() {
  const { user } = useAuth();
  const [fileName, setFileName] = useState('');
  const { success } = useToast();
  const { error } = useToast();
  const revision = useSyncExternalStore(incidentService.subscribe, incidentService.getRevision);
  const incidents = useMemo(() => user ? incidentService.getVisible(user) : [], [user, revision]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try {
      const incident = incidentService.create(user, {
        type: String(data.get('type') ?? ''),
        location: String(data.get('location') ?? ''),
        description: String(data.get('description') ?? ''),
      });
      event.currentTarget.reset();
      setFileName('');
      success(`${incident.id} saved. ${incident.followUpTaskId ? `Follow-up ${incident.followUpTaskId} assigned to the manager.` : ''} No external alert was sent.`);
    } catch (reason) {
      error(reason instanceof Error ? reason.message : 'Incident could not be submitted.');
    }
  };
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Incident report" description="Quickly record a safety or facility issue for the society team." />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium">Incident type<select name="type" className="min-h-10 w-full rounded-md border border-border bg-white px-3"><option>Safety concern</option><option>Facility damage</option><option>Visitor issue</option><option>Medical emergency</option><option>Other</option></select></label>
          <Input name="location" label="Location / flat" placeholder="e.g. B wing lobby" required />
          <label className="block text-sm font-medium">What happened?<textarea name="description" rows={5} required minLength={8} className="mt-1.5 w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Describe the issue and any immediate action taken." /></label>
          <div><label className="block text-sm font-medium">Add a photo (optional)</label><input type="file" accept="image/*" capture="environment" className="mt-2 block w-full text-sm" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} />{fileName && <p className="mt-1 text-xs text-text-secondary">Selected: {fileName} · upload is not connected in this demo</p>}</div>
          <Button type="submit" size="lg" fullWidth>Submit incident report</Button>
        </form>
      </Card>
      {incidents.length > 0 && <Card className="mt-5" title="Shared incident history" description="Visible to the society manager and admin; no external alert has been sent.">
        <ul className="space-y-3">{incidents.map((incident) => <li key={incident.id} className="rounded-lg border border-border p-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-semibold">{incident.id} · {incident.type}</p><p className="text-xs text-text-secondary">{new Date(incident.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p></div><p className="mt-1 text-xs text-text-secondary">{incident.reporterName} · {incident.location}{incident.followUpTaskId ? ` · Task ${incident.followUpTaskId}` : ''}</p><p className="mt-2 text-sm">{incident.description}</p></li>)}</ul>
      </Card>}
    </div>
  );
}
