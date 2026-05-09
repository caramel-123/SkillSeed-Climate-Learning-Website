import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Trophy,
  Users,
  Clock,
  Star,
  Flame,
  TrendingUp,
  ChevronRight,
  Plus,
  Share2,
  CheckCircle,
  Leaf,
  Target,
  Award,
  ArrowUp,
  Loader2,
  Camera,
  Search,
  SlidersHorizontal,
  X,
  AlertCircle,
  RefreshCw,
  LogIn,
  Info,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useShowBlockingFullPageLoader } from "../hooks/useShowBlockingFullPageLoader";
import { supabase } from "../utils/supabase";
import {
  fetchActiveChallenges,
  fetchJoinedChallenges,
  fetchLeaderboard,
  fetchCommunityStats,
  fetchUserChallengeStats,
  fetchUserRank,
  fetchFeaturedChallenge,
  joinChallenge,
  leaveChallenge,
  createChallenge,
  subscribeToChallenges,
  subscribeToLeaderboard,
  unsubscribeFromChannel,
  fetchCommunityFeed,
  fetchUserLikedSubmissions,
  subscribeToFeed,
} from "../utils/challengeService";
import { CreateChallengeModal } from "../components/CreateChallengeModal";
import { SubmissionModal } from "../components/SubmissionModal";
import { FeedCard } from "../components/FeedCard";
import type { Challenge, FeaturedChallenge, LeaderboardEntry, CreateChallengeInput, FeedItem } from "../types/database";

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

// Category icons using lucide-react (no emojis)
function getCategoryIcon(category: string | null): React.ReactNode {
  const cat = (category || "").toLowerCase();
  if (cat.includes("waste")) return <Leaf className="w-5 h-5" />;
  if (cat.includes("solar") || cat.includes("energy")) return <Flame className="w-5 h-5" />;
  if (cat.includes("urban") || cat.includes("green")) return <Target className="w-5 h-5" />;
  if (cat.includes("water")) return <Leaf className="w-5 h-5" />;
  return <Star className="w-5 h-5" />;
}

