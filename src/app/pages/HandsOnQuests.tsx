import { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { BookOpen, Filter, Loader2, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentProfile } from '../utils/matchService';
import { 
  fetchAllQuests, 
  fetchUserQuestProgress,
  fetchUserBadges,
  fetchQuestStats,
  startQuest
} from '../utils/questService';
import { QuestCard } from '../components/QuestCard';
import type { Profile, Quest, QuestProgress } from '../types/database';

type TabType = 'beginner' | 'advanced' | 'my-quests';

export function HandsOnQuests() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, QuestProgress>>({});
  const [userBadgeCount, setUserBadgeCount] = useState(0);
  const [stats, setStats] = useState({ beginnerCount: 0, advancedCount: 0 });
  const [activeTab, setActiveTab] = useState<TabType>('beginner');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'submitted' | 'verified' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'time' | 'points'>('recommended');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  useEffect(() => {
    if (authLoading) return;

    async function loadData() {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading]);

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
      navigate('/auth');
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

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0D1F18]">
        <div className="bg-gradient-to-br from-[#0F3D2E] to-[#1A5C43] py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="h-7 w-64 bg-white/20 rounded animate-pulse" />
            <div className="h-10 w-72 bg-white/10 rounded animate-pulse mt-4" />
            <div className="h-5 w-[520px] max-w-full bg-white/10 rounded animate-pulse mt-3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="h-14 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-60 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1F18]">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-[#0F3D2E] to-[#1A5C43] py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#2F8F6B]/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <span className="text-white text-xs font-semibold tracking-wide uppercase">
                  Hands-on learning
                </span>
              </div>
              <h1 className="text-[#BEEBD7] dark:text-[#B7C96A] font-[Manrope] font-bold text-3xl md:text-4xl mb-2">Learn by doing</h1>
              <p className="text-white max-w-xl text-sm md:text-base">
                Complete real-world quests, earn badges, and build a verified record of climate action.
              </p>
            </div>

            {user ? (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 min-w-[260px]">
                <p className="text-white text-sm font-semibold">Your progress</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-white font-[Manrope] font-bold text-xl">{inProgressCount}</p>
                    <p className="text-white text-xs">In progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-[Manrope] font-bold text-xl">{pendingCount}</p>
                    <p className="text-white text-xs">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-[Manrope] font-bold text-xl">{completedCount}</p>
                    <p className="text-white text-xs">Completed</p>
                  </div>
                </div>
                {needsResubmissionCount > 0 && (
                  <div className="mt-3 text-xs text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {needsResubmissionCount} need resubmission
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <p className="text-white text-sm font-semibold">Sign in to track progress</p>
                <p className="text-white text-xs mt-1">
                  Save your quests, submissions, and badges.
                </p>
              </div>
            )}
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <p className="text-white text-xs uppercase tracking-wide">Beginner quests</p>
              <p className="text-white font-[Manrope] font-bold text-2xl mt-1">{stats.beginnerCount.toLocaleString()}</p>
              <p className="text-white text-xs mt-1">Earn badges with short missions</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <p className="text-white text-xs uppercase tracking-wide">Advanced quests</p>
              <p className="text-white font-[Manrope] font-bold text-2xl mt-1">{stats.advancedCount.toLocaleString()}</p>
              <p className="text-white text-xs mt-1">Unlock verified certificates</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <p className="text-white text-xs uppercase tracking-wide">Badges earned</p>
              <p className="text-white font-[Manrope] font-bold text-2xl mt-1">{userBadgeCount.toLocaleString()}</p>
              <p className="text-white text-xs mt-1">Your visible proof of action</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB NAVIGATION
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('beginner')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'beginner'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Beginner quests
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'advanced'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Advanced quests
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('my-quests')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'my-quests'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              My quests
            </button>
          )}
          
          {/* Verifier link (if user is verifier) */}
          {profile?.is_verifier && (
            <Link
              to="/verifier"
              className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all duration-200 inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verifier dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Search + filters */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_6px_20px_rgba(15,61,46,0.08)] p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quests, skills, categories..."
                className="w-full min-h-10 pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="min-h-10 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#2F8F6B]/40 hover:bg-[#E6F4EE] transition-all duration-200 inline-flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recommended' | 'time' | 'points')}
              className="min-h-10 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30"
              aria-label="Sort quests"
            >
              <option value="recommended">Recommended</option>
              <option value="time">Shortest first</option>
              <option value="points">Most points</option>
            </select>
          </div>

          {showFilters && (
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as 'all' | 'not_started' | 'in_progress' | 'submitted' | 'verified' | 'rejected'
                  )
                }
                className="min-h-10 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30"
                aria-label="Status filter"
              >
                <option value="all">All statuses</option>
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="submitted">Pending review</option>
                <option value="verified">Completed</option>
                <option value="rejected">Needs resubmission</option>
              </select>

              {(query || statusFilter !== 'all' || sortBy !== 'recommended') && (
                <button
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('all');
                    setSortBy('recommended');
                  }}
                  className="min-h-10 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#2F8F6B] hover:text-[#0F3D2E] underline text-left"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          QUEST CARDS GRID
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {filteredQuests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            {activeTab === 'my-quests' ? (
              <>
                <p className="text-gray-500 text-sm mb-3">You haven’t started any quests yet.</p>
                <button
                  onClick={() => setActiveTab('beginner')}
                  className="text-[#0F3D2E] text-sm font-semibold hover:underline"
                >
                  Browse beginner quests →
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No quests match your filters.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myQuestsWithProgress.map(({ quest, progress }) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                progress={progress}
                onStart={handleStartQuest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sign-in prompt for guests */}
      {!user && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-r from-[#1a3a2a] to-green-700 rounded-2xl p-8 text-center">
            <h3 className="text-white text-xl font-bold mb-2">
              Ready to start learning?
            </h3>
            <p className="text-green-200 text-sm mb-4">
              Sign in to track your progress, earn badges, and get certified.
            </p>
            <Link
              to="/auth"
              className="inline-block bg-white text-[#1a3a2a] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition"
            >
              Sign In to Start →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default HandsOnQuests;
