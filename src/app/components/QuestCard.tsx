import { CheckCircle2, Clock, FileWarning, Hourglass, ListChecks, Star, Sprout, Leaf, BookOpen, Recycle, Droplets, Sun, TreePine, Mountain, Users } from 'lucide-react';
import type { Quest, QuestProgress, QuestProgressStatus } from '../types/database';

// ============================================================================
// Category Icons & Gradients (matches Missions pattern)
// ============================================================================

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "climate": <Sun className="w-5 h-5" />,
  "energy": <Sun className="w-5 h-5" />,
  "water": <Droplets className="w-5 h-5" />,
  "ocean": <Droplets className="w-5 h-5" />,
  "marine": <Droplets className="w-5 h-5" />,
  "forest": <TreePine className="w-5 h-5" />,
  "tree": <TreePine className="w-5 h-5" />,
  "reforestation": <TreePine className="w-5 h-5" />,
  "waste": <Recycle className="w-5 h-5" />,
  "recycling": <Recycle className="w-5 h-5" />,
  "circular": <Recycle className="w-5 h-5" />,
  "biodiversity": <Leaf className="w-5 h-5" />,
  "nature": <Leaf className="w-5 h-5" />,
  "conservation": <Mountain className="w-5 h-5" />,
  "community": <Users className="w-5 h-5" />,
  "education": <BookOpen className="w-5 h-5" />,
  "default": <Sprout className="w-5 h-5" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "climate": "from-amber-500/20 to-orange-500/10",
  "energy": "from-amber-500/20 to-orange-500/10",
  "water": "from-cyan-500/20 to-blue-500/10",
  "ocean": "from-cyan-500/20 to-blue-500/10",
  "marine": "from-cyan-500/20 to-blue-500/10",
  "forest": "from-green-500/20 to-emerald-500/10",
  "tree": "from-green-500/20 to-emerald-500/10",
  "reforestation": "from-green-500/20 to-emerald-500/10",
  "waste": "from-lime-500/20 to-green-500/10",
  "recycling": "from-lime-500/20 to-green-500/10",
  "circular": "from-lime-500/20 to-green-500/10",
  "biodiversity": "from-emerald-500/20 to-teal-500/10",
  "nature": "from-emerald-500/20 to-teal-500/10",
  "conservation": "from-slate-500/20 to-gray-500/10",
  "community": "from-violet-500/20 to-purple-500/10",
  "education": "from-blue-500/20 to-indigo-500/10",
  "default": "from-[#2F8F6B]/20 to-[#0F3D2E]/10",
};

