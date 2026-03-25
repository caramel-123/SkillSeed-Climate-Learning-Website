import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Loader2 } from 'lucide-react';
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
  const filteredQuests = activeTab === 'my-quests'
    ? quests.filter(q => progressMap[q.id])
    : quests.filter(q => q.tier === activeTab);

  // My quests with progress
  const myQuestsWithProgress = filteredQuests.map(q => ({
    quest: q,
    progress: progressMap[q.id] ?? null
  }));

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F8F6B]" />
          <p className="text-gray-500">Loading quests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1a3a2a] w-full px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-2">
            🌱 Hands-on Learning
          </p>
          <h1 className="text-white text-4xl font-bold mb-3">Learn by Doing</h1>
          <p className="text-green-200 text-sm max-w-lg">
            Complete real-world environmental quests. Earn badges for beginner
            quests and verified certificates for advanced ones.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div>
              <p className="text-white text-2xl font-bold">{stats.beginnerCount}</p>
              <p className="text-green-400 text-xs">Beginner Quests</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">{stats.advancedCount}</p>
              <p className="text-green-400 text-xs">Advanced Quests</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">{userBadgeCount}</p>
              <p className="text-green-400 text-xs">Your Badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB NAVIGATION
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <div className="flex gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('beginner')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'beginner'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            🌱 Beginner Quests
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'advanced'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            🏆 Advanced Quests
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('my-quests')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'my-quests'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              📋 My Quests
            </button>
          )}
          
          {/* Verifier link (if user is verifier) */}
          {profile?.is_verifier && (
            <Link
              to="/verifier"
              className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
            >
              🔍 Verifier Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          QUEST CARDS GRID
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {filteredQuests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            {activeTab === 'my-quests' ? (
              <>
                <p className="text-gray-400 text-sm mb-3">
                  You haven't started any quests yet.
                </p>
                <button
                  onClick={() => setActiveTab('beginner')}
                  className="text-[#1a3a2a] text-sm font-medium hover:underline"
                >
                  Browse Beginner Quests →
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-sm">No quests available.</p>
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
        <div className="max-w-7xl mx-auto px-8 pb-12">
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
