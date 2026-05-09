import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { ChevronRight, Search, ShieldCheck, SlidersHorizontal, Sparkles, RefreshCw, AlertTriangle, Leaf, X, CheckCircle2, Hourglass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../hooks/useDemoMode';
import { getCurrentProfile } from '../utils/matchService';
import { 
  fetchAllQuests, 
  fetchUserQuestProgress,
  fetchUserBadges,
  fetchQuestStats,
  startQuest
} from '../utils/questService';
import { QuestCard } from '../components/QuestCard';
import { EmptyState } from '../components/ui/empty-state';
import type { Profile, Quest, QuestProgress } from '../types/database';
import { useShowBlockingFullPageLoader } from '../hooks/useShowBlockingFullPageLoader';

type TabType = 'beginner' | 'advanced' | 'my-quests';

// ============================================================================
// Skeleton Components
// ============================================================================

function QuestCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] overflow-hidden animate-pulse">
      <div className="h-20 bg-slate-100 dark:bg-[#1E3B34]" />
      <div className="p-4">
        <div className="h-4 w-2/3 bg-slate-100 dark:bg-[#1E3B34] rounded mb-2" />
        <div className="h-3 w-1/2 bg-slate-100 dark:bg-[#1E3B34] rounded mb-4" />
        <div className="h-9 w-full bg-slate-100 dark:bg-[#1E3B34] rounded-lg" />
      </div>
    </div>
  );
}

function KPIStripSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-4 animate-pulse">
          <div className="h-3 w-16 bg-slate-100 dark:bg-[#1E3B34] rounded mb-2" />
          <div className="h-7 w-10 bg-slate-100 dark:bg-[#1E3B34] rounded" />
        </div>
      ))}
    </div>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-4 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 bg-slate-100 dark:bg-[#1E3B34] rounded-lg" />
        <div className="h-10 w-32 bg-slate-100 dark:bg-[#1E3B34] rounded-lg" />
        <div className="h-10 w-28 bg-slate-100 dark:bg-[#1E3B34] rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function HandsOnQuests() {
  const { user, loading: authLoading } = useAuth();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, QuestProgress>>({});
  const [userBadgeCount, setUserBadgeCount] = useState(0);
  const [stats, setStats] = useState({ beginnerCount: 0, advancedCount: 0 });
  const [activeTab, setActiveTab] = useState<TabType>('beginner');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'submitted' | 'verified' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'time' | 'points'>('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuestData, setSelectedQuestData] = useState<{ quest: Quest; progress: QuestProgress | null } | null>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);

  // Close filters dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filtersDropdownRef.current && !filtersDropdownRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch data
  useEffect(() => {
    if (authLoading) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch quests and stats (always available)
        const [questsData, statsData] = await Promise.all([
          fetchAllQuests(),
          fetchQuestStats()
        ]);
        setQuests(questsData);
        setStats(statsData);

        // Fetch user-specific data if logged in
        if (user) {
          const profileData = await getCurrentProfile();
          if (profileData?.id) {
            setProfile(profileData);
            
            const [progressData, badgesData] = await Promise.all([
              fetchUserQuestProgress(profileData.id),
              fetchUserBadges(profileData.id)
            ]);

            // Build progress map
            const pMap: Record<string, QuestProgress> = {};
            progressData.forEach(p => {
              pMap[p.quest_id] = p;
            });
            setProgressMap(pMap);
            setUserBadgeCount(badgesData.length);
          }
        }
      } catch (err) {
        console.error('Error loading quests:', err);
        setError('Failed to load quests. Please try again.');
      } finally {
        setInitialLoadDone(true);
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading]);

  const showBlockingLoader = useShowBlockingFullPageLoader(
    authLoading || loading,
    initialLoadDone
  );

  const progressList = useMemo(() => Object.values(progressMap ?? {}), [progressMap]);
  const completedCount = useMemo(
    () => progressList.filter((p) => p.status === 'verified').length,
    [progressList]
  );
  const inProgressCount = useMemo(
    () => progressList.filter((p) => p.status === 'in_progress').length,
    [progressList]
  );
  const pendingCount = useMemo(
    () => progressList.filter((p) => p.status === 'submitted').length,
    [progressList]
  );
  const needsResubmissionCount = useMemo(
    () => progressList.filter((p) => p.status === 'rejected').length,
    [progressList]
  );

  // Handle starting a quest
  const handleStartQuest = async (quest: Quest) => {
    if (!user) {
      if (demoMode) {
        navigate(`/quests/${quest.id}`);
      } else {
        navigate('/auth');
      }
      return;
    }

    if (!profile?.id) {
      console.error('No profile found');
      return;
    }

    // Start quest if not already started
    const existing = progressMap[quest.id];
    if (!existing) {
      await startQuest(quest.id, profile.id);
    }

    // Navigate to quest detail
    navigate(`/quests/${quest.id}`);
  };

  // Filter quests by tab
  const baseQuests = activeTab === 'my-quests'
    ? quests.filter(q => progressMap[q.id])
    : quests.filter(q => q.tier === activeTab);

  const filteredQuests = baseQuests
    .filter((q) => {
      if (!query) return true;
      const hay = `${q.title} ${(q.description ?? '')} ${(q.category ?? '')}`.toLowerCase();
      return hay.includes(query.toLowerCase());
    })
    .filter((q) => {
      if (statusFilter === 'all') return true;
      const status = progressMap[q.id]?.status ?? 'not_started';
      return status === statusFilter;
    })
    .sort((a, b) => {
      const aProgress = progressMap[a.id];
      const bProgress = progressMap[b.id];

      if (sortBy === 'points') return (b.points_reward ?? 0) - (a.points_reward ?? 0);
      if (sortBy === 'time') return (a.estimated_days ?? 0) - (b.estimated_days ?? 0);

      // recommended: in-progress first, then rejected, then shortest time, then higher points.
      const rank = (p?: QuestProgress) => {
        if (!p) return 3;
        if (p.status === 'in_progress') return 0;
        if (p.status === 'rejected') return 1;
        if (p.status === 'submitted') return 2;
        if (p.status === 'verified') return 4;
        return 3;
      };
      const r = rank(aProgress) - rank(bProgress);
      if (r !== 0) return r;
      const t = (a.estimated_days ?? 0) - (b.estimated_days ?? 0);
      if (t !== 0) return t;
      return (b.points_reward ?? 0) - (a.points_reward ?? 0);
    });

  // My quests with progress
  const myQuestsWithProgress = filteredQuests.map(q => ({
    quest: q,
    progress: progressMap[q.id] ?? null
  }));

  const hasActiveFilters = query !== '' || statusFilter !== 'all' || sortBy !== 'recommended';

  function clearAllFilters() {
    setQuery('');
    setStatusFilter('all');
    setSortBy('recommended');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Loading State
  // ══════════════════════════════════════════════════════════════════════════
  if (showBlockingLoader) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F18]">
        {/* Header skeleton */}
        <div className="bg-white dark:bg-[#132B23] border-b border-slate-200 dark:border-[#1E3B34]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-4 w-24 bg-slate-100 dark:bg-[#1E3B34] rounded mb-2 animate-pulse" />
            <div className="h-8 w-48 bg-slate-100 dark:bg-[#1E3B34] rounded mb-3 animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 dark:bg-[#1E3B34] rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <KPIStripSkeleton />
          <FilterBarSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <QuestCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Error State
  // ══════════════════════════════════════════════════════════════════════════
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F18] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F3D2E] text-white text-sm font-medium rounded-lg hover:bg-[#1a5241] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Main Render
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F18] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
      {/* ─────────────────────────────────────────────────────────────────────
          Page Header (matches Missions pattern)
      ───────────────────────────────────────────────────────────────────── */}
      <header className="animate-slide-down bg-white dark:bg-[#132B23] border-b border-slate-200 dark:border-[#1E3B34]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Learn by Doing
              </h1>
              <p className="text-sm text-slate-600 dark:text-[#94C8AF] mt-1 leading-relaxed text-pretty">
                Complete real-world quests, earn badges, and build a verified record of climate action.
              </p>
            </div>
            {/* Verifier link (if user is verifier) */}
            {profile?.is_verifier && (
              <Link
                to="/verifier"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#1E3B34] bg-white dark:bg-transparent text-slate-700 dark:text-[#BEEBD7] hover:bg-slate-50 dark:hover:bg-[#1E3B34] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                Verifier Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* ─────────────────────────────────────────────────────────────────────
            KPI Strip (matches Missions pattern)
        ───────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-3 gap-2 sm:gap-3 px-0.5 sm:px-0">
          <button
            onClick={() => setActiveTab('beginner')}
            className={`animate-slide-in btn-pop text-left bg-white dark:bg-[#132B23] rounded-xl border p-3 sm:p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] min-h-[44px] ${
              activeTab === 'beginner' 
                ? 'border-[#2F8F6B] dark:border-[#6DD4A8]' 
                : 'border-slate-200 dark:border-[#1E3B34] hover:border-[#2F8F6B]/50'
            }`}
          >
            <p className="text-xs text-slate-500 dark:text-[#94C8AF] font-medium mb-1">Beginner Quests</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.beginnerCount}</p>
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            style={{ animationDelay: '70ms' }}
            className={`animate-slide-in btn-pop text-left bg-white dark:bg-[#132B23] rounded-xl border p-3 sm:p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[44px] ${
              activeTab === 'advanced' 
                ? 'border-amber-400 dark:border-amber-500' 
                : 'border-slate-200 dark:border-[#1E3B34] hover:border-amber-300'
            }`}
          >
            <p className="text-xs text-slate-500 dark:text-[#94C8AF] font-medium mb-1">Advanced Quests</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.advancedCount}</p>
          </button>
          {user ? (
            <button
              onClick={() => setActiveTab('my-quests')}
              style={{ animationDelay: '140ms' }}
              className={`animate-slide-in btn-pop text-left bg-white dark:bg-[#132B23] rounded-xl border p-3 sm:p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] min-h-[44px] ${
                activeTab === 'my-quests' 
                  ? 'border-[#2F8F6B] dark:border-[#6DD4A8]' 
                  : 'border-slate-200 dark:border-[#1E3B34] hover:border-[#2F8F6B]/50'
              }`}
            >
              <p className="text-xs text-slate-500 dark:text-[#94C8AF] font-medium mb-1 flex items-center gap-1">
                My Progress
                {needsResubmissionCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-3 h-3" />
                  </span>
                )}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedCount}<span className="text-sm font-normal text-slate-400 dark:text-[#6B8F7F]">/{inProgressCount + completedCount + pendingCount}</span>
              </p>
            </button>
          ) : (
            <div style={{ animationDelay: '140ms' }} className="animate-slide-in bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-3 sm:p-4 min-h-[44px]">
              <p className="text-xs text-slate-500 dark:text-[#94C8AF] font-medium mb-1">Badges Earned</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{userBadgeCount}</p>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Filter Bar (matches Missions pattern)
        ───────────────────────────────────────────────────────────────────── */}
        <div style={{ animationDelay: '220ms' }} className="animate-slide-in relative z-10 bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onKeyDown={(e) => { if (e.key === "Escape") { setSearchFocused(false); (e.target as HTMLInputElement).blur(); } }}
                placeholder="Search quests, skills, categories..."
                className="w-full min-h-[40px] pl-10 pr-4 py-2 border border-slate-200 dark:border-[#1E3B34] bg-slate-50 dark:bg-[#0D1F18] rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B] transition-all text-slate-900 dark:text-white"
              />
              {searchFocused && (() => {
                const SUGGESTED_SKILLS = ["Solar Installation", "Tree Planting", "Marine Conservation", "Community Training", "Waste Management", "Urban Farming"];
                const BROWSE_CATEGORIES = ["All", "Beginner", "Intermediate", "Advanced", "Outdoor", "Indoor", "Remote"];
                const predictive = query.length > 0
                  ? quests.filter((q) =>
                      q.title.toLowerCase().includes(query.toLowerCase()) ||
                      (q.category ?? "").toLowerCase().includes(query.toLowerCase()) ||
                      (q.tier ?? "").toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 5)
                  : [];
                return (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#132B23] border border-slate-200 dark:border-[#1E3B34] rounded-xl shadow-lg p-3 z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                    {query.length > 0 ? (
                      predictive.length > 0 ? (
                        <div className="space-y-0.5">
                          {predictive.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => { setQuery(q.title); setSearchFocused(false); }}
                              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E3B34] text-left transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{q.title}</p>
                                <p className="text-xs text-slate-400 dark:text-[#6B8F7F] truncate">
                                  {q.category || "General"}{q.tier ? ` · ${q.tier}` : ""}
                                </p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 dark:text-[#6B8F7F] px-3 py-2">No quests match "{query}"</p>
                      )
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-[#6B8F7F] uppercase tracking-wide mb-2 px-1">Suggested Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {SUGGESTED_SKILLS.map((skill) => (
                              <button
                                key={skill}
                                onClick={() => { setQuery(skill); setSearchFocused(false); }}
                                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1E3B34] text-slate-600 dark:text-[#94C8AF] hover:bg-[#E8F5EF] dark:hover:bg-[#0F3D2E]/50 transition-colors"
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-[#6B8F7F] uppercase tracking-wide mb-2 px-1">Browse by Category</p>
                          <div className="flex flex-wrap gap-1.5">
                            {BROWSE_CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => { setQuery(cat === "All" ? "" : cat); setSearchFocused(false); }}
                                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                                  (cat === "All" ? query === "" : query === cat)
                                    ? "bg-[#0F3D2E] text-white"
                                    : "bg-slate-100 dark:bg-[#1E3B34] text-slate-600 dark:text-[#94C8AF] hover:bg-[#E8F5EF] dark:hover:bg-[#0F3D2E]/50"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            {/* Filters toggle */}
            <div ref={filtersDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`min-h-[40px] flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] ${
                  showFilters
                    ? "bg-[#0F3D2E] text-white border-transparent"
                    : "border-slate-200 dark:border-[#1E3B34] text-slate-600 dark:text-[#94C8AF] hover:bg-slate-100 dark:hover:bg-[#1E3B34]"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#132B23] border border-slate-200 dark:border-[#1E3B34] rounded-xl shadow-lg p-4 z-50 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] mb-1.5 block">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'recommended' | 'time' | 'points')}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-[#1E3B34] rounded-lg text-sm bg-white dark:bg-[#0D1F18] text-slate-700 dark:text-[#BEEBD7] focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/50"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="time">Shortest first</option>
                      <option value="points">Most points</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] mb-1.5 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'not_started' | 'in_progress' | 'submitted' | 'verified' | 'rejected')}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-[#1E3B34] rounded-lg text-sm bg-white dark:bg-[#0D1F18] text-slate-700 dark:text-[#BEEBD7] focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/50"
                    >
                      <option value="all">All statuses</option>
                      <option value="not_started">Not started</option>
                      <option value="in_progress">In progress</option>
                      <option value="submitted">Pending review</option>
                      <option value="verified">Completed</option>
                      <option value="rejected">Needs resubmission</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowFilters(false); }}
                    className="w-full py-2 bg-[#0F3D2E] text-white text-sm font-medium rounded-lg hover:bg-[#1a5241] transition-colors"
                  >
                    Apply
                  </button>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => { clearAllFilters(); setShowFilters(false); }}
                      className="w-full py-1.5 text-sm font-medium text-[#2F8F6B] dark:text-[#6DD4A8] hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Quest Cards Grid
        ───────────────────────────────────────────────────────────────────── */}
        {filteredQuests.length === 0 ? (
          activeTab === 'my-quests' ? (
            <EmptyState
              icon={Leaf}
              title="No quests started yet"
              description="Start your first quest to begin your climate action journey."
              action={{
                label: "Browse beginner quests",
                onClick: () => setActiveTab('beginner')
              }}
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No quests found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={{
                label: "Clear filters",
                onClick: clearAllFilters
              }}
            />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myQuestsWithProgress.map(({ quest, progress }, index) => (
              <div key={quest.id} onClick={() => setSelectedQuestData({ quest, progress })} style={{ animationDelay: `${Math.min(500, 300 + index * 50)}ms`, '--card-delay': `${Math.min(500, 300 + index * 50)}ms` } as React.CSSProperties} className="animate-slide-in cursor-pointer">
                <QuestCard
                  quest={quest}
                  progress={progress}
                  onStart={handleStartQuest}
                />
              </div>
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            Sign-in prompt for guests
        ──────────────────────────────────��────────────────────────────────── */}
        {!user && (
          <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Ready to start learning?
            </h3>
            <p className="text-sm text-slate-600 dark:text-[#94C8AF] mb-5 max-w-md mx-auto">
              Sign in to track your progress, earn badges, and get certified.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center min-h-[44px] bg-[#0F3D2E] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2F8F6B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] focus-visible:ring-offset-2"
            >
              Sign In to Start
            </Link>
          </div>
        )}
      </div>

      {/* Quest Preview Drawer */}
      {selectedQuestData && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setSelectedQuestData(null)}
          role="button"
          aria-label="Close"
        />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 bg-white dark:bg-[#132B23] shadow-2xl overflow-y-auto flex flex-col transition-transform duration-[650ms] ease-out ${selectedQuestData ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}>
        {selectedQuestData && (() => {
          const { quest, progress } = selectedQuestData;
          const status = progress?.status ?? 'not_started';
          const totalSteps = quest.steps?.length ?? 0;
          const currentStep = progress?.current_step ?? 0;
          const progressRatio = totalSteps > 0 ? Math.min(1, Math.max(0, currentStep / totalSteps)) : 0;
          return (
            <>
              <div className="p-5 border-b border-slate-200 dark:border-[#1E3B34]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] uppercase tracking-wide mb-1">Quest Details</p>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{quest.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedQuestData(null)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-[#1E3B34] text-slate-500 dark:text-[#94C8AF] hover:bg-slate-50 dark:hover:bg-[#1E3B34] transition-colors min-h-[40px] min-w-[40px]"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${quest.tier === 'beginner' ? 'bg-[#E6F4EE] dark:bg-[#1E3B34] text-[#0F3D2E] dark:text-[#6DD4A8]' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'}`}>
                    {quest.tier === 'beginner' ? 'Beginner' : 'Advanced'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E3B34] text-slate-600 dark:text-[#94C8AF] text-xs font-medium">
                    {quest.category || 'Quest'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-[#94C8AF] leading-relaxed">{quest.description}</p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">Duration</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">~{quest.estimated_days}d</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">Points</p>
                    <p className="text-sm font-bold text-[#2F8F6B] dark:text-[#6DD4A8] mt-0.5">+{quest.points_reward}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">Steps</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{totalSteps}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-[#BEEBD7]">
                  {quest.tier === 'beginner' ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8F6B] dark:text-[#6DD4A8]" />
                      Badge: {quest.badge_name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Hourglass className="w-3.5 h-3.5 text-amber-500" />
                      Certificate: {quest.certificate_name}
                    </span>
                  )}
                </div>

                {status !== 'not_started' && totalSteps > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-[#6B8F7F] mb-1">
                      <span>Step {Math.min(totalSteps, currentStep + 1)} of {totalSteps}</span>
                      <span className="font-medium">{Math.round(progressRatio * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-[#0D1F18] overflow-hidden">
                      <div className="h-full bg-[#2F8F6B] dark:bg-[#6DD4A8] rounded-full" style={{ width: `${Math.round(progressRatio * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-[#1E3B34]">
                {status === 'submitted' ? (
                  <div className="w-full min-h-[48px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-xl flex items-center justify-center">
                    Pending Review
                  </div>
                ) : status === 'verified' ? (
                  <div className="w-full min-h-[48px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </div>
                ) : (
                  <button
                    onClick={() => { setSelectedQuestData(null); handleStartQuest(quest); }}
                    className="w-full min-h-[48px] flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-[#0F3D2E] text-white hover:bg-[#1a5241] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B]"
                  >
                    {status === 'not_started' ? 'Start Quest' : status === 'rejected' ? 'Resubmit Quest' : 'Continue Quest'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default HandsOnQuests;
