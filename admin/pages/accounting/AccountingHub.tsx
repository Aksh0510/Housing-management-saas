import { useState } from 'react';
import AccountHeads from './AccountHeads';
import Bills from './Bills';

export default function AccountingHub() {
  const [section, setSection] = useState<'bills' | 'heads'>('bills');
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Accounting sections">
        <button type="button" role="tab" aria-selected={section === 'bills'} onClick={() => setSection('bills')} className={`rounded-md px-4 py-2 text-sm font-medium ${section === 'bills' ? 'bg-primary text-white' : 'border border-border bg-white text-text-secondary'}`}>Bills</button>
        <button type="button" role="tab" aria-selected={section === 'heads'} onClick={() => setSection('heads')} className={`rounded-md px-4 py-2 text-sm font-medium ${section === 'heads' ? 'bg-primary text-white' : 'border border-border bg-white text-text-secondary'}`}>Account heads</button>
      </div>
      {section === 'bills' ? <Bills /> : <AccountHeads />}
    </div>
  );
}