function getCategoryIcon(category: string | null | undefined): React.ReactNode {
  const cat = (category || "").toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (cat.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
}

function getCategoryGradient(category: string | null | undefined): string {
  const cat = (category || "").toLowerCase();
  for (const [key, gradient] of Object.entries(CATEGORY_GRADIENTS)) {
    if (cat.includes(key)) return gradient;
  }
  return CATEGORY_GRADIENTS.default;
}

// ============================================================================
// QuestCard Component
// ============================================================================

interface QuestCardProps {
  quest: Quest;
  progress?: QuestProgress | null;
  onStart: (quest: Quest) => void;
}

export function QuestCard({ quest, progress, onStart }: QuestCardProps) {
  const status: QuestProgressStatus | 'not_started' = progress?.status ?? 'not_started';
  const totalSteps = quest.steps?.length ?? 0;
  const currentStep = progress?.current_step ?? 0;
  const progressRatio = totalSteps > 0 ? Math.min(1, Math.max(0, currentStep / totalSteps)) : 0;

  const statusLabel: Record<typeof status, string> = {
    not_started: 'Not started',
    in_progress: 'In progress',
    submitted: 'Pending review',
    verified: 'Completed',
    rejected: 'Needs resubmission',
  };

  const statusTone: Record<typeof status, string> = {
    not_started: 'bg-slate-100 dark:bg-[#1E3B34] text-slate-600 dark:text-[#94C8AF]',
    in_progress: 'bg-[#E6F4EE] dark:bg-[#1E3B34] text-[#0F3D2E] dark:text-[#6DD4A8]',
    submitted: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    verified: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    rejected: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  };

  return (
    <div className="group bg-white dark:bg-[#132B23] border border-slate-200 dark:border-[#1E3B34] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2F8F6B]/40 dark:hover:border-[#6DD4A8]/40 transition-all duration-200 ease-out motion-reduce:transition-none flex flex-col h-full">
      {/* ─────────────────────────────────────────────────────────────────────
          Card Header — pastel gradient + centered icon (matches Missions)
      ───────────────────────────────────────────────────────────────────── */}
      <div className={`relative h-24 flex items-center justify-center bg-gradient-to-br ${getCategoryGradient(quest.category)}`}>
        <div className="w-11 h-11 rounded-lg bg-white/80 dark:bg-[#0D1F18]/80 backdrop-blur-sm flex items-center justify-center text-[#0F3D2E] dark:text-[#6DD4A8] shadow-sm">
          {getCategoryIcon(quest.category)}
        </div>
        {/* Tier badge - top left */}
        <span
          className={`absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            quest.tier === 'beginner'
              ? 'bg-white/90 dark:bg-[#0D1F18]/90 text-[#0F3D2E] dark:text-[#6DD4A8]'
              : 'bg-amber-100/90 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
          }`}
        >
          {quest.tier === 'beginner' ? 'Beginner' : 'Advanced'}
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          Card Body
      ───────────────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category chip + status */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E3B34] text-slate-600 dark:text-[#94C8AF] text-[10px] font-medium">
            {quest.category || "Quest"}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusTone[status]}`}>
            {statusLabel[status]}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-1.5 line-clamp-2 group-hover:text-[#0F3D2E] dark:group-hover:text-[#6DD4A8] transition-colors">
          {quest.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-[#94C8AF] line-clamp-2 leading-relaxed mb-3">
          {quest.description}
        </p>

        {/* Meta row: Duration - Points - Steps (matches Missions pattern) */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-[#6B8F7F] mb-3">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>~{quest.estimated_days}d</span>
          <span className="text-slate-300 dark:text-[#1E3B34]">-</span>
          <Star className="w-3 h-3 flex-shrink-0 text-amber-500" />
          <span>+{quest.points_reward} pts</span>
          <span className="text-slate-300 dark:text-[#1E3B34]">-</span>
          <ListChecks className="w-3 h-3 flex-shrink-0" />
          <span>{totalSteps} steps</span>
        </div>

        {/* Reward badge */}
        <div className="bg-slate-50 dark:bg-[#0D1F18] rounded-lg px-3 py-2 mb-3 text-xs text-slate-700 dark:text-[#BEEBD7]">
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

        {/* Progress bar (only when started) */}
        {status !== 'not_started' && totalSteps > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-[#6B8F7F] mb-1">
              <span>Step {Math.min(totalSteps, currentStep + 1)} of {totalSteps}</span>
              <span className="font-medium">{Math.round(progressRatio * 100)}%</span>
            </div>
            <div className="h-1 rounded-full bg-slate-100 dark:bg-[#0D1F18] overflow-hidden">
              <div
                className="h-full bg-[#2F8F6B] dark:bg-[#6DD4A8] transition-[width] duration-500 ease-out motion-reduce:transition-none rounded-full"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ─────────────────────────────────────────────────────────────────────
            CTA Button — state aware (matches Missions forest green style)
        ───────────────────────────────────────────────────────────────────── */}
        <div className="animate-btn-entrance" style={{ animationDelay: 'calc(var(--card-delay, 0ms) + 320ms)' }}>
          {status === 'not_started' && (
            <button
              onClick={(e) => { e.stopPropagation(); onStart(quest); }}
              className="w-full min-h-[40px] bg-[#0F3D2E] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#2F8F6B] transition-colors active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] focus-visible:ring-offset-2"
            >
              Start Quest
            </button>
          )}
          {status === 'in_progress' && (
            <button
              onClick={(e) => { e.stopPropagation(); onStart(quest); }}
              className="w-full min-h-[40px] border border-[#0F3D2E] dark:border-[#6DD4A8] text-[#0F3D2E] dark:text-[#6DD4A8] text-sm font-semibold py-2 rounded-lg hover:bg-[#E6F4EE] dark:hover:bg-[#1E3B34] transition-colors active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] focus-visible:ring-offset-2"
            >
              Continue
            </button>
          )}
          {status === 'submitted' && (
            <div className="w-full min-h-[40px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-medium py-2 rounded-lg text-center flex items-center justify-center">
              Pending Review
            </div>
          )}
          {status === 'verified' && (
            <div className="w-full min-h-[40px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold py-2 rounded-lg text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
          )}
          {status === 'rejected' && (
            <button
              onClick={(e) => { e.stopPropagation(); onStart(quest); }}
              className="w-full min-h-[40px] bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-sm font-semibold py-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <FileWarning className="w-4 h-4" />
              Resubmit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestCard;
