import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  Sprout,
  Users,
  BarChart3,
  ArrowRight,
  Leaf,
  Zap,
  Recycle,
  Sun,
  TreePine,
  Wrench,
  Building2,
  Star,
  Globe,
  CheckCircle2,
  MapPin,
  Clock,
  Play,
  TrendingUp,
} from "lucide-react";

const IMG_COMMUNITY = "https://images.unsplash.com/photo-1768306662463-4e3f6c858889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwYWN0aW9uJTIwdm9sdW50ZWVyJTIwY29tbXVuaXR5JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI4NTQ4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_GARDEN = "https://images.unsplash.com/photo-1769690093872-b6909c820a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGdhcmRlbiUyMHJvb2Z0b3AlMjBncmVlbiUyMGNpdHl8ZW58MXx8fHwxNzcyODU0ODgyfDA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_TREE = "https://images.unsplash.com/photo-1637552481611-1f36222fb188?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmVlJTIwcGxhbnRpbmclMjByZWZvcmVzdGF0aW9uJTIwaGFuZHMlMjBzb2lsfGVufDF8fHx8MTc3Mjg1NDg4NHww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_SOLAR = "https://images.unsplash.com/photo-1626793369994-a904d2462888?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsJTIwaW5zdGFsbGF0aW9uJTIwcmVuZXdhYmxlJTIwZW5lcmd5JTIwd29ya2VyfGVufDF8fHx8MTc3Mjg0MTkxNHww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_COMPOST = "https://images.unsplash.com/photo-1680847307417-b6ae9b78cda6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wb3N0aW5nJTIwb3JnYW5pYyUyMHdhc3RlJTIwc3VzdGFpbmFibGUlMjBsaXZpbmd8ZW58MXx8fHwxNzcyODU0ODg3fDA&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_REPAIR = "https://images.unsplash.com/photo-1633991810204-8f75dafdd324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXBhaXIlMjB3b3Jrc2hvcCUyMHRvb2xzJTIwY29tbXVuaXR5JTIwdXBjeWNsaW5nfGVufDF8fHx8MTc3Mjg1NDg4OHww&ixlib=rb-4.1.0&q=80&w=1080";

function useCounter(target: number, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);
  return count;
}

function AnimatedStat({ value, suffix, label, desc }: { value: number; suffix: string; label: string; desc?: string }) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCounter(value, 2000, triggered);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTriggered(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl mb-1" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "white" }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{label}</div>
      {desc && <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{desc}</div>}
    </div>
  );
}

const missionCards = [
  { title: "Urban Composting", cat: "Soil & Waste", pts: 120, duration: "2 weeks", img: IMG_COMPOST, color: "#2F8F6B", diff: "Beginner" },
  { title: "Solar Energy Basics", cat: "Clean Energy", pts: 200, duration: "3 weeks", img: IMG_SOLAR, color: "#F59E0B", diff: "Intermediate" },
  { title: "Urban Gardening", cat: "Food & Nature", pts: 160, duration: "4 weeks", img: IMG_GARDEN, color: "#10B981", diff: "Beginner" },
  { title: "Repair Café Skills", cat: "Circular Economy", pts: 80, duration: "1 week", img: IMG_REPAIR, color: "#3B82F6", diff: "Beginner" },
];

const testimonials = [
  { name: "Maria Santos", role: "Urban Gardener · Quezon City", text: "SkillSeed helped me turn my rooftop into a productive food garden. The composting mission changed everything — I now teach my neighbors!", avatar: "MS", stars: 5 },
  { name: "James Reyes", role: "Solar Installer · Manila", text: "I completed the energy-saving missions and landed a job with a solar NGO. The hands-on format is incredible for real learning.", avatar: "JR", stars: 5 },
  { name: "Lena Cruz", role: "Community Organizer · Cebu", text: "Our barangay is running 3 repair cafés after learning through SkillSeed. The community challenges keep everyone motivated.", avatar: "LC", stars: 5 },
];

