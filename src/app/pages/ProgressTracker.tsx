import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Loader2, MapPin, Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getCurrentProfile } from "../utils/matchService";
import { supabase } from "../utils/supabase";
import type { Profile } from "../types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MissionWithProject {
  id: string;
  status: string;
  role: string;
  created_at: string;
  projects: {
    title: string;
    location: string | null;
    duration: string | null;
    focus_area: string[];
    status: string;
    type: string;
  } | null;
}

interface ChallengeParticipantWithChallenge {
  id: string;
  challenge_id: string;
  user_id: string;
  status: string;
  actions_completed: number;
  points_earned: number;
  joined_at: string;
  challenges: {
    title: string;
    category: string | null;
    points_reward: number;
    deadline: string | null;
  } | null;
}

interface UserBadge {
  id: string;
  earned_at: string;
  badges: {
    name: string;
    icon: string;
    description: string | null;
  } | null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ProgressTracker() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [missions, setMissions] = useState<MissionWithProject[]>([]);
  const [challenges, setChallenges] = useState<ChallengeParticipantWithChallenge[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [leaderboardRank, setLeaderboardRank] = useState<number | string>("—");
  const [loading, setLoading] = useState(true);

  // Derived
  const completedChallenges = challenges.filter(c => c.status === "completed").length;

  // ── Data Fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || authLoading) {
      setLoading(false);
      return;
    }

    async function fetchAllData() {
      setLoading(true);
      try {
        const profileData = await getCurrentProfile();
        if (!profileData?.id) {
          setLoading(false);
          return;
        }
        setProfile(profileData);

        // Fetch all data in parallel
        await Promise.all([
          fetchMissions(profileData.id),
          fetchChallenges(profileData.id),
          fetchBadges(profileData.id),
          fetchLeaderboardRank(profileData.id),
          fetchStreak(profileData.id),
        ]);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [user, authLoading]);

  // Missions applied to
  const fetchMissions = async (profileId: string) => {
    const { data, error } = await supabase
      .from("connections")
      .select("id, status, role, created_at, projects(title, location, duration, focus_area, status, type)")
      .eq("responder_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching missions:", error);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMissions((data as any) ?? []);
  };

  // Challenges — joined and completed
  const fetchChallenges = async (profileId: string) => {
    const { data, error } = await supabase
      .from("challenge_participants")
      .select("*, challenges(title, category, points_reward, deadline)")
      .eq("user_id", profileId)
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("Error fetching challenges:", error);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChallenges((data as any) ?? []);
  };

  // Badges
  const fetchBadges = async (profileId: string) => {
    const { data, error } = await supabase
      .from("user_badges")
      .select("*, badges(name, icon, description)")
      .eq("user_id", profileId)
      .order("earned_at", { ascending: false });

    if (error) {
      // Table may not exist yet — silently ignore
      console.log("Badges table not available:", error.message);
      return;
    }
    setBadges((data as UserBadge[]) ?? []);
  };

  // Leaderboard rank
  const fetchLeaderboardRank = async (profileId: string) => {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("user_id, total_points");

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }

    const sorted = (data ?? []).sort((a, b) => b.total_points - a.total_points);
    const rank = sorted.findIndex(r => r.user_id === profileId) + 1;
    setLeaderboardRank(rank > 0 ? rank : "—");

    const userRow = sorted.find(r => r.user_id === profileId);
    setTotalPoints(userRow?.total_points ?? 0);
  };

  // Streak — count consecutive days with challenge_submissions
  const fetchStreak = async (profileId: string) => {
    const { data, error } = await supabase
      .from("challenge_submissions")
      .select("created_at")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Submissions table not available:", error.message);
      return;
    }

    // Calculate consecutive days
    let streakCount = 0;
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    const dates = [...new Set(
      data?.map(s => new Date(s.created_at).toDateString())
    )];

    for (const dateStr of dates) {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((current.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === streakCount) streakCount++;
      else break;
    }
    setStreak(streakCount);
  };

