import { useState, type FormEvent } from 'react';
import Badge from '../../shared/components/ui/Badge';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';
import Input from '../../shared/components/ui/Input';
import useAuth from '../../shared/hooks/useAuth';
import useToast from '../../shared/hooks/useToast';
import { authenticateDemoUser, getDemoUsers } from '../../shared/services/authService';
import type { UserRole } from '../../shared/types/models';

const roleLabels: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Society Admin',
  member: 'Member',
  staff: 'Staff',
};

const roleVariants: Record<UserRole, 'info' | 'success' | 'neutral' | 'warning'> = {
  superadmin: 'info',
  admin: 'success',
  member: 'neutral',
  staff: 'warning',
};

interface LoginPageProps {
  onBackToHome?: () => void;
}

export default function LoginPage({ onBackToHome }: LoginPageProps) {
  const { login } = useAuth();
  const { error, success } = useToast();
  const demoUsers = getDemoUsers();
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const matchingUser = authenticateDemoUser(identifier);
      login(matchingUser);
      success(`Demo workspace opened for ${matchingUser.name}.`);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'The demo account could not be opened.';
      setFormError(message);
      error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-light px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          {onBackToHome && <button type="button" onClick={onBackToHome} className="mb-5 text-sm font-medium text-primary hover:underline">← Back to home</button>}
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">SocietyDesk · Demo mode</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">Welcome back</h1>
          <p className="mt-2 text-sm text-text-secondary">Choose a fictional demo user to open a role-specific workspace.</p>
        </div>

        <Card className="shadow-md" contentClassName="space-y-5">
          <form onSubmit={signIn} className="space-y-4">
            <Input
              label="Email or mobile number"
              name="identifier"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Enter an email or mobile number"
              autoComplete="username"
              required
            />
            <p className="-mt-2 text-xs text-text-secondary">
              Local demo only. No password is requested and no production authentication is connected.
            </p>
            {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>}
            <Button type="submit" fullWidth disabled={!identifier.trim() || isSubmitting}>
              {isSubmitting ? 'Opening workspace…' : 'Open demo workspace'}
            </Button>
          </form>

          <div className="border-t border-border pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-semibold text-text">Choose a demo role</h2><span className="text-xs text-text-secondary">{demoUsers.length} fictional accounts</span></div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {demoUsers.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => { setIdentifier(user.email); setFormError(''); }}
                    className={`flex min-h-[4.25rem] w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-light focus-visible:outline-2 focus-visible:outline-primary ${identifier === user.email ? 'border-primary bg-primary-light/50' : 'border-border'}`}
                    aria-pressed={identifier === user.email}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text">{user.name}</span>
                      <span className="block truncate text-xs text-text-secondary">{user.staffType ?? user.memberType ?? user.email}</span>
                    </span>
                    <Badge variant={roleVariants[user.role]}>{roleLabels[user.role]}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-text-secondary">Sample data is fictional, in-memory and not connected to a live society.</p>
      </div>
    </main>
  );
}
