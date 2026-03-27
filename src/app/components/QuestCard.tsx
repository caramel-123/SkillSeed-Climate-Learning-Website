import { CheckCircle2, Clock, FileWarning, Hourglass, ListChecks, Star } from 'lucide-react';
import type { Quest, QuestProgress, QuestProgressStatus } from '../types/database';

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
    not_started: 'bg-gray-50 text-gray-700 border border-gray-200',
    in_progress: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    submitted: 'bg-amber-50 text-amber-800 border border-amber-100',
    verified: 'bg-green-50 text-green-700 border border-green-100',
    rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_6px_20px_rgba(15,61,46,0.08)] hover:shadow-[0_14px_28px_rgba(15,61,46,0.12)] transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 flex flex-col h-full">
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
          {quest.tier === 'beginner' ? 'Beginner' : 'Advanced'}
        </span>
      </div>

      {/* Title + description */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{quest.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{quest.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusTone[status]}`}>
          {statusLabel[status]}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          ~{quest.estimated_days} days
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-500" />
          +{quest.points_reward.toLocaleString()} points
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="w-4 h-4" />
          {totalSteps} steps
        </span>
      </div>

      {/* Reward label */}
      <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 text-sm text-gray-700">
        {quest.tier === 'beginner' ? (
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Badge: {quest.badge_name}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-600" />
            Certificate: {quest.certificate_name}
          </span>
        )}
      </div>

      {/* Progress (only when started) */}
      {status !== 'not_started' && totalSteps > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Step {Math.min(totalSteps, currentStep + 1)} of {totalSteps}</span>
            <span>{Math.round(progressRatio * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#2F8F6B] transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA button — state aware */}
      {status === 'not_started' && (
        <button
          onClick={() => onStart(quest)}
          className="w-full bg-[#0F3D2E] text-white text-sm py-2.5 rounded-xl hover:bg-[#2F8F6B] transition-all duration-300 delay-75 motion-reduce:transition-none hover:scale-[1.01] active:scale-[0.99]"
        >
          Start quest
        </button>
      )}
      {status === 'in_progress' && (
        <button
          onClick={() => onStart(quest)}
          className="w-full border border-[#0F3D2E] text-[#0F3D2E] text-sm py-2.5 rounded-xl hover:bg-[#E6F4EE] transition-all duration-300 delay-75 motion-reduce:transition-none hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue
        </button>
      )}
      {status === 'submitted' && (
        <div className="w-full bg-amber-50 text-amber-800 text-sm py-2.5 rounded-xl text-center border border-amber-100">
          Pending review
        </div>
      )}
      {status === 'verified' && (
        <div className="w-full bg-green-50 text-green-700 text-sm py-2.5 rounded-xl text-center font-semibold border border-green-100">
          Completed
        </div>
      )}
      {status === 'rejected' && (
        <button
          onClick={() => onStart(quest)}
          className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-sm py-2.5 rounded-xl hover:bg-rose-100 transition-all duration-300 delay-75 motion-reduce:transition-none hover:scale-[1.01] active:scale-[0.99] inline-flex items-center justify-center gap-2"
        >
          <FileWarning className="w-4 h-4" />
          Resubmit
        </button>
      )}
    </div>
  );
}

export default QuestCard;
