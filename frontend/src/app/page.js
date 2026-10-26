import HeroActions from "@/components/HeroActions";
import { CardsIcon, CodeIcon, HeartIcon, ShieldIcon, SparklesIcon, UsersIcon } from "@/components/Icons";

const FEATURES = [
  {
    icon: CardsIcon,
    title: "Swipe on developers",
    text: "A feed of real developers with their skills and story. Drag right if you're interested, left to pass.",
  },
  {
    icon: UsersIcon,
    title: "Match & connect",
    text: "When someone accepts your request you're connected — build side projects, hackathons or startups together.",
  },
  {
    icon: ShieldIcon,
    title: "Secure by design",
    text: "httpOnly cookies, rate-limited auth and one-time password reset links. Your account stays yours.",
  },
];

const STEPS = [
  { title: "Create your profile", text: "Add your photo, skills and a short bio." },
  { title: "Discover developers", text: "Swipe through people who match your vibe." },
  { title: "Get connected", text: "Accept requests and start building." },
];

// Decorative stack of sample cards for the hero
function HeroCards() {
  const cards = [
    { name: "left", rotate: "-rotate-6", pos: "left-0 top-6", tone: "from-navy-600 to-navy-800" },
    { name: "right", rotate: "rotate-6", pos: "right-0 top-10", tone: "from-crimson-700 to-navy-800" },
  ];
  return (
    <div className="relative mx-auto h-[26rem] w-full max-w-sm">
      {cards.map((c) => (
        <div
          key={c.name}
          className={`absolute ${c.pos} ${c.rotate} h-80 w-56 rounded-3xl border border-line bg-linear-to-br ${c.tone} p-5 opacity-70 shadow-2xl`}
        >
          <div className="flex h-full flex-col justify-end gap-2">
            <span className="h-3 w-24 rounded-full bg-white/25" />
            <span className="h-2 w-16 rounded-full bg-white/15" />
          </div>
        </div>
      ))}
      <div className="absolute inset-x-6 top-0 z-10 mx-auto flex h-[24rem] max-w-[17rem] flex-col overflow-hidden rounded-3xl border border-line bg-navy-900 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]">
        <div className="relative flex flex-1 items-center justify-center bg-linear-to-br from-navy-500 via-navy-700 to-crimson-700">
          <span className="font-display text-6xl font-bold text-white/90">HK</span>
          <span className="absolute top-4 right-4 rounded-full border-2 border-success px-2.5 py-0.5 text-xs font-bold tracking-wider text-success">
            MATCH
          </span>
        </div>
        <div className="space-y-2.5 p-4">
          <p className="font-display text-lg font-bold">
            Haseeb <span className="font-sans text-base font-medium text-muted">26</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Node.js", "MongoDB", "Next.js"].map((s) => (
              <span key={s} className="chip">
                <CodeIcon className="size-3 text-crimson-300" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-4">
        <span className="flex size-14 items-center justify-center rounded-full border border-line bg-navy-850 text-muted shadow-xl">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
        <span className="flex size-14 items-center justify-center rounded-full bg-linear-to-br from-crimson-500 to-crimson-700 text-white shadow-xl shadow-crimson-800/40">
          <HeartIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="chip border-crimson-700/60 bg-crimson-800/30 text-crimson-300">
            <SparklesIcon className="size-3.5" />
            Built for developers
          </span>
          <h1 className="mt-5 font-display text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find the developer
            <br />
            who <span className="bg-linear-to-r from-crimson-400 to-crimson-300 bg-clip-text text-transparent">gets your code.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            devTinder connects you with developers who share your stack and your ambition. Swipe, match and start
            building together.
          </p>
          <HeroActions />
        </div>
        <HeroCards />
      </section>

      {/* Features */}
      <section className="grid gap-5 pb-16 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6 transition hover:-translate-y-1 hover:border-navy-500">
            <div className="flex size-11 items-center justify-center rounded-xl bg-crimson-800/40 text-crimson-300 ring-1 ring-crimson-700/50">
              <Icon className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="card mb-16 p-8 sm:p-10">
        <h2 className="font-display text-2xl font-bold">How it works</h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-crimson-600 font-display font-bold text-crimson-300">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-subtle">
        devTinder · Built with Node.js, Express, MongoDB & Next.js
      </footer>
    </div>
  );
}