  // ── Loading / Auth Guards ───────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F8F6B]" />
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-[#0F3D2E]">Please sign in</h2>
          <p className="mb-4 text-gray-500">You need to be logged in to view your profile.</p>
          <Link to="/auth" className="text-[#2F8F6B] font-semibold">Sign in →</Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══════════════════════════════════════════════════════════════════════
          PROFILE HEADER (dark green banner)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1a3a2a] w-full px-8 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Top row — avatar + name + edit button */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              {/* Name + org + location */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-white text-2xl font-bold">{profile?.name || user?.email}</h1>
                  {profile?.verified && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">✓ Verified</span>
                  )}
                </div>
                {profile?.org_name && (
                  <p className="text-green-300 text-sm">{profile.org_name}</p>
                )}
                {profile?.location && (
                  <p className="text-green-400 text-xs mt-0.5">📍 {profile.location}</p>
                )}
              </div>
            </div>

            {/* Edit profile button */}
            <button
              onClick={() => navigate("/edit-profile")}
              className="border border-green-500 text-green-300 text-xs px-4 py-2 rounded-full hover:bg-green-800 transition"
            >
              ✏️ Edit Profile
            </button>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-green-100 text-sm leading-relaxed mb-6 max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.skills.map(skill => (
                <span key={skill} className="bg-green-800 text-green-200 text-xs px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4">
            <div className="bg-green-800/50 rounded-2xl px-4 py-3 text-center">
              <p className="text-yellow-400 text-lg font-bold">{totalPoints}</p>
              <p className="text-green-300 text-xs">Points</p>
            </div>
            <div className="bg-green-800/50 rounded-2xl px-4 py-3 text-center">
              <p className="text-white text-lg font-bold">🔥 {streak}d</p>
              <p className="text-green-300 text-xs">Streak</p>
            </div>
            <div className="bg-green-800/50 rounded-2xl px-4 py-3 text-center">
              <p className="text-white text-lg font-bold">#{leaderboardRank}</p>
              <p className="text-green-300 text-xs">Global Rank</p>
            </div>
            <div className="bg-green-800/50 rounded-2xl px-4 py-3 text-center">
              <p className="text-white text-lg font-bold">{completedChallenges}</p>
              <p className="text-green-300 text-xs">Challenges Done</p>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — My Missions
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-8 py-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">My Missions</h2>

        {missions.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-sm">No missions applied to yet.</p>
            <button
              onClick={() => navigate("/work")}
              className="mt-3 text-[#1a3a2a] text-sm font-medium hover:underline"
            >
              Browse Missions →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {missions.map(mission => (
              <div
                key={mission.id}
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between hover:shadow-sm transition"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {mission.projects?.title || "Untitled Mission"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {mission.projects?.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mission.projects?.duration || "Flexible"}
                    </span>
                    <span className="capitalize">🎯 {mission.role}</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    mission.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : mission.status === "declined"
                      ? "bg-red-100 text-red-500"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {mission.status === "accepted"
                    ? "✓ Accepted"
                    : mission.status === "declined"
                    ? "✗ Rejected"
                    : "⏳ Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — My Challenges
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-8 pb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">My Challenges</h2>

        {challenges.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-sm">No challenges joined yet.</p>
            <button
              onClick={() => navigate("/community")}
              className="mt-3 text-[#1a3a2a] text-sm font-medium hover:underline"
            >
              Browse Challenges →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {challenges.map(cp => (
              <div
                key={cp.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    {cp.challenges?.category || "General"}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cp.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {cp.status === "completed" ? "✓ Completed" : "⏳ In Progress"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {cp.challenges?.title || "Untitled Challenge"}
                </p>
                <p className="text-xs text-yellow-500 font-medium">
                  +{cp.points_earned || 0} pts earned
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Badges Earned
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-8 pb-16">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Badges Earned</h2>

        {badges.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-sm">
              Complete challenges and missions to earn badges.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {badges.map(ub => (
              <div
                key={ub.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-center w-28 hover:shadow-sm transition"
              >
                <div className="text-3xl mb-2">{ub.badges?.icon || "🏅"}</div>
                <p className="text-xs font-semibold text-gray-800">
                  {ub.badges?.name || "Badge"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {ub.badges?.description || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}