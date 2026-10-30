import { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import useToast from '../../hooks/useToast';
import { formatDate } from '../../utils/format';
import { demoDataService } from '../../services/demoDataService';
import type { User } from '../../types/models';

interface DashboardHeaderProps {
  title: string;
  user: User;
  onSwitchUser: () => void;
  onToggleNavigation: () => void;
}

export default function DashboardHeader({ title, user, onSwitchUser, onToggleNavigation }: DashboardHeaderProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const { success } = useToast();

  const resetDemo = () => {
    demoDataService.reset();
    setResetOpen(false);
    success('Demo records have been restored to the sample data.');
  };

  return (
    <>
      <header className="flex min-h-20 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-4 sm:px-6">
        <div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onToggleNavigation} className="grid h-10 w-10 place-items-center rounded-lg border border-border text-lg text-primary lg:hidden" aria-label="Open navigation">☰</button>
          <div>
            <h1 className="text-lg font-semibold text-text sm:text-xl">{title}</h1>
            {user.societyName && <p className="mt-1 text-xs text-text-secondary sm:text-sm">{user.societyName}{user.flat ? ` · ${user.wing}-${user.flat}` : ''}</p>}
          </div>
        </div>
      </div>
        <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-sm text-text-secondary xl:inline">{formatDate(new Date())}</span>
        <span className="hidden rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 sm:inline-flex">Demo mode</span>
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
            {user.name.trim().charAt(0).toUpperCase()}
          </div>
          <span className="max-w-40 truncate text-sm font-medium text-text">{user.name}</span>
        </div>
        <button type="button" onClick={onSwitchUser} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary-light sm:text-sm">Switch demo user</button>
      </div>
      </header>
      <div className="flex justify-end border-b border-border bg-surface px-4 py-1.5 sm:px-6">
        <button type="button" onClick={() => setResetOpen(true)} className="text-xs font-medium text-text-secondary underline decoration-transparent underline-offset-2 transition hover:text-primary hover:decoration-current">Reset demo data</button>
      </div>
      <Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo data?" description="This restores bills, receipts, visitors and complaints to the original fictional sample records." footer={<><Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button><Button variant="danger" onClick={resetDemo}>Reset sample data</Button></>}>
        <p className="text-sm text-text-secondary">Changes made in this browser session will be removed. This does not affect a real society or backend.</p>
      </Modal>
    </>
  );
}
