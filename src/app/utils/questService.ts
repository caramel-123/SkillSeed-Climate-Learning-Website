// Quest Service - Handles all quest-related operations
import { supabase } from './supabase';
import type { 
  Quest, 
  QuestProgress, 
  Badge, 
  UserBadge, 
  QuestProgressStatus,
  QuestProgressWithQuest,
  QuestProgressWithDetails 
} from '../types/database';

// ============================================================================
// Fetch Quests
// ============================================================================

export async function fetchAllQuests(): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .order('tier', { ascending: true })
    .order('estimated_days', { ascending: true });

  if (error) {
    console.error('Error fetching quests:', error);
    throw error;
  }

  return data ?? [];
}

export async function fetchQuestsByTier(tier: 'beginner' | 'advanced'): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('tier', tier)
    .order('estimated_days', { ascending: true });

  if (error) {
    console.error('Error fetching quests by tier:', error);
    throw error;
  }

  return data ?? [];
}

export async function fetchQuestById(questId: string): Promise<Quest | null> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single();

  if (error) {
    console.error('Error fetching quest:', error);
    return null;
  }

  return data;
}

// ============================================================================
// Quest Progress
// ============================================================================

export async function fetchUserQuestProgress(userId: string): Promise<QuestProgressWithQuest[]> {
  const { data, error } = await supabase
    .from('quest_progress')
    .select('*, quests(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quest progress:', error);
    throw error;
  }

  return (data ?? []) as QuestProgressWithQuest[];
}

export async function fetchQuestProgress(questId: string, userId: string): Promise<QuestProgress | null> {
  const { data, error } = await supabase
    .from('quest_progress')
    .select('*')
    .eq('quest_id', questId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching quest progress:', error);
    return null;
  }

  return data;
}

export async function startQuest(questId: string, userId: string): Promise<QuestProgress | null> {
  const { data, error } = await supabase
    .from('quest_progress')
    .insert({
      quest_id: questId,
      user_id: userId,
      status: 'in_progress',
      current_step: 0
    })
    .select()
    .single();

  if (error) {
    // If already exists, just return existing progress
    if (error.code === '23505') {
      return fetchQuestProgress(questId, userId);
    }
    console.error('Error starting quest:', error);
    throw error;
  }

  return data;
}

export async function updateQuestStep(
  questId: string, 
  userId: string, 
  newStep: number
): Promise<void> {
  // First check if row exists
  const { data: existing } = await supabase
    .from('quest_progress')
    .select('id')
    .eq('quest_id', questId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing row
    const { error } = await supabase
      .from('quest_progress')
      .update({ current_step: newStep })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating quest step:', error);
      throw error;
    }
  } else {
    // Insert new row
    const { error } = await supabase
      .from('quest_progress')
      .insert({
        quest_id: questId,
        user_id: userId,
        status: 'in_progress',
        current_step: newStep
      });

    if (error) {
      console.error('Error inserting quest progress:', error);
      throw error;
    }
  }
}

export async function submitQuest(
  questId: string,
  userId: string,
  photoUrl: string,
  reflection: string
): Promise<void> {
  const { error } = await supabase
    .from('quest_progress')
    .update({
      status: 'submitted',
      photo_url: photoUrl,
      reflection: reflection,
      submitted_at: new Date().toISOString()
    })
    .eq('quest_id', questId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error submitting quest:', error);
    throw error;
  }
}

// ============================================================================
// Badges
// ============================================================================

export async function fetchUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }

  return (data ?? []) as UserBadge[];
}

export async function fetchBadgeForQuest(questId: string): Promise<Badge | null> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('quest_id', questId)
    .single();

  if (error) {
    console.error('Error fetching badge:', error);
    return null;
  }

  return data;
}

export async function awardBadge(
  questId: string, 
  userId: string
): Promise<void> {
  // Get the badge for this quest
  const badge = await fetchBadgeForQuest(questId);
  if (!badge) {
    console.error('No badge found for quest:', questId);
    return;
  }

  // Insert user badge
  const { error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badge.id,
      quest_id: questId
    });

  if (error && error.code !== '23505') { // Ignore duplicate
    console.error('Error awarding badge:', error);
    throw error;
  }

  // Update quest progress to verified
  await supabase
    .from('quest_progress')
    .update({ 
      status: 'verified',
      verified_at: new Date().toISOString()
    })
    .eq('quest_id', questId)
    .eq('user_id', userId);
}

// ============================================================================
// Verifier Functions
// ============================================================================

export async function fetchPendingSubmissions(): Promise<QuestProgressWithDetails[]> {
  const { data, error } = await supabase
    .from('quest_progress')
    .select('*, profiles!quest_progress_user_id_fkey(name, avatar_url, location), quests(title, tier, certificate_name, badge_name, description)')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending submissions:', error);
    throw error;
  }

  return (data ?? []) as QuestProgressWithDetails[];
}

export async function verifySubmission(
  progressId: string,
  userId: string,
  questId: string,
  verifierId: string
): Promise<void> {
  // Update progress to verified
  const { error } = await supabase
    .from('quest_progress')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: verifierId
    })
    .eq('id', progressId);

  if (error) {
    console.error('Error verifying submission:', error);
    throw error;
  }

  // Award the badge
  await awardBadge(questId, userId);
}

export async function rejectSubmission(
  progressId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from('quest_progress')
    .update({
      status: 'rejected',
      rejection_reason: reason
    })
    .eq('id', progressId);

  if (error) {
    console.error('Error rejecting submission:', error);
    throw error;
  }
}

// ============================================================================
// Photo Upload
// ============================================================================

export async function uploadQuestPhoto(
  userId: string,
  questId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${questId}-${Date.now()}.${ext}`;

  // Upload with explicit content type
  const { error: uploadError } = await supabase.storage
    .from('quest-photos')
    .upload(path, file, { 
      upsert: true,
      contentType: file.type
    });

  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = supabase.storage
    .from('quest-photos')
    .getPublicUrl(path);

  console.log('Generated public URL:', data.publicUrl);

  // Verify it's a public URL format
  if (!data.publicUrl.includes('/object/public/')) {
    console.error('Photo URL may not be publicly accessible:', data.publicUrl);
  }

  return data.publicUrl;
}

// ============================================================================
// Stats
// ============================================================================

export async function fetchQuestStats(): Promise<{
  beginnerCount: number;
  advancedCount: number;
}> {
  const { data, error } = await supabase
    .from('quests')
    .select('tier');

  if (error) {
    console.error('Error fetching quest stats:', error);
    return { beginnerCount: 0, advancedCount: 0 };
  }

  const beginnerCount = data?.filter(q => q.tier === 'beginner').length ?? 0;
  const advancedCount = data?.filter(q => q.tier === 'advanced').length ?? 0;

  return { beginnerCount, advancedCount };
}
