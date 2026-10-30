import { useState, type FormEvent } from 'react';
import Button from '../../shared/components/ui/Button';
import Card from '../../shared/components/ui/Card';

const features = [
  { title: 'Finance that connects', description: 'Generate maintenance bills, track receipts and keep a clear flat-wise balance.', icon: '₹' },
  { title: 'A calmer helpdesk', description: 'Give each request an owner, a status and a visible path to resolution.', icon: '✓' },
  { title: 'Confident gate operations', description: 'Share resident pre-approvals with the gate and keep entry history in sync.', icon: '⌂' },
  { title: 'Resident self-service', description: 'Keep bills, visitors and requests close at hand for owners and tenants.', icon: '◎' },
  { title: 'Committee decisions', description: 'Bring operational context and financial visibility into one workspace.', icon: '◷' },
  { title: 'Useful society records', description: 'Organize members, staff, notices and documents around society workflows.', icon: '▤' },
];

const roles = [
  ['Committee', 'Review approvals, finances and society activity.'],
  ['Accountant / Treasurer', 'Work with bills, balances and receipt history.'],
  ['Society manager', 'Keep daily operations and resident requests moving.'],
  ['Gate team', 'Use a focused, touch-friendly visitor workflow.'],
  ['Owners', "See your flat's bills, visitors and requests."],
  ['Tenants', 'Access the society services shared with your household.'],
];

const plans = [
  { name: 'Essentials', description: 'Core member, billing and communication workflows.', features: ['Member directory', 'Maintenance billing', 'Resident requests'] },
  { name: 'Operations', description: 'Connected finance, security and daily society operations.', features: ['Everything in Essentials', 'Visitor and gate workflow', 'Operations overview'], featured: true },
  { name: 'Portfolio', description: 'Central visibility for teams managing multiple communities.', features: ['Everything in Operations', 'Multi-society overview', 'Guided onboarding'] },
];

