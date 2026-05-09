import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2, Trophy } from "lucide-react";
import type { CreateChallengeInput, ChallengeDifficulty } from "../types/database";

const CATEGORIES = [
  "Waste Reduction",
  "Solar Energy",
  "Urban Greening",
  "Water Conservation",
  "Energy Efficiency",
  "Mixed",
] as const;

const DIFFICULTIES: ChallengeDifficulty[] = ["Beginner", "Intermediate", "Advanced"];

const POINTS_RANGE: Record<ChallengeDifficulty, { min: number; max: number; default: number }> = {
  Beginner:     { min: 50,  max: 200,  default: 100 },
  Intermediate: { min: 201, max: 500,  default: 300 },
  Advanced:     { min: 501, max: 1000, default: 750 },
};

function getPointsRange(difficulty: ChallengeDifficulty) {
  return POINTS_RANGE[difficulty] ?? POINTS_RANGE["Beginner"];
}

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateChallengeInput) => Promise<void>;
}

export function CreateChallengeModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateChallengeModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateChallengeInput>({
    title: "",
    description: "",
    category: "",
    difficulty: "Beginner",
    points_reward: 100,
    deadline: "",
    banner_url: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateChallengeInput, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateChallengeInput, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    const { min, max } = getPointsRange(formData.difficulty as ChallengeDifficulty);
    if (formData.points_reward < min || formData.points_reward > max) {
      newErrors.points_reward = `${formData.difficulty} must be ${min}–${max} pts`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await onSubmit(formData);
      setFormData({
        title: "",
        description: "",
        category: "",
        difficulty: "Beginner",
        points_reward: 100,
        deadline: "",
        banner_url: "",
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to create challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateChallengeInput, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "difficulty") {
        updated.points_reward = getPointsRange(value as ChallengeDifficulty).default;
      }
      return updated;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "difficulty" && errors.points_reward) {
      setErrors((prev) => ({ ...prev, points_reward: undefined }));
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const range = getPointsRange(formData.difficulty as ChallengeDifficulty);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[92dvh] sm:max-h-[90vh] p-0">
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
        </div>

        <div className="px-4 sm:px-6 pt-2 sm:pt-6 pb-6">
          <DialogHeader className="mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#E6F4EE] dark:bg-[#1E3B34] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#2F8F6B]" />
              </div>
              <div>
                <DialogTitle className="text-[#0F3D2E] dark:text-white font-[Nunito] text-base sm:text-lg">
                  Create Challenge
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm mt-0.5">
                  Launch a new climate action challenge for the community
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-[#0F3D2E] dark:text-[#BEEBD7] font-medium text-sm">
                Challenge Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., 30-Day Zero Waste Challenge"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={`min-h-[44px] text-sm ${errors.title ? "border-red-500" : ""}`}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
            </div>

            {/* Category + Difficulty — side by side on sm, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[#0F3D2E] dark:text-[#BEEBD7] font-medium text-sm">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
                  <SelectTrigger className={`min-h-[44px] text-sm ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="difficulty" className="text-[#0F3D2E] dark:text-[#BEEBD7] font-medium text-sm">
                  Difficulty
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => handleChange("difficulty", v as ChallengeDifficulty)}
                >
                  <SelectTrigger className="min-h-[44px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[#0F3D2E] dark:text-[#BEEBD7] font-medium text-sm">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the challenge, its goals, and how participants can take part..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className={`text-sm resize-none ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            </div>

            {/* Deadline & Points — side by side on sm, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deadline" className="text-[#0F3D2E] dark:text-[#BEEBD7] font-medium text-sm">
                  Deadline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  min={today}
                  value={formData.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  className={`min-h-[44px] text-sm ${errors.deadline ? "border-red-500" : ""}`}
                />
                {errors.deadline && <p className="text-red-500 text-xs">{errors.deadline}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="points" className="text-[#0F3D2E] dark:text-[#BEEBD7] font-medium text-sm">
                  Points Reward
                </Label>
                <Input
                  id="points"
                  type="number"
                  min={range.min}
                  max={range.max}
                  value={formData.points_reward}
                  onChange={(e) => handleChange("points_reward", parseInt(e.target.value) || range.default)}
                  className={`min-h-[44px] text-sm ${errors.points_reward ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">
                  {formData.difficulty}: {range.min}–{range.max} pts
                </p>
                {errors.points_reward && <p className="text-red-500 text-xs">{errors.points_reward}</p>}
              </div>
            </div>

            {/* Banner URL */}
            <div className="space-y-1.5">
              <Label htmlFor="banner_url" className="text-[#0F3D2E] dark:text-[#BEEBD7] font-medium text-sm">
                Banner Image URL <span className="text-slate-400 text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="banner_url"
                type="url"
                placeholder="https://..."
                value={formData.banner_url}
                onChange={(e) => handleChange("banner_url", e.target.value)}
                className="min-h-[44px] text-sm"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 min-h-[44px] text-sm"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 min-h-[44px] text-sm bg-[#0F3D2E] hover:bg-[#2F8F6B] text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Challenge"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
