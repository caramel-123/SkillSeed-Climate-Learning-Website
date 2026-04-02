import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { createProject, getProjectById, updateProject } from "../utils/matchService";
import { useAuth } from "../hooks/useAuth";
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
  Image,
  Briefcase,
  Heart,
  Loader2,
} from "lucide-react";

const focusAreas = ["Disaster Response", "Reforestation", "Marine", "Urban", "Agriculture", "Education", "Energy", "Water Conservation"];
const allSkills = ["GIS Mapping", "Soil Science", "Forestry", "Community Organising", "Urban Farming", "Solar Installation", "Teaching", "Medical", "Construction", "Electrical"];

export function PostProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProjectId = searchParams.get('edit');
  const isEditMode = Boolean(editProjectId);
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState<"ongoing" | "urgent">("ongoing");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [volunteerCount, setVolunteerCount] = useState(5);
  const [professionalCount, setProfessionalCount] = useState(2);
  const [volunteerSkills, setVolunteerSkills] = useState<string[]>([]);
  const [professionalSkills, setProfessionalSkills] = useState<string[]>([]);
  const [compensationMin, setCompensationMin] = useState('');
  const [compensationMax, setCompensationMax] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    duration: "",
    description: "",
    bannerUrl: "",
  });

  // Fetch existing project data when in edit mode
  useEffect(() => {
    const fetchProject = async () => {
      if (!editProjectId || !user) return;

      setLoading(true);
      const project = await getProjectById(editProjectId);

      if (!project) {
        setError('Project not found.');
        navigate('/work');
        return;
      }

      // Guard — only owner can edit
      if (String(project.poster_id) !== String(user.id)) {
        setError('You do not have permission to edit this project.');
        navigate('/work');
        return;
      }

      // Pre-populate all fields
      setProjectType(project.type === 'urgent' ? 'urgent' : 'ongoing');
      setSelectedFocus(project.focus_area ?? []);
      setVolunteerCount(project.volunteers_needed ?? 0);
      setProfessionalCount(project.professionals_needed ?? 0);
      setVolunteerSkills(project.skills_needed ?? []);
      setProfessionalSkills(project.skills_needed ?? []);
      setCompensationMin(project.compensation_min?.toString() ?? '');
      setCompensationMax(project.compensation_max?.toString() ?? '');
      setFormData({
        title: project.title ?? '',
        location: project.location ?? '',
        startDate: project.start_date ?? '',
        duration: project.duration ?? '',
        description: project.description ?? '',
        bannerUrl: '',
      });

      setLoading(false);
    };

    if (isEditMode && user) {
      fetchProject();
    }
  }, [editProjectId, user, isEditMode, navigate]);

  useEffect(() => {
    if (!submitted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [submitted]);

  const resetForm = () => {
    setStep(1);
    setProjectType("ongoing");
    setSelectedFocus([]);
    setVolunteerCount(5);
    setProfessionalCount(2);
    setVolunteerSkills([]);
    setProfessionalSkills([]);
    setCompensationMin('');
    setCompensationMax('');
    setSubmitted(false);
    setError(null);
    setFormData({
      title: "",
      location: "",
      startDate: "",
      duration: "",
      description: "",
      bannerUrl: "",
    });
  };

  const toggleFocus = (area: string) => {
    setSelectedFocus(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };
  
  const toggleSkill = (skill: string, type: "volunteer" | "professional") => {
    if (type === "volunteer") {
      setVolunteerSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
      setErrors(prev => ({ ...prev, volunteerSkills: undefined }));
    } else {
      setProfessionalSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
      setErrors(prev => ({ ...prev, professionalSkills: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.title || formData.title.trim().length < 5) {
        newErrors.title = 'Title must be at least 5 characters.';
      }
      if (!formData.location || formData.location.trim() === '') {
        newErrors.location = 'Location is required.';
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required.';
      }
      if (!formData.duration) {
        newErrors.duration = 'Duration is required.';
      }
      if (selectedFocus.length === 0) {
        newErrors.focusAreas = 'Select at least one focus area.';
      }
    }

    if (stepNum === 2) {
      if (!formData.description || formData.description.trim().length < 50) {
        newErrors.description = `Description must be at least 50 characters. (${formData.description.length}/50)`;
      }
    }

    if (stepNum === 3) {
      if (volunteerCount === 0 && professionalCount === 0) {
        newErrors.people = 'You must need at least 1 volunteer or 1 professional.';
      }
      if (volunteerCount > 0 && volunteerSkills.length === 0) {
        newErrors.volunteerSkills = 'Select at least one skill for volunteers.';
      }
      if (professionalCount > 0 && professionalSkills.length === 0) {
        newErrors.professionalSkills = 'Select at least one skill for professionals.';
      }
      if (compensationMin && compensationMax) {
        if (Number(compensationMin) >= Number(compensationMax)) {
          newErrors.compensation = 'Minimum must be less than maximum.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(step)) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setError(null);

    setIsSubmitting(true);

    try {
      const allSkillsNeeded = [...new Set([...volunteerSkills, ...professionalSkills])];

      const projectData = {
        title: formData.title,
        type: projectType === "urgent" ? "urgent" : "project",
        focus_area: selectedFocus,
        location: formData.location || null,
        description: formData.description || null,
        volunteers_needed: volunteerCount,
        professionals_needed: professionalCount,
        skills_needed: allSkillsNeeded,
        duration: formData.duration || null,
        start_date: formData.startDate || null,
        compensation_min: compensationMin ? Number(compensationMin) : null,
        compensation_max: compensationMax ? Number(compensationMax) : null,
        compensation_currency: 'PHP',
      } as const;

      let project;
      if (isEditMode && editProjectId) {
        // Update existing project
        project = await updateProject(editProjectId, projectData);
      } else {
        // Create new project
        project = await createProject({
          ...projectData,
          status: "open",
          points: projectType === "urgent" ? 200 : 100,
        });
      }

      if (project) {
        if (isEditMode) {
          navigate(`/missions/${editProjectId}`);
        } else {
          setSubmitted(true);
        }
      } else {
        setError(isEditMode 
          ? "Failed to update project. Please try again." 
          : "Failed to create project. Please make sure you're logged in and try again.");
      }
    } catch (err) {
      console.error(isEditMode ? "Error updating project:" : "Error creating project:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ['Project Basics', 'Details', 'People Needed'];

  // Loading state while fetching project data in edit mode
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F18] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F8F6B] dark:text-[#6DD4A8]" />
        <span className="ml-3 text-slate-600 dark:text-[#94C8AF] font-medium">Loading project...</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-[45] overflow-y-auto overscroll-y-contain bg-slate-50 dark:bg-[#0D1F18]"
        aria-live="polite"
      >
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
          <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-8 sm:p-10 max-w-md w-full text-center shadow-sm">
            <div className="w-20 h-20 bg-[#E6F4EE] dark:bg-[#1E3B34] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#2F8F6B] dark:text-[#6DD4A8]" />
            </div>
            <h2 className="font-[Manrope] font-bold text-slate-900 dark:text-white text-2xl mb-3">Project Posted!</h2>
            <p className="text-slate-500 dark:text-[#94C8AF] mb-2">
              Your project is live. We're matching vetted profiles right now.
            </p>
            <div className="bg-[#E6F4EE] dark:bg-[#0D1F18] rounded-xl p-4 mb-6 text-left border border-slate-200/60 dark:border-[#1E3B34]">
              <p className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] mb-1">
                {projectType === "urgent" ? "Urgent" : "Ongoing"} · {formData.title || "Your Project"}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFocus.map(f => (
                  <span key={f} className="text-xs bg-white dark:bg-[#132B23] text-[#0F3D2E] dark:text-[#6DD4A8] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#1E3B34]">{f}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Link to="/browse" className="w-full flex items-center justify-center gap-2 bg-[#0F3D2E] text-white min-h-[44px] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a5241] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B]">
                View Matches <ChevronRight className="w-4 h-4" />
              </Link>
              <button type="button" onClick={resetForm} className="w-full text-sm text-slate-400 dark:text-[#6B8F7F] hover:text-slate-600 dark:hover:text-[#94C8AF] py-2">
                Post Another Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F18]">
      <header className="bg-white dark:bg-[#132B23] border-b border-slate-200 dark:border-[#1E3B34]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F8F6B] dark:text-[#6DD4A8] mb-1">
            {isEditMode ? 'Edit Project' : 'Post a Project'}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {isEditMode ? 'Update your project details' : 'Find the right people for your climate mission'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#94C8AF] mt-1">
            {isEditMode
              ? 'Make changes to your project and save when ready.'
              : 'Connect your project with vetted volunteers and professionals.'}
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form — 3 columns */}
          <div className="lg:col-span-3">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step > i + 1 ? 'bg-[#2F8F6B] text-white' :
                    step === i + 1 ? 'bg-[#0F3D2E] text-white dark:bg-[#2F8F6B]' :
                    'bg-slate-100 dark:bg-[#1E3B34] text-slate-400 dark:text-[#6B8F7F]'
                  }`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs ${step === i + 1 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-[#6B8F7F]'}`}>
                    {label}
                  </span>
                  {i < 2 && <div className="w-8 h-px bg-slate-200 dark:bg-[#1E3B34] mx-1" />}
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] p-4 sm:p-5">
              {/* STEP 1: Project Basics */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Project Basics
                  </h2>

                  {/* Project Type */}
                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] block mb-2">Project Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setProjectType("ongoing")}
                        className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          projectType === "ongoing"
                            ? "bg-[#0F3D2E] text-white dark:bg-[#2F8F6B]"
                            : "border border-slate-200 dark:border-[#1E3B34] text-slate-600 dark:text-[#94C8AF] hover:border-[#2F8F6B] dark:hover:border-[#2F8F6B]"
                        }`}
                      >
                        Ongoing Project
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectType("urgent")}
                        className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          projectType === "urgent"
                            ? "bg-red-500 text-white"
                            : "border border-slate-200 dark:border-[#1E3B34] text-slate-600 dark:text-[#94C8AF] hover:border-red-300 dark:hover:border-red-400/60"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Urgent Need
                      </button>
                    </div>
                    {projectType === "urgent" && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                        Urgent projects get priority visibility and trigger immediate notifications
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] block mb-1.5">Project Title *</label>
                    <input
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Coastal Reforestation Drive in Surigao"
                      className={`w-full min-h-[44px] px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6B8F7F] ${
                        errors.title
                          ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-900/40'
                          : 'border-slate-200 dark:border-[#1E3B34] focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Location *
                      </label>
                      <input
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, Province"
                        className={`w-full min-h-[44px] px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6B8F7F] ${
                          errors.location
                            ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-900/40'
                            : 'border-slate-200 dark:border-[#1E3B34] focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]'
                        }`}
                      />
                      {errors.location && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.location}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Start Date *
                      </label>
                      <input
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`w-full min-h-[44px] px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white transition [color-scheme:light] dark:[color-scheme:dark] ${
                          errors.startDate
                            ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-900/40'
                            : 'border-slate-200 dark:border-[#1E3B34] focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]'
                        }`}
                      />
                      {errors.startDate && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.startDate}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Duration *
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`w-full min-h-[44px] px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white transition ${
                        errors.duration
                          ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-900/40'
                          : 'border-slate-200 dark:border-[#1E3B34] focus:ring-[#2F8F6B]/30'
                      }`}
                    >
                      <option value="">Select duration...</option>
                      <option>1 week</option>
                      <option>2 weeks</option>
                      <option>1 month</option>
                      <option>2–3 months</option>
                      <option>6 months</option>
                      <option>Ongoing</option>
                    </select>
                    {errors.duration && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] block mb-2">Focus Areas *</label>
                    <div className="flex flex-wrap gap-2">
                      {focusAreas.map(area => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            toggleFocus(area);
                            setErrors(prev => ({ ...prev, focusAreas: undefined }));
                          }}
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                            selectedFocus.includes(area)
                              ? "bg-[#0F3D2E] text-white border-[#0F3D2E] dark:bg-[#2F8F6B] dark:border-[#2F8F6B]"
                              : "border-slate-200 dark:border-[#1E3B34] text-slate-600 dark:text-[#94C8AF] hover:border-[#2F8F6B]"
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                    {errors.focusAreas && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.focusAreas}</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Project Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Project Details
                  </h2>

                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] block mb-1.5">Project Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Describe the project, its goals, what volunteers/professionals will do, and the expected impact (min 50 characters)..."
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none transition bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6B8F7F] ${
                        errors.description
                          ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-900/40'
                          : 'border-slate-200 dark:border-[#1E3B34] focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B]'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.description 
                        ? <p className="text-red-500 dark:text-red-400 text-xs">{errors.description}</p>
                        : <span />
                      }
                      <p className="text-xs text-slate-400 dark:text-[#6B8F7F]">
                        {formData.description.length} characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] block mb-1.5">
                      <Image className="w-3.5 h-3.5 inline mr-1" />
                      Banner Image URL
                    </label>
                    <input
                      name="bannerUrl"
                      type="url"
                      value={formData.bannerUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full min-h-[44px] px-4 py-2.5 border border-slate-200 dark:border-[#1E3B34] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2F8F6B]/30 focus:border-[#2F8F6B] bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6B8F7F]"
                    />
                    <p className="text-xs text-slate-400 dark:text-[#6B8F7F] mt-1">
                      Add a compelling image that represents your project
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: People Needed */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2
                    className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    <Users className="w-5 h-5 text-[#2F8F6B] dark:text-[#6DD4A8]" /> People Needed
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Volunteers card */}
                    <div className={`border rounded-xl p-4 transition ${
                      volunteerCount === 0
                        ? 'bg-slate-50 dark:bg-[#0D1F18]/80 border-slate-200 dark:border-[#1E3B34] opacity-60'
                        : 'bg-green-50 dark:bg-emerald-950/40 border-green-200 dark:border-emerald-800/50'
                    }`}>
                      <p className="text-sm font-semibold text-green-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Volunteers Needed
                      </p>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setVolunteerCount(v => Math.max(0, v - 1));
                            if (volunteerCount - 1 === 0) setVolunteerSkills([]);
                          }}
                          className="w-8 h-8 border border-green-300 dark:border-emerald-700 rounded-lg flex items-center justify-center hover:bg-green-100 dark:hover:bg-emerald-900/50 text-green-700 dark:text-emerald-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-3xl font-bold text-green-800 dark:text-emerald-200 w-12 text-center">{volunteerCount}</span>
                        <button 
                          type="button"
                          onClick={() => setVolunteerCount(v => v + 1)}
                          className="w-8 h-8 border border-green-300 dark:border-emerald-700 rounded-lg flex items-center justify-center hover:bg-green-100 dark:hover:bg-emerald-900/50 text-green-700 dark:text-emerald-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={volunteerCount === 0 ? 'pointer-events-none select-none' : ''}>
                        <p className="text-xs text-slate-500 dark:text-[#94C8AF] mb-2">Required skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allSkills.map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => volunteerCount > 0 && toggleSkill(skill, "volunteer")}
                              disabled={volunteerCount === 0}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                volunteerCount === 0
                                  ? 'border-slate-200 dark:border-[#1E3B34] text-slate-400 dark:text-[#6B8F7F] cursor-not-allowed'
                                  : volunteerSkills.includes(skill)
                                    ? "bg-green-600 text-white border-green-600 dark:bg-emerald-600 dark:border-emerald-600"
                                    : "border-green-300 dark:border-emerald-700 text-green-700 dark:text-emerald-300 hover:border-green-500 dark:hover:border-emerald-500"
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      {volunteerCount === 0 && (
                        <p className="text-xs text-slate-400 dark:text-[#6B8F7F] mt-2">
                          Increase volunteer count to select skills.
                        </p>
                      )}
                      {errors.volunteerSkills && volunteerCount > 0 && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-2">{errors.volunteerSkills}</p>
                      )}
                    </div>

                    {/* Professionals card */}
                    <div className={`border rounded-xl p-4 transition ${
                      professionalCount === 0
                        ? 'bg-slate-50 dark:bg-[#0D1F18]/80 border-slate-200 dark:border-[#1E3B34] opacity-60'
                        : 'bg-blue-50 dark:bg-sky-950/35 border-blue-200 dark:border-sky-800/50'
                    }`}>
                      <p className="text-sm font-semibold text-blue-800 dark:text-sky-200 mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Professionals Needed
                      </p>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setProfessionalCount(p => Math.max(0, p - 1));
                            if (professionalCount - 1 === 0) {
                              setProfessionalSkills([]);
                              setCompensationMin('');
                              setCompensationMax('');
                            }
                          }}
                          className="w-8 h-8 border border-blue-300 dark:border-sky-700 rounded-lg flex items-center justify-center hover:bg-blue-100 dark:hover:bg-sky-900/50 text-blue-700 dark:text-sky-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-3xl font-bold text-blue-800 dark:text-sky-200 w-12 text-center">{professionalCount}</span>
                        <button 
                          type="button"
                          onClick={() => setProfessionalCount(p => p + 1)}
                          className="w-8 h-8 border border-blue-300 dark:border-sky-700 rounded-lg flex items-center justify-center hover:bg-blue-100 dark:hover:bg-sky-900/50 text-blue-700 dark:text-sky-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={professionalCount === 0 ? 'pointer-events-none select-none' : ''}>
                        <p className="text-xs text-slate-500 dark:text-[#94C8AF] mb-2">Required skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allSkills.map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => professionalCount > 0 && toggleSkill(skill, "professional")}
                              disabled={professionalCount === 0}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                professionalCount === 0
                                  ? 'border-slate-200 dark:border-[#1E3B34] text-slate-400 dark:text-[#6B8F7F] cursor-not-allowed'
                                  : professionalSkills.includes(skill)
                                    ? "bg-blue-600 text-white border-blue-600 dark:bg-sky-600 dark:border-sky-600"
                                    : "border-blue-300 dark:border-sky-700 text-blue-700 dark:text-sky-300 hover:border-blue-500 dark:hover:border-sky-500"
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      {professionalCount === 0 && (
                        <p className="text-xs text-slate-400 dark:text-[#6B8F7F] mt-2">
                          Increase professional count to select skills.
                        </p>
                      )}
                      {errors.professionalSkills && professionalCount > 0 && (
                        <p className="text-red-500 dark:text-red-400 text-xs mt-2">{errors.professionalSkills}</p>
                      )}

                      {/* Compensation Range - only shown when professionals > 0 */}
                      {professionalCount > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-slate-500 dark:text-[#94C8AF] mb-2">
                            Compensation Range <span className="text-slate-300 dark:text-[#6B8F7F]">(optional)</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-700 dark:text-sky-300 font-medium">₱</span>
                            <input
                              type="number"
                              placeholder="Min"
                              value={compensationMin}
                              onChange={e => {
                                setCompensationMin(e.target.value);
                                setErrors(prev => ({ ...prev, compensation: undefined }));
                              }}
                              className={`w-full min-h-[44px] border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white ${
                                errors.compensation
                                  ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-900/40'
                                  : 'border-blue-200 dark:border-sky-800 focus:ring-blue-300 dark:focus:ring-sky-800/50'
                              }`}
                            />
                            <span className="text-slate-400 dark:text-[#6B8F7F] text-sm">—</span>
                            <input
                              type="number"
                              placeholder="Max"
                              value={compensationMax}
                              onChange={e => {
                                setCompensationMax(e.target.value);
                                setErrors(prev => ({ ...prev, compensation: undefined }));
                              }}
                              className={`w-full min-h-[44px] border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white dark:bg-[#0D1F18] text-slate-900 dark:text-white ${
                                errors.compensation
                                  ? 'border-red-300 dark:border-red-500/50 focus:ring-red-200 dark:focus:ring-red-900/40'
                                  : 'border-blue-200 dark:border-sky-800 focus:ring-blue-300 dark:focus:ring-sky-800/50'
                              }`}
                            />
                          </div>
                          {errors.compensation ? (
                            <p className="text-red-500 dark:text-red-400 text-xs mt-2">{errors.compensation}</p>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-[#6B8F7F] mt-2">
                              Compensation is arranged directly between you and the professional.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* People needed error */}
                  {errors.people && (
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm">
                      {errors.people}
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom action bar */}
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100 dark:border-[#1E3B34]">
                {step > 1 && (
                  <button 
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="text-sm text-slate-500 dark:text-[#94C8AF] hover:text-slate-800 dark:hover:text-white"
                  >
                    ← Back
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-sm text-slate-600 dark:text-[#94C8AF] border border-slate-200 dark:border-[#1E3B34] min-h-[40px] px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0D1F18] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B]"
                  >
                    Cancel
                  </button>
                  {step < 3 ? (
                    <button 
                      type="button"
                      onClick={handleContinue}
                      className="bg-[#0F3D2E] text-white min-h-[40px] px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1a5241] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B]"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-[#0F3D2E] text-white min-h-[40px] px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1a5241] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting 
                        ? (isEditMode ? "Saving..." : "Posting...") 
                        : (isEditMode ? "Save Changes" : "Post Project")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview — 2 columns */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-slate-400 dark:text-[#6B8F7F]" />
                <span className="text-sm font-semibold text-slate-500 dark:text-[#94C8AF]">Live Preview</span>
              </div>
              <div className="bg-white dark:bg-[#132B23] rounded-xl border border-slate-200 dark:border-[#1E3B34] overflow-hidden">
                {formData.bannerUrl ? (
                  <img src={formData.bannerUrl} alt="Project banner" className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 bg-gradient-to-br from-[#0F3D2E] to-[#2F8F6B] flex items-center justify-center">
                    <div className="text-center">
                      <Leaf className="w-8 h-8 text-white/60 mx-auto mb-1" />
                      <p className="text-white/60 text-xs">Project image</p>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  {projectType === "urgent" && (
                    <div className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-2">
                      <AlertTriangle className="w-3 h-3" />
                      URGENT
                    </div>
                  )}
                  <p className="text-xs text-slate-400 dark:text-[#6B8F7F] mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Your Organisation
                    <span className="text-[#2F8F6B] dark:text-[#6DD4A8]">✓</span>
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-2">
                    {formData.title || "Your Project Title"}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#94C8AF] mb-3">
                    {formData.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {formData.location}
                      </span>
                    )}
                    {formData.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formData.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedFocus.map(f => (
                      <span key={f} className="text-xs bg-slate-100 dark:bg-[#0D1F18] text-slate-600 dark:text-[#94C8AF] px-2 py-0.5 rounded-full border border-transparent dark:border-[#1E3B34]">{f}</span>
                    ))}
                  </div>

                  {formData.description && (
                    <p className="text-xs text-slate-500 dark:text-[#94C8AF] line-clamp-3 mb-3">{formData.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {volunteerCount > 0 && (
                      <span className="bg-green-50 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-300 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-100 dark:border-emerald-800/40">
                        <Users className="w-3 h-3" /> {volunteerCount} volunteers
                      </span>
                    )}
                    {professionalCount > 0 && (
                      <span className="bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-blue-100 dark:border-sky-800/40">
                        <Briefcase className="w-3 h-3" /> {professionalCount} professionals
                      </span>
                    )}
                  </div>

                  <div className="bg-[#0F3D2E] dark:bg-[#0D1F18] text-white text-sm font-medium text-center min-h-[40px] flex items-center justify-center rounded-lg border border-[#2F8F6B]/40 dark:border-[#1E3B34]">
                    View & Apply
                  </div>
                </div>
              </div>

              {/* Tips — light: mint panel; dark: deep surface + high-contrast text */}
              <div className="mt-4 bg-[#E6F4EE] dark:bg-[#0D1F18] rounded-xl p-4 border border-slate-200/80 dark:border-[#1E3B34]">
                <p className="font-semibold text-[#0F3D2E] dark:text-[#BEEBD7] text-sm mb-2">Tips for better matches</p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-[#94C8AF]">
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
