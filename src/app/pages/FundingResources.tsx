import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Globe,
  ChevronDown,
  ChevronRight,
  Leaf,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { supabase } from "../utils/supabase";
import { PostFundingModal } from "../components/PostFundingModal";

// Types
interface Profile {
  id: string;
  name: string;
  org_name: string | null;
  org_type: string | null;
  verified: boolean;
}

interface FundingOpportunity {
  id: string;
  poster_id: string | null;
  title: string;
  description: string | null;
  funder_name: string | null;
  type: string | null;
  focus_areas: string[] | null;
  eligibility: string | null;
  amount_min: number | null;
  amount_max: number | null;
  currency: string;
  region: string | null;
  deadline: string | null;
  apply_url: string | null;
  is_closing_soon: boolean;
  status: string;
  saved_count: number;
  created_at: string;
  profiles: Profile | null;
}

const RESOURCE_SECTIONS = [
  {
    title: "Grant Writing Resources",
    items: [
      "How to Write a Winning Climate Grant Proposal",
      "Logic Model Template for Environmental Projects",
      "M&E Framework for Climate Initiatives",
      "Sample Budget Template (UNDP/USAID format)",
    ],
  },
  {
    title: "Legal & Compliance",
    items: [
      "NGO Registration Guide (Philippines)",
      "Reporting Requirements for International Grants",
      "Financial Management for Grant Recipients",
    ],
  },
  {
    title: "Impact Measurement",
    items: [
      "Carbon Footprint Calculation Methodologies",
      "Community Impact Assessment Templates",
      "Biodiversity Monitoring Protocols",
    ],
  },
];

const TYPES = ["All", "Grant", "Fellowship", "In-kind Support", "Partnership"];
const FOCUS_FILTERS = ["All Focus Areas", "Reforestation", "Marine", "Urban", "Agriculture", "Energy", "Disaster Response"];

// Format amount helper
const formatAmount = (min: number | null, max: number | null, currency: string) => {
  if (!min && !max) return null;
  const symbol = currency === "PHP" ? "₱" : currency === "EUR" ? "€" : "$";
  if (!min) return `Up to ${symbol}${max!.toLocaleString()}`;
  if (!max) return `From ${symbol}${min.toLocaleString()}`;
  return `${symbol}${min.toLocaleString()} – ${symbol}${max.toLocaleString()}`;
};

// FundingCard component
interface FundingCardProps {
  opportunity: FundingOpportunity;
  currentProfileId: string | null;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onViewDetails: (opportunity: FundingOpportunity) => void;
  onEdit?: (id: string) => void;
}

