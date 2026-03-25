import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentProfile } from '../utils/matchService';
import {
  fetchQuestById,
  fetchQuestProgress,
  startQuest,
  updateQuestStep,
  uploadQuestPhoto,
  awardBadge
} from '../utils/questService';
import { runAiScreening } from '../utils/aiScreening';
import { supabase } from '../utils/supabase';
import { AiCoachPanel } from '../components/AiCoachPanel';
import type { Profile, Quest, QuestProgress } from '../types/database';
import { toast } from 'sonner';

export function QuestDetail() {
  const { questId } = useParams<{ questId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Submission state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    if (!questId || authLoading) return;

    const currentQuestId = questId; // Capture for async closure

    async function loadData() {
      setLoading(true);
      try {
        // Fetch quest
        const questData = await fetchQuestById(currentQuestId);
        if (!questData) {
          navigate('/hands-on');
          return;
        }
        setQuest(questData);

        // Fetch user data if logged in
        if (user) {
          const profileData = await getCurrentProfile();
          if (profileData?.id) {
            setProfile(profileData);

            // Fetch or create progress
            let progressData = await fetchQuestProgress(currentQuestId, profileData.id);
            if (!progressData) {
              progressData = await startQuest(currentQuestId, profileData.id);
            }
            setProgress(progressData);
          }
        }
      } catch (err) {
        console.error('Error loading quest:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [questId, user, authLoading, navigate]);

  // Mark step as complete
  const markStepComplete = async (stepIndex: number) => {
    if (!quest || !profile?.id || !questId) return;

    const newStep = stepIndex + 1;
    await updateQuestStep(questId, profile.id, newStep);
    setProgress(prev => prev ? { ...prev, current_step: newStep } : null);
    toast.success(`Step ${stepIndex + 1} completed!`);
  };

  // Handle photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!quest || !profile?.id || !questId || !photoFile) {
      toast.error('Please upload a photo.');
      return;
    }
    if (reflection.trim().length < 50) {
      toast.error('Reflection must be at least 50 characters.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload photo to Supabase Storage
      const photoUrl = await uploadQuestPhoto(profile.id, questId, photoFile);

      // 2. Run AI screening
      toast.loading('Analysing your submission...', { id: 'ai-screen' });
      const aiResult = await runAiScreening(photoUrl, reflection, quest);
      toast.dismiss('ai-screen');

      // 3. Determine auto-approval logic
      // Beginner + AI confidence >= 70 + recommendation = approve → auto verify
      // Advanced → always needs human verifier
      // AI failed → goes to manual review
      const autoVerify = 
        quest.tier === 'beginner' && 
        aiResult !== null && 
        aiResult.confidence >= 70 &&
        aiResult.recommendation === 'approve';

      // 4. Save submission
      // First check if row exists
      const { data: existingProgress } = await supabase
        .from('quest_progress')
        .select('id')
        .eq('quest_id', quest.id)
        .eq('user_id', profile.id)
        .single();

      // Base submission data (without AI fields in case columns don't exist yet)
      // Also clear rejection_reason on resubmit
      const isResubmit = progress?.status === 'rejected';
      const baseData = {
        status: autoVerify ? 'verified' : 'submitted',
        photo_url: photoUrl,
        reflection: reflection.trim(),
        submitted_at: new Date().toISOString(),
        verified_at: autoVerify ? new Date().toISOString() : null,
        rejection_reason: null // clear previous rejection reason
      };

      // Try with AI fields first, fall back to without if columns don't exist
      const dataWithAI = {
        ...baseData,
        ai_confidence: aiResult?.confidence ?? null,
        ai_reasoning: aiResult?.reasoning ?? null,
        ai_recommendation: aiResult?.recommendation ?? null
      };

      if (existingProgress) {
        // Update existing row - try with AI fields first
        let { error: updateError } = await supabase
          .from('quest_progress')
          .update(dataWithAI)
          .eq('id', existingProgress.id);

        // If AI columns don't exist, retry without them
        if (updateError && updateError.message?.includes('column')) {
          console.warn('AI columns may not exist, retrying without them...');
          const { error: retryError } = await supabase
            .from('quest_progress')
            .update(baseData)
            .eq('id', existingProgress.id);
          updateError = retryError;
        }

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
      } else {
        // Insert new row
        const insertDataWithAI = {
          quest_id: quest.id,
          user_id: profile.id,
          current_step: quest.steps?.length ?? 0,
          ...dataWithAI
        };

        let { error: insertError } = await supabase
          .from('quest_progress')
          .insert(insertDataWithAI);

        // If AI columns don't exist, retry without them
        if (insertError && insertError.message?.includes('column')) {
          console.warn('AI columns may not exist, retrying without them...');
          const { error: retryError } = await supabase
            .from('quest_progress')
            .insert({
              quest_id: quest.id,
              user_id: profile.id,
              current_step: quest.steps?.length ?? 0,
              ...baseData
            });
          insertError = retryError;
        }

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      }

      // 5. Auto-award badge if beginner + high confidence
      if (autoVerify) {
        await awardBadge(questId, profile.id);
        toast.success('🏅 Badge earned! Submission auto-verified.');
      } else if (isResubmit) {
        toast.success("📬 Resubmitted! Under review again.");
      } else if (quest.tier === 'beginner') {
        toast.success("📬 Submitted! Being reviewed — you'll be notified shortly.");
      } else {
        toast.success('📬 Submitted for verification. Certificate issued after review.');
      }

      navigate('/hands-on');
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if all steps are done
  const allStepsDone = quest?.steps
    ? (progress?.current_step ?? 0) >= quest.steps.length
    : false;

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F8F6B]" />
          <p className="text-gray-500">Loading quest...</p>
        </div>
      </div>
    );
  }

  // Auth guard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-[#0F3D2E]">Please sign in</h2>
          <p className="mb-4 text-gray-500">You need to be logged in to access quests.</p>
          <Link to="/auth" className="text-[#2F8F6B] font-semibold">
            Sign in →
          </Link>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Quest not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back navigation */}
      <div className="bg-[#1a3a2a] px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/hands-on')}
            className="flex items-center gap-2 text-green-300 text-sm hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quests
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-10 flex gap-8">
        {/* LEFT — Quest steps (65%) */}
        <div className="flex-1 min-w-0">
          {/* Quest header */}
          <div className="mb-8">
            <span className="text-3xl">{quest.badge_icon}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{quest.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{quest.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  quest.tier === 'beginner'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}
              >
                {quest.tier === 'beginner' ? '🌱 Beginner' : '🏆 Advanced'}
              </span>
              <span className="text-xs text-gray-400">
                📅 ~{quest.estimated_days} days
              </span>
              <span className="text-xs text-gray-400">
                ⭐ +{quest.points_reward} pts
              </span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span>
                {progress?.current_step ?? 0} / {quest.steps?.length ?? 0} steps
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#1a3a2a] h-2 rounded-full transition-all"
                style={{
                  width: `${
                    quest.steps?.length
                      ? ((progress?.current_step ?? 0) / quest.steps.length) * 100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4 mb-8">
            {quest.steps?.map((step, index) => {
              const isCompleted = (progress?.current_step ?? 0) > index;
              const isCurrent = (progress?.current_step ?? 0) === index;

              return (
                <div
                  key={step.step}
                  className={`rounded-2xl border p-5 transition ${
                    isCompleted
                      ? 'border-green-200 bg-green-50'
                      : isCurrent
                      ? 'border-[#1a3a2a] bg-white shadow-sm'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-[#1a3a2a] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? '✓' : step.step}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed ml-10">
                    {step.instruction}
                  </p>
                  {isCurrent && progress?.status === 'in_progress' && (
                    <button
                      onClick={() => markStepComplete(index)}
                      className="ml-10 mt-3 bg-[#1a3a2a] text-white text-xs px-4 py-2 rounded-xl hover:bg-green-900 transition"
                    >
                      Mark as Done ✓
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submission form — shown when all steps done and (in_progress OR rejected) */}
          {allStepsDone && (progress?.status === 'in_progress' || progress?.status === 'rejected') && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {progress?.status === 'rejected' 
                  ? 'Resubmit Your Proof' 
                  : 'Submit for Verification'
                }
              </h2>

              {/* Show rejection reason prominently above the form */}
              {progress?.status === 'rejected' && progress?.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-red-600 text-xs font-semibold mb-1">
                    ⚠ Previous submission was rejected
                  </p>
                  <p className="text-red-500 text-xs">
                    Reason: {progress.rejection_reason}
                  </p>
                  <p className="text-red-400 text-xs mt-1">
                    Please address the feedback above and resubmit.
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 mb-5">
                {quest.tier === 'beginner'
                  ? 'Upload proof to earn your badge.'
                  : 'Upload proof for verifier review. Certificate issued after approval.'}
              </p>

              {/* Photo upload */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Proof Photo *
                </label>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-xl"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">Click to upload photo</p>
                  )}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Reflection */}
              <div className="mb-5">
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Reflection * (min 50 characters)
                </label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="What did you do? What did you learn? What impact did it make?"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
                />
                <p
                  className={`text-xs mt-1 text-right ${
                    reflection.length < 50 ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {reflection.length}/50 min
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!photoFile || reflection.length < 50 || submitting}
                className="w-full bg-[#1a3a2a] text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-900 transition"
              >
                {submitting 
                  ? 'Submitting...' 
                  : progress?.status === 'rejected'
                  ? 'Resubmit for Verification →'
                  : 'Submit for Verification →'
                }
              </button>
            </div>
          )}

          {/* Status messages */}
          {progress?.status === 'submitted' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-yellow-700 font-medium">⏳ Awaiting Verification</p>
              <p className="text-yellow-600 text-sm mt-1">
                Your submission is being reviewed. You'll be notified when it's verified.
              </p>
            </div>
          )}

          {progress?.status === 'verified' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <p className="text-green-700 font-medium text-lg">✓ Quest Completed!</p>
              <p className="text-green-600 text-sm mt-1">
                Congratulations! You've earned the{' '}
                <strong>{quest.badge_name || quest.certificate_name}</strong>{' '}
                {quest.tier === 'beginner' ? 'badge' : 'certificate'}.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — AI Coach Side Panel (35%) */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <AiCoachPanel quest={quest} />
        </div>
      </div>

      {/* Mobile AI Coach toggle */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <button
          onClick={() => {
            // Could implement a mobile drawer here
            toast.info('AI Coach is available on larger screens');
          }}
          className="bg-[#1a3a2a] text-white p-4 rounded-full shadow-lg hover:bg-green-900 transition"
        >
          🌿
        </button>
      </div>
    </div>
  );
}

export default QuestDetail;
