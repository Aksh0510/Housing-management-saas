import type { UserRole } from '../../types/models';
import { getNavigation } from '../../config/roleConfig';

const roleLabels: Record<UserRole, string> = {
  superadmin: 'Platform Admin',
  admin: 'Society Admin',
  member: 'Resident',
  staff: 'Staff',
};

interface SidebarProps {
  role: UserRole;
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
  staffType?: string;
  user?: import('../../types/models').User;
}

export default function Sidebar({ role, activeItem, onNavigate, onLogout, open, onClose, staffType, user }: SidebarProps) {
  const navigation = user ? getNavigation(user) : role === 'staff' && staffType === 'Security Guard' ? ['Gate Dashboard', 'Attendance & Shifts', 'Incident Report', 'My Profile'] : ['Dashboard'];
  const mobileNavigation = navigation.slice(0, 5).map((item) => ({
    item,
    label: item === 'Dashboard' ? 'Home' : item,
  }));
  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-primary text-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="border-b border-white/15 px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold tracking-tight">SocietyDesk</p>
          <button type="button" className="rounded px-2 py-1 text-white/80 hover:bg-white/10 lg:hidden" onClick={onClose} aria-label="Close navigation">×</button>
        </div>
        <p className="mt-1 text-xs text-white/70">Management platform</p>
      </div>

      <div className="px-5 py-4">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{roleLabels[role]}</span>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => { onNavigate(item); onClose(); }}
            aria-current={activeItem === item ? 'page' : undefined}
            className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
              activeItem === item ? 'bg-white text-primary font-semibold' : 'text-white/85 hover:bg-white/10'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/15 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-md px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" style={{ gridTemplateColumns: `repeat(${mobileNavigation.length}, minmax(0, 1fr))` }} aria-label="Mobile navigation">
        {mobileNavigation.map(({ item, label }) => (
          <button key={item} type="button" onClick={() => onNavigate(item)} aria-current={activeItem === item ? 'page' : undefined} className={`min-h-14 px-1 text-[11px] font-medium ${activeItem === item ? 'text-primary' : 'text-text-secondary'}`}>{label}</button>
        ))}
      </nav>
    </>
  );
}
