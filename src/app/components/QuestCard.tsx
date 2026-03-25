import type { Quest, QuestProgress, QuestProgressStatus } from '../types/database';

interface QuestCardProps {
  quest: Quest;
  progress?: QuestProgress | null;
  onStart: (quest: Quest) => void;
}

export function QuestCard({ quest, progress, onStart }: QuestCardProps) {
  const status: QuestProgressStatus | 'not_started' = progress?.status ?? 'not_started';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition flex flex-col h-full">
      {/* Icon + tier badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{quest.badge_icon}</span>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            quest.tier === 'beginner'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          {quest.tier === 'beginner' ? '🌱 Beginner' : '🏆 Advanced'}
        </span>
      </div>

      {/* Title + description */}
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{quest.title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{quest.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 flex-wrap">
        <span>📅 ~{quest.estimated_days} days</span>
        <span>⭐ +{quest.points_reward} pts</span>
        <span>{quest.steps?.length ?? 0} steps</span>
      </div>

      {/* Reward label */}
      <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 text-xs text-gray-600">
        {quest.tier === 'beginner'
          ? `🏅 Badge: ${quest.badge_name}`
          : `📜 Certificate: ${quest.certificate_name}`}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA button — state aware */}
      {status === 'not_started' && (
        <button
          onClick={() => onStart(quest)}
          className="w-full bg-[#1a3a2a] text-white text-sm py-2.5 rounded-xl hover:bg-green-900 transition"
        >
          Start Quest →
        </button>
      )}
      {status === 'in_progress' && (
        <button
          onClick={() => onStart(quest)}
          className="w-full border-2 border-[#1a3a2a] text-[#1a3a2a] text-sm py-2.5 rounded-xl hover:bg-green-50 transition"
        >
          Continue Quest →
        </button>
      )}
      {status === 'submitted' && (
        <div className="w-full bg-yellow-50 text-yellow-700 text-sm py-2.5 rounded-xl text-center">
          ⏳ Awaiting Verification
        </div>
      )}
      {status === 'verified' && (
        <div className="w-full bg-green-100 text-green-700 text-sm py-2.5 rounded-xl text-center font-medium">
          ✓ Completed
        </div>
      )}
      {status === 'rejected' && (
        <button
          onClick={() => onStart(quest)}
          className="w-full bg-red-50 border border-red-200 text-red-600 text-sm py-2.5 rounded-xl hover:bg-red-100 transition"
        >
          ⚠ Resubmit
        </button>
      )}
    </div>
  );
}

export default QuestCard;
