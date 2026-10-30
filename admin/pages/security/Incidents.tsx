import { useMemo, useSyncExternalStore } from 'react';
import Card from '../../../../shared/components/ui/Card';
import { PageTitle } from '../../../../shared/components/ui/DashboardWidgets';
import useAuth from '../../../../shared/hooks/useAuth';
import { incidentService } from '../../../../shared/services/incidentService';

export default function Incidents() {
  const { user } = useAuth();
  const revision = useSyncExternalStore(incidentService.subscribe, incidentService.getRevision);
  const records = useMemo(() => user ? incidentService.getVisible(user) : [], [user, revision]);
  return <div className="mx-auto max-w-5xl"><PageTitle title="Incident reports" description="Staff-submitted incidents and follow-up assignments for this society." />
    <div className="space-y-3">{records.map((incident) => <Card key={incident.id} title={`${incident.id} · ${incident.type}`} description={`${incident.reporterName} · ${incident.location} · ${new Date(incident.createdAt).toLocaleString('en-IN')}`}>
      <p className="text-sm">{incident.description}</p><p className="mt-3 text-xs text-text-secondary">{incident.followUpTaskId ? `Manager follow-up task: ${incident.followUpTaskId}` : 'No follow-up task linked.'}</p>
    </Card>)}{records.length === 0 && <Card><p className="text-sm text-text-secondary">No incident reports have been submitted.</p></Card>}</div>
  </div>;
}