// Category color mapping for chips
const CATEGORY_COLORS: Record<string, string> = {
  "Waste Reduction": "bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  "Solar Energy": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Urban Greening": "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Water Conservation": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Energy Efficiency": "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

function getCategoryColor(category: string | null): string {
  return CATEGORY_COLORS[category || ""] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
}

// Calculate days remaining
function getDaysRemaining(deadline: string | null): number {
  if (!deadline) return 30;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Get initials from name
function getInitials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Validate challenge title (filter out garbage)
function isValidChallengeTitle(title: string | null): boolean {
  if (!title) return false;
  if (title.length < 6) return false;
  // Must contain at least 3 letters
  const letterCount = (title.match(/[a-zA-Z]/g) || []).length;
  if (letterCount < 3) return false;
  // Check for repeated characters (e.g., "aaaa" or "1111")
  if (/(.)\1{4,}/.test(title)) return false;
  return true;
}

function isValidChallengeDescription(description: string | null): boolean {
  if (!description) return false;
  const trimmed = description.trim();
  if (trimmed.length < 20) return false;
  // Must contain at least 8 letters
  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
  if (letterCount < 8) return false;
  // Filter obvious placeholder spam like "sadasdassd"
  if (/(.)\1{4,}/.test(trimmed)) return false;
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADER
// ══════════════════════════════════════════════════════════════════════════════

function ChallengeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-100 dark:bg-[#0D1F18]" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-100 dark:bg-[#1E3B34] rounded" />
          <div className="h-5 w-16 bg-slate-100 dark:bg-[#1E3B34] rounded" />
        </div>
        <div className="h-5 w-3/4 bg-slate-100 dark:bg-[#1E3B34] rounded" />
        <div className="h-4 w-full bg-slate-100 dark:bg-[#1E3B34] rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 flex-1 bg-slate-100 dark:bg-[#1E3B34] rounded-lg" />
          <div className="h-9 w-9 bg-slate-100 dark:bg-[#1E3B34] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-6 h-6 bg-slate-100 dark:bg-[#1E3B34] rounded" />
          <div className="w-8 h-8 bg-slate-100 dark:bg-[#1E3B34] rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-slate-100 dark:bg-[#1E3B34] rounded mb-1" />
            <div className="h-3 w-16 bg-slate-100 dark:bg-[#1E3B34] rounded" />
          </div>
          <div className="h-4 w-12 bg-slate-100 dark:bg-[#1E3B34] rounded" />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD CARD - Honest beta state (no fake data)
// ══════════════════════════════════════════════════════════════════════════════

interface LeaderboardCardProps {
  leaderboard: LeaderboardEntry[];
  leaderboardLoading: boolean;
  userProfileId: string | null;
  user: { id: string } | null;
}

function LeaderboardCard({ leaderboard, leaderboardLoading, userProfileId, user }: LeaderboardCardProps) {
  const [scoringExpanded, setScoringExpanded] = useState(false);

  // Beta honesty: never show leaderboard people pre-launch (even if seed rows exist).
  const hasRealData = false;

  return (
    <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Leaderboard</h3>
          {leaderboardLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F5EF] dark:bg-[#1E3B34] text-[#2F8F6B] dark:text-[#6DD4A8] font-semibold">
          Beta
        </span>
      </div>

      {/* Empty state (beta - no fake data) */}
      {!hasRealData ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1E3B34] flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-slate-400 dark:text-[#6DD4A8]" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">No rankings yet (beta)</p>
          <p className="text-xs text-slate-500 dark:text-[#94C8AF] mb-4">
            Be the first to complete a challenge and appear here.
          </p>

          {/* How scoring works - expandable */}
          <button
            onClick={() => setScoringExpanded(!scoringExpanded)}
            className="w-full text-left bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 mb-3"
          >
            <p className="text-xs font-medium text-slate-700 dark:text-[#BEEBD7] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                How points work
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${scoringExpanded ? "rotate-90" : ""}`} />
            </p>
            {scoringExpanded && (
              <ul className="text-xs text-slate-500 dark:text-[#94C8AF] space-y-1.5 mt-2 pl-5">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-[#2F8F6B] shrink-0" />
                  <span>Join and complete challenges to earn points</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-[#2F8F6B] shrink-0" />
                  <span>Verified submissions earn bonus points</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-[#2F8F6B] shrink-0" />
                  <span>Higher difficulty = more points</span>
                </li>
              </ul>
            )}
          </button>

          {/* Primary CTA */}
          {user ? (
            <Link
              to="#challenges"
              style={{ animationDelay: 'calc(var(--card-delay, 0ms) + 300ms)' }}
              className="animate-btn-entrance inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#2F8F6B] transition-colors"
            >
              <Target className="w-4 h-4" />
              Join a challenge
            </Link>
          ) : (
            <Link
              to="/auth"
              style={{ animationDelay: 'calc(var(--card-delay, 0ms) + 300ms)' }}
              className="animate-btn-entrance inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#2F8F6B] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in to join
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function CommunityChallenges() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Data state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<Set<string>>(new Set());
  const [completedChallengeIds, setCompletedChallengeIds] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalChallengers: 0,
    activeChallenges: 0,
    totalActions: 0,
  });
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    activeChallenges: 0,
    completedChallenges: 0,
  });
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [featuredChallenge, setFeaturedChallenge] = useState<FeaturedChallenge | null>(null);

  // Feed state
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [likedSubmissionIds, setLikedSubmissionIds] = useState<Set<string>>(new Set());

  // UI state
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "joined" | "feed">("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"trending" | "ending_soon" | "newest">("trending");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedChallengeForSubmission, setSelectedChallengeForSubmission] = useState<Challenge | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);

  const challengeById = useMemo(() => {
    const map = new Map<string, Challenge>();
    challenges.forEach((c) => map.set(c.id, c));
    return map;
  }, [challenges]);

  // Fetch user's profile ID
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return null;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    return data?.id || null;
  }, [user?.id]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [challengesData, statsData, leaderboardData, featuredData, feedData] = await Promise.all([
        fetchActiveChallenges(),
        fetchCommunityStats(),
        fetchLeaderboard(10),
        fetchFeaturedChallenge(),
        fetchCommunityFeed(20),
      ]);

      setChallenges(challengesData);
      setCommunityStats(statsData);
      setLeaderboard(leaderboardData);
      setFeaturedChallenge(featuredData);
      setFeedItems(feedData);

      if (user?.id) {
        const profileId = await fetchUserProfile();
        setUserProfileId(profileId);

        if (profileId) {
          const [joinedData, userStatsData, rankData, likedData] = await Promise.all([
            fetchJoinedChallenges(profileId),
            fetchUserChallengeStats(profileId),
            fetchUserRank(profileId),
            fetchUserLikedSubmissions(profileId),
          ]);

          setJoinedChallengeIds(new Set(joinedData.map((j) => j.challenge_id)));
          const completedIds = joinedData
            .filter((j) => j.status === "completed")
            .map((j) => j.challenge_id);
          setCompletedChallengeIds(new Set(completedIds));
          setUserStats(userStatsData);
          setUserRank(rankData);
          setLikedSubmissionIds(new Set(likedData));
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load challenges. Please try again.");
    } finally {
      setInitialLoadDone(true);
      setLoading(false);
    }
  }, [user?.id, fetchUserProfile]);

  // Dedicated leaderboard refresh
  const fetchLeaderboardData = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const [leaderboardData, rankData] = await Promise.all([
        fetchLeaderboard(10),
        userProfileId ? fetchUserRank(userProfileId) : Promise.resolve(null),
      ]);
      setLeaderboard(leaderboardData);
      if (rankData !== null) setUserRank(rankData);
    } catch (err) {
      console.error("Error refreshing leaderboard:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [userProfileId]);

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

  // Real-time subscriptions
  useEffect(() => {
    const leaderboardChannel = subscribeToLeaderboard(() => {
      fetchLeaderboardData();
    });
    const interval = setInterval(fetchLeaderboardData, 60 * 60 * 1000);
    return () => {
      unsubscribeFromChannel(leaderboardChannel);
      clearInterval(interval);
    };
  }, [fetchLeaderboardData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const challengesChannel = subscribeToChallenges(() => {
      fetchData();
    });
    const feedChannel = subscribeToFeed(() => {
      fetchData();
    });
    return () => {
      unsubscribeFromChannel(challengesChannel);
      unsubscribeFromChannel(feedChannel);
    };
  }, [fetchData]);

  // Handle join/leave challenge
  const handleJoin = async (challengeId: string) => {
    if (!user || !userProfileId) return;
    setJoiningId(challengeId);
    try {
      const isJoined = joinedChallengeIds.has(challengeId);
      if (isJoined) {
        // Optimistic: reflect the change immediately.
        setJoinedChallengeIds((prev) => {
          const next = new Set(prev);
          next.delete(challengeId);
          return next;
        });
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === challengeId
              ? { ...c, participant_count: Math.max(0, (c.participant_count ?? 0) - 1) }
              : c
          )
        );
        await leaveChallenge(challengeId, userProfileId);
      } else {
        // Optimistic: reflect the change immediately.
        setJoinedChallengeIds((prev) => new Set(prev).add(challengeId));
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === challengeId ? { ...c, participant_count: (c.participant_count ?? 0) + 1 } : c
          )
        );
        await joinChallenge(challengeId, userProfileId);
      }
    } catch (err) {
      console.error("Error joining/leaving challenge:", err);
      // Best-effort: refresh from server to recover from optimistic mismatch.
      void fetchData();
    } finally {
      setJoiningId(null);
    }
  };

  // Handle create challenge
  const handleCreateChallenge = async (data: CreateChallengeInput) => {
    if (!userProfileId) throw new Error("Profile not loaded. Please refresh and try again.");
    const created = await createChallenge(userProfileId, data);
    setChallenges((prev) => [created, ...prev]);
    setCommunityStats((prev) => ({
      ...prev,
      activeChallenges: prev.activeChallenges + 1,
    }));
  };

  // Handle opening submission modal
  const handleOpenSubmissionModal = (challenge: Challenge) => {
    setSelectedChallengeForSubmission(challenge);
    setSubmissionModalOpen(true);
  };

  // Handle successful submission
  const handleSubmissionSuccess = () => {
    // Optimistic: mark the selected challenge completed and keep UI snappy.
    if (selectedChallengeForSubmission?.id) {
      const id = selectedChallengeForSubmission.id;
      setCompletedChallengeIds((prev) => new Set(prev).add(id));
      setJoinedChallengeIds((prev) => new Set(prev).add(id));
    }
    // Refresh in background for feed + stats.
    void fetchData();
  };


  // Get challenge status for a user
  const getChallengeStatus = (challengeId: string): "not-joined" | "joined" | "completed" => {
    if (completedChallengeIds.has(challengeId)) return "completed";
    if (joinedChallengeIds.has(challengeId)) return "joined";
    return "not-joined";
  };

  // Handle like update from feed card
  const handleLikeUpdate = (submissionId: string, _newCount: number, isLiked: boolean) => {
    setLikedSubmissionIds((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.add(submissionId);
      } else {
        newSet.delete(submissionId);
      }
      return newSet;
    });
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // FILTER & SORT CHALLENGES
  // Key: Filter out expired (0 days left) and invalid titles
  // ══════════════════════���═══════════════════════════════════════════════════════

  // Trending Skills — derived from real challenge categories + participant counts
  const trendingSkills = useMemo(() => {
    const skillCount: Record<string, number> = {};
    challenges.forEach((c) => {
      if (c.category) {
        skillCount[c.category] = (skillCount[c.category] || 0) + (c.participant_count || 1);
      }
    });
    const sorted = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([skill, count]) => ({
      skill,
      count,
      pct: Math.round((count / max) * 100),
    }));
  }, [challenges]);

  const categories = useMemo(() => {
    const cats = new Set(challenges.map((c) => c.category || "General"));
    return ["All", ...Array.from(cats)];
  }, [challenges]);

  const levels = useMemo(() => {
    const lvls = new Set(challenges.map((c) => c.difficulty || "Beginner"));
    return ["All", ...Array.from(lvls)];
  }, [challenges]);

  const filteredChallenges = useMemo(() => {
    return challenges
      // Filter out expired challenges (0 days left)
      .filter((c) => getDaysRemaining(c.deadline) > 0)
      // Filter out invalid/placeholder titles
      .filter((c) => isValidChallengeTitle(c.title))
      // Filter out placeholder/garbage descriptions (e.g. test data)
      .filter((c) => isValidChallengeDescription(c.description ?? null))
      // Tab filter
      .filter((c) => {
        if (activeTab === "feed") return false;
        if (activeTab === "joined") return joinedChallengeIds.has(c.id);
        return true;
      })
      // Search filter
      .filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q) ||
          (c.category ?? "").toLowerCase().includes(q)
        );
      })
      // Category filter
      .filter((c) => categoryFilter === "All" || (c.category ?? "General") === categoryFilter)
      // Level filter
      .filter((c) => levelFilter === "All" || (c.difficulty ?? "Beginner") === levelFilter)
      // Sort
      .sort((a, b) => {
        // Pin featured first
        if (a.id === featuredChallenge?.id) return -1;
        if (b.id === featuredChallenge?.id) return 1;

        if (sortBy === "ending_soon") {
          return getDaysRemaining(a.deadline) - getDaysRemaining(b.deadline);
        }
        if (sortBy === "newest") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        // trending: participants then ending soon
        const participantDiff = (b.participant_count ?? 0) - (a.participant_count ?? 0);
        if (participantDiff !== 0) return participantDiff;
        return getDaysRemaining(a.deadline) - getDaysRemaining(b.deadline);
      });
  }, [challenges, activeTab, search, categoryFilter, levelFilter, sortBy, joinedChallengeIds, featuredChallenge]);

  const isFeatured = (challengeId: string) => challengeId === featuredChallenge?.id;

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setLevelFilter("All");
    setSortBy("trending");
    setActiveTab("all");
  };

  const hasActiveFilters = search || categoryFilter !== "All" || levelFilter !== "All" || sortBy !== "trending" || activeTab !== "all";

  // ══════════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════════════════════════════════════════

  const showBlockingLoader = useShowBlockingFullPageLoader(loading, initialLoadDone);
  if (showBlockingLoader) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F18]">
        {/* Header skeleton */}
        <header className="bg-white dark:bg-[#132B23] border-b border-slate-200 dark:border-[#1E3B34]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-3 w-28 bg-slate-100 dark:bg-[#1E3B34] rounded animate-pulse mb-2" />
            <div className="h-8 w-72 bg-slate-100 dark:bg-[#1E3B34] rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-slate-100 dark:bg-[#1E3B34] rounded animate-pulse" />
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* KPI strip skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-4 animate-pulse"
              >
                <div className="h-3 w-16 bg-slate-100 dark:bg-[#1E3B34] rounded mb-2" />
                <div className="h-7 w-12 bg-slate-100 dark:bg-[#1E3B34] rounded" />
              </div>
            ))}
          </div>
          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Tabs skeleton */}
              <div className="h-12 w-64 bg-white dark:bg-[#132B23] rounded-lg border border-slate-200 dark:border-[#1E3B34] animate-pulse" />
              {/* Cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <ChallengeCardSkeleton key={i} />
                ))}
              </div>
            </div>
            {/* Sidebar skeleton */}
            <div className="space-y-5">
              <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-5 animate-pulse">
                <div className="h-5 w-28 bg-slate-100 dark:bg-[#1E3B34] rounded mb-4" />
                <LeaderboardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ERROR STATE
  // ══════════════════════════════════════════════════════════════════════════════

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0D1F18] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 dark:text-[#94C8AF] mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#2F8F6B] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F18]">
      {/* Modals */}
      <CreateChallengeModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateChallenge}
      />
      {selectedChallengeForSubmission && userProfileId && (
        <SubmissionModal
          open={submissionModalOpen}
          onOpenChange={setSubmissionModalOpen}
          challenge={selectedChallengeForSubmission}
          userId={userProfileId}
          onSuccess={handleSubmissionSuccess}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Page Header (matches Missions pattern)
      ───────────────────────────────────────────────────────────────────── */}
      <header className="animate-slide-down bg-white dark:bg-[#132B23] border-b border-slate-200 dark:border-[#1E3B34]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Compete. Collaborate. Impact.
              </h1>
              <p className="text-sm text-slate-600 dark:text-[#94C8AF] mt-1">
                Join challenges that turn small actions into visible community progress.
              </p>
            </div>
            <button
              onClick={() => user ? setCreateModalOpen(true) : navigate('/auth')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#1E3B34] bg-white dark:bg-transparent text-slate-700 dark:text-[#BEEBD7] hover:bg-slate-50 dark:hover:bg-[#1E3B34] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Start a Challenge
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* ─────────────────────────────────────────────────────────────────────
            KPI Strip (honest beta pattern - no fake usage numbers)
        ───────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users, label: "Members", isBeta: true },
            { icon: Target, label: "Active", isBeta: true },
            { icon: Leaf, label: "Actions", isBeta: true },
            { icon: Trophy, label: "Challenges", value: filteredChallenges.length, isBeta: false },
          ].map(({ icon: Icon, label, value, isBeta }, index) => (
            <div
              key={label}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-slide-in bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-4"
            >
              <p className="text-xs text-slate-500 dark:text-[#94C8AF] font-medium mb-1 flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {label}
                {isBeta && (
                  <span className="px-1 py-0.5 text-[9px] font-semibold rounded bg-[#E8F5EF] dark:bg-[#1E3B34] text-[#2F8F6B] dark:text-[#6DD4A8]">
                    Beta
                  </span>
                )}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {isBeta ? "—" : (value ?? 0).toLocaleString()}
              </p>
              {isBeta && (
                <p className="text-[10px] text-slate-400 dark:text-[#6B8F7F] mt-0.5">Live after launch</p>
              )}
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Full-width Search + Tabs + Filters
        ───────────────────────────────────────────────────────────────────── */}
        <div style={{ animationDelay: '260ms' }} className="animate-slide-in relative z-10 bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-4">
          <div className="flex items-center gap-2">
            {/* Search input with predictive dropdown */}
            {activeTab !== "feed" ? (
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search challenges, skills, categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setSearchFocused(false); (e.target as HTMLInputElement).blur(); } }}
                  className="w-full min-h-[40px] pl-10 pr-4 py-2 border border-slate-200 dark:border-[#1E3B34] bg-slate-50 dark:bg-[#0D1F18] rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B] transition-all text-slate-900 dark:text-white"
                />
                {searchFocused && (() => {
                  const SUGGESTED_SKILLS = ["GIS Mapping", "Solar Installation", "Community Organising", "Teaching", "Forestry"];
                  const BROWSE_CATEGORIES = ["All", "Renewable Energy", "Education", "Disaster Response", "Urban Planning", "Conservation", "Waste Reduction"];
                  const predictive = search.length > 0
                    ? challenges.filter((c) =>
                        c.title.toLowerCase().includes(search.toLowerCase()) ||
                        (c.category ?? "").toLowerCase().includes(search.toLowerCase()) ||
                        (c.difficulty ?? "").toLowerCase().includes(search.toLowerCase())
                      ).slice(0, 5)
                    : [];
                  return (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#132B23] border border-slate-200 dark:border-[#1E3B34] rounded-xl shadow-lg p-3 z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                      {search.length > 0 ? (
                        predictive.length > 0 ? (
                          <div className="space-y-0.5">
                            {predictive.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => { setSearch(c.title); setSearchFocused(false); }}
                                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1E3B34] text-left transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.title}</p>
                                  <p className="text-xs text-slate-400 dark:text-[#6B8F7F] truncate">
                                    {c.category || "General"}{c.difficulty ? ` · ${c.difficulty}` : ""}
                                  </p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 dark:text-[#6B8F7F] px-3 py-2">No challenges match "{search}"</p>
                        )
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-[#6B8F7F] uppercase tracking-wide mb-2 px-1">Suggested Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {SUGGESTED_SKILLS.map((skill) => (
                                <button
                                  key={skill}
                                  onClick={() => { setSearch(skill); setSearchFocused(false); }}
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
                                  onClick={() => { setCategoryFilter(cat); setSearchFocused(false); }}
                                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                                    categoryFilter === cat
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
            ) : (
              <div className="flex-1" />
            )}

            {/* Filters button + dropdown */}
            <div ref={filtersDropdownRef} className="relative shrink-0">
                <button
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
                      <label className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] mb-1.5 block">View</label>
                      <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as "all" | "joined" | "feed")}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#1E3B34] rounded-lg text-sm bg-white dark:bg-[#0D1F18] text-slate-700 dark:text-[#BEEBD7] focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/50"
                      >
                        <option value="all">All</option>
                        <option value="joined">Joined</option>
                        <option value="feed">Feed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] mb-1.5 block">Category</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#1E3B34] rounded-lg text-sm bg-white dark:bg-[#0D1F18] text-slate-700 dark:text-[#BEEBD7] focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/50"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] mb-1.5 block">Level</label>
                      <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#1E3B34] rounded-lg text-sm bg-white dark:bg-[#0D1F18] text-slate-700 dark:text-[#BEEBD7] focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/50"
                      >
                        {levels.map((l) => (
                          <option key={l} value={l}>{l === "All" ? "All Levels" : l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] mb-1.5 block">Sort by</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#1E3B34] rounded-lg text-sm bg-white dark:bg-[#0D1F18] text-slate-700 dark:text-[#BEEBD7] focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/50"
                      >
                        <option value="trending">Trending</option>
                        <option value="ending_soon">Ending soon</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2 bg-[#0F3D2E] text-white text-sm font-medium rounded-lg hover:bg-[#1a5241] transition-colors"
                    >
                      Apply
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={() => { clearFilters(); setShowFilters(false); }}
                        className="w-full py-1.5 text-sm font-medium text-[#2F8F6B] dark:text-[#6DD4A8] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            Main Content Grid
        ───────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ══════════════════════════════════════════════════════════════════════════════
              LEFT COLUMN - Challenges
          ══════════════════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* ══════════����════════════════════════════════════��══════════════════════════════
                CHALLENGE LIST
            ══════════════════════════════════════════════════════════════════════════════ */}
            {activeTab === "feed" ? (
              <>
                {feedItems.length === 0 ? (
                  <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#1E3B34] flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-7 h-7 text-slate-400 dark:text-[#6DD4A8]" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No submissions yet</h3>
                    <p className="text-sm text-slate-600 dark:text-[#94C8AF] mb-5">
                      Be the first to complete a challenge and share your progress.
                    </p>
                    <button
                      onClick={() => setActiveTab("all")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#2F8F6B] transition-colors"
                    >
                      Browse challenges
                    </button>
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto flex flex-col gap-4">
                    {feedItems.map((item) => (
                      <FeedCard
                        key={item.id}
                        item={item}
                        isLiked={likedSubmissionIds.has(item.id)}
                        userId={userProfileId}
                        onOpenChallenge={(challengeId) => {
                          const challenge = challengeById.get(challengeId);
                          if (challenge) setSelectedChallenge(challenge);
                        }}
                        onLikeUpdate={handleLikeUpdate}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : filteredChallenges.length === 0 ? (
              <div style={{ animationDelay: '300ms', '--card-delay': '300ms' } as React.CSSProperties} className="animate-slide-in bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#1E3B34] flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-7 h-7 text-slate-400 dark:text-[#6DD4A8]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {activeTab === "joined" ? "No joined challenges" : "No challenges yet"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-[#94C8AF] mb-5">
                  {activeTab === "joined"
                    ? "Join a challenge to track your progress here."
                    : "Be the first to create a challenge for the community."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1E3B34] text-slate-700 dark:text-[#BEEBD7] text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#2F8F6B]/20 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                  <button
                    onClick={() => user ? setCreateModalOpen(true) : null}
                    disabled={!user}
                    style={{ animationDelay: 'calc(var(--card-delay, 0ms) + 320ms)' }}
                    className="animate-btn-entrance inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#2F8F6B] transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Start a Challenge
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChallenges.map((challenge, index) => {
                  const status = getChallengeStatus(challenge.id);
                  const isJoined = status !== "not-joined";
                  const isCompleted = status === "completed";
                  const daysLeft = getDaysRemaining(challenge.deadline);
                  const isFeaturedChallenge = isFeatured(challenge.id);

                  return (
                    <article
                      key={challenge.id}
                      onClick={() => setSelectedChallenge(challenge)}
                      className={`cursor-pointer bg-white dark:bg-[#132B23] rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
                        isFeaturedChallenge
                          ? "border-[#2F8F6B]/40 ring-1 ring-[#2F8F6B]/20"
                          : "border-slate-200 dark:border-[#1E3B34]"
                      } ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                      style={{ transitionDelay: `${Math.min(200, index * 40)}ms`, '--card-delay': `${Math.min(200, index * 40)}ms` } as React.CSSProperties}
                    >
                      {/* Featured challenge gets special treatment */}
                      {isFeaturedChallenge ? (
                        <>
                          <div className="bg-gradient-to-r from-[#2F8F6B] to-[#0F3D2E] px-4 py-1.5 flex items-center gap-2">
                            <Flame className="w-3.5 h-3.5 text-amber-300" />
                            <span className="text-white text-xs font-medium">This Week&apos;s Challenge</span>
                          </div>
                          <div className="p-4 sm:p-5">
                            {/* What you'll do */}
                            <p className="text-xs font-semibold text-[#2F8F6B] dark:text-[#6DD4A8] uppercase tracking-wide mb-2">
                              What you&apos;ll do this week
                            </p>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                              {challenge.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-[#94C8AF] leading-relaxed mb-4">
                              {challenge.description}
                            </p>
                            {/* What you need */}
                            <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 mb-4">
                              <p className="text-xs font-semibold text-slate-700 dark:text-[#BEEBD7] mb-2">What you need:</p>
                              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-[#94C8AF]">
                                <li className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-[#2F8F6B]" />
                                  ~15 min to start
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-[#2F8F6B]" />
                                  Beginner-friendly
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <Target className="w-3 h-3 text-[#2F8F6B]" />
                                  No special gear
                                </li>
                              </ul>
                            </div>
                            {/* Meta row */}
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-[#6B8F7F] mb-4">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {daysLeft} days left
                              </span>
                              <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                                <Star className="w-3.5 h-3.5" />
                                +{challenge.points_reward || 0} pts
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 sm:p-5">
                          {/* Top row: Category + Level + Days */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(challenge.category)}`}>
                              {getCategoryIcon(challenge.category)}
                              {challenge.category || "General"}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-[#6B8F7F]">
                              {challenge.difficulty || "Beginner"}
                            </span>
                            {daysLeft <= 7 && (
                              <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                                daysLeft <= 3 ? "text-red-500" : "text-amber-600"
                              }`}>
                                <Clock className="w-3 h-3" />
                                {daysLeft}d left
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-snug">
                            {challenge.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-slate-600 dark:text-[#94C8AF] leading-relaxed mb-4 line-clamp-2">
                            {challenge.description}
                          </p>

                          {/* Meta row - Beta-honest (no participation counts pre-launch) */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-[#6B8F7F] mb-4">
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span className="inline-flex items-center gap-1.5">
                                <span className="font-semibold">—</span>
                                <span className="px-1 py-0.5 text-[9px] font-semibold rounded bg-[#E8F5EF] dark:bg-[#1E3B34] text-[#2F8F6B] dark:text-[#6DD4A8]">
                                  Beta
                                </span>
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {daysLeft} days left
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                              <Star className="w-3.5 h-3.5" />
                              +{challenge.points_reward || 0} pts
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions - shared by both featured and regular cards */}
                      <div className="animate-btn-entrance px-4 sm:px-5 pb-4 sm:pb-5" style={{ animationDelay: 'calc(var(--card-delay, 0ms) + 380ms)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {isCompleted ? (
                            <div className="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </div>
                          ) : isJoined ? (
                            <>
                              <button
                                onClick={() => handleOpenSubmissionModal(challenge)}
                                disabled={!user}
                                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 min-h-[40px]"
                              >
                                <span className="inline-flex items-center justify-center gap-1.5">
                                  <Camera className="w-4 h-4" />
                                  Submit Proof
                                </span>
                              </button>
                              <button
                                onClick={() => handleJoin(challenge.id)}
                                disabled={!user || joiningId === challenge.id}
                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1E3B34] text-slate-500 dark:text-[#94C8AF] hover:border-red-300 hover:text-red-500 transition-colors text-sm min-h-[40px]"
                              >
                                {joiningId === challenge.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Leave"}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => user ? handleJoin(challenge.id) : null}
                              disabled={joiningId === challenge.id}
                              className="flex-1 py-2 rounded-lg text-sm font-semibold bg-[#0F3D2E] text-white hover:bg-[#2F8F6B] transition-colors disabled:opacity-50 min-h-[40px]"
                            >
                              {!user ? (
                                <Link to="/auth" className="inline-flex items-center justify-center gap-1.5 w-full">
                                  <LogIn className="w-4 h-4" />
                                  Sign in to Join
                                </Link>
                              ) : joiningId === challenge.id ? (
                                <span className="inline-flex items-center justify-center gap-1.5">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center gap-1.5">
                                  <Plus className="w-4 h-4" />
                                  Join Challenge
                                </span>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedChallenge(challenge)}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1E3B34] text-slate-500 dark:text-[#94C8AF] hover:border-[#2F8F6B] hover:text-[#2F8F6B] transition-colors min-h-[40px]"
                            aria-label="View details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1E3B34] text-slate-500 dark:text-[#94C8AF] hover:border-[#2F8F6B] hover:text-[#2F8F6B] transition-colors min-h-[40px]"
                            aria-label="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════════════════
              RIGHT COLUMN - Sidebar
          ══════════════════════════════════════════════════════════════════════════════ */}
          <aside className="space-y-5">
            {/* ══════════════════════════════════════════════════════════════════════════════
                LEADERBOARD - Pre-launch empty state with optional demo toggle
            ══════════════════════════════════════════════════════════════════════════════ */}
            <div style={{ animationDelay: '320ms', '--card-delay': '320ms' } as React.CSSProperties} className="animate-slide-in">
              <LeaderboardCard
                leaderboard={leaderboard}
                leaderboardLoading={leaderboardLoading}
                userProfileId={userProfileId}
                user={user}
              />
            </div>

            {/* My Stats - Only show if logged in */}
            {user && (
              <div style={{ animationDelay: '390ms' }} className="animate-slide-in bg-[#0F3D2E] rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-[#6DD4A8]" />
                  <span className="font-semibold">My Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold">{userStats.activeChallenges}</div>
                    <div className="text-[#A8D5BF] text-xs mt-0.5">Active</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold">{userStats.completedChallenges}</div>
                    <div className="text-[#A8D5BF] text-xs mt-0.5">Completed</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-[#6DD4A8]">{userStats.totalPoints.toLocaleString()}</div>
                    <div className="text-[#A8D5BF] text-xs mt-0.5">Points</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold">#{userRank || "-"}</div>
                    <div className="text-[#A8D5BF] text-xs mt-0.5">Rank</div>
                  </div>
                </div>
                {userRank && userRank > 1 && leaderboard.length >= userRank - 1 && (
                  <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg p-3">
                    <ArrowUp className="w-4 h-4 text-[#6DD4A8]" />
                    <p className="text-[#A8D5BF] text-xs">
                      {leaderboard[userRank - 2]?.total_points - userStats.totalPoints || 0} points to rank #{userRank - 1}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Trending Skills — derived from real challenge data */}
            <div style={{ animationDelay: '460ms' }} className="animate-slide-in bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#2F8F6B]" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Trending Skills</h3>
              </div>
              {trendingSkills.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-[#6B8F7F] text-center py-3">
                  No challenge data yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {trendingSkills.map((item) => (
                    <div key={item.skill} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-700 dark:text-[#BEEBD7] truncate">{item.skill}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-1.5 w-16 bg-slate-100 dark:bg-[#0D1F18] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2F8F6B] rounded-full"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-[#6B8F7F] w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-400 dark:text-[#6B8F7F] mt-3 text-center">
                Based on participant counts across active challenges
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ─────────────────────��───────────────────────────────────────────────
          Challenge Details Drawer
      ────────────��────────────────────────���─────────────────────────────── */}
      {selectedChallenge && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setSelectedChallenge(null)}
          role="button"
          aria-label="Close"
        />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 bg-white dark:bg-[#132B23] shadow-2xl overflow-y-auto transition-transform duration-[650ms] ease-out ${selectedChallenge ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}>
        {selectedChallenge && (
          <>
            <div className="p-5 border-b border-slate-200 dark:border-[#1E3B34]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-[#94C8AF] uppercase tracking-wide mb-1">
                    Challenge Details
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedChallenge.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-[#1E3B34] text-slate-500 dark:text-[#94C8AF] hover:bg-slate-50 dark:hover:bg-[#1E3B34] transition-colors min-h-[40px] min-w-[40px]"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Category + Level */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(selectedChallenge.category)}`}>
                  {getCategoryIcon(selectedChallenge.category)}
                  {selectedChallenge.category || "General"}
                </span>
                <span className="text-xs text-slate-400 dark:text-[#6B8F7F]">
                  {selectedChallenge.difficulty || "Beginner"}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-[#94C8AF] leading-relaxed">
                {selectedChallenge.description}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">Participants</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {(selectedChallenge.participant_count || 0) > 0 
                      ? (selectedChallenge.participant_count || 0).toLocaleString()
                      : "0"}
                  </p>
                  {(selectedChallenge.participant_count || 0) === 0 && (
                    <p className="text-[10px] text-[#2F8F6B] mt-0.5">Be first!</p>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">Time left</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {getDaysRemaining(selectedChallenge.deadline)}d
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">Reward</p>
                  <p className="text-sm font-bold text-[#2F8F6B] mt-0.5">
                    +{selectedChallenge.points_reward || 0}
                  </p>
                </div>
              </div>

              {/* How to complete */}
              <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">How to complete</p>
                <ol className="space-y-2 text-sm text-slate-600 dark:text-[#94C8AF]">
                  <li className="flex gap-2">
                    <span className="text-[#2F8F6B] font-bold">1.</span>
                    Do the action in real life.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#2F8F6B] font-bold">2.</span>
                    Upload a proof photo.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#2F8F6B] font-bold">3.</span>
                    Earn points and appear on the leaderboard.
                  </li>
                </ol>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {(() => {
                  const status = getChallengeStatus(selectedChallenge.id);
                  const isJoined = status !== "not-joined";
                  const isCompleted = status === "completed";

                  if (isCompleted) {
                    return (
                      <div className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    );
                  }

                  if (isJoined) {
                    return (
                      <>
                        <button
                          onClick={() => handleOpenSubmissionModal(selectedChallenge)}
                          disabled={!user}
                          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 min-h-[44px]"
                        >
                          <span className="inline-flex items-center justify-center gap-1.5">
                            <Camera className="w-4 h-4" />
                            Submit Proof
                          </span>
                        </button>
                        <button
                          onClick={() => handleJoin(selectedChallenge.id)}
                          disabled={!user || joiningId === selectedChallenge.id}
                          className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-[#1E3B34] text-slate-500 dark:text-[#94C8AF] hover:border-red-300 hover:text-red-500 transition-colors text-sm min-h-[44px]"
                        >
                          {joiningId === selectedChallenge.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Leave"}
                        </button>
                      </>
                    );
                  }

                  return (
                    <button
                      onClick={() => user ? handleJoin(selectedChallenge.id) : null}
                      disabled={joiningId === selectedChallenge.id}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[#0F3D2E] text-white hover:bg-[#2F8F6B] transition-colors disabled:opacity-50 min-h-[44px]"
                    >
                      {!user ? (
                        <Link to="/auth" className="inline-flex items-center justify-center gap-1.5 w-full">
                          <LogIn className="w-4 h-4" />
                          Sign in to Join
                        </Link>
                      ) : joiningId === selectedChallenge.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <Plus className="w-4 h-4" />
                          Join Challenge
                        </span>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}