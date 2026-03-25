import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  org_name: string | null;
  org_type: string | null;
  verified: boolean;
}

const TYPES = ["Grant", "Fellowship", "In-kind Support", "Partnership"];
const FOCUS_OPTIONS = ["Reforestation", "Marine", "Urban", "Agriculture", "Energy", "Disaster Response"];
const CURRENCIES = ["PHP", "USD", "EUR"];

export function EditFunding() {
  const { fundingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
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

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, name, org_name, org_type, verified")
          .eq("user_id", user.id)
          .single();
        setCurrentProfile(data);
      } else {
        toast.error("Please sign in to edit funding opportunities.");
        navigate("/auth");
      }
    };
    fetchProfile();
  }, [navigate]);

  // Fetch funding data
  useEffect(() => {
    const fetchFunding = async () => {
      if (!fundingId || !currentProfile?.id) return;

      const { data, error } = await supabase
        .from("funding_opportunities")
        .select("*")
        .eq("id", fundingId)
        .single();

      if (error || !data) {
        toast.error("Funding opportunity not found.");
        navigate("/funding");
        return;
      }

      // Guard — only owner can edit
      if (String(data.poster_id) !== String(currentProfile?.id)) {
        toast.error("You do not have permission to edit this.");
        navigate("/funding");
        return;
      }

      // Pre-populate all fields
      setTitle(data.title ?? "");
      setFunderName(data.funder_name ?? "");
      setType(data.type ?? "Grant");
      setFocusAreas(data.focus_areas ?? []);
      setDescription(data.description ?? "");
      setEligibility(data.eligibility ?? "");
      setAmountMin(data.amount_min?.toString() ?? "");
      setAmountMax(data.amount_max?.toString() ?? "");
      setCurrency(data.currency ?? "PHP");
      setRegion(data.region ?? "");
      setDeadline(
        data.deadline
          ? new Date(data.deadline).toISOString().split("T")[0]
          : ""
      );
      setApplyUrl(data.apply_url ?? "");

      setLoading(false);
    };

    if (currentProfile?.id) fetchFunding();
  }, [fundingId, currentProfile?.id, navigate]);

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async () => {
    setErrors({});

    // Validate
    if (!title || title.trim().length < 5) {
      setErrors({ title: "Title must be at least 5 characters." });
      return;
    }
    if (!type) {
      setErrors({ type: "Please select a type." });
      return;
    }
    if (focusAreas.length === 0) {
      setErrors({ focusAreas: "Select at least one focus area." });
      return;
    }
    if (amountMin && amountMax) {
      if (Number(amountMin) >= Number(amountMax)) {
        setErrors({ compensation: "Minimum must be less than maximum." });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("funding_opportunities")
        .update({
          title,
          funder_name: funderName || null,
          type,
          focus_areas: focusAreas,
          description: description || null,
          eligibility: eligibility || null,
          amount_min: amountMin ? Number(amountMin) : null,
          amount_max: amountMax ? Number(amountMax) : null,
          currency,
          region: region || null,
          deadline: deadline || null,
          apply_url: applyUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fundingId);

      if (error) throw error;

      toast.success("Funding opportunity updated!");
      navigate("/funding");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this funding opportunity? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("funding_opportunities")
        .delete()
        .eq("id", fundingId)
        .eq("poster_id", currentProfile?.id);

      if (error) throw error;

      toast.success("Funding opportunity deleted.");
      navigate("/funding");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/funding")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Funding</span>
          </button>
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "'Manrope', sans-serif", color: "#0F3D2E" }}
          >
            Edit Funding Opportunity
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Climate Resilience Grant 2026"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.title ? "border-red-300" : "border-gray-200"
              } focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Funder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Funder / Organization Name
            </label>
            <input
              type="text"
              value={funderName}
              onChange={e => setFunderName(e.target.value)}
              placeholder="e.g., UNDP, USAID, Your Organization"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm"
            />
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
                  onClick={() => setType(t)}
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
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the funding opportunity, objectives, and what it supports..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm resize-none"
            />
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Eligibility Requirements
            </label>
            <textarea
              value={eligibility}
              onChange={e => setEligibility(e.target.value)}
              placeholder="Who can apply? e.g., NGOs, community groups, individuals with 2+ years experience..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm resize-none"
            />
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Min Amount
              </label>
              <input
                type="number"
                value={amountMin}
                onChange={e => setAmountMin(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Amount
              </label>
              <input
                type="number"
                value={amountMax}
                onChange={e => setAmountMax(e.target.value)}
                placeholder="50000"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.compensation ? "border-red-300" : "border-gray-200"
                } focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm`}
              />
              {errors.compensation && (
                <p className="text-red-500 text-xs mt-1">{errors.compensation}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Currency
              </label>
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

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={e => setRegion(e.target.value)}
              placeholder="e.g., Philippines, Southeast Asia, Global"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm"
            />
          </div>

          {/* Apply URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Application URL
            </label>
            <input
              type="url"
              value={applyUrl}
              onChange={e => setApplyUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm"
            />
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            {/* Left — danger zone */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-400 text-sm border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete Opportunity
            </button>

            {/* Right — save */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/funding")}
                className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#1a3a2a] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-green-900 transition disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
