import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Sprout, ChevronDown, User, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDemoMode } from "../hooks/useDemoMode";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "./ui/utils";

const navLinks = [
  { label: "Missions",     href: "/browse",    comingSoon: false },
  { label: "Community", href: "/community", comingSoon: false },
  { label: "Hands-on",   href: "/hands-on",   comingSoon: false },
  { label: "Funding",   href: "/funding",   comingSoon: false },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const { demoMode, enableDemoMode, disableDemoMode } = useDemoMode();
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Helper to get user display name from Supabase user_metadata
  const getUserName = () => {
    if (!user) return "";
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  };

  // Helper to get avatar initials
  const getAvatarInitials = () => {
    const name = getUserName();
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    signOut();
    setDropdownOpen(false);
    navigate("/");
  };

  const handleTryDemo = () => {
    enableDemoMode();
    navigate("/browse", { replace: false });
  };

  return (
    <nav
      className={cn(
        "sticky top-0 border-b border-border dark:border-[#1E3B34] shadow-sm pt-[env(safe-area-inset-top,0px)] bg-white dark:bg-[#0D1F18]",
        mobileOpen ? "z-[100]" : "z-50"
      )}
    >
      <div className="relative z-[110] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0D1F18]">
        <div className="flex items-center justify-between h-16 relative">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-h-[44px] min-w-0 pr-1">
            <img 
              src="/logo.png" 
              alt="SkillSeed Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
            />
            <span className="text-lg sm:text-xl truncate" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800 }}>
              <span className="text-[#0F3D2E] dark:text-[#BEEBD7]">Skill</span>
              <span className="text-[#2F8F6B] dark:text-[#6DD4A8]">Seed</span>
            </span>
          </Link>

          {/* ── Center Nav (desktop) ── */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <div key={link.label} className="relative">
                {link.comingSoon ? (
                  <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted-foreground cursor-default select-none text-sm">
                    {link.label}
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#E6F4EE] dark:bg-[#1E3B34] text-[#2F8F6B] dark:text-[#6DD4A8] font-semibold">
                      Soon
                    </span>
                  </span>
                ) : (
                  <Link
                    to={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      location.pathname === link.href
                        ? "bg-[#E6F4EE] dark:bg-[#1E3B34] text-[#0F3D2E] dark:text-[#6DD4A8] font-semibold"
                        : "text-muted-foreground hover:bg-muted dark:hover:bg-[#17342B] hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* ── Right Side (desktop) ── */}
          <div className="hidden md:flex items-center gap-2">
            {mounted && <ThemeToggle />}
            {user ? (
              /* ── LOGGED IN ── */
              <>
                {/* Avatar + Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl transition-all min-h-[44px] border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] ${
                      dropdownOpen 
                        ? "border-[#2F8F6B] bg-[#E8F5EF] dark:bg-[#1E3B34]" 
                        : "border-slate-200 dark:border-[#1E3B34] hover:border-[#2F8F6B]/50 dark:hover:border-[#6DD4A8]/50"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm bg-gradient-to-br from-[#0F3D2E] to-[#2F8F6B] font-bold">
                      {getAvatarInitials()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-[#BEEBD7]">
                      {getUserName().split(" ")[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-[#94C8AF] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden bg-white dark:bg-[#132B23] border border-slate-200 dark:border-[#1E3B34] shadow-lg z-[100]">
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-[#1E3B34]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#0F3D2E] to-[#2F8F6B] font-bold">
                            {getAvatarInitials()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-[#BEEBD7] truncate">{getUserName()}</p>
                            <p className="text-xs text-slate-500 dark:text-[#94C8AF] truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        {[
                          { icon: User, label: "Profile", href: "/tracker" },
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={label}
                            to={href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-[#BEEBD7] hover:bg-slate-50 dark:hover:bg-[#1E3B34] transition-colors"
                          >
                            <Icon className="w-4 h-4 text-slate-400 dark:text-[#94C8AF]" />
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-100 dark:border-[#1E3B34] py-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ── LOGGED OUT ── */
              <>
                <button
                  onClick={demoMode ? () => { disableDemoMode(); navigate("/", { replace: true }); } : handleTryDemo}
                  className="min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-[#1E3B34] bg-white/70 dark:bg-[#132B23] text-slate-700 dark:text-[#BEEBD7] hover:bg-white dark:hover:bg-[#17342B] transition-colors"
                >
                  {demoMode ? "Exit demo" : "Try demo"}
                </button>
                <button
                  onClick={() => navigate("/auth?tab=login")}
                  className="min-h-[40px] px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted dark:hover:bg-[#17342B] transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/auth?tab=signup")}
                  className="min-h-[40px] px-5 py-2 rounded-lg text-white text-sm font-semibold bg-[linear-gradient(135deg,#0F3D2E_0%,#2F8F6B_100%)] shadow-sm shadow-[#2F8F6B]/25 hover:shadow-md hover:shadow-[#2F8F6B]/30 transition-all flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* ── Mobile controls ── */}
          <div className="md:hidden flex items-center gap-0.5 shrink-0">
            {mounted && <ThemeToggle />}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[#0F3D2E] dark:text-[#BEEBD7] hover:bg-slate-100 dark:hover:bg-[#17342B] active:bg-slate-200 dark:active:bg-[#1E3B34]"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu: fixed overlay (does not push page content) ── */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="md:hidden fixed inset-x-0 bottom-0 z-[80] bg-black/45 dark:bg-black/55"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="md:hidden fixed left-0 right-0 bottom-0 z-[90] flex flex-col bg-white dark:bg-[#0D1F18] border-t border-slate-200 dark:border-[#1E3B34] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 4rem)",
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
          >
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-3 pb-2 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.comingSoon ? (
                    <span className="flex items-center gap-2 px-3 min-h-[48px] rounded-lg text-slate-600 dark:text-[#A8E6CA] text-sm">
                      {link.label}
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#E6F4EE] dark:bg-[#1E3B34] text-[#2F8F6B] dark:text-[#6DD4A8] font-semibold">
                        Soon
                      </span>
                    </span>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center px-3 min-h-[48px] rounded-lg text-sm font-medium transition-colors",
                        "text-slate-900 dark:text-[#E8FFF4]",
                        "hover:bg-slate-100 dark:hover:bg-[#17342B]",
                        "active:bg-slate-200 dark:active:bg-[#1E3B34] active:text-slate-900 dark:active:text-[#E8FFF4]",
                        location.pathname === link.href &&
                          "bg-[#E6F4EE] dark:bg-[#1E3B34] text-[#0F3D2E] dark:text-[#6DD4A8] font-semibold ring-1 ring-[#2F8F6B]/25 dark:ring-[#6DD4A8]/30"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-3 flex flex-col gap-2 border-t border-slate-200 dark:border-[#1E3B34] mt-2">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-xs font-medium text-slate-600 dark:text-[#A8E6CA]">Theme</span>
                  <div className="flex items-center gap-2">
                    {[
                      { id: "light", icon: Sun },
                      { id: "dark", icon: Moon },
                    ].map(({ id, icon: Icon }) => {
                      const active = resolvedTheme === id;
                      return (
                        <button
                          type="button"
                          key={id}
                          onClick={() => setTheme(id)}
                          className={cn(
                            "p-2.5 rounded-lg border min-h-[44px] min-w-[44px] inline-flex items-center justify-center transition-colors",
                            active
                              ? "border-[#2F8F6B] bg-[#E8F5EF] dark:bg-[#1E3B34] text-[#0F3D2E] dark:text-[#6DD4A8]"
                              : "border-slate-200 dark:border-[#2A4D42] bg-white dark:bg-[#132B23] text-slate-600 dark:text-[#C8F5DE] active:bg-slate-100 dark:active:bg-[#1E3B34]"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#132B23] border border-slate-100 dark:border-[#1E3B34]">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[#0F3D2E] to-[#2F8F6B]">
                        {getAvatarInitials()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0F3D2E] dark:text-[#E8FFF4] truncate">{getUserName()}</p>
                        <p className="text-xs text-slate-500 dark:text-[#94C8AF] truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/tracker"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center min-h-[48px] text-center px-4 rounded-lg text-sm font-semibold border-2 border-[#0F3D2E] dark:border-[#6DD4A8] text-[#0F3D2E] dark:text-[#E8FFF4] bg-white dark:bg-[#132B23] hover:bg-[#E6F4EE] dark:hover:bg-[#17342B] active:bg-slate-200 dark:active:bg-[#1E3B34] active:text-[#0F3D2E] dark:active:text-[#E8FFF4] transition-colors mx-0.5"
                    >
                      My Tracker
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                        navigate("/");
                      }}
                      className="inline-flex items-center justify-center min-h-[48px] text-center px-4 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 bg-white dark:bg-[#132B23] hover:bg-red-50 dark:hover:bg-red-950/30 active:bg-red-100 dark:active:bg-red-950/50 transition-colors mx-0.5"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleTryDemo();
                        setMobileOpen(false);
                      }}
                      className="inline-flex items-center justify-center min-h-[48px] text-center px-4 rounded-lg text-sm font-semibold border border-slate-200 dark:border-[#6DD4A8]/45 text-[#0F3D2E] dark:text-[#E8FFF4] bg-white dark:bg-[#132B23] hover:bg-slate-50 dark:hover:bg-[#17342B] active:bg-slate-200 dark:active:bg-[#1E3B34] transition-colors mx-0.5"
                    >
                      Try demo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/auth?tab=login");
                        setMobileOpen(false);
                      }}
                      className="inline-flex items-center justify-center min-h-[48px] text-center px-4 rounded-lg text-sm font-medium border border-slate-200 dark:border-[#6DD4A8]/45 text-[#0F3D2E] dark:text-[#E8FFF4] bg-white dark:bg-[#132B23] hover:bg-slate-50 dark:hover:bg-[#17342B] active:bg-slate-200 dark:active:bg-[#1E3B34] transition-colors mx-0.5"
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/auth?tab=signup");
                        setMobileOpen(false);
                      }}
                      className="inline-flex items-center justify-center min-h-[48px] text-center px-4 rounded-lg text-white text-sm font-semibold gap-1.5 bg-gradient-to-br from-[#0F3D2E] to-[#2F8F6B] hover:brightness-110 active:brightness-95 transition-all shadow-sm mx-0.5"
                    >
                      <Sprout className="w-3.5 h-3.5" />
                      Sign Up Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
