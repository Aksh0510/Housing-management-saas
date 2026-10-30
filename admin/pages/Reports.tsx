import { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import { PageTitle } from '../../../shared/components/ui/DashboardWidgets';
import useAuth from '../../../shared/hooks/useAuth';
import useToast from '../../../shared/hooks/useToast';
import { reportService } from '../../../shared/services/reportService';

export default function Reports() {
  const { user } = useAuth();
  const { error, success } = useToast();
  const [from, setFrom] = useState(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<'Attendance' | 'Visitors' | 'Incidents'>('Attendance');
  const [preview, setPreview] = useState('');
  const generate = () => {
    if (!user) return;
    try { setPreview(reportService.buildCsv(user, report, { from, to })); success('Demo report generated.'); }
    catch (reason) { error(reason instanceof Error ? reason.message : 'Report generation failed.'); }
  };
  const download = () => {
    if (!preview) { error('Generate a report before exporting.'); return; }
    const url = URL.createObjectURL(new Blob([preview], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `society-${report.toLowerCase()}-${from}-${to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    success('Demo CSV downloaded.');
  };
  return <div className="mx-auto max-w-5xl"><PageTitle title="Reports & export center" description="Filter local demo records by date and export an actual CSV file." />
    <Card title="Build report"><div className="grid gap-3 sm:grid-cols-4"><label className="space-y-1.5 text-sm font-medium">Report<select value={report} onChange={(event) => { setReport(event.target.value as typeof report); setPreview(''); }} className="min-h-10 w-full rounded-md border border-border bg-white px-3"><option>Attendance</option><option>Visitors</option><option>Incidents</option></select></label><Input label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /><Input label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} /><div className="flex items-end gap-2"><Button onClick={generate}>Generate</Button><Button onClick={download} variant="outline" disabled={!preview}>Export CSV</Button></div></div></Card>
    {preview && <Card className="mt-4" title={`${report} report preview`} description="Showing CSV data generated from local mock services."><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{preview}</pre></Card>}
  </div>;
}