function FundingCard({
  opportunity,
  currentProfileId,
  isSaved,
  onToggleSave,
  onViewDetails,
  onEdit,
}: FundingCardProps) {
  const isOwner = currentProfileId && String(opportunity.poster_id) === String(currentProfileId);
  const isVerifiedOrg = opportunity.profiles?.verified && opportunity.profiles?.org_type;
  const isClosingSoon = opportunity.is_closing_soon;
  const sourceLabel = opportunity.poster_id ? "Community posted" : "Official source";

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-[0_6px_20px_rgba(15,61,46,0.08)] hover:shadow-[0_14px_28px_rgba(15,61,46,0.12)] transition-all duration-300 ${
        isClosingSoon ? "border-amber-200" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left — main info */}
        <div className="flex-1 min-w-0">
          {/* Badge row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* Funder name + verified badge */}
            <span className="text-xs text-gray-500 font-medium">
              {opportunity.funder_name ?? opportunity.profiles?.name ?? "Community"}
            </span>
            <span className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">
              {sourceLabel}
            </span>
            {isVerifiedOrg && (
              <span className="flex items-center gap-0.5 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">
                <CheckCircle2 className="w-3 h-3" />
                Verified Org
              </span>
            )}

            {/* Type badge */}
            {opportunity.type && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {opportunity.type}
              </span>
            )}

            {/* Focus area badges */}
            {opportunity.focus_areas?.slice(0, 2).map(area => (
              <span
                key={area}
                className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full"
              >
                {area}
              </span>
            ))}

            {/* Closing soon badge */}
            {isClosingSoon && (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Closing Soon
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {opportunity.title}
          </h3>

          {/* Description */}
          {opportunity.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {opportunity.description}
            </p>
          )}

          {/* Eligibility */}
          {opportunity.eligibility && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              <span className="font-medium text-gray-700">Eligibility: </span>
              {opportunity.eligibility}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            {opportunity.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(opportunity.deadline).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {formatAmount(opportunity.amount_min, opportunity.amount_max, opportunity.currency) && (
              <span className="text-green-700 font-semibold flex items-center gap-1">
                {formatAmount(opportunity.amount_min, opportunity.amount_max, opportunity.currency)}
              </span>
            )}
            {opportunity.region && (
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {opportunity.region}
              </span>
            )}
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {isOwner ? (
            <button
              onClick={() => onEdit?.(opportunity.id)}
              className="border border-[#1a3a2a] text-[#1a3a2a] text-sm px-3 py-2 rounded-xl hover:bg-green-50 transition flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(opportunity)}
              className="bg-[#1a3a2a] text-white text-sm px-4 py-2 rounded-xl hover:bg-green-900 transition flex items-center gap-1"
            >
              View Details
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onToggleSave(opportunity.id)}
            className={`flex items-center gap-1 text-sm px-3 py-2 rounded-xl border transition ${
              isSaved
                ? "border-green-600 text-green-600 bg-green-50"
                : "border-gray-200 text-gray-400 hover:border-gray-300"
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3 h-3" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3 h-3" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FundingResources() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [focusFilter, setFocusFilter] = useState("All Focus Areas");
  const [sortBy, setSortBy] = useState<"recommended" | "closing" | "largest" | "newest">("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null);

  // Data state
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      }
    };
    fetchProfile();
  }, []);

  // Fetch opportunities
  useEffect(() => {
    fetchOpportunities();
  }, [typeFilter, focusFilter, search]);

  // Fetch saved when profile loads
  useEffect(() => {
    if (currentProfile?.id) {
      fetchSaved();
    }
  }, [currentProfile?.id]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("funding_opportunities_view")
        .select("*, profiles(name, org_name, org_type, verified)")
        .eq("status", "active")
        .order("deadline", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (typeFilter !== "All") {
        query = query.eq("type", typeFilter);
      }

      if (focusFilter !== "All Focus Areas") {
        query = query.contains("focus_areas", [focusFilter]);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%,funder_name.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      setOpportunities((data as FundingOpportunity[]) ?? []);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (!currentProfile?.id) return;
    try {
      const { data } = await supabase
        .from("saved_funding")
        .select("funding_id")
        .eq("user_id", currentProfile.id);
      setSavedIds(data?.map(s => s.funding_id) ?? []);
    } catch (err) {
      console.error("Error fetching saved:", err);
    }
  };

  const handleToggleSave = async (fundingId: string) => {
    if (!currentProfile?.id) {
      navigate("/auth");
      return;
    }

    const isSaved = savedIds.includes(fundingId);
    try {
      if (isSaved) {
        await supabase
          .from("saved_funding")
          .delete()
          .eq("funding_id", fundingId)
          .eq("user_id", currentProfile.id);
        setSavedIds(ids => ids.filter(id => id !== fundingId));
      } else {
        await supabase
          .from("saved_funding")
          .insert({ funding_id: fundingId, user_id: currentProfile.id });
        setSavedIds(ids => [...ids, fundingId]);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const handlePostClick = () => {
    if (!currentProfile) {
      navigate("/auth");
      return;
    }
    setIsModalOpen(true);
  };

  const closingSoonCount = opportunities.filter(o => o.is_closing_soon).length;
  const communityPostedCount = opportunities.filter(o => !!o.poster_id).length;

  const displayedOpportunities = [...opportunities].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "largest") {
      return (b.amount_max ?? b.amount_min ?? 0) - (a.amount_max ?? a.amount_min ?? 0);
    }
    if (sortBy === "closing") {
      const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return aDeadline - bDeadline;
    }
    // recommended
    if (a.is_closing_soon && !b.is_closing_soon) return -1;
    if (!a.is_closing_soon && b.is_closing_soon) return 1;
    const aSaved = a.saved_count ?? 0;
    const bSaved = b.saved_count ?? 0;
    if (bSaved !== aSaved) return bSaved - aSaved;
    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    return aDeadline - bDeadline;
  });

  const activeFilterChips = [
    search ? `Search: ${search}` : "",
    typeFilter !== "All" ? typeFilter : "",
    focusFilter !== "All Focus Areas" ? focusFilter : "",
    sortBy !== "recommended" ? `Sort: ${sortBy}` : "",
  ].filter(Boolean);

  const clearAllFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setFocusFilter("All Focus Areas");
    setSortBy("recommended");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D1F18]">
        <div className="bg-gradient-to-br from-[#0F3D2E] to-[#1A5C43] w-full px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="h-6 w-40 bg-white/20 rounded animate-pulse mb-3" />
            <div className="h-10 w-80 bg-white/10 rounded animate-pulse" />
            <div className="h-5 w-[520px] max-w-full bg-white/10 rounded animate-pulse mt-3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white/10 rounded-xl border border-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="h-20 bg-white rounded-2xl border border-gray-100 shadow-[0_6px_20px_rgba(15,61,46,0.08)] animate-pulse" />
          <div className="space-y-3 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D1F18]">
      {/* ── Hero Header — matches Work and Community tabs ── */}
      <div className="bg-gradient-to-br from-[#0F3D2E] to-[#1A5C43] w-full px-8 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#2F8F6B]/10 blur-3xl" />
        <div className="relative max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left — text */}
          <div>
            <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-2">
              Funding opportunities
            </p>
            <h1
              className="text-[#BEEBD7] dark:text-[#B7C96A] text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Fund Your Climate Project
            </h1>
            <p className="text-white text-sm max-w-md">
              Discover grants, fellowships, and partnerships to power your environmental mission.
            </p>
          </div>

          {/* Right — CTA button */}
          <button
            onClick={handlePostClick}
            className="flex items-center gap-2 bg-white text-[#1a3a2a] font-semibold text-sm px-5 py-3 rounded-full hover:bg-green-100 transition flex-shrink-0 min-h-10"
          >
            <Plus className="w-4 h-4" />
            Post a Funding Opportunity
          </button>
        </div>

        {/* KPI strip */}
        <div className="relative max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-white text-xs uppercase tracking-wide">Opportunities</p>
            <p className="text-white text-2xl font-bold mt-1">{opportunities.length.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-white text-xs uppercase tracking-wide">Closing soon</p>
            <p className="text-white text-2xl font-bold mt-1">{closingSoonCount.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
            <p className="text-white text-xs uppercase tracking-wide">Community posted</p>
            <p className="text-white text-2xl font-bold mt-1">{communityPostedCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-[0_6px_20px_rgba(15,61,46,0.08)]">
          {/* Search + sort */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200">
              <Search className="w-4 h-4 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search grants, funders, focus areas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="min-h-10 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recommended" | "closing" | "largest" | "newest")}
              className="min-h-10 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="closing">Closing soon</option>
              <option value="largest">Largest amount</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {showFilters && (
            <>
          {/* Row 1 — Type filter */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 mr-1">Type:</span>
            {TYPES.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  typeFilter === type
                    ? "bg-[#1a3a2a] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Row 2 — Focus Area filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 mr-1">Focus:</span>
            {FOCUS_FILTERS.map(area => (
              <button
                key={area}
                onClick={() => setFocusFilter(area)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  focusFilter === area
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
            </>
          )}

          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {activeFilterChips.map((chip) => (
                <span key={chip} className="text-xs font-medium px-3 py-1 rounded-full bg-[#E6F4EE] text-[#0F3D2E]">
                  {chip}
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-[#2F8F6B] hover:text-[#0F3D2E] underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{displayedOpportunities.length}</span> opportunities found
            {closingSoonCount > 0 && (
              <span className="text-amber-600 ml-2">
                · {closingSoonCount} closing soon
              </span>
            )}
            <span className="text-gray-400 ml-2">· Community-posted included</span>
          </p>
        </div>

        {/* Funding List */}
        <div className="mb-8">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : displayedOpportunities.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ background: "white", border: "1px solid #E5E7EB" }}
            >
              <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: "#D1D5DB" }} />
              <p className="text-gray-500 text-sm">No opportunities found. Try different filters.</p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#E6F4EE] text-[#0F3D2E] hover:bg-[#d9efe4]"
                >
                  Clear filters
                </button>
                <button
                  onClick={handlePostClick}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#0F3D2E] text-white hover:bg-[#2F8F6B]"
                >
                  Post opportunity
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedOpportunities.map(opportunity => (
                <FundingCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  currentProfileId={currentProfile?.id ?? null}
                  isSaved={savedIds.includes(opportunity.id)}
                  onToggleSave={handleToggleSave}
                  onViewDetails={setSelectedOpportunity}
                  onEdit={id => navigate(`/edit-funding/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Resource Library */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-4 h-4" style={{ color: "#2F8F6B" }} />
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: "#0F3D2E" }}>
              Resource Library
            </h2>
          </div>
          <div className="space-y-3">
            {RESOURCE_SECTIONS.map(section => (
              <div
                key={section.title}
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid #E5E7EB" }}
              >
                <button
                  onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      color: "#0F3D2E",
                      fontSize: "0.95rem",
                    }}
                  >
                    {section.title}
                  </span>
                  {openSection === section.title ? (
                    <ChevronDown className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                  )}
                </button>
                {openSection === section.title && (
                  <div className="px-5 pb-4 space-y-2" style={{ borderTop: "1px solid #E5E7EB" }}>
                    {section.items.map(item => (
                      <a
                        key={item}
                        href="#"
                        className="flex items-center gap-2 py-2.5 text-sm transition-colors"
                        style={{ color: "#374151" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#2F8F6B")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#374151")}
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: "#9CA3AF" }} />
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post Funding Modal */}
      <PostFundingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentProfileId={currentProfile?.id ?? null}
        onSuccess={() => fetchOpportunities()}
      />

      {/* Details drawer */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedOpportunity(null)}
            role="button"
            aria-label="Close funding details"
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl border-l border-gray-100 overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Funding details</p>
                <h2 className="font-[Manrope] font-bold text-[#0F3D2E] text-xl mt-1">{selectedOpportunity.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedOpportunity.funder_name ?? selectedOpportunity.profiles?.name ?? "Community"} · {selectedOpportunity.type ?? "Grant"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                {selectedOpportunity.focus_areas?.map((area) => (
                  <span key={area} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    {area}
                  </span>
                ))}
                {selectedOpportunity.is_closing_soon && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Closing soon</span>
                )}
              </div>

              {selectedOpportunity.description && (
                <p className="text-sm text-gray-700 leading-relaxed">{selectedOpportunity.description}</p>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F9FDFB] border border-gray-100 rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="text-sm font-bold text-[#0F3D2E] mt-0.5">
                    {selectedOpportunity.deadline
                      ? new Date(selectedOpportunity.deadline).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                      : "Open"}
                  </p>
                </div>
                <div className="bg-[#F9FDFB] border border-gray-100 rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm font-bold text-[#2F8F6B] mt-0.5">
                    {formatAmount(selectedOpportunity.amount_min, selectedOpportunity.amount_max, selectedOpportunity.currency) ?? "Not specified"}
                  </p>
                </div>
                <div className="bg-[#F9FDFB] border border-gray-100 rounded-2xl p-3">
                  <p className="text-xs text-gray-500">Region</p>
                  <p className="text-sm font-bold text-[#0F3D2E] mt-0.5">{selectedOpportunity.region ?? "Global"}</p>
                </div>
              </div>

              {selectedOpportunity.eligibility && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-[#0F3D2E]">Eligibility</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedOpportunity.eligibility}</p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedOpportunity.apply_url ? (
                  <a
                    href={selectedOpportunity.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[#0F3D2E] text-white hover:bg-[#2F8F6B] transition-colors text-center inline-flex items-center justify-center gap-1.5"
                  >
                    Visit application link <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    No application link
                  </button>
                )}
                <button
                  onClick={() => handleToggleSave(selectedOpportunity.id)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium ${
                    savedIds.includes(selectedOpportunity.id)
                      ? "border-green-600 text-green-600 bg-green-50"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {savedIds.includes(selectedOpportunity.id) ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}