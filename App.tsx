import { useEffect, useState } from 'react';
import AdminDashboard from './modules/admin/pages/Dashboard';
import ComplaintsList from './modules/admin/pages/complaints/List';
import AccountingHub from './modules/admin/pages/accounting/AccountingHub';
import MemberList from './modules/admin/pages/members/List';
import SocietyProfile from './modules/admin/pages/SocietyProfile';
import StaffList from './modules/admin/pages/staff/List';
import VisitorLog from './modules/admin/pages/security/VisitorLog';
import LoginPage from './modules/auth/LoginPage';
import LandingPage from './modules/public/LandingPage';
import MemberBills from './modules/member/pages/Bills';
import MemberComplaints from './modules/member/pages/Complaints';
import MemberDashboard from './modules/member/pages/Dashboard';
import MemberVisitors from './modules/member/pages/Visitors';
import StaffGateDashboard from './modules/staff/pages/GateDashboard';
import IncidentReport from './modules/staff/pages/IncidentReport';
import StaffDashboard from './modules/staff/pages/StaffDashboard';
import StaffTasks from './modules/staff/pages/MyTasks';
import StaffAttendance from './modules/staff/pages/Attendance';
import StaffProfile from './modules/staff/pages/Profile';
import AttendanceReport from './modules/admin/pages/staff/AttendanceReport';
import Incidents from './modules/admin/pages/security/Incidents';
import VendorContracts from './modules/admin/pages/vendors/Contracts';
import Reports from './modules/admin/pages/Reports';
import AuditLog from './modules/admin/pages/AuditLog';
import Settings from './modules/admin/pages/Settings';
import ParkingVehicles from './modules/shared/ParkingVehicles';
import Amenities from './modules/shared/Amenities';
import NoticesPolls from './modules/shared/NoticesPolls';
import DocumentsNoc from './modules/shared/DocumentsNoc';
import SuperAdminDashboard from './modules/superadmin/pages/Dashboard';
import Societies from './modules/superadmin/pages/Societies';
import DashboardHeader from './shared/components/layout/DashboardHeader';
import Sidebar from './shared/components/layout/Sidebar';
import Card from './shared/components/ui/Card';
import { AuthProvider } from './shared/hooks/useAuth';
import useAuth from './shared/hooks/useAuth';
import { ToastProvider } from './shared/hooks/useToast';
import type { UserRole } from './shared/types/models';
import { canAccessPage } from './shared/config/roleConfig';

type PublicView = 'landing' | 'login';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Card title="Access restricted" description={`Your current role cannot open “${title}”.`}>
        <p className="text-sm leading-6 text-text-secondary">Choose an available section from your role-specific navigation. Demo workspaces are scoped to the signed-in user.</p>
      </Card>
    </div>
  );
}

function AccountingOrBills() {
  return <AccountingHub />;
}

function AppViewController() {
  const { user, logout } = useAuth();
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [activePage, setActivePage] = useState('Dashboard');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const role: UserRole | null = user?.role ?? null;

  useEffect(() => {
    if (user) {
      setActivePage(user.role === 'staff' && user.staffType === 'Security Guard' ? 'Gate Access' : user.role === 'staff' ? 'Tasks' : 'Dashboard');
      setNavigationOpen(false);
    }
  }, [user?.id, user?.role, user?.staffType]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [user?.id, publicView, activePage]);

  if (!user || !role) {
    return publicView === 'landing'
      ? <LandingPage onLogin={() => setPublicView('login')} />
      : <LoginPage onBackToHome={() => setPublicView('landing')} />;
  }

  const logoutToPublic = () => {
    logout();
    setActivePage('Dashboard');
    setPublicView('landing');
  };

  const switchDemoUser = () => {
    logout();
    setPublicView('login');
  };

  const renderPage = () => {
    if (!canAccessPage(user, activePage)) return <PlaceholderPage title={activePage} />;

    if (role === 'superadmin') {
      if (activePage === 'Societies') return <Societies />;
      if (activePage === 'Dashboard') return <SuperAdminDashboard />;
      return <PlaceholderPage title={activePage} />;
    }

    if (role === 'admin') {
      switch (activePage) {
        case 'Dashboard': return <AdminDashboard />;
        case 'Society Profile': return <SocietyProfile />;
        case 'Members': return <MemberList />;
        case 'Accounting & Billing': return <AccountingOrBills />;
        case 'Security & Entry': return <VisitorLog />;
        case 'Staff': return <StaffList />;
        case 'Attendance': return <AttendanceReport />;
        case 'Incidents': return <Incidents />;
        case 'Complaints': return <ComplaintsList />;
        case 'Parking & Vehicles': return <ParkingVehicles />;
        case 'Amenities': return <Amenities />;
        case 'Notices & Polls': return <NoticesPolls />;
        case 'Documents & NOC': return <DocumentsNoc />;
        case 'Vendors & AMC': return <VendorContracts />;
        case 'Reports': return <Reports />;
        case 'Audit Log': return <AuditLog />;
        case 'Settings': return <Settings />;
        default: return <PlaceholderPage title={activePage} />;
      }
    }

    if (role === 'member') {
      switch (activePage) {
        case 'Dashboard': return <MemberDashboard onBills={() => setActivePage('My Bills & Payments')} onVisitors={() => setActivePage('Visitors')} onComplaints={() => setActivePage('Complaints')} />;
        case 'My Bills & Payments': return <MemberBills />;
        case 'Complaints': return <MemberComplaints />;
        case 'Visitors': return <MemberVisitors />;
        case 'Parking & Vehicles': return <ParkingVehicles />;
        case 'Amenities': return <Amenities />;
        case 'Notices & Polls': return <NoticesPolls />;
        case 'Documents & NOC': return <DocumentsNoc />;
        default: return <PlaceholderPage title={activePage} />;
      }
    }

    if (activePage === 'Incident Report') return <IncidentReport />;
    if (activePage === 'Gate Access' && user.staffType === 'Security Guard') return <StaffGateDashboard onIncident={() => setActivePage('Incident Report')} />;
    if (activePage === 'Dashboard') return <StaffDashboard onNavigate={setActivePage} />;
    if (activePage === 'Tasks') return <StaffTasks />;
    if (activePage === 'Attendance & Shifts') return <StaffAttendance />;
    if (activePage === 'My Profile') return <StaffProfile />;
    if (activePage === 'Parking & Vehicles' && user.staffType === 'Security Guard') return <ParkingVehicles />;
    return <PlaceholderPage title={activePage} />;
  };

  const headerTitle = activePage === 'Dashboard' && user.role === 'member' ? 'Overview' : activePage;

  return (
    <div className="flex min-h-screen bg-surface-light">
      <Sidebar role={role} activeItem={activePage} onNavigate={setActivePage} onLogout={logoutToPublic} open={navigationOpen} onClose={() => setNavigationOpen(false)} staffType={user.staffType} user={user} />
      <div className="min-w-0 flex-1">
        <DashboardHeader title={headerTitle} user={user} onSwitchUser={switchDemoUser} onToggleNavigation={() => setNavigationOpen((isOpen) => !isOpen)} />
        <main className="p-4 pb-20 sm:p-6 sm:pb-20 lg:p-8 lg:pb-8">{renderPage()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppViewController />
      </ToastProvider>
    </AuthProvider>
  );
}