const questions = [
  ['Can we try the product before setup?', 'Yes. Use the interactive demo to explore role-specific sample workspaces. Demo data is fictional and resets with the page session.'],
  ['Does the demo process real payments?', 'No. The payment flow records a clearly labelled demo receipt in the browser. No payment gateway or bank is contacted.'],
  ['Are SMS, WhatsApp and email connected?', 'No provider is connected in this demo. Delivery actions are shown as simulated and are not represented as sent messages.'],
  ['Is the product certified or legally compliant?', 'No certification or legal-compliance claim is made here. Societies should verify requirements and configured policies with qualified professionals.'],
];

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4"><path d="M4 10h11m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnquirySubmitted(true);
    event.currentTarget.reset();
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-text">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5 lg:px-8" aria-label="Main navigation">
          <a className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-primary" href="#home" onClick={closeMenu}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm text-white">S</span>
            SocietyDesk
          </a>
          <div className={`${menuOpen ? 'absolute inset-x-0 top-full flex flex-col border-b border-border bg-white p-4 shadow-lg' : 'hidden'} items-stretch gap-1 text-sm font-medium text-text-secondary md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            {[['Features', '#features'], ['Who it serves', '#solutions'], ['Security', '#security'], ['Pricing', '#pricing'], ['FAQ', '#faq'], ['Contact', '#contact']].map(([label, href]) => (
              <a key={href} href={href} onClick={closeMenu} className="rounded-lg px-3 py-2 transition hover:bg-primary-light hover:text-primary md:px-0 md:py-1 md:hover:bg-transparent">{label}</a>
            ))}
            <button type="button" onClick={() => { closeMenu(); onLogin(); }} className="rounded-lg px-3 py-2 text-left font-semibold text-primary transition hover:bg-primary-light md:hidden">Login to demo</button>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button type="button" onClick={onLogin} className="px-3 py-2 text-sm font-semibold text-text-secondary transition hover:text-primary">Login</button>
            <a href="#contact" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Book a demo <ArrowIcon /></a>
          </div>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-lg border border-border text-primary md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? '×' : '☰'}</button>
        </nav>
      </header>

      <main>
        <section id="home" className="relative isolate bg-surface-light">
          <div className="absolute -right-36 -top-20 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:py-20 md:grid-cols-[1.05fr_0.95fr] md:py-24 lg:px-8">
            <div className="animate-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm"><span className="h-2 w-2 rounded-full bg-secondary" /> Housing society operations, connected</span>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.12] tracking-tight text-primary sm:text-5xl lg:text-6xl">Run your society with <span className="text-secondary">more clarity.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">Bring maintenance billing, resident requests and gate activity into one practical workspace for Indian housing communities.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={onLogin}>Explore the demo <ArrowIcon /></Button>
                <a href="#features" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-light">See how it works</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-text-secondary sm:text-sm">
                <span className="inline-flex items-center gap-2"><span className="text-secondary">✓</span> Role-specific workspaces</span>
                <span className="inline-flex items-center gap-2"><span className="text-secondary">✓</span> Connected demo workflows</span>
                <span className="inline-flex items-center gap-2"><span className="text-secondary">✓</span> India-ready date and currency</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl animate-in">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-light text-primary">⌂</span><div><p className="text-sm font-semibold">Society overview</p><p className="mt-0.5 text-xs text-text-secondary">Shree Ganesh CHS · Demo society</p></div></div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-900">DEMO DATA</span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5">
                  {[['Open balances', '₹1,24,500', 'From sample bills'], ['Collected', '₹64,800', 'Mock receipts only'], ['Open requests', '14', 'Sample helpdesk data'], ['Visitors inside', '2', 'Gate activity sample']].map(([label, value, note]) => (
                    <div key={label} className="rounded-xl border border-border/80 p-3 sm:p-4">
                      <p className="text-[11px] font-medium text-text-secondary sm:text-xs">{label}</p><p className="mt-2 text-lg font-semibold tracking-tight text-primary sm:text-2xl">{value}</p><p className="mt-1 text-[10px] text-text-secondary sm:text-xs">{note}</p>
                    </div>
                  ))}
                </div>
                <div className="mx-4 mb-4 rounded-xl bg-surface-light p-4 sm:mx-5 sm:mb-5">
                  <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold">Collection activity</p><p className="mt-1 text-[10px] text-text-secondary">Illustrative monthly sample</p></div><span className="text-xs text-text-secondary">May – Oct</span></div>
                  <div className="flex h-24 items-end gap-2 sm:gap-3" role="img" aria-label="Illustrative demo collections trend from May through October">
                    {[38, 57, 48, 73, 63, 88].map((height, index) => <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className={`w-full rounded-t-md ${index === 5 ? 'bg-secondary' : 'bg-primary/70'} transition-all duration-300 hover:opacity-80`} style={{ height: `${height}%` }} /><span className="text-[9px] text-text-secondary">{['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][index]}</span></div>)}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-secondary"><span>Finance <span className="text-border">/</span> Operations <span className="text-border">/</span> Residents</span><span className="font-medium text-secondary">Sample workspace</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
            <div><p className="text-sm font-semibold text-text">A product walkthrough, not a claim about live customers.</p><p className="mt-1 text-xs text-text-secondary">Numbers and records in the preview are fictional demo data.</p></div>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium text-text-secondary sm:justify-end"><span className="rounded-full bg-surface-light px-3 py-2">Finance workflows</span><span className="rounded-full bg-surface-light px-3 py-2">Resident experience</span><span className="rounded-full bg-surface-light px-3 py-2">Gate operations</span></div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">One connected workspace</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">The work behind a well-run community.</h2><p className="mt-4 text-sm leading-6 text-text-secondary sm:text-base">Purpose-built flows for routine tasks, with shared context instead of disconnected lists.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => <Card key={feature.title} className="group border-border/80 transition duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-lg font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">{feature.icon}</div>
              <h3 className="mt-5 text-base font-semibold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{feature.description}</p>
            </Card>)}
          </div>
        </section>

        <section id="solutions" className="bg-surface-light py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div className="max-w-lg"><p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Designed around people</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">The right view for every role.</h2><p className="mt-4 text-sm leading-6 text-text-secondary">Keep the work relevant: finance for the treasurer, a faster gate flow for security, and a personal service view for residents.</p><Button className="mt-6" onClick={onLogin}>Choose a demo role <ArrowIcon /></Button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {roles.map(([role, description], index) => <div key={role} className="flex gap-4 rounded-xl border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-semibold ${index % 2 ? 'bg-green-50 text-secondary' : 'bg-primary-light text-primary'}`}>{String(index + 1).padStart(2, '0')}</span><div><h3 className="text-sm font-semibold">{role}</h3><p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p></div></div>)}
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:py-20 md:grid-cols-2 lg:px-8">
          <div className="rounded-2xl bg-primary p-7 text-white sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">A clearer operating rhythm</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">From setup to everyday work.</h2>
            <ol className="mt-7 space-y-5">{[['01', 'Set up your society', 'Bring buildings, flats, roles and billing defaults together.'], ['02', 'Connect the workflows', 'Use shared records across finance, residents and the gate.'], ['03', 'Review and improve', 'Use activity and reports to keep decisions visible.']].map(([number, title, description]) => <li key={number} className="flex gap-4"><span className="text-sm font-semibold text-white/60">{number}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-white/75">{description}</p></div></li>)}</ol>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Security & transparency</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Clear about what is live—and what is a demo.</h2>
            <p className="mt-4 text-sm leading-6 text-text-secondary">This presentation uses fictional in-browser records. Payment, email and messaging provider integrations are not connected. Data protection, legal and security controls must be validated for each production deployment.</p>
            <ul className="mt-6 space-y-3 text-sm text-text-secondary"><li className="flex gap-3"><span className="font-semibold text-secondary">✓</span>Role-scoped demo views for supported accounts</li><li className="flex gap-3"><span className="font-semibold text-secondary">✓</span>Financial actions labelled as simulations</li><li className="flex gap-3"><span className="font-semibold text-secondary">✓</span>Operational changes reflected in linked demo screens</li></ul>
          </div>
        </section>

        <section id="pricing" className="bg-surface-light py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Plans for your community</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A conversation before a quote.</h2><p className="mt-4 text-sm leading-6 text-text-secondary">Pricing depends on society needs and onboarding scope. No rates or customer claims are invented in this demo.</p></div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">{plans.map((plan) => <Card key={plan.name} className={plan.featured ? 'border-2 border-primary shadow-lg' : 'border-border/80'}>
              {plan.featured && <span className="rounded-full bg-primary-light px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">Connected workflows</span>}
              <h3 className="mt-4 text-lg font-semibold">{plan.name}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{plan.description}</p><p className="mt-5 text-xl font-semibold text-primary">Talk to our team</p><ul className="mt-5 space-y-3 border-t border-border pt-5 text-sm text-text-secondary">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><span className="text-secondary">✓</span>{feature}</li>)}</ul><a href="#contact" className={`mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${plan.featured ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-border text-primary hover:bg-primary-light'}`}>Discuss {plan.name} <ArrowIcon /></a>
            </Card>)}</div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Questions</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Straight answers for your walkthrough.</h2></div>
          <div className="mt-8 divide-y divide-border border-y border-border">{questions.map(([question, answer]) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold"><span>{question}</span><span className="text-lg text-primary transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">{answer}</p></details>)}</div>
        </section>

        <section id="contact" className="bg-primary px-5 py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center lg:px-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Start a conversation</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">See how it could work for your society.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/75">Explore sample roles now, or share a few details to shape a future product walkthrough.</p><Button variant="outline" className="mt-6" onClick={onLogin}>Open interactive demo <ArrowIcon /></Button></div>
            <form onSubmit={submitEnquiry} className="rounded-2xl bg-white p-5 text-text shadow-xl sm:p-7">
              <h3 className="text-lg font-semibold">Request a walkthrough</h3><p className="mt-1 text-xs text-text-secondary">Demo form only. Information is not sent to a server.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold">Your name<input name="name" autoComplete="name" required className="min-h-11 w-full rounded-lg border border-border px-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
                <label className="space-y-1.5 text-xs font-semibold">Work email<input name="email" type="email" autoComplete="email" required className="min-h-11 w-full rounded-lg border border-border px-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
                <label className="space-y-1.5 text-xs font-semibold sm:col-span-2">Society / community<input name="society" required className="min-h-11 w-full rounded-lg border border-border px-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Button type="submit">Save demo enquiry <ArrowIcon /></Button>{enquirySubmitted && <p role="status" className="text-xs font-medium text-secondary">Demo enquiry noted locally; nothing was sent.</p>}</div>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#082f50] text-white/75">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 text-xs sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div><p className="font-bold text-white">SocietyDesk</p><p className="mt-1">Housing society operations demo · Fictional sample data</p></div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><a className="hover:text-white" href="#features">Features</a><a className="hover:text-white" href="#security">Security notes</a><a className="hover:text-white" href="#faq">FAQ</a><a className="hover:text-white" href="#contact">Contact</a><button type="button" onClick={onLogin} className="hover:text-white">Login</button></div>
          <span>© 2026 SocietyDesk · Demo experience</span>
        </div>
      </footer>
    </div>
  );
}
