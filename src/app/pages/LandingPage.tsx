import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
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
  Heart,
  Eye,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchAllQuests } from "../utils/questService";
import type { Quest } from "../types/database";

const IMG_COMMUNITY = "https://images.unsplash.com/photo-1768306662463-4e3f6c858889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwYWN0aW9uJTIwdm9sdW50ZWVyJTIwY29tbXVuaXR5JTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzI4NTQ4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080";

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

// Tier-based color mapping for quest cards
function getQuestColor(quest: Quest): string {
  if (quest.category?.toLowerCase().includes("energy")) return "#F59E0B";
  if (quest.category?.toLowerCase().includes("waste") || quest.category?.toLowerCase().includes("soil")) return "#2F8F6B";
  if (quest.category?.toLowerCase().includes("nature") || quest.category?.toLowerCase().includes("tree") || quest.category?.toLowerCase().includes("forest")) return "#059669";
  if (quest.tier === "advanced") return "#3B82F6";
  return "#2F8F6B";
}

const testimonials = [
  { name: "Maria Santos", role: "Urban Gardener · Quezon City", text: "SkillSeed helped me turn my rooftop into a productive food garden. The composting mission changed everything — I now teach my neighbors!", avatar: "MS", stars: 5 },
  { name: "James Reyes", role: "Solar Installer · Manila", text: "I completed the energy-saving missions and landed a job with a solar NGO. The hands-on format is incredible for real learning.", avatar: "JR", stars: 5 },
  { name: "Lena Cruz", role: "Community Organizer · Cebu", text: "Our barangay is running 3 repair cafés after learning through SkillSeed. The community challenges keep everyone motivated.", avatar: "LC", stars: 5 },
];

