import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { createProject } from "../utils/matchService";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  Eye,
  ChevronRight,
  CheckCircle,
  Plus,
  Minus,
  Building2,
  Leaf,
} from "lucide-react";

const focusAreas = ["Disaster Response", "Reforestation", "Marine", "Urban", "Agriculture", "Education", "Energy", "Water Conservation"];

export function PostProject() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"ongoing" | "urgent">("ongoing");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [volunteerCount, setVolunteerCount] = useState(5);
  const [professionalCount, setProfessionalCount] = useState(2);
  const [volunteerSkills, setVolunteerSkills] = useState<string[]>([]);
  const [professionalSkills, setProfessionalSkills] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    duration: "",
    description: "",
  });

  const resetForm = () => {
    setTab("ongoing");
    setSelectedFocus([]);
    setVolunteerCount(5);
    setProfessionalCount(2);
    setVolunteerSkills([]);
    setProfessionalSkills([]);
    setSubmitted(false);
    setError(null);
    setFormData({
      title: "",
      location: "",
      startDate: "",
      duration: "",
      description: "",
    });
  };

  const toggleFocus = (area: string) => {
    setSelectedFocus(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };
  const toggleSkill = (skill: string, type: "volunteer" | "professional") => {
    if (type === "volunteer") {
      setVolunteerSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    } else {
      setProfessionalSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Combine all skills needed
      const allSkillsNeeded = [...new Set([...volunteerSkills, ...professionalSkills])];

      const project = await createProject({
        title: formData.title,
        type: tab === "urgent" ? "urgent" : "project",
        focus_area: selectedFocus,
        location: formData.location || null,
        description: formData.description || null,
        volunteers_needed: volunteerCount,
        professionals_needed: professionalCount,
        skills_needed: allSkillsNeeded,
        duration: formData.duration || null,
        start_date: formData.startDate || null,
        status: "open",
        points: tab === "urgent" ? 200 : 100,
      });

      if (project) {
        setSubmitted(true);
      } else {
        setError("Failed to create project. Please make sure you're logged in and try again.");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSkills = ["GIS Mapping", "Soil Science", "Forestry", "Community Organising", "Urban Farming", "Solar Installation", "Teaching", "Medical", "Construction", "Electrical"];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F9FDFB] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#E6F4EE] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#2F8F6B]" />
          </div>
          <h2 className="font-[Manrope] font-bold text-[#0F3D2E] text-2xl mb-3">Project Posted!</h2>
          <p className="text-gray-500 mb-2">
            Your project is live. We're matching vetted profiles right now.
          </p>
          <div className="bg-[#E6F4EE] rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-[#0F3D2E] mb-1">
              {tab === "urgent" ? "🚨 URGENT" : "📌 ONGOING"} · {formData.title || "Your Project"}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedFocus.map(f => (
                <span key={f} className="text-xs bg-white text-[#0F3D2E] px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Link to="/dashboard" className="w-full flex items-center justify-center gap-2 bg-[#0F3D2E] text-white py-3 rounded-xl font-semibold hover:bg-[#2F8F6B] transition-colors">
              View Matches <ChevronRight className="w-4 h-4" />
            </Link>
            <button onClick={resetForm} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
              Post Another Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FDFB]">
      {/* Header */}
      <div className="bg-[#0F3D2E] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#6DD4A8] font-semibold text-sm uppercase tracking-wider mb-1">Post a Project</p>
          <h1 className="text-white font-[Manrope] font-bold text-3xl md:text-4xl">
            Find the right people for your climate mission
          </h1>
          <p className="text-[#A8D5BF] mt-2">Connect your project with vetted volunteers and professionals.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Project type tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1 mb-6 w-fit">
              {(["ongoing", "urgent"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                    tab === t
                      ? t === "urgent" ? "bg-red-500 text-white" : "bg-[#0F3D2E] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "urgent" && <AlertTriangle className="w-3.5 h-3.5" />}
                  {t === "ongoing" ? "Ongoing Project" : "Urgent Need"}
                </button>
              ))}
            </div>

            {tab === "urgent" && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Urgent projects get priority visibility</p>
                  <p className="text-red-600 text-xs mt-0.5">These will be pinned at the top of the mission board and trigger immediate notifications to matched profiles.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 mb-5">
                <h2 className="font-[Manrope] font-bold text-[#0F3D2E] text-xl">Project Details</h2>

                <div>
                  <label className="text-sm font-semibold text-[#0F3D2E] block mb-1.5">Project Title *</label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Coastal Reforestation Drive in Surigao"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Location *
                    </label>
                    <input
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Province"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Start Date
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 bg-white"
                    >
                      <option value="">Select duration...</option>
                      <option>1 week</option>
                      <option>2 weeks</option>
                      <option>1 month</option>
                      <option>2–3 months</option>
                      <option>6 months</option>
                      <option>Ongoing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#0F3D2E] block mb-2">Focus Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {focusAreas.map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleFocus(area)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          selectedFocus.includes(area)
                            ? "bg-[#0F3D2E] text-white border-[#0F3D2E]"
                            : "border-gray-200 text-gray-600 hover:border-[#2F8F6B]"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#0F3D2E] block mb-1.5">Project Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the project, its goals, what volunteers/professionals will do, and the expected impact (max 250 words)..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B] resize-none"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formData.description.trim().split(/\s+/).filter(Boolean).length}/250 words
                  </p>
                </div>
              </div>

              {/* People Needed */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 mb-5">
                <h2 className="font-[Manrope] font-bold text-[#0F3D2E] text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2F8F6B]" /> People Needed
                </h2>
                {[
                  { label: "Volunteers", count: volunteerCount, setCount: setVolunteerCount, skills: volunteerSkills, type: "volunteer" as const },
                  { label: "Professionals", count: professionalCount, setCount: setProfessionalCount, skills: professionalSkills, type: "professional" as const },
                ].map(({ label, count, setCount, skills, type }) => (
                  <div key={label} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-[#0F3D2E] text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setCount(Math.max(0, count - 1))} className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-[#0F3D2E]">{count}</span>
                        <button type="button" onClick={() => setCount(count + 1)} className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Required skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {allSkills.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill, type)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                              skills.includes(skill)
                                ? type === "volunteer" ? "bg-[#2F8F6B] text-white border-[#2F8F6B]" : "bg-teal-600 text-white border-teal-600"
                                : "border-gray-200 text-gray-500 hover:border-[#2F8F6B]/50"
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#0F3D2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2F8F6B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Post Project"} <ChevronRight className="w-4 h-4" />
                </button>
                <button type="button" disabled={isSubmitting} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Save Draft
                </button>
                {tab !== "urgent" && (
                  <button type="button" onClick={() => setTab("urgent")} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                    Mark as Urgent
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Live Preview */}
          <div>
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">Live Preview</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-[#0F3D2E] to-[#2F8F6B] flex items-center justify-center">
                  <div className="text-center">
                    <Leaf className="w-8 h-8 text-white/60 mx-auto mb-1" />
                    <p className="text-white/60 text-xs">Project image</p>
                  </div>
                </div>
                <div className="p-4">
                  {tab === "urgent" && (
                    <div className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-2">
                      <AlertTriangle className="w-3 h-3" />
                      URGENT
                    </div>
                  )}
                  <h3 className="font-[Manrope] font-bold text-[#0F3D2E] text-base mb-1">
                    {formData.title || "Your Project Title"}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Building2 className="w-3 h-3" />
                    Your Organisation
                  </div>
                  {formData.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" /> {formData.location}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedFocus.map(f => (
                      <span key={f} className="text-[10px] font-semibold bg-[#E6F4EE] text-[#0F3D2E] px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                  {formData.description && (
                    <p className="text-xs text-gray-500 line-clamp-3 mb-3">{formData.description}</p>
                  )}
                  <div className="flex gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{volunteerCount} volunteers</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{professionalCount} professionals</span>
                  </div>
                  <div className="bg-[#0F3D2E] text-white text-xs font-semibold text-center py-2 rounded-lg">
                    View & Apply
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 bg-[#E6F4EE] rounded-xl p-4">
                <p className="font-semibold text-[#0F3D2E] text-sm mb-2">💡 Tips for better matches</p>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li>• Add a clear project description</li>
                  <li>• Select specific focus areas</li>
                  <li>• Tag the exact skills you need</li>
                  <li>• Set a realistic start date</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
