import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";

interface PostFundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfileId: string | null;
  onSuccess: () => void;
}

const TYPES = ["Grant", "Fellowship", "In-kind Support", "Partnership"];
const FOCUS_OPTIONS = ["Reforestation", "Marine", "Urban", "Agriculture", "Energy", "Disaster Response"];
const CURRENCIES = ["PHP", "USD", "EUR"];

export function PostFundingModal({ isOpen, onClose, currentProfileId, onSuccess }: PostFundingModalProps) {
  const [title, setTitle] = useState("");
  const [funderName, setFunderName] = useState("");
  const [type, setType] = useState("Grant");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [currency, setCurrency] = useState("PHP");
  const [region, setRegion] = useState("");
  const [deadline, setDeadline] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
    setErrors(prev => ({ ...prev, focusAreas: undefined }));
  };

  const validateFundingForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title || title.trim().length < 5)
      newErrors.title = "Title must be at least 5 characters.";

    if (!funderName || funderName.trim() === "")
      newErrors.funderName = "Funder or organisation name is required.";

    if (!type)
      newErrors.type = "Please select a funding type.";

    if (focusAreas.length === 0)
      newErrors.focusAreas = "Select at least one focus area.";

    if (!description || description.trim().length < 30)
      newErrors.description = `Description must be at least 30 characters. (${description.trim().length}/30)`;

    if (!eligibility || eligibility.trim() === "")
      newErrors.eligibility = "Eligibility criteria is required.";

    if (!region || region.trim() === "")
      newErrors.region = "Region is required.";

    if (amountMin && amountMax) {
      if (Number(amountMin) <= 0)
        newErrors.amountMin = "Amount must be greater than 0.";
      if (Number(amountMax) <= 0)
        newErrors.amountMax = "Amount must be greater than 0.";
      if (Number(amountMin) >= Number(amountMax))
        newErrors.compensation = "Minimum must be less than maximum amount.";
    }

    if (amountMin && !amountMax)
      newErrors.amountMax = "Please enter a maximum amount.";

    if (amountMax && !amountMin)
      newErrors.amountMin = "Please enter a minimum amount.";

    if (applyUrl && !applyUrl.startsWith("http"))
      newErrors.applyUrl = "Please enter a valid URL starting with http:// or https://";

    if (deadline) {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today)
        newErrors.deadline = "Deadline must be a future date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfileId) {
      toast.error("Please sign in to post a funding opportunity");
      return;
    }

    if (!validateFundingForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("funding_opportunities").insert({
        poster_id: currentProfileId,
        title: title.trim(),
        description: description.trim() || null,
        funder_name: funderName.trim() || null,
        type,
        focus_areas: focusAreas.length > 0 ? focusAreas : null,
        eligibility: eligibility.trim() || null,
        amount_min: amountMin ? Number(amountMin) : null,
        amount_max: amountMax ? Number(amountMax) : null,
        currency,
        region: region.trim() || null,
        deadline: deadline || null,
        apply_url: applyUrl.trim() || null,
        status: "active",
      });

      if (error) throw error;

      toast.success("Funding opportunity posted!");
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error posting funding:", err);
      toast.error("Failed to post funding opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setFunderName("");
    setType("Grant");
    setFocusAreas([]);
    setDescription("");
    setEligibility("");
    setAmountMin("");
    setAmountMax("");
    setCurrency("PHP");
    setRegion("");
    setDeadline("");
    setApplyUrl("");
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: "'Manrope', sans-serif", color: "#0F3D2E" }}
          >
            Post a Funding Opportunity
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                setErrors(prev => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Community Reforestation Grant 2026"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                errors.title
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Funder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Funder / Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={funderName}
              onChange={e => {
                setFunderName(e.target.value);
                setErrors(prev => ({ ...prev, funderName: undefined }));
              }}
              placeholder="e.g., UNDP, Forest Foundation Philippines"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                errors.funderName
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              }`}
            />
            {errors.funderName && (
              <p className="text-red-500 text-xs mt-1">{errors.funderName}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setErrors(prev => ({ ...prev, type: undefined }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    type === t
                      ? "bg-[#1a3a2a] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type}</p>
            )}
          </div>

          {/* Focus Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Focus Areas <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleFocusArea(area)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    focusAreas.includes(area)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
            {errors.focusAreas && (
              <p className="text-red-500 text-xs mt-1">{errors.focusAreas}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                setErrors(prev => ({ ...prev, description: undefined }));
              }}
              placeholder="Describe the funding opportunity, its goals, and expected impact..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm resize-none ${
                errors.description
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-500 text-xs">{errors.description}</p>
              ) : (
                <span />
              )}
              <p className={`text-xs ${
                description.trim().length < 30 ? "text-red-400" : "text-gray-400"
              }`}>
                {description.trim().length}/30 min
              </p>
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Eligibility Requirements <span className="text-red-500">*</span>
            </label>
            <textarea
              value={eligibility}
              onChange={e => {
                setEligibility(e.target.value);
                setErrors(prev => ({ ...prev, eligibility: undefined }));
              }}
              placeholder="e.g., NGOs, community groups with 2+ years experience"
              rows={2}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm resize-none ${
                errors.eligibility
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              }`}
            />
            {errors.eligibility && (
              <p className="text-red-500 text-xs mt-1">{errors.eligibility}</p>
            )}
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount Range
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="number"
                  value={amountMin}
                  onChange={e => {
                    setAmountMin(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      amountMin: undefined,
                      compensation: undefined,
                    }));
                  }}
                  placeholder="Min"
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                    errors.amountMin || errors.compensation
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.amountMin && (
                  <p className="text-red-500 text-xs mt-1">{errors.amountMin}</p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  value={amountMax}
                  onChange={e => {
                    setAmountMax(e.target.value);
                    setErrors(prev => ({
                      ...prev,
                      amountMax: undefined,
                      compensation: undefined,
                    }));
                  }}
                  placeholder="Max"
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                    errors.amountMax || errors.compensation
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.amountMax && (
                  <p className="text-red-500 text-xs mt-1">{errors.amountMax}</p>
                )}
              </div>
              <div>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm bg-white"
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errors.compensation && (
              <p className="text-red-500 text-xs mt-1">{errors.compensation}</p>
            )}
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Region <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={region}
              onChange={e => {
                setRegion(e.target.value);
                setErrors(prev => ({ ...prev, region: undefined }));
              }}
              placeholder="e.g., Philippines, Southeast Asia, Global"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                errors.region
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              }`}
            />
            {errors.region && (
              <p className="text-red-500 text-xs mt-1">{errors.region}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => {
                setDeadline(e.target.value);
                setErrors(prev => ({ ...prev, deadline: undefined }));
              }}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                errors.deadline
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              }`}
            />
            {errors.deadline && (
              <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>
            )}
          </div>

          {/* Apply URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Application URL
            </label>
            <input
              type="url"
              value={applyUrl}
              onChange={e => {
                setApplyUrl(e.target.value);
                setErrors(prev => ({ ...prev, applyUrl: undefined }));
              }}
              placeholder="https://..."
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                errors.applyUrl
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              }`}
            />
            {errors.applyUrl && (
              <p className="text-red-500 text-xs mt-1">{errors.applyUrl}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl text-white font-bold transition disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #0F3D2E 0%, #2F8F6B 100%)",
              }}
            >
              {isSubmitting ? "Posting..." : "Post Opportunity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