export function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);

  // Fetch real quests on mount
  useEffect(() => {
    async function loadQuests() {
      try {
        const data = await fetchAllQuests();
        setQuests(data);
      } catch (err) {
        console.error("Error fetching quests for landing:", err);
      } finally {
        setQuestsLoading(false);
      }
    }
    loadQuests();
  }, []);

  // Take first 4 quests for display
  const displayQuests = quests.slice(0, 4);

  // Role card routing — auth-aware
  const handleRoleClick = (roleId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Logged-in users go to the appropriate page
    switch (roleId) {
      case "learner":
        navigate("/hands-on");
        break;
      case "jobready":
        navigate("/dashboard");
        break;
      case "org":
        navigate("/post-project");
        break;
      default:
        navigate("/dashboard");
    }
  };

  // Auth-aware CTA
  const handleJoinProject = () => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/dashboard");
    }
  };

  const roles = [
    {
      id: "learner",
      icon: Sprout,
      title: "I'm a Learner",
      subtitle: "Beginner-friendly",
      desc: "Build green skills from scratch and participate in real climate missions — no experience needed.",
      cta: "Start Learning",
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
      bg: "#0F3D2E",
      border: "#0F3D2E",
      iconBg: "rgba(255,255,255,0.15)",
      iconColor: "white",
      textColor: "white",
    },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-16 pb-0 overflow-hidden" style={{ background: "white" }}>
        {/* subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#0F3D2E 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-5" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "clamp(2.4rem, 5.5vw, 4rem)", lineHeight: 1.1, color: "#0F3D2E", letterSpacing: "-0.02em" }}>
            Where climate action<br />
            <span style={{ color: "#2F8F6B" }}>finds its people.</span>
          </h1>

          <p className="mb-8 mx-auto text-lg" style={{ color: "#6B7280", lineHeight: 1.7, maxWidth: "580px" }}>
            SkillSeed connects learners, skilled volunteers, and organizations to short, real-world climate missions. Learn by doing. Track your impact. Join the movement.
          </p>


          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <button onClick={handleJoinProject}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white transition-all duration-200 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #0F3D2E 0%, #2F8F6B 100%)", fontWeight: 700, fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 20px rgba(47,143,107,0.4)", border: "none" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
              <Users className="w-4 h-4" /> Join a Project
            </button>
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

        {/* Mission & Vision cards */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-8 text-left" style={{ background: "#F0FDF6", border: "1px solid #BBF7D0" }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E6F4EE" }}>
                  <Heart className="w-5 h-5" style={{ color: "#2F8F6B" }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#2F8F6B", letterSpacing: "0.1em" }}>Our Mission</span>
              </div>
              <h3 className="mb-3" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0F3D2E", fontSize: "1.15rem", lineHeight: 1.4 }}>
                Connect. Build capacity. Deploy the people the climate crisis needs.
              </h3>
              <p style={{ color: "#4B5563", lineHeight: 1.9, fontSize: "0.9rem" }}>
                Starting in the Philippines, where the need is greatest, and growing into a global network. Rooted in community, driven by people, and open to every nation ready to act.
              </p>
            </div>
            <div className="rounded-2xl p-8 text-left" style={{ background: "#F0F7FF", border: "1px solid #BAE0FD" }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#DBEAFE" }}>
                  <Eye className="w-5 h-5" style={{ color: "#1E6B9A" }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1E6B9A", letterSpacing: "0.1em" }}>Our Vision</span>
              </div>
              <h3 className="mb-3" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#1E3A5F", fontSize: "1.15rem", lineHeight: 1.4 }}>
                A world where no climate crisis goes unanswered.
              </h3>
              <p style={{ color: "#4B5563", lineHeight: 1.9, fontSize: "0.9rem" }}>
                Because the people and skills to respond already exist in every community. The Philippines leads the way: the nation that faces the most, teaches the most. From its shores, Skill Seed grows outward — because every climate issue has a human-driven solution.
              </p>
            </div>
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
            {roles.map(({ id, icon: Icon, title, subtitle, desc, cta, bg, border, iconBg, iconColor, textColor }) => (
              <div key={id} className="rounded-2xl p-8 flex flex-col group transition-all duration-300 cursor-pointer"
                style={{ background: bg, border: `1.5px solid ${border}` }}
                onClick={() => handleRoleClick(id)}
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
                <span
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ color: id === "org" ? "white" : "#0F3D2E", fontWeight: 700, fontFamily: "'Manrope', sans-serif" }}>
                  {cta} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURED QUESTS ════════════════ */}
      <section className="py-20" style={{ background: "#F9FAFB" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs mb-3"
                style={{ background: "#E6F4EE", color: "#2F8F6B", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Quests
              </span>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, color: "#0F3D2E", fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
                Start Your Climate Journey
              </h2>
            </div>
            <Link to="/hands-on" className="hidden sm:inline-flex items-center gap-1.5 text-sm"
              style={{ color: "#2F8F6B", fontWeight: 600 }}>
              View all quests <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {questsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#2F8F6B" }} />
            </div>
          ) : displayQuests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayQuests.map((quest) => {
                const color = getQuestColor(quest);
                return (
                  <Link key={quest.id} to={`/quests/${quest.id}`} className="group rounded-2xl overflow-hidden block transition-all duration-300"
                    style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,61,46,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}>
                    <div className="relative h-44 overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}15, ${color}35)` }}>
                      <span className="text-6xl transition-transform duration-500 group-hover:scale-110">{quest.badge_icon || "🌿"}</span>
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: "rgba(255,255,255,0.92)", color: color, fontWeight: 700 }}>
                        {quest.category || quest.tier}
                      </span>
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: "rgba(0,0,0,0.45)", color: "white", fontWeight: 600 }}>
                        {quest.tier === "beginner" ? "Beginner" : "Advanced"}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>{quest.tier === "beginner" ? "🌱 Badge Quest" : "🏆 Certificate Quest"}</p>
                      <h3 className="mb-3" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#0F3D2E", fontSize: "0.95rem" }}>{quest.title}</h3>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
                        <span className="text-xs flex items-center gap-1" style={{ color: "#9CA3AF" }}>
                          <Clock className="w-3 h-3" /> ~{quest.estimated_days} days
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "#FBBF24", fontWeight: 700 }}>
                          <Zap className="w-3 h-3 fill-current" /> {quest.points_reward} pts
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm" style={{ color: "#9CA3AF" }}>Quests coming soon — check back shortly!</p>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/hands-on" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "#2F8F6B", fontWeight: 600 }}>
              View all quests <ArrowRight className="w-4 h-4" />
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
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white transition-all"
              style={{ background: "#2F8F6B", fontWeight: 700, fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1EB89A")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2F8F6B")}>
              <Sprout className="w-4 h-4" /> Join for Free
            </Link>
            <Link to="/hands-on"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "white", fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}>
              Browse Quests <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