const roles = [
  {
    id: "learner",
    icon: Sprout,
    title: "I'm a Learner",
    subtitle: "Beginner-friendly",
    desc: "Build green skills from scratch and participate in real climate missions — no experience needed.",
    cta: "Start Learning",
    href: "/signup",
    bg: "#F0FDF6",
    border: "#BBF7D0",
    iconBg: "#E6F4EE",
    iconColor: "#2F8F6B",
    textColor: "#0F3D2E",
  },
  {
    id: "jobready",
    icon: Wrench,
    title: "I'm Job Ready",
    subtitle: "Skilled volunteer",
    desc: "Deploy your existing skills on real climate projects and build a verified impact portfolio.",
    cta: "Offer My Skills",
    href: "/signup",
    bg: "#F0F7FF",
    border: "#BAE0FD",
    iconBg: "#DBEAFE",
    iconColor: "#1E6B9A",
    textColor: "#1E3A5F",
  },
  {
    id: "org",
    icon: Building2,
    title: "I'm an Organization",
    subtitle: "Project coordinator",
    desc: "Post climate projects and get matched with skilled volunteers and professionals immediately.",
    cta: "Post a Project",
    href: "/post-project",
    bg: "#0F3D2E",
    border: "#0F3D2E",
    iconBg: "rgba(255,255,255,0.15)",
    iconColor: "white",
    textColor: "white",
  },
];

