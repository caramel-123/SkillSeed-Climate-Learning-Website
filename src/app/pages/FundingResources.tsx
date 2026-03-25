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
  onEdit?: (id: string) => void;
}

function FundingCard({ opportunity, currentProfileId, isSaved, onToggleSave, onEdit }: FundingCardProps) {
  const isOwner = currentProfileId && String(opportunity.poster_id) === String(currentProfileId);
  const isVerifiedOrg = opportunity.profiles?.verified && opportunity.profiles?.org_type;
  const isClosingSoon = opportunity.is_closing_soon;

  return (
    <div
      className={`bg-white rounded-2xl border p-5 hover:shadow-md transition ${
        isClosingSoon ? "border-red-200" : "border-gray-100"
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
              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Closing Soon
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {opportunity.title}
          </h3>

          {/* Description */}
          {opportunity.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {opportunity.description}
            </p>
          )}

          {/* Eligibility */}
          {opportunity.eligibility && (
            <p className="text-xs text-gray-400 mb-3">
              <span className="font-medium text-gray-500">Eligibility: </span>
              {opportunity.eligibility}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            {opportunity.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
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
                <Globe className="w-3 h-3" />
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
              className="border border-[#1a3a2a] text-[#1a3a2a] text-xs px-3 py-2 rounded-xl hover:bg-green-50 transition flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          ) : opportunity.apply_url ? (
            <a
              href={opportunity.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1a3a2a] text-white text-xs px-4 py-2 rounded-xl hover:bg-green-900 transition flex items-center gap-1"
            >
              View Details
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : null}
          <button
            onClick={() => onToggleSave(opportunity.id)}
            className={`flex items-center gap-1 text-xs px-3 py-2 rounded-xl border transition ${
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
  const [openSection, setOpenSection] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB" }}>
      {/* ── Hero Header — matches Work and Community tabs ── */}
      <div className="bg-[#1a3a2a] w-full px-8 py-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left — text */}
          <div>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-2">
              💰 Funding Opportunities
            </p>
            <h1
              className="text-white text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Fund Your Climate Project
            </h1>
            <p className="text-green-200 text-sm max-w-md">
              Discover grants, fellowships, and partnerships to power your environmental mission.
            </p>
          </div>

          {/* Right — CTA button */}
          <button
            onClick={handlePostClick}
            className="flex items-center gap-2 bg-white text-[#1a3a2a] font-semibold text-sm px-5 py-3 rounded-full hover:bg-green-100 transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post a Funding Opportunity
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Search bar */}
        <div
          className="flex items-center gap-3 mb-6 max-w-lg px-4 py-3 rounded-xl bg-white"
          style={{ border: "1.5px solid #E5E7EB" }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search grants, funders, focus areas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#374151" }}
          />
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100">
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
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{opportunities.length}</span> opportunities found
            {closingSoonCount > 0 && (
              <span className="text-red-500 ml-2">
                · {closingSoonCount} closing soon
              </span>
            )}
            <span className="text-gray-400 ml-2">· Community-posted included</span>
          </p>
        </div>

        {/* Funding List */}
        <div className="mb-8">
          {loading ? (
            <div className="text-center py-16 rounded-2xl bg-white border border-gray-100">
              <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ background: "white", border: "1px solid #E5E7EB" }}
            >
              <TrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: "#D1D5DB" }} />
              <p style={{ color: "#9CA3AF" }}>No opportunities found. Try different filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map(opportunity => (
                <FundingCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  currentProfileId={currentProfile?.id ?? null}
                  isSaved={savedIds.includes(opportunity.id)}
                  onToggleSave={handleToggleSave}
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
    </div>
  );
}