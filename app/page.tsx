import ChatWidget from "@/components/ChatWidget";

const practiceAreas = [
  {
    title: "Car Accidents",
    copy: "Rear-end collisions, rideshare accidents, and Strip-area crashes involving out-of-state drivers.",
  },
  {
    title: "Slip & Fall",
    copy: "Injuries at hotels, casinos, restaurants, and retail properties across Clark County.",
  },
  {
    title: "Motorcycle Accidents",
    copy: "Serious injury claims where insurers routinely undervalue motorcyclists' cases.",
  },
  {
    title: "Wrongful Death",
    copy: "Representing families seeking accountability and compensation after a preventable loss.",
  },
];

const steps = [
  {
    n: "01",
    title: "Tell us what happened",
    copy: "Reach us any hour, day or night — by phone or chat. No cost, no obligation.",
  },
  {
    n: "02",
    title: "We review your case",
    copy: "An attorney evaluates the details and explains your options in plain language.",
  },
  {
    n: "03",
    title: "We handle the fight",
    copy: "You focus on recovering. We deal with insurance companies and paperwork.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <header className="border-b border-line bg-parchment/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-serif font-semibold text-lg text-ink">
            Vegas Injury Partners
          </div>
          <a
            href="tel:+17025550134"
            className="text-sm font-semibold text-brass-dark hover:text-brass"
          >
            (702) 555-0134
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-ink text-parchment">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] tracking-[0.14em] uppercase text-brass font-semibold mb-4 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              </span>
              Free consultation, available 24/7
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.1] mb-5">
              Injured in Las Vegas?
              <br />
              We&apos;ll fight for what you&apos;re owed.
            </h1>
            <p className="text-[#C9C2AE] text-[15px] leading-relaxed mb-8 max-w-md">
              Serving Las Vegas and Clark County since 2004. Car accidents,
              slip and falls, and serious injury claims — no fee unless we
              win your case.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+17025550134"
                className="bg-brass hover:bg-brass-dark transition-colors text-white text-sm font-semibold px-6 py-3.5 rounded-lg"
              >
                Call (702) 555-0134
              </a>
              <span className="text-[#C9C2AE] text-sm self-center">
                or use the chat in the corner →
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
              <div className="text-[11px] tracking-[0.1em] uppercase text-[#C9C2AE] font-semibold mb-3">
                Why people call us first
              </div>
              <ul className="space-y-3 text-[14px] text-parchment/90">
                <li>— No fee unless you win</li>
                <li>— Direct access to your attorney, not a call center</li>
                <li>— 20+ years resolving cases in Clark County</li>
                <li>— Bilingual staff, English &amp; Spanish</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Practice areas */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-[11px] tracking-[0.14em] uppercase text-brass-dark font-semibold mb-3">
          Practice areas
        </div>
        <h2 className="font-serif text-3xl font-semibold mb-10 max-w-xl">
          Case types we handle every week
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {practiceAreas.map((area) => (
            <div
              key={area.title}
              className="border border-line rounded-xl p-6 bg-paper"
            >
              <h3 className="font-serif text-lg font-semibold mb-2">
                {area.title}
              </h3>
              <p className="text-slate text-[14px] leading-relaxed">
                {area.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-white border-y border-line">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-[11px] tracking-[0.14em] uppercase text-brass-dark font-semibold mb-3">
            How it works
          </div>
          <h2 className="font-serif text-3xl font-semibold mb-12 max-w-xl">
            Three steps, starting the moment you reach out
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="font-serif text-3xl text-brass font-semibold mb-3">
                  {s.n}
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{s.title}</h3>
                <p className="text-slate text-[14px] leading-relaxed">
                  {s.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-ink text-parchment rounded-2xl px-8 py-14 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-3">
            Accidents don&apos;t wait for business hours. Neither do we.
          </h2>
          <p className="text-[#C9C2AE] text-[14px] mb-8 max-w-md mx-auto">
            Start a conversation any time, day or night — a member of our
            team will follow up personally.
          </p>
          <a
            href="tel:+17025550134"
            className="inline-block bg-brass hover:bg-brass-dark transition-colors text-white text-sm font-semibold px-7 py-3.5 rounded-lg"
          >
            Call (702) 555-0134
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 text-[12px] text-slate flex flex-wrap justify-between gap-3">
          <div>© {new Date().getFullYear()} Vegas Injury Partners. All rights reserved.</div>
          <div>4435 S Eastern Ave, Las Vegas, NV 89119</div>
        </div>
      </footer>

      <ChatWidget />
    </main>
  );
}