export function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-16 pb-0 overflow-hidden" style={{ background: "white" }}>
        {/* subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#0F3D2E 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
            style={{ background: "#E6F4EE", border: "1px solid #BBF7D0" }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <span className="text-sm" style={{ color: "#0F3D2E", fontWeight: 600 }}>
              1,240+ active climate missions · 87 countries
            </span>
          </div>

          <h1 className="mb-5" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "clamp(2.4rem, 5.5vw, 4rem)", lineHeight: 1.1, color: "#0F3D2E", letterSpacing: "-0.02em" }}>
            Grow Your Climate Skills.<br />
            <span style={{ color: "#2F8F6B" }}>Make Real Impact.</span>
          </h1>

          <p className="mb-8 mx-auto text-lg" style={{ color: "#6B7280", lineHeight: 1.7, maxWidth: "580px" }}>
            SkillSeed connects learners, skilled volunteers, and organizations to short, real-world climate missions. Learn by doing. Track your impact. Join the movement.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Link to="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #0F3D2E 0%, #2F8F6B 100%)", fontWeight: 700, fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 20px rgba(47,143,107,0.4)" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              <Users className="w-4 h-4" /> Join a Project
            </Link>
            <Link to="/hands-on"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl transition-all duration-200"
              style={{ background: "white", border: "2px solid #0F3D2E", color: "#0F3D2E", fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F0FDF6")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}> 
              <Sprout className="w-4 h-4" /> Learn New Skills
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["MS", "JR", "LC", "AB", "DK"].map((i, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white"
                    style={{ background: ["#2F8F6B", "#059669", "#1EB89A", "#0F3D2E", "#34D399"][idx], fontWeight: 700 }}>{i}</div>
                ))}
              </div>
              <span className="text-sm" style={{ color: "#6B7280" }}><strong style={{ color: "#0F3D2E" }}>12,840+</strong> members</span>
            </div>
            {[
              { icon: Globe, label: "87 countries" },
              { icon: CheckCircle2, label: "Verified missions" },
              { icon: Leaf, label: "Free to join" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" style={{ color: "#2F8F6B" }} />
                <span className="text-sm" style={{ color: "#6B7280", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission cards strip */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {missionCards.map((card, i) => (
              <Link key={i} to="/mission/1"
                className="group rounded-2xl overflow-hidden transition-all duration-300 block"
                style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,61,46,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}>
                <div className="relative h-36 overflow-hidden">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.9)", color: card.color, fontWeight: 700 }}>
                    {card.diff}
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{card.cat}</span>
                  <h4 className="mt-0.5 mb-2" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#0F3D2E", fontSize: "0.875rem" }}>
                    {card.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1" style={{ color: "#9CA3AF" }}>
                      <Clock className="w-3 h-3" /> {card.duration}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: "#FBBF24", fontWeight: 700 }}>
                      <Zap className="w-3 h-3" /> {card.pts} pts
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* ground fade */}
          <div className="h-12 w-full" style={{ background: "linear-gradient(to bottom, transparent, #F0F9F5)" }} />
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-20" style={{ background: "#F0F9F5" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs mb-3"
              style={{ background: "#E6F4EE", color: "#2F8F6B", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              How It Works
            </span>
            <h2 className="mb-3" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0F3D2E", fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              Simple. Mission-Driven. Impactful.
            </h2>
            <p style={{ color: "#6B7280", maxWidth: "480px", margin: "0 auto" }}>
              From skill building to real-world action — SkillSeed makes climate participation accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5" style={{ background: "linear-gradient(90deg, #2F8F6B, #1EB89A, #2F8F6B)" }} />

            {[
              { step: "01", icon: Sprout, title: "Browse or Post", desc: "Explore short climate missions that match your interests, or post a project needing skilled volunteers.", color: "#2F8F6B", bg: "#E6F4EE" },
              { step: "02", icon: Users, title: "Match & Connect", desc: "Get matched with the right people. Learners find mentors. Organizations find skilled volunteers instantly.", color: "#1EB89A", bg: "#D1FAE5" },
              { step: "03", icon: TrendingUp, title: "Learn & Make Impact", desc: "Complete missions, earn verified points, and see your real environmental impact measured and celebrated.", color: "#059669", bg: "#A7F3D0" },
            ].map(({ step, icon: Icon, title, desc, color, bg }) => (
              <div key={step} className="relative bg-white rounded-2xl p-8 text-center"
                style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ background: bg }}>
                  <Icon className="w-7 h-7" style={{ color }} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center text-xs"
                    style={{ background: color, fontWeight: 800 }}>{step.slice(1)}</span>
                </div>
                <h3 className="mb-3" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#0F3D2E" }}>{title}</h3>
                <p className="text-sm" style={{ color: "#6B7280", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="py-16" style={{ background: "#0F3D2E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={12840} suffix="+" label="Active Members" desc="across 87 countries" />
            <AnimatedStat value={1240} suffix="+" label="Missions Completed" desc="verified impact" />
            <AnimatedStat value={87} suffix="" label="Countries Reached" desc="and growing" />
            <AnimatedStat value={94600} suffix="kg" label="CO₂ Avoided" desc="this year" />
          </div>
        </div>
      </section>

      {/* ════════════════ WHO IT'S FOR ════════════════ */}
      <section className="py-20" style={{ background: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs mb-3"
              style={{ background: "#E6F4EE", color: "#2F8F6B", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              For Everyone
            </span>
            <h2 className="mb-3" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0F3D2E", fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              However you show up, you belong here
            </h2>
            <p style={{ color: "#6B7280", maxWidth: "480px", margin: "0 auto" }}>
              SkillSeed is built for every kind of climate participant — from curious beginners to seasoned professionals to leading organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roles.map(({ id, icon: Icon, title, subtitle, desc, cta, href, bg, border, iconBg, iconColor, textColor }) => (
              <div key={id} className="rounded-2xl p-8 flex flex-col group transition-all duration-300"
                style={{ background: bg, border: `1.5px solid ${border}` }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: iconBg }}>
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <span className="text-xs mb-2 px-2 py-0.5 rounded-full w-fit"
                  style={{ background: id === "org" ? "rgba(255,255,255,0.15)" : "#E6F4EE", color: id === "org" ? "rgba(255,255,255,0.8)" : "#2F8F6B", fontWeight: 600 }}>
                  {subtitle}
                </span>
                <h3 className="mb-2" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: textColor, fontSize: "1.2rem" }}>
                  {title}
                </h3>
                <p className="text-sm mb-6 flex-1" style={{ color: id === "org" ? "rgba(255,255,255,0.72)" : "#6B7280", lineHeight: 1.7 }}>
                  {desc}
                </p>
                <Link to={href}
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ color: id === "org" ? "white" : "#0F3D2E", fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURED MISSIONS ════════════════ */}
      <section className="py-20" style={{ background: "#F9FAFB" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs mb-3"
                style={{ background: "#E6F4EE", color: "#2F8F6B", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Missions
              </span>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0F3D2E", fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
                Start Your Climate Journey
              </h2>
            </div>
            <Link to="/browse" className="hidden sm:inline-flex items-center gap-1.5 text-sm"
              style={{ color: "#2F8F6B", fontWeight: 600 }}>
              View all missions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Recycle, title: "Urban Composting", cat: "Soil & Waste", diff: "Beginner", dur: "2 weeks", pts: 120, img: IMG_COMPOST, color: "#2F8F6B", org: "EcoAction PH" },
              { icon: Sun, title: "Solar Energy Basics", cat: "Clean Energy", diff: "Intermediate", dur: "3 weeks", pts: 200, img: IMG_SOLAR, color: "#F59E0B", org: "SunPower NGO" },
              { icon: Wrench, title: "Repair Café Skills", cat: "Circular Economy", diff: "Beginner", dur: "1 week", pts: 80, img: IMG_REPAIR, color: "#3B82F6", org: "Repair Circle PH" },
              { icon: TreePine, title: "Community Reforestation", cat: "Nature", diff: "Beginner", dur: "2 days", pts: 60, img: IMG_TREE, color: "#059669", org: "Green Luzon" },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <Link key={i} to="/mission/1" className="group rounded-2xl overflow-hidden block transition-all duration-300"
                  style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,61,46,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}>
                  <div className="relative h-44 overflow-hidden">
                    <img src={m.img} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }} />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs"
                      style={{ background: "rgba(255,255,255,0.92)", color: m.color, fontWeight: 700 }}>
                      {m.cat}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs"
                      style={{ background: "rgba(0,0,0,0.45)", color: "white", fontWeight: 600 }}>
                      {m.diff}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>{m.org}</p>
                    <h3 className="mb-3" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#0F3D2E", fontSize: "0.95rem" }}>{m.title}</h3>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
                      <span className="text-xs flex items-center gap-1" style={{ color: "#9CA3AF" }}>
                        <Clock className="w-3 h-3" /> {m.dur}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: "#FBBF24", fontWeight: 700 }}>
                        <Zap className="w-3 h-3 fill-current" /> {m.pts} pts
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "#2F8F6B", fontWeight: 600 }}>
              View all missions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-20" style={{ background: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs mb-3"
              style={{ background: "#E6F4EE", color: "#2F8F6B", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Community Stories
            </span>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0F3D2E", fontSize: "clamp(1.8rem, 3vw, 2.2rem)" }}>
              What Our Members Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-7 rounded-2xl flex flex-col" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4" style={{ fill: "#FBBF24", color: "#FBBF24" }} />
                  ))}
                </div>
                <p className="text-sm mb-6 flex-1" style={{ color: "#374151", lineHeight: 1.8 }}>"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: "1px solid #E5E7EB" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #0F3D2E, #2F8F6B)", fontWeight: 700 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm" style={{ fontWeight: 700, color: "#0F3D2E" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#9CA3AF" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: "#0F3D2E" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${IMG_COMMUNITY})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,61,46,0.95) 0%, rgba(47,143,107,0.85) 100%)" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <Leaf className="w-3.5 h-3.5 text-green-300" />
            <span className="text-sm text-white" style={{ fontWeight: 600 }}>Start free · No experience needed</span>
          </div>
          <h2 className="text-white mb-4" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.15 }}>
            Every skill planted grows a better future.
          </h2>
          <p className="mb-8" style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7, fontSize: "1.1rem" }}>
            Start your first climate mission today — it only takes 10 minutes to get going.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white transition-all"
              style={{ background: "#2F8F6B", fontWeight: 700, fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1EB89A")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2F8F6B")}>
              <Sprout className="w-4 h-4" /> Join for Free
            </Link>
            <Link to="/browse"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "white", fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}>
              Browse Missions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
