"use client";

import type { LucideIcon } from "lucide-react";
import {
    AlertTriangle,
    ArrowRight,
    BadgeIndianRupee,
    BarChart3,
    BookOpenCheck,
    BriefcaseBusiness,
    Building2,
    CalendarCheck2,
    Check,
    CheckCircle2,
    ChevronDown,
    Circle,
    ClipboardPaste,
    Clock3,
    Code2,
    Download,
    ExternalLink,
    FileDown,
    Github,
    GraduationCap,
    Heart,
    Import,
    LayoutDashboard,
    Link2,
    ListChecks,
    LoaderCircle,
    LockKeyhole,
    LogOut,
    Mail,
    Menu,
    MessageCircle,
    Phone,
    Plus,
    Printer,
    RefreshCw,
    Save,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    Trash2,
    Upload,
    UserRound,
    Users,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { CareerDiscoveryView, JobHuntView } from "@/components/job-assistant/career-discovery";
import { GBLogo } from "@/components/job-assistant/gb-logo";
import { OfferAnalyzerView } from "@/components/job-assistant/offer-analyzer";
import { getRoundGuidance, suggestRoles } from "@/lib/job-assistant/career";
import { extractDocumentFileText } from "@/lib/job-assistant/document-import";
import { analyzeJob, createPreparationPlan, tailorResume } from "@/lib/job-assistant/engine";
import { createLearningRoadmap } from "@/lib/job-assistant/learning";
import { composePreferredLocation, inferStructuredLocation } from "@/lib/job-assistant/locations";
import { getPreparationMaterials } from "@/lib/job-assistant/prep-materials";
import { buildPreparationGuideDocx } from "@/lib/job-assistant/prep-export";
import { createInitialWorkspace } from "@/lib/job-assistant/profile";
import { buildResumeDocx, downloadBlob, openResumePrintView } from "@/lib/job-assistant/resume-export";
import { importProfileFromText } from "@/lib/job-assistant/resume-import";
import { useButtonFeedback } from "@/hooks/use-button-feedback";
import { useMotionTier } from "@/hooks/use-motion-tier";
import type {
    CandidateProfile,
    CareerPreferences,
    EducationEntry,
    ExperienceEntry,
    ExtractedJob,
    JobAnalysis,
    JobRecord,
    JobSearchResult,
    JobStatus,
    LearningRoadmap,
    PreparationPlan,
    ProjectEntry,
    SkillGroup,
    TailoredResume,
    WorkspaceState,
} from "@/lib/job-assistant/types";

type ViewId = "dashboard" | "discover" | "search" | "tailor" | "jobs" | "offer" | "planner" | "learn" | "profile";

type WorkspaceProps = {
    inviteId: string;
    inviteLabel: string;
    isOwner: boolean;
};

type NavItem = {
    id: ViewId;
    label: string;
    icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "discover", label: "Discover roles", icon: Target },
    { id: "search", label: "Find openings", icon: Search },
    { id: "tailor", label: "Tailor resume", icon: Sparkles },
    { id: "jobs", label: "Saved jobs", icon: BriefcaseBusiness },
    { id: "offer", label: "Offer analyzer", icon: BadgeIndianRupee },
    { id: "planner", label: "Prep planner", icon: CalendarCheck2 },
    { id: "learn", label: "Skill roadmaps", icon: GraduationCap },
    { id: "profile", label: "My profile", icon: UserRound },
];

const JOB_STATUSES: Array<{ value: JobStatus; label: string }> = [
    { value: "saved", label: "Saved" },
    { value: "applied", label: "Applied" },
    { value: "recruiter_screen", label: "Recruiter screen" },
    { value: "hr_round", label: "HR round" },
    { value: "aptitude_round", label: "Aptitude round" },
    { value: "assignment_round", label: "Assignment / case" },
    { value: "technical_round", label: "Technical round" },
    { value: "manager_round", label: "Hiring-manager round" },
    { value: "final_round", label: "Final round" },
    { value: "other_round", label: "Other round" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
];

const INPUT_CLASS =
    "w-full rounded-lg border border-[#23372f]/20 bg-white px-3 py-2.5 text-sm text-[#17211c] outline-none transition placeholder:text-[#8b958f] focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/20";
const LABEL_CLASS = "mb-1.5 block font-jetbrains text-[10px] font-semibold uppercase tracking-[0.12em] text-[#58665f]";
const BUTTON_PRIMARY =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#19372d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f7453] disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_SECONDARY =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#23372f]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#23372f] transition hover:border-[#ff7a1a] hover:bg-[#fff5ec] disabled:cursor-not-allowed disabled:opacity-50";

function blankJob(): JobRecord {
    return {
        id: "",
        title: "",
        company: "",
        location: "",
        url: "",
        description: "",
        employmentType: "",
        postedAt: "",
        source: "Manual entry",
        status: "saved",
        customStage: "",
        nextRoundAt: "",
        statusHistory: [],
        notes: "",
        savedAt: "",
        updatedAt: "",
    };
}

function normalizeStoredStatus(value: unknown): JobStatus {
    if (value === "assessment") return "aptitude_round";
    if (value === "interview") return "hr_round";
    if (value === "closed") return "rejected";
    return JOB_STATUSES.some((status) => status.value === value) ? value as JobStatus : "saved";
}

function mergeStoredWorkspace(stored: unknown, fallback: WorkspaceState): WorkspaceState {
    if (!stored || typeof stored !== "object") return fallback;
    const candidate = stored as Partial<WorkspaceState>;
    if (candidate.version !== 1 || !candidate.profile || !Array.isArray(candidate.jobs)) return fallback;

    const storedPreferences = candidate.careerPreferences;
    const careerPreferences = { ...fallback.careerPreferences, ...storedPreferences };
    const inferredLocation = inferStructuredLocation(careerPreferences.preferredLocation);
    if (!storedPreferences?.preferredCountry) careerPreferences.preferredCountry = inferredLocation.country;
    if (!storedPreferences?.preferredCities) careerPreferences.preferredCities = inferredLocation.cities;
    if (storedPreferences?.customLocation === undefined) careerPreferences.customLocation = inferredLocation.customLocation;
    careerPreferences.preferredLocation = composePreferredLocation(
        careerPreferences.preferredCountry,
        careerPreferences.preferredCities,
        careerPreferences.customLocation,
    ) || careerPreferences.preferredLocation;
    const offerAnalyses = Object.fromEntries(
        Object.entries(candidate.offerAnalyses ?? {}).map(([offerKey, offer]) => [offerKey, {
            ...offer,
            source: offer.source ?? (offer.jobId ? "tracked" : "standalone"),
            compensation: {
                ...offer.compensation,
                performanceBonusAnnual: offer.compensation.performanceBonusAnnual ?? 0,
                performanceBonusPayoutPercent: offer.compensation.performanceBonusPayoutPercent ?? 0,
                retentionPayoutPercent: offer.compensation.retentionPayoutPercent ?? 100,
            },
        }]),
    );

    return {
        ...fallback,
        ...candidate,
        profile: { ...fallback.profile, ...candidate.profile },
        jobs: candidate.jobs.map((job) => ({
            ...job,
            status: normalizeStoredStatus(job.status),
            customStage: job.customStage ?? "",
            nextRoundAt: job.nextRoundAt ?? "",
            statusHistory: Array.isArray(job.statusHistory) ? job.statusHistory : [],
        })),
        analyses: candidate.analyses ?? {},
        resumes: candidate.resumes ?? {},
        plans: Array.isArray(candidate.plans) ? candidate.plans.map((plan) => ({
            ...plan,
            tasks: plan.tasks.map((task) => {
                const materials = getPreparationMaterials(task.title, task.category, plan.jobTitle, plan.company);
                return {
                    ...task,
                    studyNotes: task.studyNotes?.length ? task.studyNotes : materials.studyNotes,
                    practiceQuestions: task.practiceQuestions?.length ? task.practiceQuestions : materials.practiceQuestions,
                    resources: task.resources?.length ? task.resources : materials.resources,
                };
            }),
        })) : [],
        learningRoadmaps: Array.isArray(candidate.learningRoadmaps) ? candidate.learningRoadmaps : [],
        latestJobId: candidate.latestJobId ?? "",
        activePlanId: candidate.activePlanId ?? "",
        activeLearningRoadmapId: candidate.activeLearningRoadmapId ?? "",
        careerPreferences,
        roleSuggestions: Array.isArray(candidate.roleSuggestions) ? candidate.roleSuggestions.map((suggestion) => ({
            ...suggestion,
            fitBreakdown: suggestion.fitBreakdown ?? {
                baseline: 15,
                profileEvidence: 0,
                interestsAndIndustry: 0,
                education: 0,
                workStyle: 0,
            },
        })) : [],
        jobSearchResults: Array.isArray(candidate.jobSearchResults) ? candidate.jobSearchResults : [],
        lastJobSearchAt: candidate.lastJobSearchAt ?? "",
        offerAnalyses,
        activeOfferJobId: candidate.activeOfferJobId ?? "",
    };
}

function formatDate(value: string): string {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function isProfileReady(profile: CandidateProfile): boolean {
    return Boolean(
        profile.fullName.trim() &&
        profile.summary.trim() &&
        profile.skillGroups.some((group) => group.items.length) &&
        (profile.experiences.length || profile.projects.length || profile.sourceText.trim()),
    );
}

function statusTone(status: JobStatus): string {
    const styles: Record<JobStatus, string> = {
        saved: "border-[#718079]/30 bg-[#eef0ed] text-[#4e5b55]",
        applied: "border-[#2f6f9f]/25 bg-[#e8f2f8] text-[#245a80]",
        recruiter_screen: "border-[#32718d]/25 bg-[#e5f2f5] text-[#2a6076]",
        hr_round: "border-[#7b59a8]/25 bg-[#f0eaf8] text-[#67468f]",
        aptitude_round: "border-[#9d6c22]/25 bg-[#fbf0d9] text-[#80571d]",
        assignment_round: "border-[#9d6c22]/25 bg-[#fbf0d9] text-[#80571d]",
        technical_round: "border-[#7253a2]/25 bg-[#eee9f7] text-[#60448a]",
        manager_round: "border-[#6b4c94]/25 bg-[#f0eaf8] text-[#5e4084]",
        final_round: "border-[#2f7453]/25 bg-[#e5f3e9] text-[#245d43]",
        other_round: "border-[#66736c]/25 bg-[#eef0ed] text-[#4e5b55]",
        offer: "border-[#2f7453]/25 bg-[#e5f3e9] text-[#245d43]",
        rejected: "border-[#a4493d]/25 bg-[#f8e9e6] text-[#883b32]",
        withdrawn: "border-[#718079]/30 bg-[#eef0ed] text-[#4e5b55]",
    };
    return styles[status];
}

function categoryTone(category: string): string {
    const tones: Record<string, string> = {
        aptitude: "bg-[#e7f1f7] text-[#285e7d]",
        role: "bg-[#e8f3e9] text-[#275f43]",
        company: "bg-[#f7edda] text-[#78551f]",
        interview: "bg-[#f1e9f7] text-[#67458b]",
        application: "bg-[#f6e8e5] text-[#8a4439]",
    };
    return tones[category] ?? "bg-[#eef0ed] text-[#4e5b55]";
}

function SectionHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
    return (
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#23372f]/15 pb-5 sm:flex-row sm:items-end">
            <div>
                <p className="mb-2 font-jetbrains text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f7453]">{eyebrow}</p>
                <h1 className="text-2xl font-semibold leading-tight text-[#17211c] sm:text-[1.75rem]" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>
                    {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6862]">{copy}</p>
            </div>
            {action}
        </div>
    );
}

function EmptyState({ icon: Icon, title, copy, action }: { icon: LucideIcon; title: string; copy: string; action?: React.ReactNode }) {
    return (
        <div className="pd-surface border border-dashed border-[#23372f]/25 bg-[#f8f7f2] px-6 py-12 text-center">
            <Icon className="mx-auto h-7 w-7 text-[#718079]" />
            <h3 className="mt-4 text-base font-semibold text-[#23372f]">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#66736c]">{copy}</p>
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}

function KeywordList({ values, tone = "match", empty }: { values: string[]; tone?: "match" | "gap" | "neutral"; empty: string }) {
    if (!values.length) return <p className="text-sm text-[#6b7771]">{empty}</p>;
    const toneClass = tone === "match"
        ? "border-[#2f7453]/25 bg-[#e6f2e8] text-[#275f43]"
        : tone === "gap"
            ? "border-[#a66d20]/25 bg-[#fbefd8] text-[#81591e]"
            : "border-[#66736c]/20 bg-[#eef0ed] text-[#4e5b55]";
    return (
        <div className="flex flex-wrap gap-2">
            {values.map((value) => (
                <span className={`border px-2.5 py-1 text-xs ${toneClass}`} key={value}>{value}</span>
            ))}
        </div>
    );
}

export function JobWorkspace({ inviteId, inviteLabel, isOwner }: WorkspaceProps) {
    const router = useRouter();
    const motionTier = useMotionTier();
    useButtonFeedback();
    const storageKey = `placement-desk:v1:${inviteId}`;
    const [workspace, setWorkspace] = useState<WorkspaceState>(() => createInitialWorkspace(isOwner));
    const [storageReady, setStorageReady] = useState(false);
    const [view, setView] = useState<ViewId>("dashboard");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [draftJob, setDraftJob] = useState<JobRecord>(blankJob);
    const [notice, setNotice] = useState("");
    const [noticeSequence, setNoticeSequence] = useState(0);
    const [loggingOut, setLoggingOut] = useState(false);
    const [importingUrl, setImportingUrl] = useState(false);
    const [exportingResume, setExportingResume] = useState(false);
    const [plannerDuration, setPlannerDuration] = useState<7 | 14>(7);
    const [planJobId, setPlanJobId] = useState("");
    const [learningJobId, setLearningJobId] = useState("");
    const [customSkill, setCustomSkill] = useState("");
    const [resumeSource, setResumeSource] = useState("");
    const [importingResume, setImportingResume] = useState(false);
    const [jobSearch, setJobSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
    const [makerStoryOpen, setMakerStoryOpen] = useState(false);
    const [loadedJobUrl, setLoadedJobUrl] = useState("");
    const [jobImportIssue, setJobImportIssue] = useState("");
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const fallback = createInitialWorkspace(isOwner);
            try {
                const raw = window.localStorage.getItem(storageKey);
                const restored = raw ? mergeStoredWorkspace(JSON.parse(raw), fallback) : fallback;
                setWorkspace(restored);
                const latest = restored.jobs.find((job) => job.id === restored.latestJobId);
                if (latest) {
                    setDraftJob(latest);
                    setLoadedJobUrl(latest.url);
                }
                setPlanJobId(restored.latestJobId);
                setLearningJobId(restored.latestJobId);
            } catch {
                setWorkspace(fallback);
                setNotice("The saved workspace could not be read, so a fresh local workspace was opened.");
            }
            setStorageReady(true);
        }, 0);
        return () => window.clearTimeout(timer);
    }, [isOwner, storageKey]);

    useEffect(() => {
        if (!storageReady) return;
        window.localStorage.setItem(storageKey, JSON.stringify(workspace));
    }, [storageKey, storageReady, workspace]);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 4_500);
        return () => window.clearTimeout(timer);
    }, [notice, noticeSequence]);

    useEffect(() => {
        if (!makerStoryOpen) return;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMakerStoryOpen(false);
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [makerStoryOpen]);

    const currentJobId = draftJob.id;
    const currentAnalysis = currentJobId ? workspace.analyses[currentJobId] : undefined;
    const currentResume = currentJobId ? workspace.resumes[currentJobId] : undefined;
    const activePlan = workspace.plans.find((plan) => plan.id === workspace.activePlanId) ?? workspace.plans[0];
    const activeRoadmap = workspace.learningRoadmaps.find((roadmap) => roadmap.id === workspace.activeLearningRoadmapId) ?? workspace.learningRoadmaps[0];
    const analyzedJobs = workspace.jobs.filter((job) => Boolean(workspace.analyses[job.id]));
    const selectedPlanJobId = planJobId || workspace.latestJobId;
    const selectedLearningJobId = learningJobId || workspace.latestJobId || "__standalone__";
    const selectedLearningAnalysis = selectedLearningJobId !== "__standalone__" ? workspace.analyses[selectedLearningJobId] : undefined;
    const selectedOfferId =
        workspace.activeOfferJobId ||
        workspace.jobs.find((job) => job.status === "offer")?.id ||
        workspace.latestJobId ||
        workspace.jobs[0]?.id ||
        "__standalone_new__";
    const completedPlanTasks = workspace.plans.flatMap((plan) => plan.tasks).filter((task) => task.completed).length;
    const allPlanTasks = workspace.plans.flatMap((plan) => plan.tasks).length;

    function showNotice(message: string) {
        setNotice(message);
        setNoticeSequence((current) => current + 1);
    }

    function navigate(nextView: ViewId) {
        setView(nextView);
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function logout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            const response = await fetch("/api/job-assistant/auth", { method: "DELETE" });
            if (!response.ok) throw new Error();
            router.refresh();
        } catch {
            setLoggingOut(false);
            showNotice("Unable to sign out. Check the connection and try again.");
        }
    }

    function updateDraft<K extends keyof JobRecord>(key: K, value: JobRecord[K]) {
        setDraftJob((current) => ({ ...current, [key]: value }));
    }

    function updateJobUrl(url: string) {
        const changedJob = Boolean(
            loadedJobUrl &&
            url.trim() !== loadedJobUrl.trim() &&
            (draftJob.title.trim() || draftJob.company.trim() || draftJob.description.trim()),
        );
        if (changedJob) {
            setDraftJob({ ...blankJob(), url });
        } else {
            setDraftJob((current) => ({ ...current, url }));
        }
        setJobImportIssue("");
        setImportDialogOpen(false);
    }

    function persistJob(job: JobRecord): JobRecord {
        const now = new Date().toISOString();
        const saved: JobRecord = {
            ...job,
            id: job.id || crypto.randomUUID(),
            savedAt: job.savedAt || now,
            updatedAt: now,
            customStage: job.customStage ?? "",
            nextRoundAt: job.nextRoundAt ?? "",
            statusHistory: job.statusHistory ?? [],
        };
        setWorkspace((current) => ({
            ...current,
            jobs: current.jobs.some((candidate) => candidate.id === saved.id)
                ? current.jobs.map((candidate) => candidate.id === saved.id ? saved : candidate)
                : [saved, ...current.jobs],
            latestJobId: saved.id,
        }));
        setDraftJob(saved);
        setLoadedJobUrl(saved.url);
        setPlanJobId(saved.id);
        setLearningJobId(saved.id);
        return saved;
    }

    async function importJobUrl() {
        if (!draftJob.url.trim()) {
            showNotice("Paste a complete job link first.");
            return;
        }
        const requestedUrl = draftJob.url.trim();
        setImportingUrl(true);
        setJobImportIssue("");
        try {
            const response = await fetch("/api/job-assistant/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteId, url: requestedUrl }),
            });
            const result = (await response.json()) as { job?: ExtractedJob; error?: string };
            if (!response.ok || !result.job) throw new Error(result.error ?? "Unable to read that job link.");
            setDraftJob((current) => ({
                ...current,
                ...result.job,
                id: "",
                status: "saved",
                notes: "",
                savedAt: "",
                updatedAt: "",
            }));
            setLoadedJobUrl(result.job.url || requestedUrl);
            setImportDialogOpen(false);
            showNotice("Job details imported. Review the description before tailoring.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to import the job. Paste its description instead.";
            if (!loadedJobUrl || requestedUrl !== loadedJobUrl) {
                setDraftJob((current) => ({ ...blankJob(), url: requestedUrl, notes: current.notes }));
                setLoadedJobUrl("");
            }
            setJobImportIssue(`${message} Old job details were removed so they cannot be used for this application.`);
            setImportDialogOpen(true);
        } finally {
            setImportingUrl(false);
        }
    }

    function saveForLater(): boolean {
        if (!draftJob.title.trim() && !draftJob.company.trim() && !draftJob.url.trim()) {
            showNotice("Add a title, company, or link before saving this job.");
            return false;
        }
        persistJob(draftJob);
        showNotice("Job saved in this browser.");
        return true;
    }

    function handleAnalyze(event?: FormEvent) {
        event?.preventDefault();
        if (!isProfileReady(workspace.profile)) {
            showNotice("Complete or import your profile before tailoring a resume.");
            navigate("profile");
            return;
        }
        if (!draftJob.title.trim() || !draftJob.company.trim() || draftJob.description.trim().length < 80) {
            showNotice("Add the role title, company, and a fuller job description before analysis.");
            return;
        }

        const saved = persistJob(draftJob);
        const analysis = analyzeJob(workspace.profile, saved);
        const resume = tailorResume(workspace.profile, saved, analysis);
        setWorkspace((current) => ({
            ...current,
            jobs: current.jobs.some((job) => job.id === saved.id)
                ? current.jobs.map((job) => job.id === saved.id ? saved : job)
                : [saved, ...current.jobs],
            latestJobId: saved.id,
            analyses: { ...current.analyses, [saved.id]: analysis },
            resumes: { ...current.resumes, [saved.id]: resume },
        }));
        showNotice(`Tailored draft ready with ${analysis.score}% supported keyword alignment.`);
    }

    function loadJob(job: JobRecord) {
        setDraftJob(job);
        setLoadedJobUrl(job.url);
        setJobImportIssue("");
        setImportDialogOpen(false);
        setWorkspace((current) => ({ ...current, latestJobId: job.id }));
        setPlanJobId(job.id);
        setLearningJobId(job.id);
        navigate("tailor");
    }

    function updateJobStatus(jobId: string, status: JobStatus) {
        const label = JOB_STATUSES.find((option) => option.value === status)?.label ?? status;
        const jobTitle = workspace.jobs.find((job) => job.id === jobId)?.title || "This job";
        setWorkspace((current) => ({
            ...current,
            jobs: current.jobs.map((job) => job.id === jobId ? {
                ...job,
                status,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    ...(job.statusHistory ?? []),
                    { id: crypto.randomUUID(), status, label, changedAt: new Date().toISOString() },
                ],
            } : job),
        }));
        showNotice(`${jobTitle} moved to ${label}.`);
    }

    function updateJobDetails(jobId: string, patch: Partial<Pick<JobRecord, "customStage" | "nextRoundAt" | "notes">>) {
        setWorkspace((current) => ({
            ...current,
            jobs: current.jobs.map((job) => job.id === jobId ? { ...job, ...patch, updatedAt: new Date().toISOString() } : job),
        }));
        if (draftJob.id === jobId) setDraftJob((current) => ({ ...current, ...patch }));
    }

    function removeJob(jobId: string) {
        if (!window.confirm("Delete this saved job and its generated material from this browser?")) return;
        setWorkspace((current) => {
            const analyses = { ...current.analyses };
            const resumes = { ...current.resumes };
            const offerAnalyses = { ...current.offerAnalyses };
            delete analyses[jobId];
            delete resumes[jobId];
            delete offerAnalyses[jobId];
            return {
                ...current,
                jobs: current.jobs.filter((job) => job.id !== jobId),
                analyses,
                resumes,
                offerAnalyses,
                plans: current.plans.filter((plan) => plan.jobId !== jobId),
                learningRoadmaps: current.learningRoadmaps.filter((roadmap) => roadmap.jobId !== jobId),
                latestJobId: current.latestJobId === jobId ? "" : current.latestJobId,
                activeOfferJobId: current.activeOfferJobId === jobId ? "" : current.activeOfferJobId,
            };
        });
        if (draftJob.id === jobId) setDraftJob(blankJob());
        showNotice("Job and its generated material deleted from this browser.");
    }

    function startNewJob() {
        setDraftJob(blankJob());
        setLoadedJobUrl("");
        setJobImportIssue("");
        setImportDialogOpen(false);
        navigate("tailor");
    }

    function updateResume(patch: Partial<TailoredResume>) {
        if (!currentResume || !currentJobId) return;
        setWorkspace((current) => ({
            ...current,
            resumes: { ...current.resumes, [currentJobId]: { ...currentResume, ...patch } },
        }));
    }

    function updateResumeExperience(index: number, bulletsText: string) {
        if (!currentResume) return;
        const experiences = currentResume.experiences.map((experience, experienceIndex) => experienceIndex === index
            ? { ...experience, bullets: bulletsText.split("\n").map((bullet) => bullet.trim()).filter(Boolean) }
            : experience,
        );
        updateResume({ experiences });
    }

    async function downloadResume() {
        if (!currentResume) return;
        setExportingResume(true);
        try {
            const { blob, filename } = await buildResumeDocx(workspace.profile, currentResume);
            downloadBlob(blob, filename);
            showNotice("ATS-friendly DOCX downloaded.");
        } catch {
            showNotice("The DOCX could not be generated. Try the print/PDF option.");
        } finally {
            setExportingResume(false);
        }
    }

    function printResume() {
        if (!currentResume) return;
        const opened = openResumePrintView(workspace.profile, currentResume);
        if (!opened) showNotice("Allow popups for this page, then try Print / PDF again.");
    }

    function generatePlan() {
        const job = workspace.jobs.find((candidate) => candidate.id === selectedPlanJobId);
        const analysis = selectedPlanJobId ? workspace.analyses[selectedPlanJobId] : undefined;
        if (!job || !analysis) {
            showNotice("Analyze a job before creating its preparation plan.");
            return;
        }
        const plan = createPreparationPlan(job, analysis, plannerDuration);
        setWorkspace((current) => ({
            ...current,
            plans: [plan, ...current.plans],
            activePlanId: plan.id,
        }));
        showNotice(`${plannerDuration}-day aptitude and interview plan created.`);
    }

    function togglePlanTask(planId: string, taskId: string) {
        setWorkspace((current) => ({
            ...current,
            plans: current.plans.map((plan) => plan.id === planId
                ? { ...plan, tasks: plan.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task) }
                : plan,
            ),
        }));
    }

    function removePlan(planId: string) {
        setWorkspace((current) => ({
            ...current,
            plans: current.plans.filter((plan) => plan.id !== planId),
            activePlanId: current.activePlanId === planId ? "" : current.activePlanId,
        }));
        showNotice("Preparation plan deleted.");
    }

    function generateLearningRoadmap(skillValue?: string, jobIdValue?: string) {
        const skill = (skillValue || customSkill).trim();
        if (!skill) {
            showNotice("Choose or enter a skill to learn.");
            return;
        }
        const roadmapJobId = jobIdValue || selectedLearningJobId;
        const job = workspace.jobs.find((candidate) => candidate.id === roadmapJobId);
        const analysis = job ? workspace.analyses[job.id] ?? analyzeJob(workspace.profile, job) : undefined;
        const roleLabel = analysis?.roleLabel || job?.title || "Standalone skill development";
        const roadmap = createLearningRoadmap(skill, job, roleLabel);
        setWorkspace((current) => ({
            ...current,
            learningRoadmaps: [roadmap, ...current.learningRoadmaps],
            activeLearningRoadmapId: roadmap.id,
        }));
        setCustomSkill("");
        showNotice(`Seven-day ${skill} roadmap created with study material and proof tasks.`);
    }

    function toggleLearningDay(roadmapId: string, dayNumber: number) {
        setWorkspace((current) => ({
            ...current,
            learningRoadmaps: current.learningRoadmaps.map((roadmap) => roadmap.id === roadmapId
                ? { ...roadmap, days: roadmap.days.map((day) => day.day === dayNumber ? { ...day, completed: !day.completed } : day) }
                : roadmap,
            ),
        }));
    }

    function updateLearningEvidence(roadmapId: string, evidenceNote: string) {
        setWorkspace((current) => ({
            ...current,
            learningRoadmaps: current.learningRoadmaps.map((roadmap) => roadmap.id === roadmapId ? { ...roadmap, evidenceNote } : roadmap),
        }));
    }

    function verifyLearnedSkill(roadmap: LearningRoadmap) {
        if (!roadmap.days.every((day) => day.completed)) {
            showNotice("Complete all seven checkpoints before marking the skill resume-ready.");
            return;
        }
        if (roadmap.evidenceNote.trim().length < 25) {
            showNotice("Add a specific evidence note: project, assessment result, or artifact you can explain.");
            return;
        }
        const job = workspace.jobs.find((candidate) => candidate.id === roadmap.jobId);

        const profile = workspace.profile;
        const alreadyListed = profile.skillGroups.some((group) => group.items.some((item) => item.toLowerCase() === roadmap.skill.toLowerCase()));
        const skillGroups = alreadyListed
            ? profile.skillGroups
            : profile.skillGroups.map((group, index) => index === 0 ? { ...group, items: [...group.items, roadmap.skill] } : group);
        const nextProfile = { ...profile, skillGroups };

        setWorkspace((current) => ({
            ...current,
            profile: nextProfile,
            analyses: job ? { ...current.analyses, [job.id]: analyzeJob(nextProfile, job) } : current.analyses,
            resumes: job ? {
                ...current.resumes,
                [job.id]: tailorResume(nextProfile, job, analyzeJob(nextProfile, job)),
            } : current.resumes,
            learningRoadmaps: current.learningRoadmaps.map((candidate) => candidate.id === roadmap.id ? { ...candidate, verified: true } : candidate),
        }));
        showNotice(job
            ? `${roadmap.skill} added to your skills and the tailored resume was regenerated.`
            : `${roadmap.skill} added to your profile skills with its evidence note.`);
    }

    function updateProfile(patch: Partial<CandidateProfile>) {
        setWorkspace((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
    }

    function updateCareerPreferences(patch: Partial<CareerPreferences>) {
        setWorkspace((current) => ({
            ...current,
            careerPreferences: { ...current.careerPreferences, ...patch },
        }));
    }

    function openOfferAnalyzer(jobId: string) {
        setWorkspace((current) => ({ ...current, activeOfferJobId: jobId }));
        navigate("offer");
    }

    function generateRoleSuggestions() {
        const suggestions = suggestRoles(workspace.profile, workspace.careerPreferences);
        const validTitles = new Set(suggestions.map((suggestion) => suggestion.title));
        setWorkspace((current) => ({
            ...current,
            roleSuggestions: suggestions,
            careerPreferences: {
                ...current.careerPreferences,
                selectedRoleTitles: current.careerPreferences.selectedRoleTitles.filter((title) => validTitles.has(title)),
            },
        }));
        showNotice("Role shortlist created. Review the day-to-day work and choose the directions you want to pursue.");
    }

    function completeJobSearch(results: JobSearchResult[], searchedAt: string) {
        setWorkspace((current) => ({
            ...current,
            jobSearchResults: results,
            lastJobSearchAt: searchedAt,
        }));
    }

    function saveSearchResult(result: JobSearchResult, tailorNow: boolean) {
        const existing = workspace.jobs.find((job) => job.url === result.url);
        const saved = persistJob({
            id: existing?.id ?? "",
            title: result.title,
            company: result.company,
            location: result.location,
            url: result.url,
            description: result.description,
            employmentType: result.employmentType,
            postedAt: result.postedAt,
            source: result.source,
            status: existing?.status ?? "saved",
            customStage: existing?.customStage ?? "",
            nextRoundAt: existing?.nextRoundAt ?? "",
            statusHistory: existing?.statusHistory ?? [],
            notes: existing?.notes ?? "",
            savedAt: existing?.savedAt ?? "",
            updatedAt: existing?.updatedAt ?? "",
        });
        if (tailorNow) {
            setDraftJob(saved);
            navigate("tailor");
            showNotice(result.description.length >= 80
                ? "Opening saved. Review the imported description, then analyze and tailor."
                : "Opening saved. This feed did not include the full description; fetch the link or paste the JD before tailoring.");
        } else {
            showNotice(existing ? "This opening was already saved; its listing details were refreshed." : "Opening saved to the tracker.");
        }
    }

    async function handleResumeFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (file.size > 10_000_000) {
            showNotice("Choose a resume file smaller than 10 MB.");
            return;
        }
        setImportingResume(true);
        try {
            const text = await extractDocumentFileText(file, {
                documentName: "resume",
                pasteFallback: "Paste the resume text instead.",
            });
            setResumeSource(text);
            showNotice("Resume text extracted locally. Review it, then choose Import into profile.");
        } catch (error) {
            showNotice(error instanceof Error ? error.message : "That resume file could not be read.");
        } finally {
            setImportingResume(false);
        }
    }

    function applyResumeImport() {
        if (resumeSource.trim().length < 80) {
            showNotice("Paste or upload a fuller resume before importing.");
            return;
        }
        updateProfile(importProfileFromText(resumeSource, workspace.profile));
        showNotice("Resume parsed into the local profile. Review contact, skills, and experience below.");
    }

    function updateSkillGroup(index: number, patch: Partial<SkillGroup>) {
        updateProfile({
            skillGroups: workspace.profile.skillGroups.map((group, groupIndex) => groupIndex === index ? { ...group, ...patch } : group),
        });
    }

    function updateExperience(index: number, patch: Partial<ExperienceEntry>) {
        updateProfile({
            experiences: workspace.profile.experiences.map((experience, experienceIndex) => experienceIndex === index ? { ...experience, ...patch } : experience),
        });
    }

    function updateProject(index: number, patch: Partial<ProjectEntry>) {
        updateProfile({
            projects: workspace.profile.projects.map((project, projectIndex) => projectIndex === index ? { ...project, ...patch } : project),
        });
    }

    function updateEducation(index: number, patch: Partial<EducationEntry>) {
        updateProfile({
            education: workspace.profile.education.map((education, educationIndex) => educationIndex === index ? { ...education, ...patch } : education),
        });
    }

    function exportBackup() {
        downloadBlob(
            new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" }),
            `placement-desk-${inviteId}-backup.json`,
        );
        showNotice("Local workspace backup downloaded.");
    }

    async function importBackup(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text()) as unknown;
            const restored = mergeStoredWorkspace(parsed, createInitialWorkspace(isOwner));
            setWorkspace(restored);
            const latest = restored.jobs.find((job) => job.id === restored.latestJobId);
            setDraftJob(latest ?? blankJob());
            showNotice("Workspace backup restored in this browser.");
        } catch {
            showNotice("That backup file is invalid or incompatible.");
        }
    }

    function resetWorkspace() {
        if (!window.confirm("Reset this invite's local jobs, plans, roadmaps, and profile? This cannot be undone without a backup.")) return;
        const reset = createInitialWorkspace(isOwner);
        setWorkspace(reset);
        setDraftJob(blankJob());
        setResumeSource("");
        showNotice("Local workspace reset.");
    }

    if (!storageReady) {
        return (
            <main className="relative z-[110] grid min-h-screen place-items-center bg-[#f3f1ea] text-[#23372f] [color-scheme:light]">
                <div className="flex items-center gap-3 font-jetbrains text-xs uppercase tracking-[0.14em]">
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Loading local workspace
                </div>
            </main>
        );
    }

    const filteredJobs = workspace.jobs.filter((job) => {
        const matchesStatus = statusFilter === "all" || job.status === statusFilter;
        const query = jobSearch.trim().toLowerCase();
        const matchesSearch = !query || `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(query);
        return matchesStatus && matchesSearch;
    });

    return (
        <main className="placement-desk-ui relative z-[110] min-h-screen bg-[#f3f1ea] text-[#17211c] [color-scheme:light]" data-motion={motionTier}>
            <div className="pd-backdrop pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(35,55,47,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(35,55,47,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <aside className="fixed inset-y-0 left-0 z-20 hidden w-[236px] flex-col border-r border-[#23372f]/15 bg-[#17271f] text-white lg:flex">
                <div className="border-b border-white/10 px-5 py-5">
                    <div className="flex items-center gap-3">
                        <button
                            aria-label="Open the GajendraBoys story"
                            className="grid h-9 w-9 place-items-center"
                            onClick={() => setMakerStoryOpen(true)}
                            title="GajendraBoys · GB"
                            type="button"
                        >
                            <GBLogo size="sm" />
                        </button>
                        <div>
                            <p className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>Placement Desk</p>
                            <p className="font-jetbrains text-[9px] uppercase tracking-[0.13em] text-white/45">Made in India</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Workspace navigation">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = view === item.id;
                        return (
                            <button
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${active ? "bg-[#ff7a1a] font-semibold text-[#17271f]" : "text-white/68 hover:bg-white/8 hover:text-white"}`}
                                key={item.id}
                                onClick={() => navigate(item.id)}
                                type="button"
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                                {item.id === "jobs" && workspace.jobs.length ? <span className="ml-auto font-jetbrains text-[10px]">{workspace.jobs.length}</span> : null}
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <button
                        className="mb-4 w-full border-l-2 border-[#ff7a1a] bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/9"
                        onClick={() => setMakerStoryOpen(true)}
                        type="button"
                    >
                        <span className="block text-[11px] font-semibold text-white/85">Built by Fareeth Raja</span>
                        <span className="mt-1 block font-jetbrains text-[8px] uppercase tracking-[0.1em] text-white/40">Open source · India</span>
                    </button>
                    <div className="mb-4 flex items-center gap-2 text-[11px] text-white/55">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#ff7a1a]" />
                        <span>Local autosave active</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{inviteLabel}</p>
                            <p className="truncate font-jetbrains text-[8px] uppercase tracking-[0.1em] text-white/40">{inviteId}</p>
                        </div>
                        <button aria-label={loggingOut ? "Signing out" : "Sign out"} className="grid h-8 w-8 shrink-0 place-items-center border border-white/15 text-white/65 hover:border-white/35 hover:text-white" disabled={loggingOut} onClick={logout} title="Sign out" type="button">
                            {loggingOut ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            </aside>

            <div className="relative min-h-screen lg:pl-[236px]">
                <header className="sticky top-0 z-20 flex h-15 items-center justify-between border-b border-[#23372f]/15 bg-[#f3f1ea]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 lg:hidden">
                        <button aria-label="Open navigation" className="grid h-9 w-9 place-items-center border border-[#23372f]/20 bg-white" onClick={() => setMobileMenuOpen((open) => !open)} type="button">
                            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                        <div>
                            <p className="text-sm font-semibold">Placement Desk</p>
                            <p className="font-jetbrains text-[8px] uppercase tracking-[0.12em] text-[#718079]">{inviteLabel}</p>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 text-xs text-[#66736c] lg:flex">
                        <LockKeyhole className="h-3.5 w-3.5" /> Unlisted workspace / {inviteLabel}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            aria-label="Open the GajendraBoys story"
                            className="grid h-10 w-10 place-items-center lg:hidden"
                            onClick={() => setMakerStoryOpen(true)}
                            title="GajendraBoys · GB"
                            type="button"
                        >
                            <GBLogo />
                        </button>
                        <button className={BUTTON_SECONDARY} onClick={startNewJob} type="button">
                            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New job</span>
                        </button>
                        <button aria-label={loggingOut ? "Signing out" : "Sign out"} className="grid h-10 w-10 place-items-center border border-[#23372f]/20 bg-white lg:hidden" disabled={loggingOut} onClick={logout} title="Sign out" type="button">
                            {loggingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                        </button>
                    </div>
                </header>

                {mobileMenuOpen ? (
                    <nav className="fixed inset-x-0 top-15 z-30 grid grid-cols-2 gap-px border-b border-[#23372f]/20 bg-[#23372f]/15 p-px lg:hidden" aria-label="Mobile workspace navigation">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button className={`flex items-center gap-2 px-4 py-3 text-left text-sm ${view === item.id ? "bg-[#ff7a1a] font-semibold" : "bg-[#fbfaf6]"}`} key={item.id} onClick={() => navigate(item.id)} type="button">
                                    <Icon className="h-4 w-4" /> {item.label}
                                </button>
                            );
                        })}
                    </nav>
                ) : null}

                <div className="pd-view mx-auto w-full max-w-[1380px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
                    {notice ? (
                        <div className="pd-notice mb-6 flex items-start justify-between gap-4 border-l-4 border-[#2f7453] bg-[#e5f1e8] px-4 py-3 text-sm text-[#275840]" key={noticeSequence} role="status">
                            <span>{notice}</span>
                            <button aria-label="Dismiss message" className="shrink-0" onClick={() => setNotice("")} type="button"><X className="h-4 w-4" /></button>
                        </div>
                    ) : null}

                    {view === "dashboard" ? (
                        <DashboardView
                            activePlan={activePlan}
                            allPlanTasks={allPlanTasks}
                            completedPlanTasks={completedPlanTasks}
                            jobs={workspace.jobs}
                            learningRoadmaps={workspace.learningRoadmaps}
                            navigate={navigate}
                            startNewJob={startNewJob}
                        />
                    ) : null}

                    {view === "discover" ? (
                        <CareerDiscoveryView
                            continueToSearch={() => navigate("search")}
                            generateSuggestions={generateRoleSuggestions}
                            preferences={workspace.careerPreferences}
                            suggestions={workspace.roleSuggestions}
                            updatePreferences={updateCareerPreferences}
                        />
                    ) : null}

                    {view === "search" ? (
                        <JobHuntView
                            backToDiscovery={() => navigate("discover")}
                            completeSearch={completeJobSearch}
                            inviteId={inviteId}
                            lastSearchAt={workspace.lastJobSearchAt}
                            notify={showNotice}
                            preferences={workspace.careerPreferences}
                            results={workspace.jobSearchResults}
                            saveResult={saveSearchResult}
                            savedJobUrls={workspace.jobs.map((job) => job.url).filter(Boolean)}
                            updatePreferences={updateCareerPreferences}
                        />
                    ) : null}

                    {view === "tailor" ? (
                        <TailorView
                            analysis={currentAnalysis}
                            currentResume={currentResume}
                            draftJob={draftJob}
                            exportingResume={exportingResume}
                            importDialogOpen={importDialogOpen}
                            importIssue={jobImportIssue}
                            importJobUrl={importJobUrl}
                            importingUrl={importingUrl}
                            navigate={navigate}
                            onAnalyze={handleAnalyze}
                            onDownload={downloadResume}
                            onPrint={printResume}
                            profile={workspace.profile}
                            saveForLater={saveForLater}
                            closeImportDialog={() => setImportDialogOpen(false)}
                            updateDraft={updateDraft}
                            updateJobUrl={updateJobUrl}
                            updateResume={updateResume}
                            updateResumeExperience={updateResumeExperience}
                            startRoadmap={(skill) => {
                                if (currentJobId) setLearningJobId(currentJobId);
                                navigate("learn");
                                window.setTimeout(() => generateLearningRoadmap(skill, currentJobId), 0);
                            }}
                            createPlan={() => {
                                if (currentJobId) setPlanJobId(currentJobId);
                                navigate("planner");
                            }}
                        />
                    ) : null}

                    {view === "jobs" ? (
                        <SavedJobsView
                            filteredJobs={filteredJobs}
                            jobSearch={jobSearch}
                            loadJob={loadJob}
                            removeJob={removeJob}
                            setJobSearch={setJobSearch}
                            setStatusFilter={setStatusFilter}
                            startNewJob={startNewJob}
                            statusFilter={statusFilter}
                            updateJobDetails={updateJobDetails}
                            updateJobStatus={updateJobStatus}
                            analyses={workspace.analyses}
                            analyzeOfferJob={openOfferAnalyzer}
                            prepareJob={(jobId) => {
                                setPlanJobId(jobId);
                                navigate("planner");
                            }}
                        />
                    ) : null}

                    {view === "offer" ? (
                        <OfferAnalyzerView
                            deleteOffer={(offerKey) => {
                                setWorkspace((current) => {
                                    const offerAnalyses = { ...current.offerAnalyses };
                                    delete offerAnalyses[offerKey];
                                    return {
                                        ...current,
                                        activeOfferJobId: "__standalone_new__",
                                        offerAnalyses,
                                    };
                                });
                                showNotice("Standalone offer analysis deleted.");
                            }}
                            inviteId={inviteId}
                            jobs={workspace.jobs}
                            markOfferReceived={(jobId) => {
                                updateJobStatus(jobId, "offer");
                                showNotice("Job moved to Offer and added to its stage history.");
                            }}
                            notify={showNotice}
                            offers={workspace.offerAnalyses}
                            saveOffer={(offer) => setWorkspace((current) => ({
                                ...current,
                                activeOfferJobId: offer.jobId || offer.id,
                                offerAnalyses: { ...current.offerAnalyses, [offer.jobId || offer.id]: offer },
                            }))}
                            selectedOfferId={selectedOfferId}
                            setSelectedOfferId={(offerId) => setWorkspace((current) => ({ ...current, activeOfferJobId: offerId }))}
                        />
                    ) : null}

                    {view === "planner" ? (
                        <PlannerView
                            activePlan={activePlan}
                            analyzedJobs={analyzedJobs}
                            generatePlan={generatePlan}
                            plannerDuration={plannerDuration}
                            plans={workspace.plans}
                            removePlan={removePlan}
                            notify={showNotice}
                            selectedJobId={selectedPlanJobId}
                            setActivePlan={(planId) => setWorkspace((current) => ({ ...current, activePlanId: planId }))}
                            setDuration={setPlannerDuration}
                            setJobId={setPlanJobId}
                            toggleTask={togglePlanTask}
                        />
                    ) : null}

                    {view === "learn" ? (
                        <LearningView
                            activeRoadmap={activeRoadmap}
                            analyzedJobIds={new Set(Object.keys(workspace.analyses))}
                            availableJobs={workspace.jobs}
                            analysis={selectedLearningAnalysis}
                            customSkill={customSkill}
                            generateRoadmap={generateLearningRoadmap}
                            roadmaps={workspace.learningRoadmaps}
                            selectedJobId={selectedLearningJobId}
                            setActiveRoadmap={(roadmapId) => setWorkspace((current) => ({ ...current, activeLearningRoadmapId: roadmapId }))}
                            setCustomSkill={setCustomSkill}
                            setJobId={setLearningJobId}
                            toggleDay={toggleLearningDay}
                            updateEvidence={updateLearningEvidence}
                            verifySkill={verifyLearnedSkill}
                        />
                    ) : null}

                    {view === "profile" ? (
                        <ProfileView
                            exportBackup={exportBackup}
                            handleResumeFile={handleResumeFile}
                            importBackup={importBackup}
                            importingResume={importingResume}
                            isOwner={isOwner}
                            profile={workspace.profile}
                            resetWorkspace={resetWorkspace}
                            resumeSource={resumeSource}
                            setResumeSource={setResumeSource}
                            applyResumeImport={applyResumeImport}
                            updateEducation={updateEducation}
                            updateExperience={updateExperience}
                            updateProfile={updateProfile}
                            updateProject={updateProject}
                            updateSkillGroup={updateSkillGroup}
                        />
                    ) : null}

                    <footer className="mt-12 flex flex-col justify-between gap-4 border-t border-[#23372f]/15 py-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <button
                                aria-label="Open the GajendraBoys story"
                                className="grid h-9 w-9 shrink-0 place-items-center"
                                onClick={() => setMakerStoryOpen(true)}
                                title="GajendraBoys · GB"
                                type="button"
                            >
                                <GBLogo size="sm" />
                            </button>
                            <div>
                                <p className="text-xs font-semibold text-[#23372f]">Built by Fareeth Raja</p>
                                <p className="mt-0.5 font-jetbrains text-[8px] uppercase tracking-[0.1em] text-[#718079]">Open source · For India&apos;s early-career community</p>
                            </div>
                        </div>
                        <button className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[#a84708] sm:self-auto" onClick={() => setMakerStoryOpen(true)} type="button">
                            Origin & contributors <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </footer>
                </div>
            </div>

            {makerStoryOpen ? (
                <div
                    className="pd-backdrop pd-dialog-backdrop fixed inset-0 z-[200] flex items-center justify-center bg-[#0e1813]/80 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={() => setMakerStoryOpen(false)}
                >
                    <section
                        aria-labelledby="maker-story-title"
                        aria-modal="true"
                        className="pd-dialog-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#ff7a1a]/60 bg-[#fbfaf6] shadow-[10px_10px_0_#ff7a1a]"
                        onMouseDown={(event) => event.stopPropagation()}
                        role="dialog"
                    >
                        <div className="flex items-start justify-between gap-5 bg-[#17271f] px-5 py-5 text-white sm:px-7 sm:py-6">
                            <div className="flex items-center gap-4">
                                <GBLogo size="lg" />
                                <div>
                                    <p className="font-jetbrains text-[9px] uppercase tracking-[0.13em] text-[#ff9a52]">Maker&apos;s mark</p>
                                    <h2 className="mt-1 text-2xl font-semibold" id="maker-story-title" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>GajendraBoys</h2>
                                    <p className="mt-1 text-xs text-white/55">A nod to the gang. The product is built by Fareeth Raja.</p>
                                </div>
                            </div>
                            <button
                                aria-label="Close origin story"
                                autoFocus
                                className="grid h-9 w-9 shrink-0 place-items-center border border-white/20 text-white/70 transition hover:border-white/50 hover:text-white"
                                onClick={() => setMakerStoryOpen(false)}
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-5 sm:p-7">
                            <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
                                <div>
                                    <p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a84708]">Why this exists</p>
                                    <h3 className="mt-2 max-w-lg text-xl font-semibold leading-snug text-[#17211c]">A clearer path through a difficult season.</h3>
                                    <p className="mt-4 text-sm leading-7 text-[#58665f]">
                                        After finding his own job, Fareeth kept watching friends struggle through applications, carry the pressure home, and make painful calls to their mothers. Placement Desk began as a response: honest tools, clearer preparation, and a little less loneliness in the search.
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-[#58665f]">
                                        It is open source for Indian students and early-career candidates. Copying it to help more people is welcome. The maker&apos;s mark simply keeps the origin visible and gives contributors a way back to the project.
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <a className={BUTTON_PRIMARY} href="https://github.com/fareethraja/My-portfolio" rel="noreferrer" target="_blank">
                                            <Github className="h-4 w-4" /> Contribute on GitHub
                                        </a>
                                        <a className={BUTTON_SECONDARY} href="https://wa.me/919159469088?text=Hi%20Fareeth%2C%20I%27d%20like%20to%20connect%20about%20Placement%20Desk." rel="noreferrer" target="_blank">
                                            <MessageCircle className="h-4 w-4" /> WhatsApp
                                        </a>
                                    </div>
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        <a className="flex items-center gap-3 border border-[#23372f]/15 bg-white px-3 py-2.5 text-xs font-semibold text-[#23372f] transition hover:border-[#ff7a1a] hover:bg-[#fff5ec]" href="tel:+919159469088">
                                            <Phone className="h-4 w-4 text-[#a84708]" />
                                            <span><span className="block">Call Fareeth</span><span className="mt-0.5 block font-jetbrains text-[9px] font-normal text-[#718079]">+91 91594 69088</span></span>
                                        </a>
                                        <a className="flex items-center gap-3 border border-[#23372f]/15 bg-white px-3 py-2.5 text-xs font-semibold text-[#23372f] transition hover:border-[#ff7a1a] hover:bg-[#fff5ec]" href="mailto:fareethraja.26.careers@gmail.com?subject=Placement%20Desk%20contribution">
                                            <Mail className="h-4 w-4 text-[#a84708]" />
                                            <span><span className="block">Email Fareeth</span><span className="mt-0.5 block break-all font-jetbrains text-[9px] font-normal text-[#718079]">fareethraja.26.careers@gmail.com</span></span>
                                        </a>
                                    </div>
                                </div>

                                <div className="border-l-2 border-[#ff7a1a] bg-[#f2f3ee] p-5">
                                    <p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a84708]">Contributors welcome</p>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex gap-3"><Code2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a84708]" /><div><p className="text-xs font-semibold">Build and refine</p><p className="mt-1 text-xs leading-5 text-[#68756f]">Document parsers, job sources, accessibility, role data, and reliable tests.</p></div></div>
                                        <div className="flex gap-3"><Users className="mt-0.5 h-4 w-4 shrink-0 text-[#a84708]" /><div><p className="text-xs font-semibold">Make it more Indian</p><p className="mt-1 text-xs leading-5 text-[#68756f]">Regional-language guidance, fresher pathways, local hiring rounds, and current tax knowledge.</p></div></div>
                                        <div className="flex gap-3"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#a84708]" /><div><p className="text-xs font-semibold">Protect the candidate</p><p className="mt-1 text-xs leading-5 text-[#68756f]">Privacy, truthful resumes, transparent assumptions, and no exploitative shortcuts.</p></div></div>
                                    </div>
                                    <p className="mt-5 border-t border-[#23372f]/12 pt-4 text-[11px] leading-5 text-[#718079]">GB is short for GajendraBoys, Fareeth&apos;s gang name. It lives here as a quiet easter egg and a reminder of who this was built beside and for.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            ) : null}
        </main>
    );
}

function DashboardView({ jobs, learningRoadmaps, activePlan, allPlanTasks, completedPlanTasks, navigate, startNewJob }: {
    jobs: JobRecord[];
    learningRoadmaps: LearningRoadmap[];
    activePlan?: PreparationPlan;
    allPlanTasks: number;
    completedPlanTasks: number;
    navigate: (view: ViewId) => void;
    startNewJob: () => void;
}) {
    const applied = jobs.filter((job) => job.status !== "saved").length;
    const interviews = jobs.filter((job) => ["recruiter_screen", "hr_round", "aptitude_round", "assignment_round", "technical_round", "manager_round", "final_round", "offer"].includes(job.status)).length;
    const verifiedSkills = learningRoadmaps.filter((roadmap) => roadmap.verified).length;
    const progress = allPlanTasks ? Math.round((completedPlanTasks / allPlanTasks) * 100) : 0;
    const nextTasks = activePlan?.tasks.filter((task) => !task.completed).slice(0, 4) ?? [];

    return (
        <>
            <SectionHeader
                eyebrow="Command center"
                title="Application overview"
                copy="Track the role, improve the evidence, and prepare for the round that comes next."
                action={<button className={BUTTON_PRIMARY} onClick={startNewJob} type="button"><Sparkles className="h-4 w-4" /> Tailor a job</button>}
            />

            <div className="pd-surface grid border-l border-t border-[#23372f]/15 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "Jobs tracked", value: jobs.length, detail: `${jobs.filter((job) => job.status === "saved").length} waiting to apply`, icon: BriefcaseBusiness, color: "text-[#2f7453]" },
                    { label: "Applications", value: applied, detail: `${interviews} at interview or offer`, icon: ArrowRight, color: "text-[#2f6f9f]" },
                    { label: "Prep complete", value: `${progress}%`, detail: `${completedPlanTasks} of ${allPlanTasks} tasks`, icon: ListChecks, color: "text-[#845b22]" },
                    { label: "Skills verified", value: verifiedSkills, detail: `${learningRoadmaps.length} roadmaps created`, icon: GraduationCap, color: "text-[#7a4f9a]" },
                ].map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div className="border-b border-r border-[#23372f]/15 bg-[#fbfaf6] p-5" key={metric.label}>
                            <div className="flex items-center justify-between">
                                <p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#68756f]">{metric.label}</p>
                                <Icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                            <p className="mt-4 text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>{metric.value}</p>
                            <p className="mt-1 text-xs text-[#718079]">{metric.detail}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Recent jobs</h2>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#2f7453]" onClick={() => navigate("jobs")} type="button">View pipeline <ArrowRight className="h-3.5 w-3.5" /></button>
                    </div>
                    {jobs.length ? (
                        <div className="divide-y divide-[#23372f]/12 border-y border-[#23372f]/15 bg-[#fbfaf6]">
                            {jobs.slice(0, 5).map((job) => (
                                <button className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 text-left hover:bg-[#eef3ed]" key={job.id} onClick={() => navigate("jobs")} type="button">
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold">{job.title || "Untitled role"}</span>
                                        <span className="mt-1 flex items-center gap-2 truncate text-xs text-[#68756f]"><Building2 className="h-3 w-3" /> {job.company || "Company not set"}</span>
                                    </span>
                                    <span className={`border px-2 py-1 font-jetbrains text-[9px] uppercase tracking-[0.08em] ${statusTone(job.status)}`}>{job.status}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={BriefcaseBusiness} title="No jobs tracked" copy="Paste a description or import a public job link to create your first tailored application." action={<button className={BUTTON_PRIMARY} onClick={startNewJob} type="button">Add first job</button>} />
                    )}
                </section>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Next prep tasks</h2>
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#2f7453]" onClick={() => navigate("planner")} type="button">Open plan <ArrowRight className="h-3.5 w-3.5" /></button>
                    </div>
                    {nextTasks.length ? (
                        <div className="divide-y divide-[#23372f]/12 border-y border-[#23372f]/15 bg-[#fbfaf6]">
                            {nextTasks.map((task) => (
                                <div className="flex gap-3 px-4 py-4" key={task.id}>
                                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#8b958f]" />
                                    <div>
                                        <p className="text-sm font-semibold">{task.title}</p>
                                        <p className="mt-1 text-xs text-[#718079]">Day {task.day} · {task.durationMinutes} min</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon={CalendarCheck2} title="No active plan" copy="Analyze a role, then generate a focused aptitude and interview schedule." action={<button className={BUTTON_SECONDARY} onClick={() => navigate("planner")} type="button">Open planner</button>} />
                    )}
                </section>
            </div>
        </>
    );
}

function TailorView({ draftJob, analysis, currentResume, profile, importingUrl, exportingResume, importIssue, importDialogOpen, updateDraft, updateJobUrl, importJobUrl, closeImportDialog, saveForLater, onAnalyze, onDownload, onPrint, updateResume, updateResumeExperience, navigate, startRoadmap, createPlan }: {
    draftJob: JobRecord;
    analysis?: JobAnalysis;
    currentResume?: TailoredResume;
    profile: CandidateProfile;
    importingUrl: boolean;
    exportingResume: boolean;
    importIssue: string;
    importDialogOpen: boolean;
    updateDraft: <K extends keyof JobRecord>(key: K, value: JobRecord[K]) => void;
    updateJobUrl: (value: string) => void;
    importJobUrl: () => void;
    closeImportDialog: () => void;
    saveForLater: () => boolean;
    onAnalyze: (event?: FormEvent) => void;
    onDownload: () => void;
    onPrint: () => void;
    updateResume: (patch: Partial<TailoredResume>) => void;
    updateResumeExperience: (index: number, bullets: string) => void;
    navigate: (view: ViewId) => void;
    startRoadmap: (skill: string) => void;
    createPlan: () => void;
}) {
    const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
    const detailsReady = Boolean(
        draftJob.title.trim() &&
        draftJob.company.trim() &&
        draftJob.description.trim().length >= 80,
    );

    function focusDescription() {
        closeImportDialog();
        requestAnimationFrame(() => {
            document.getElementById("job-description")?.scrollIntoView({ behavior: "smooth", block: "center" });
            document.getElementById("job-description")?.focus({ preventScroll: true });
        });
    }

    function changeDraft<K extends keyof JobRecord>(key: K, value: JobRecord[K]) {
        setSaveState("idle");
        updateDraft(key, value);
    }

    function changeJobUrl(value: string) {
        setSaveState("idle");
        updateJobUrl(value);
    }

    function saveDraft() {
        if (saveForLater()) setSaveState("saved");
    }

    return (
        <>
            <SectionHeader eyebrow="Application lab" title="Tailor a truthful resume" copy="Import or paste the role, then match only requirements supported by evidence in your profile." />

            <form onSubmit={onAnalyze}>
                <section className="border border-[#23372f]/15 bg-[#fbfaf6]">
                    <div className="border-b border-[#23372f]/12 bg-[#e8eee8] px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2 text-sm font-semibold"><Link2 className="h-4 w-4 text-[#2f7453]" /> Import public job link</div>
                    </div>
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
                        <label className="sr-only" htmlFor="job-url">Job URL</label>
                        <input className={`${INPUT_CLASS} flex-1`} id="job-url" onChange={(event) => changeJobUrl(event.target.value)} placeholder="https://company.com/careers/job..." type="url" value={draftJob.url} />
                        <button className={`${BUTTON_SECONDARY} shrink-0`} disabled={importingUrl} onClick={importJobUrl} type="button">
                            {importingUrl ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Import className="h-4 w-4" />} {importingUrl ? "Reading page" : "Fetch details"}
                        </button>
                    </div>
                    {importIssue ? (
                        <div className="mx-4 mb-4 flex flex-col justify-between gap-3 border-l-4 border-[#ff7a1a] bg-[#fff0e4] px-4 py-3 sm:mx-5 sm:flex-row sm:items-center" role="alert">
                            <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#a84708]" /><div><p className="text-xs font-semibold text-[#8f3d08]">Automatic import blocked</p><p className="mt-1 text-xs leading-5 text-[#80571d]">{importIssue}</p></div></div>
                            <button className={`${BUTTON_SECONDARY} shrink-0`} onClick={focusDescription} type="button"><ClipboardPaste className="h-4 w-4" /> Paste JD manually</button>
                        </div>
                    ) : <p className="px-4 pb-4 text-xs leading-5 text-[#718079] sm:px-5">Protected sites may block import. If that happens, stale job fields are cleared and the page asks for a fresh pasted description.</p>}
                </section>

                <section className="mt-5 border border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label><span className={LABEL_CLASS}>Role title *</span><input className={INPUT_CLASS} onChange={(event) => changeDraft("title", event.target.value)} placeholder="Business Analyst" value={draftJob.title} /></label>
                        <label><span className={LABEL_CLASS}>Company *</span><input className={INPUT_CLASS} onChange={(event) => changeDraft("company", event.target.value)} placeholder="Company name" value={draftJob.company} /></label>
                        <label><span className={LABEL_CLASS}>Location</span><input className={INPUT_CLASS} onChange={(event) => changeDraft("location", event.target.value)} placeholder="Bengaluru / Remote" value={draftJob.location} /></label>
                        <label><span className={LABEL_CLASS}>Employment type</span><input className={INPUT_CLASS} onChange={(event) => changeDraft("employmentType", event.target.value)} placeholder="Full-time" value={draftJob.employmentType} /></label>
                    </div>
                    <label className="mt-4 block">
                        <span className={LABEL_CLASS}>Job description *</span>
                        <textarea className={`${INPUT_CLASS} min-h-[260px] resize-y leading-6`} id="job-description" onChange={(event) => changeDraft("description", event.target.value)} placeholder="Paste responsibilities, requirements, qualifications, and preferred skills..." value={draftJob.description} />
                    </label>
                    <label className="mt-4 block">
                        <span className={LABEL_CLASS}>Private notes</span>
                        <textarea className={`${INPUT_CLASS} min-h-20 resize-y`} onChange={(event) => changeDraft("notes", event.target.value)} placeholder="Recruiter name, referral, deadline, or application notes" value={draftJob.notes} />
                    </label>
                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button aria-live="polite" className={`${BUTTON_SECONDARY} ${saveState === "saved" ? "pd-save-confirm pd-save-success" : ""}`} onClick={saveDraft} type="button">{saveState === "saved" ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saveState === "saved" ? "Saved" : "Save for later"}</button>
                        <button className={BUTTON_PRIMARY} disabled={importingUrl || !detailsReady} type="submit"><Sparkles className="h-4 w-4" /> Analyze + tailor resume</button>
                    </div>
                </section>
            </form>

            {analysis && currentResume ? (
                <div className="mt-10 space-y-8">
                    <section className="border-y border-[#23372f]/15 bg-[#fbfaf6]">
                        <div className="grid lg:grid-cols-[250px_1fr]">
                            <div className="border-b border-[#23372f]/15 p-6 lg:border-b-0 lg:border-r">
                                <p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.13em] text-[#66736c]">Supported alignment</p>
                                <div className="mt-3 flex items-end gap-2"><span className="text-5xl font-semibold text-[#19372d]" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>{analysis.score}</span><span className="pb-1 text-sm text-[#718079]">/ 100</span></div>
                                <p className="mt-2 text-sm font-semibold text-[#2f7453]">{analysis.fitLabel}</p>
                                <p className="mt-1 text-xs text-[#718079]">Track: {analysis.roleLabel}</p>
                                <div className="mt-5 h-2 bg-[#dfe4df]"><div className="h-full bg-[#2f7453]" style={{ width: `${analysis.score}%` }} /></div>
                            </div>
                            <div className="grid gap-px bg-[#23372f]/12 sm:grid-cols-2">
                                <div className="bg-[#fbfaf6] p-5">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-[#2f7453]" /> Evidence already present</h3>
                                    <KeywordList empty="No supported role keyword detected yet." values={analysis.matchedKeywords} />
                                </div>
                                <div className="bg-[#fbfaf6] p-5">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><GraduationCap className="h-4 w-4 text-[#9a6720]" /> Learn before claiming</h3>
                                    <KeywordList empty="No major detected gaps." tone="gap" values={analysis.missingKeywords} />
                                    {analysis.missingKeywords.length ? (
                                        <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#80571d]" onClick={() => startRoadmap(analysis.missingKeywords[0])} type="button">Start with {analysis.missingKeywords[0]} <ArrowRight className="h-3.5 w-3.5" /></button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-8 xl:grid-cols-2">
                        <section>
                            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold"><Target className="h-4 w-4 text-[#2f7453]" /> What the job emphasizes</h2>
                            <div className="divide-y divide-[#23372f]/12 border-y border-[#23372f]/15 bg-[#fbfaf6]">
                                {(analysis.topRequirements.length ? analysis.topRequirements : ["No discrete requirement sentences were found. Review the pasted description before applying."]).map((requirement, index) => (
                                    <div className="flex gap-3 px-4 py-3.5 text-sm leading-6" key={`${requirement}-${index}`}><span className="font-jetbrains text-[10px] text-[#2f7453]">{String(index + 1).padStart(2, "0")}</span><span>{requirement}</span></div>
                                ))}
                            </div>
                        </section>
                        <section>
                            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold"><ShieldCheck className="h-4 w-4 text-[#2f7453]" /> Resume guardrails</h2>
                            <div className="border-y border-[#23372f]/15 bg-[#fbfaf6] px-5 py-4">
                                {[...analysis.strengths, ...analysis.watchouts].map((comment, index) => (
                                    <p className="flex gap-3 border-b border-[#23372f]/10 py-3 text-sm leading-6 last:border-b-0" key={comment}><span>{index < analysis.strengths.length ? <Check className="mt-1 h-4 w-4 text-[#2f7453]" /> : <ShieldCheck className="mt-1 h-4 w-4 text-[#9a6720]" />}</span><span>{comment}</span></p>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="border border-[#23372f]/15 bg-[#fbfaf6]">
                        <div className="flex flex-col justify-between gap-4 border-b border-[#23372f]/15 bg-[#e8eee8] px-5 py-4 sm:flex-row sm:items-center">
                            <div>
                                <p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.13em] text-[#2f7453]">Generated document</p>
                                <h2 className="mt-1 text-base font-semibold">Editable ATS resume draft</h2>
                                <p className="mt-1 text-xs text-[#68756f]">Complete structure: contact, summary, skills, experience, projects, education, certifications, and achievements.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button className={BUTTON_SECONDARY} onClick={onPrint} type="button"><Printer className="h-4 w-4" /> Print / PDF</button>
                                <button className={BUTTON_PRIMARY} disabled={exportingResume} onClick={onDownload} type="button">{exportingResume ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Download DOCX</button>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
                            <div className="border-b border-[#23372f]/15 p-5 lg:border-b-0 lg:border-r">
                                <label><span className={LABEL_CLASS}>Target headline</span><textarea className={`${INPUT_CLASS} min-h-24 resize-y`} onChange={(event) => updateResume({ headline: event.target.value })} value={currentResume.headline} /></label>
                                <label className="mt-4 block"><span className={LABEL_CLASS}>Professional summary</span><textarea className={`${INPUT_CLASS} min-h-44 resize-y leading-6`} onChange={(event) => updateResume({ summary: event.target.value })} value={currentResume.summary} /></label>
                                <details className="mt-4 border border-[#23372f]/15 bg-white">
                                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold">Edit selected bullets <ChevronDown className="h-4 w-4" /></summary>
                                    <div className="space-y-4 border-t border-[#23372f]/12 p-3">
                                        {currentResume.experiences.map((experience, index) => (
                                            <label className="block" key={experience.id}><span className={LABEL_CLASS}>{experience.role}</span><textarea className={`${INPUT_CLASS} min-h-36 resize-y text-xs leading-5`} onChange={(event) => updateResumeExperience(index, event.target.value)} value={experience.bullets.join("\n")} /></label>
                                        ))}
                                    </div>
                                </details>
                                <p className="mt-4 text-xs leading-5 text-[#80571d]">Review every statement before applying. Editing is for accuracy and clarity, not adding experience you cannot demonstrate.</p>
                            </div>
                            <ResumePreview profile={profile} resume={currentResume} />
                        </div>
                    </section>

                    <section className="grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 lg:grid-cols-2">
                        <div className="bg-[#fbfaf6] p-5">
                            <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold"><BriefcaseBusiness className="h-4 w-4 text-[#2f7453]" /> After shortlisting</h2><button className="text-xs font-semibold text-[#2f7453]" onClick={createPlan} type="button">Build plan</button></div>
                            <ol className="space-y-3">
                                {analysis.shortlistSteps.map((step, index) => <li className="flex gap-3 text-sm leading-6" key={step}><span className="grid h-5 w-5 shrink-0 place-items-center bg-[#19372d] font-jetbrains text-[9px] text-white">{index + 1}</span><span>{step}</span></li>)}
                            </ol>
                        </div>
                        <div className="bg-[#fbfaf6] p-5">
                            <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold"><ListChecks className="h-4 w-4 text-[#2f7453]" /> Likely questions</h2><button className="text-xs font-semibold text-[#2f7453]" onClick={() => navigate("planner")} type="button">Practice</button></div>
                            <ul className="space-y-3">
                                {analysis.interviewQuestions.map((question) => <li className="border-l-2 border-[#ff7a1a] pl-3 text-sm leading-6" key={question}>{question}</li>)}
                            </ul>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="mt-7"><EmptyState icon={BarChart3} title="Analysis appears here" copy="Complete the job details and run analysis to get supported keywords, learning gaps, an editable resume, shortlist guidance, and interview questions." /></div>
            )}

            {importDialogOpen && importIssue ? (
                <div className="pd-backdrop pd-dialog-backdrop fixed inset-0 z-[210] flex items-center justify-center bg-[#0e1813]/80 px-4 py-6 backdrop-blur-sm" onMouseDown={closeImportDialog}>
                    <section aria-labelledby="import-blocked-title" aria-modal="true" className="pd-dialog-panel w-full max-w-lg border border-[#ff7a1a]/60 bg-[#fbfaf6] p-5 shadow-[8px_8px_0_#ff7a1a] sm:p-6" onMouseDown={(event) => event.stopPropagation()} role="alertdialog">
                        <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fff0e4] text-[#a84708]"><AlertTriangle className="h-5 w-5" /></div><div><p className="font-jetbrains text-[9px] uppercase tracking-[0.12em] text-[#a84708]">New link needs manual details</p><h2 className="mt-1 text-xl font-semibold" id="import-blocked-title">This job site blocked automatic reading</h2></div></div>
                        <p className="mt-4 text-sm leading-6 text-[#58665f]">{importIssue}</p>
                        <div className="mt-4 rounded-lg bg-[#e8eee8] px-4 py-3 text-xs leading-5 text-[#355d4c]"><strong>Your saved old job is safe in Saved jobs.</strong> It is no longer connected to this draft, so the wrong resume cannot be generated accidentally.</div>
                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button className={BUTTON_SECONDARY} onClick={closeImportDialog} type="button">Keep link only</button><button className={BUTTON_PRIMARY} onClick={focusDescription} type="button"><ClipboardPaste className="h-4 w-4" /> Paste JD manually</button></div>
                    </section>
                </div>
            ) : null}
        </>
    );
}

function ResumePreview({ profile, resume }: { profile: CandidateProfile; resume: TailoredResume }) {
    return (
        <div className="bg-[#dfe3de] p-3 sm:p-6">
            <div className="mx-auto min-h-[720px] max-w-[720px] bg-white px-5 py-7 text-[#17211c] shadow-[0_4px_18px_rgba(23,33,28,0.12)] sm:px-9">
                <div className="border-b border-[#23372f]/25 pb-4 text-center">
                    <p className="text-xl font-bold">{profile.fullName || "Candidate name"}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase text-[#2f7453]">{resume.headline}</p>
                    <p className="mt-2 text-[9px] text-[#58665f]">{[profile.location, profile.phone, profile.email].filter(Boolean).join(" | ")}</p>
                    <p className="mt-1 text-[8px] text-[#718079]">{[profile.portfolio, profile.linkedin, profile.github].filter(Boolean).join(" | ")}</p>
                </div>
                <PreviewSection title="Professional summary"><p className="text-[10px] leading-[1.55]">{resume.summary}</p></PreviewSection>
                <PreviewSection title="Core skills">
                    <div className="space-y-1.5">{resume.skillGroups.filter((group) => group.items.length).map((group) => <p className="text-[9px] leading-[1.45]" key={group.id}><strong>{group.name}:</strong> {group.items.join(", ")}</p>)}</div>
                </PreviewSection>
                <PreviewSection title="Experience">
                    <div className="space-y-3">{resume.experiences.map((experience) => <div key={experience.id}><div className="flex justify-between gap-3 text-[9px]"><strong>{experience.role} | {experience.company}</strong><span className="shrink-0 text-[#718079]">{experience.startDate} - {experience.endDate}</span></div><ul className="mt-1 list-disc space-y-0.5 pl-4 text-[9px] leading-[1.4]">{experience.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}</div>
                </PreviewSection>
                {resume.projects.length ? <PreviewSection title="Selected projects"><div className="space-y-2">{resume.projects.map((project) => <div key={project.id}><p className="text-[9px]"><strong>{project.name} | {project.subtitle}</strong></p><ul className="mt-1 list-disc pl-4 text-[9px] leading-[1.4]">{project.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}</div></PreviewSection> : null}
                {resume.education.length ? <PreviewSection title="Education"><div className="space-y-2">{resume.education.map((education) => <div key={education.id}><div className="flex justify-between gap-3 text-[9px]"><strong>{education.qualification} | {education.institution}</strong><span className="shrink-0 text-[#718079]">{education.dates}</span></div>{education.detail ? <p className="mt-0.5 text-[8px] text-[#58665f]">{education.detail}</p> : null}</div>)}</div></PreviewSection> : null}
                {resume.certifications.length ? <PreviewSection title="Certifications"><ul className="list-disc space-y-0.5 pl-4 text-[9px] leading-[1.4]">{resume.certifications.map((certification) => <li key={certification}>{certification}</li>)}</ul></PreviewSection> : null}
                {resume.achievements.length ? <PreviewSection title="Achievements"><ul className="list-disc space-y-0.5 pl-4 text-[9px] leading-[1.4]">{resume.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul></PreviewSection> : null}
            </div>
        </div>
    );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
    return <section className="mt-4"><h3 className="mb-2 border-b border-[#718079] pb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#19372d]">{title}</h3>{children}</section>;
}

function SavedJobsView({ filteredJobs, analyses, jobSearch, statusFilter, setJobSearch, setStatusFilter, loadJob, removeJob, updateJobStatus, updateJobDetails, prepareJob, analyzeOfferJob, startNewJob }: {
    filteredJobs: JobRecord[];
    analyses: Record<string, JobAnalysis>;
    jobSearch: string;
    statusFilter: "all" | JobStatus;
    setJobSearch: (value: string) => void;
    setStatusFilter: (value: "all" | JobStatus) => void;
    loadJob: (job: JobRecord) => void;
    removeJob: (jobId: string) => void;
    updateJobStatus: (jobId: string, status: JobStatus) => void;
    updateJobDetails: (jobId: string, patch: Partial<Pick<JobRecord, "customStage" | "nextRoundAt" | "notes">>) => void;
    prepareJob: (jobId: string) => void;
    analyzeOfferJob: (jobId: string) => void;
    startNewJob: () => void;
}) {
    const [coachJobId, setCoachJobId] = useState("");
    const coachJob = filteredJobs.find((job) => job.id === coachJobId);
    const guidance = coachJob
        ? getRoundGuidance(coachJob.status, coachJob.title, coachJob.company, analyses[coachJob.id], coachJob.customStage)
        : undefined;

    function changeStatus(jobId: string, status: JobStatus) {
        updateJobStatus(jobId, status);
        setCoachJobId(jobId);
    }

    return (
        <>
            <SectionHeader eyebrow="Application pipeline" title="Saved jobs" copy="Keep links, application state, tailored material, and preparation in one browser-local tracker." action={<button className={BUTTON_PRIMARY} onClick={startNewJob} type="button"><Plus className="h-4 w-4" /> Add job</button>} />
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1"><span className="sr-only">Search jobs</span><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#718079]" /><input className={`${INPUT_CLASS} pl-10`} onChange={(event) => setJobSearch(event.target.value)} placeholder="Search title, company, or location" value={jobSearch} /></label>
                <label className="w-full sm:w-auto"><span className="sr-only">Filter by status</span><select className={`${INPUT_CLASS} min-w-0 sm:min-w-44`} onChange={(event) => setStatusFilter(event.target.value as "all" | JobStatus)} value={statusFilter}><option value="all">All statuses</option>{JOB_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
            </div>
            {filteredJobs.length ? (
                <>
                    <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
                        {filteredJobs.map((job) => (
                            <article className="border border-[#23372f]/15 bg-[#fbfaf6] p-4" key={job.id}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="break-words text-sm font-semibold">{job.title || "Untitled role"}</h2>
                                        <p className="mt-1 flex items-start gap-1.5 text-xs text-[#68756f]"><Building2 className="mt-0.5 h-3 w-3 shrink-0" /><span className="break-words">{job.company || "Company not set"}</span></p>
                                    </div>
                                    {analyses[job.id] ? <span className="shrink-0 font-jetbrains text-xs font-semibold text-[#2f7453]">{analyses[job.id].score}%</span> : null}
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                    <div><span className={LABEL_CLASS}>Location</span><p className="break-words text-[#58665f]">{job.location || "Not listed"}</p></div>
                                    <div><span className={LABEL_CLASS}>Updated</span><p className="text-[#58665f]">{formatDate(job.updatedAt)}</p></div>
                                </div>
                                <label className="mt-4 block"><span className={LABEL_CLASS}>Application status</span><select aria-label={`Update status for ${job.title || "untitled role"}`} className={`${INPUT_CLASS} min-h-11 font-semibold ${statusTone(job.status)}`} onChange={(event) => changeStatus(job.id, event.target.value as JobStatus)} value={job.status}>{JOB_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
                                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#23372f]/10 pt-4 sm:grid-cols-3">
                                    <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#23372f]/15 bg-white px-3 text-xs font-semibold text-[#2f7453]" onClick={() => setCoachJobId(job.id)} type="button"><BookOpenCheck className="h-4 w-4" /> Round help</button>
                                    <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#23372f]/15 bg-white px-3 text-xs font-semibold text-[#94611d]" onClick={() => analyzeOfferJob(job.id)} type="button"><BadgeIndianRupee className="h-4 w-4" /> Offer</button>
                                    <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#23372f]/15 bg-white px-3 text-xs font-semibold" onClick={() => loadJob(job)} type="button"><Sparkles className="h-4 w-4" /> Tailor</button>
                                    {job.url ? <a className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#23372f]/15 bg-white px-3 text-xs font-semibold" href={job.url} rel="noreferrer" target="_blank"><ExternalLink className="h-4 w-4" /> Listing</a> : null}
                                    <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#a4493d]/15 bg-white px-3 text-xs font-semibold text-[#a4493d]" onClick={() => removeJob(job.id)} type="button"><Trash2 className="h-4 w-4" /> Delete</button>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="pd-surface hidden overflow-x-auto border border-[#23372f]/15 bg-[#fbfaf6] lg:block">
                    <table className="w-full min-w-[850px] border-collapse text-left">
                        <thead className="bg-[#e8eee8] font-jetbrains text-[9px] uppercase tracking-[0.1em] text-[#58665f]"><tr><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Location</th><th className="px-4 py-3 font-semibold">Fit</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Updated</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead>
                        <tbody className="divide-y divide-[#23372f]/10">
                            {filteredJobs.map((job) => (
                                <tr className="hover:bg-[#f1f4ef]" key={job.id}>
                                    <td className="px-4 py-4"><p className="max-w-xs truncate text-sm font-semibold">{job.title || "Untitled role"}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-[#68756f]"><Building2 className="h-3 w-3" /> {job.company || "Company not set"}</p></td>
                                    <td className="px-4 py-4 text-xs text-[#68756f]">{job.location || "Not listed"}</td>
                                    <td className="px-4 py-4">{analyses[job.id] ? <span className="font-jetbrains text-xs font-semibold text-[#2f7453]">{analyses[job.id].score}%</span> : <span className="text-xs text-[#8b958f]">Not analyzed</span>}</td>
                                    <td className="px-4 py-4"><select className={`border px-2 py-1.5 text-xs outline-none ${statusTone(job.status)}`} onChange={(event) => changeStatus(job.id, event.target.value as JobStatus)} value={job.status}>{JOB_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td>
                                    <td className="px-4 py-4 text-xs text-[#68756f]">{formatDate(job.updatedAt)}</td>
                                    <td className="px-4 py-4"><div className="flex justify-end gap-1"><button aria-label={`Open round help for ${job.title}`} className="grid h-9 w-9 place-items-center border border-[#23372f]/15 bg-white text-[#2f7453] hover:bg-[#e7efe8]" onClick={() => setCoachJobId(job.id)} title="Round coach" type="button"><BookOpenCheck className="h-4 w-4" /></button><button aria-label={`Analyze offer for ${job.title}`} className="grid h-9 w-9 place-items-center border border-[#23372f]/15 bg-white text-[#94611d] hover:bg-[#fbefd8]" onClick={() => analyzeOfferJob(job.id)} title="Analyze offer" type="button"><BadgeIndianRupee className="h-4 w-4" /></button><button aria-label={`Tailor resume for ${job.title}`} className="grid h-9 w-9 place-items-center border border-[#23372f]/15 bg-white hover:bg-[#e7efe8]" onClick={() => loadJob(job)} title="Open and tailor" type="button"><Sparkles className="h-4 w-4" /></button>{job.url ? <a aria-label={`Open ${job.title} job link`} className="grid h-9 w-9 place-items-center border border-[#23372f]/15 bg-white hover:bg-[#e7efe8]" href={job.url} rel="noreferrer" target="_blank" title="Open job link"><ExternalLink className="h-4 w-4" /></a> : null}<button aria-label={`Delete ${job.title}`} className="grid h-9 w-9 place-items-center border border-[#a4493d]/15 bg-white text-[#a4493d] hover:bg-[#f7e8e5]" onClick={() => removeJob(job.id)} title="Delete job" type="button"><Trash2 className="h-4 w-4" /></button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </>
            ) : <EmptyState icon={BriefcaseBusiness} title="No jobs match" copy="Adjust the search or add a role to start the application pipeline." action={<button className={BUTTON_PRIMARY} onClick={startNewJob} type="button">Add job</button>} />}

            {coachJob && guidance ? (
                <section className="mt-7 border border-[#23372f]/15 bg-[#fbfaf6]">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#23372f]/15 bg-[#19372d] px-5 py-5 text-white sm:flex-row sm:items-start">
                        <div>
                            <p className="font-jetbrains text-[9px] uppercase tracking-[0.13em] text-[#ff9a52]">Round coach · {coachJob.company}</p>
                            <h2 className="mt-2 text-xl font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>{guidance.title}</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{guidance.goal}</p>
                        </div>
                        <button aria-label="Close round coach" className="grid h-9 w-9 shrink-0 place-items-center border border-white/20 text-white/70 hover:border-white/50 hover:text-white" onClick={() => setCoachJobId("")} title="Close round coach" type="button"><X className="h-4 w-4" /></button>
                    </div>

                    <div className="grid gap-px bg-[#23372f]/12 lg:grid-cols-[1fr_0.72fr]">
                        <div className="bg-[#fbfaf6] p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {coachJob.status === "other_round" ? <label><span className={LABEL_CLASS}>Custom round name</span><input className={INPUT_CLASS} onChange={(event) => updateJobDetails(coachJob.id, { customStage: event.target.value })} placeholder="Presentation round" value={coachJob.customStage} /></label> : <div><span className={LABEL_CLASS}>Current stage</span><span className={`inline-flex border px-3 py-2 text-xs font-semibold ${statusTone(coachJob.status)}`}>{JOB_STATUSES.find((status) => status.value === coachJob.status)?.label}</span></div>}
                                <label><span className={LABEL_CLASS}>Scheduled date + time</span><input className={INPUT_CLASS} onChange={(event) => updateJobDetails(coachJob.id, { nextRoundAt: event.target.value })} type="datetime-local" value={coachJob.nextRoundAt} /></label>
                            </div>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><ListChecks className="h-4 w-4 text-[#2f7453]" /> Readiness checklist</h3><ul className="space-y-3">{guidance.checklist.map((item) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={item}><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f7453]" /> {item}</li>)}</ul></div>
                                <div><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-[#2f7453]" /> Practice now</h3><ul className="space-y-3">{guidance.practice.map((item) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={item}><ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f7453]" /> {item}</li>)}</ul></div>
                            </div>

                            {guidance.resources.length ? <div className="mt-6 border-t border-[#23372f]/12 pt-4"><p className={LABEL_CLASS}>Practice resources</p><div className="flex flex-wrap gap-2">{guidance.resources.map((resource) => <a className="inline-flex items-center gap-1.5 border border-[#23372f]/18 bg-white px-3 py-2 text-xs font-semibold text-[#2f7453] hover:bg-[#edf3ee]" href={resource.url} key={resource.url} rel="noreferrer" target="_blank">{resource.label} <ExternalLink className="h-3.5 w-3.5" /></a>)}</div></div> : null}

                            <div className="mt-6 flex flex-wrap gap-2"><button className={BUTTON_PRIMARY} onClick={() => prepareJob(coachJob.id)} type="button"><CalendarCheck2 className="h-4 w-4" /> Build full prep plan</button><button className={BUTTON_SECONDARY} onClick={() => loadJob(coachJob)} type="button"><Sparkles className="h-4 w-4" /> Review tailored resume</button></div>
                        </div>

                        <div className="bg-[#f2f3ee] p-5">
                            <h3 className="text-sm font-semibold">Stage history</h3>
                            <p className="mt-1 text-xs leading-5 text-[#718079]">Updates stay in this browser with the job record.</p>
                            {coachJob.statusHistory.length ? <ol className="mt-5 space-y-0">{[...coachJob.statusHistory].reverse().slice(0, 10).map((entry, index, entries) => <li className="relative flex gap-3 pb-5 last:pb-0" key={entry.id}>{index < entries.length - 1 ? <span className="absolute left-[7px] top-4 h-full w-px bg-[#23372f]/18" /> : null}<span className="relative mt-1 h-3.5 w-3.5 shrink-0 border-2 border-[#2f7453] bg-[#f2f3ee]" /><span><span className="block text-xs font-semibold">{entry.label}</span><span className="mt-1 block font-jetbrains text-[9px] text-[#718079]">{formatDate(entry.changedAt)}</span></span></li>)}</ol> : <div className="mt-5 border border-dashed border-[#23372f]/20 bg-white px-4 py-5 text-center text-xs leading-5 text-[#718079]">Change the status to start the stage history.</div>}
                        </div>
                    </div>
                </section>
            ) : null}
        </>
    );
}

function PlannerView({ analyzedJobs, selectedJobId, setJobId, plannerDuration, setDuration, generatePlan, plans, activePlan, setActivePlan, toggleTask, removePlan, notify }: {
    analyzedJobs: JobRecord[];
    selectedJobId: string;
    setJobId: (jobId: string) => void;
    plannerDuration: 7 | 14;
    setDuration: (duration: 7 | 14) => void;
    generatePlan: () => void;
    plans: PreparationPlan[];
    activePlan?: PreparationPlan;
    setActivePlan: (planId: string) => void;
    toggleTask: (planId: string, taskId: string) => void;
    removePlan: (planId: string) => void;
    notify: (message: string) => void;
}) {
    const [exportingGuide, setExportingGuide] = useState(false);
    const completed = activePlan?.tasks.filter((task) => task.completed).length ?? 0;
    const total = activePlan?.tasks.length ?? 0;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    async function downloadGuide() {
        if (!activePlan) return;
        setExportingGuide(true);
        try {
            const { blob, filename } = await buildPreparationGuideDocx(activePlan);
            downloadBlob(blob, filename);
            notify("Offline study guide downloaded.");
        } catch {
            notify("The study guide could not be generated. Try again.");
        } finally {
            setExportingGuide(false);
        }
    }

    return (
        <>
            <SectionHeader
                eyebrow="Assessment + interview"
                title="Preparation planner"
                copy="Generate a role-aware schedule with built-in lessons, practice questions, trusted resources, and an offline study guide."
                action={activePlan ? <button className={BUTTON_PRIMARY} disabled={exportingGuide} onClick={downloadGuide} type="button">{exportingGuide ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} Download study guide</button> : undefined}
            />
            <section className="grid gap-4 border border-[#23372f]/15 bg-[#fbfaf6] p-4 md:grid-cols-[1fr_auto_auto] md:items-end sm:p-5">
                <label><span className={LABEL_CLASS}>Analyzed job</span><select className={INPUT_CLASS} onChange={(event) => setJobId(event.target.value)} value={selectedJobId}><option value="">Choose a job</option>{analyzedJobs.map((job) => <option key={job.id} value={job.id}>{job.title} · {job.company}</option>)}</select></label>
                <div><span className={LABEL_CLASS}>Plan length</span><div className="flex border border-[#23372f]/20 bg-white p-1">{([7, 14] as const).map((duration) => <button className={`min-h-9 px-4 text-xs font-semibold ${plannerDuration === duration ? "bg-[#19372d] text-white" : "text-[#58665f]"}`} key={duration} onClick={() => setDuration(duration)} type="button">{duration} days</button>)}</div></div>
                <button className={BUTTON_PRIMARY} onClick={generatePlan} type="button"><CalendarCheck2 className="h-4 w-4" /> Build plan</button>
            </section>

            {plans.length ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex-1"><span className={LABEL_CLASS}>Saved plans</span><select className={INPUT_CLASS} onChange={(event) => setActivePlan(event.target.value)} value={activePlan?.id ?? ""}>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.jobTitle} · {plan.company} · {plan.durationDays} days</option>)}</select></label>
                    {activePlan ? <button aria-label="Delete active plan" className={`${BUTTON_SECONDARY} mt-auto text-[#9a4438]`} onClick={() => removePlan(activePlan.id)} title="Delete plan" type="button"><Trash2 className="h-4 w-4" /> Delete</button> : null}
                </div>
            ) : null}

            {activePlan ? (
                <section className="mt-7">
                    <div className="mb-6 border-y border-[#23372f]/15 bg-[#e8eee8] px-5 py-4">
                        <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{activePlan.jobTitle} · {activePlan.company}</p><p className="mt-1 text-xs text-[#68756f]">{completed} of {total} tasks complete</p></div><span className="font-jetbrains text-lg font-semibold text-[#2f7453]">{progress}%</span></div>
                        <div className="mt-3 h-2 bg-white"><div className="h-full bg-[#2f7453] transition-[width]" style={{ width: `${progress}%` }} /></div>
                    </div>
                    <div className="space-y-7">
                        {Array.from({ length: activePlan.durationDays }, (_, index) => index + 1).map((dayNumber) => {
                            const tasks = activePlan.tasks.filter((task) => task.day === dayNumber);
                            if (!tasks.length) return null;
                            return (
                                <div className="grid gap-3 md:grid-cols-[120px_1fr]" key={dayNumber}>
                                    <div><p className="font-jetbrains text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f7453]">Day {String(dayNumber).padStart(2, "0")}</p><p className="mt-1 text-xs text-[#718079]">{formatDate(tasks[0].date)}</p></div>
                                    <div className="divide-y divide-[#23372f]/10 border-y border-[#23372f]/15 bg-[#fbfaf6]">
                                        {tasks.map((task) => (
                                            <div className="p-4" key={task.id}>
                                                <div className="flex gap-3">
                                                    <button
                                                        aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
                                                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border ${task.completed ? "border-[#2f7453] bg-[#2f7453] text-white" : "border-[#718079] bg-white"}`}
                                                        onClick={() => toggleTask(activePlan.id, task.id)}
                                                        title={task.completed ? "Mark incomplete" : "Mark complete"}
                                                        type="button"
                                                    >
                                                        {task.completed ? <Check className="h-3.5 w-3.5" /> : null}
                                                    </button>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-sm font-semibold ${task.completed ? "text-[#718079] line-through" : ""}`}>{task.title}</p>
                                                        <p className="mt-1 text-xs leading-5 text-[#68756f]">{task.detail}</p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-2"><span className={`px-2 py-1 font-jetbrains text-[8px] uppercase tracking-[0.08em] ${categoryTone(task.category)}`}>{task.category}</span><span className="flex items-center gap-1 text-[10px] text-[#718079]"><Clock3 className="h-3 w-3" /> {task.durationMinutes} min</span><span className="flex items-center gap-1 text-[10px] text-[#718079]"><BookOpenCheck className="h-3 w-3" /> {task.studyNotes.length} lessons · {task.resources.length} sources</span></div>
                                                    </div>
                                                </div>
                                                <details className="mt-3 border border-[#23372f]/12 bg-white">
                                                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#2f7453]">Learn + practice <ChevronDown className="h-4 w-4" /></summary>
                                                    <div className="border-t border-[#23372f]/10 p-3">
                                                        <div className="grid gap-5 lg:grid-cols-2">
                                                            <div><p className={LABEL_CLASS}>Core knowledge</p><ul className="space-y-2">{task.studyNotes.map((note) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={note}><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff7a1a]" />{note}</li>)}</ul></div>
                                                            <div><p className={LABEL_CLASS}>Practice questions</p><ol className="space-y-2">{task.practiceQuestions.map((question, index) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={question}><span className="font-jetbrains text-[9px] text-[#a84708]">{String(index + 1).padStart(2, "0")}</span>{question}</li>)}</ol></div>
                                                        </div>
                                                        <div className="mt-5 border-t border-[#23372f]/10 pt-3"><p className={LABEL_CLASS}>Study resources</p><div className="grid gap-2 sm:grid-cols-2">{task.resources.map((resource) => <a className="border border-[#23372f]/12 bg-[#f8f7f2] p-3 transition hover:border-[#ff7a1a] hover:bg-[#fff5ec]" href={resource.url} key={resource.url} rel="noreferrer" target="_blank"><span className="flex items-start justify-between gap-2 text-xs font-semibold text-[#19372d]">{resource.title}<ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#a84708]" /></span><span className="mt-1 block font-jetbrains text-[8px] uppercase tracking-[0.08em] text-[#2f7453]">{resource.provider}</span><span className="mt-2 block text-[10px] leading-4 text-[#718079]">{resource.note}</span></a>)}</div></div>
                                                    </div>
                                                </details>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ) : <div className="mt-7"><EmptyState icon={CalendarCheck2} title="No preparation plan yet" copy="Analyze a saved job, choose seven or fourteen days, and generate a schedule tailored to its role track." /></div>}
        </>
    );
}

function LearningView({ availableJobs, analyzedJobIds, selectedJobId, setJobId, analysis, customSkill, setCustomSkill, generateRoadmap, roadmaps, activeRoadmap, setActiveRoadmap, toggleDay, updateEvidence, verifySkill }: {
    availableJobs: JobRecord[];
    analyzedJobIds: Set<string>;
    selectedJobId: string;
    setJobId: (jobId: string) => void;
    analysis?: JobAnalysis;
    customSkill: string;
    setCustomSkill: (skill: string) => void;
    generateRoadmap: (skill?: string) => void;
    roadmaps: LearningRoadmap[];
    activeRoadmap?: LearningRoadmap;
    setActiveRoadmap: (roadmapId: string) => void;
    toggleDay: (roadmapId: string, day: number) => void;
    updateEvidence: (roadmapId: string, evidence: string) => void;
    verifySkill: (roadmap: LearningRoadmap) => void;
}) {
    const completedDays = activeRoadmap?.days.filter((day) => day.completed).length ?? 0;
    return (
        <>
            <SectionHeader eyebrow="Gap to evidence" title="Seven-day skill roadmaps" copy="Turn a missing requirement into knowledge, practice, and a proof artifact before adding it to your resume." />
            <section className="border border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <label><span className={LABEL_CLASS}>Roadmap context</span><select className={INPUT_CLASS} onChange={(event) => setJobId(event.target.value)} value={selectedJobId}><option value="__standalone__">Standalone skill roadmap</option>{availableJobs.map((job) => <option key={job.id} value={job.id}>{job.title || "Untitled role"} · {job.company || "Company not set"}{analyzedJobIds.has(job.id) ? " · Analyzed" : " · Saved"}</option>)}</select></label>
                    <label><span className={LABEL_CLASS}>Other skill</span><input className={INPUT_CLASS} onChange={(event) => setCustomSkill(event.target.value)} placeholder="SQL, Jira, Power BI..." value={customSkill} /></label>
                    <button className={BUTTON_PRIMARY} onClick={() => generateRoadmap()} type="button"><GraduationCap className="h-4 w-4" /> Build roadmap</button>
                </div>
                {analysis ? (
                    <div className="mt-5 border-t border-[#23372f]/12 pt-4"><p className="mb-3 font-jetbrains text-[9px] font-semibold uppercase tracking-[0.11em] text-[#68756f]">Detected learning gaps</p>{analysis.missingKeywords.length ? <div className="flex flex-wrap gap-2">{analysis.missingKeywords.map((skill) => <button className="inline-flex items-center gap-1.5 border border-[#a66d20]/25 bg-[#fbefd8] px-2.5 py-1.5 text-xs text-[#80571d] hover:border-[#80571d]" key={skill} onClick={() => generateRoadmap(skill)} type="button">{skill} <Plus className="h-3 w-3" /></button>)}</div> : <p className="text-sm text-[#2f7453]">No detected keyword gaps. Use the field above to deepen any role skill.</p>}</div>
                ) : null}
            </section>

            {roadmaps.length ? <label className="mt-6 block"><span className={LABEL_CLASS}>Saved roadmaps</span><select className={INPUT_CLASS} onChange={(event) => setActiveRoadmap(event.target.value)} value={activeRoadmap?.id ?? ""}>{roadmaps.map((roadmap) => <option key={roadmap.id} value={roadmap.id}>{roadmap.skill} · {roadmap.roleLabel}{roadmap.verified ? " · Verified" : ""}</option>)}</select></label> : null}

            {activeRoadmap ? (
                <div className="mt-7">
                    <section className="border-y border-[#23372f]/15 bg-[#19372d] px-5 py-5 text-white">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-jetbrains text-[9px] uppercase tracking-[0.13em] text-[#ff9a52]">7-day evidence sprint</p><h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>{activeRoadmap.skill}</h2><p className="mt-1 text-sm text-white/60">For {activeRoadmap.roleLabel} · {completedDays}/7 checkpoints</p></div>{activeRoadmap.verified ? <span className="inline-flex items-center gap-2 bg-[#ff7a1a] px-3 py-2 text-xs font-semibold text-[#19372d]"><ShieldCheck className="h-4 w-4" /> Resume-ready evidence confirmed</span> : <span className="font-jetbrains text-2xl font-semibold text-[#ff9a52]">{Math.round((completedDays / 7) * 100)}%</span>}</div>
                        <div className="mt-4 h-2 bg-white/15"><div className="h-full bg-[#ff7a1a]" style={{ width: `${(completedDays / 7) * 100}%` }} /></div>
                    </section>

                    <section className="mt-6">
                        <h3 className="mb-3 text-sm font-semibold">Study materials</h3>
                        <div className="pd-surface grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 md:grid-cols-3">
                            {activeRoadmap.resources.map((resource) => <a className="group bg-[#fbfaf6] p-4 hover:bg-[#edf3ee]" href={resource.url} key={resource.url} rel="noreferrer" target="_blank"><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold">{resource.title}</span><ExternalLink className="h-4 w-4 shrink-0 text-[#2f7453]" /></div><p className="mt-1 font-jetbrains text-[9px] uppercase tracking-[0.1em] text-[#2f7453]">{resource.provider}</p><p className="mt-3 text-xs leading-5 text-[#68756f]">{resource.note}</p></a>)}
                        </div>
                    </section>

                    <section className="mt-7 space-y-4">
                        {activeRoadmap.days.map((day) => (
                            <article className={`grid border border-[#23372f]/15 bg-[#fbfaf6] md:grid-cols-[90px_1fr] ${day.completed ? "opacity-70" : ""}`} key={day.day}>
                                <button aria-label={`${day.completed ? "Mark incomplete" : "Complete"} day ${day.day}`} className={`grid min-h-20 place-items-center border-b border-[#23372f]/12 md:border-b-0 md:border-r ${day.completed ? "bg-[#2f7453] text-white" : "bg-[#e8eee8] text-[#19372d]"}`} onClick={() => toggleDay(activeRoadmap.id, day.day)} type="button"><span className="text-center"><span className="block font-jetbrains text-[9px] uppercase tracking-[0.1em]">Day</span><span className="mt-1 block text-2xl font-semibold">{day.day}</span>{day.completed ? <CheckCircle2 className="mx-auto mt-1 h-4 w-4" /> : null}</span></button>
                                <div className="p-4 sm:p-5"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><h3 className="text-base font-semibold">{day.title}</h3><p className="mt-1 text-sm font-medium text-[#2f7453]">{day.objective}</p></div><span className="font-jetbrains text-[9px] uppercase tracking-[0.1em] text-[#718079]">{day.completed ? "Complete" : "In progress"}</span></div><div className="mt-4 grid gap-4 lg:grid-cols-3"><div><p className={LABEL_CLASS}>Learn</p><p className="text-xs leading-5 text-[#58665f]">{day.lesson}</p></div><div><p className={LABEL_CLASS}>Practice</p><p className="text-xs leading-5 text-[#58665f]">{day.practice}</p></div><div><p className={LABEL_CLASS}>Proof checkpoint</p><p className="text-xs leading-5 text-[#58665f]">{day.checkpoint}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{day.resourceIndexes.map((resourceIndex) => activeRoadmap.resources[resourceIndex] ? <a className="inline-flex items-center gap-1 border border-[#23372f]/15 bg-white px-2 py-1 text-[10px] font-semibold text-[#2f7453]" href={activeRoadmap.resources[resourceIndex].url} key={resourceIndex} rel="noreferrer" target="_blank">{activeRoadmap.resources[resourceIndex].provider} <ExternalLink className="h-3 w-3" /></a> : null)}</div></div>
                            </article>
                        ))}
                    </section>

                    <section className="mt-7 border border-[#23372f]/15 bg-[#fbfaf6] p-5">
                        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2f7453]" /><div><h3 className="text-base font-semibold">Evidence gate</h3><p className="mt-1 text-sm leading-6 text-[#66736c]">Completing videos is not enough. Record an artifact or assessment you can show and explain in an interview.</p></div></div>
                        <label className="mt-4 block"><span className={LABEL_CLASS}>Your evidence</span><textarea className={`${INPUT_CLASS} min-h-28 resize-y`} disabled={activeRoadmap.verified} onChange={(event) => updateEvidence(activeRoadmap.id, event.target.value)} placeholder="Example: Built a three-table job tracker in PostgreSQL, wrote 12 queries including joins and windows, and scored 8/10 in a timed set..." value={activeRoadmap.evidenceNote} /></label>
                        <button className={`${BUTTON_PRIMARY} mt-4`} disabled={activeRoadmap.verified || completedDays < 7} onClick={() => verifySkill(activeRoadmap)} type="button"><ShieldCheck className="h-4 w-4" /> {activeRoadmap.verified ? "Skill added to profile" : "Confirm evidence + add to resume"}</button>
                    </section>
                </div>
            ) : <div className="mt-7"><EmptyState icon={GraduationCap} title="Choose a learning gap" copy="Build a seven-day roadmap with curated material, practical work, and an evidence checkpoint before the skill reaches your resume." /></div>}
        </>
    );
}

function ProfileView({ profile, isOwner, resumeSource, setResumeSource, importingResume, handleResumeFile, applyResumeImport, updateProfile, updateSkillGroup, updateExperience, updateProject, updateEducation, exportBackup, importBackup, resetWorkspace }: {
    profile: CandidateProfile;
    isOwner: boolean;
    resumeSource: string;
    setResumeSource: (value: string) => void;
    importingResume: boolean;
    handleResumeFile: (event: ChangeEvent<HTMLInputElement>) => void;
    applyResumeImport: () => void;
    updateProfile: (patch: Partial<CandidateProfile>) => void;
    updateSkillGroup: (index: number, patch: Partial<SkillGroup>) => void;
    updateExperience: (index: number, patch: Partial<ExperienceEntry>) => void;
    updateProject: (index: number, patch: Partial<ProjectEntry>) => void;
    updateEducation: (index: number, patch: Partial<EducationEntry>) => void;
    exportBackup: () => void;
    importBackup: (event: ChangeEvent<HTMLInputElement>) => void;
    resetWorkspace: () => void;
}) {
    return (
        <>
            <SectionHeader eyebrow="Source of truth" title="Candidate profile" copy="Tailoring can reorder and emphasize this evidence, but it never invents experience outside this profile." action={isProfileReady(profile) ? <span className="inline-flex items-center gap-2 border border-[#2f7453]/25 bg-[#e5f2e8] px-3 py-2 text-xs font-semibold text-[#275f43]"><CheckCircle2 className="h-4 w-4" /> Ready to tailor</span> : <span className="inline-flex items-center gap-2 border border-[#a66d20]/25 bg-[#fbefd8] px-3 py-2 text-xs font-semibold text-[#80571d]"><Circle className="h-4 w-4" /> Profile incomplete</span>} />

            <section className="border border-[#23372f]/15 bg-[#fbfaf6]">
                <div className="flex flex-col justify-between gap-3 border-b border-[#23372f]/12 bg-[#e8eee8] px-5 py-4 sm:flex-row sm:items-center"><div><h2 className="text-sm font-semibold">Import main resume</h2><p className="mt-1 text-xs text-[#68756f]">PDF, DOCX, TXT, Markdown, or pasted text. Files are read only in this browser.</p></div><label className={`${BUTTON_SECONDARY} cursor-pointer`}><Upload className="h-4 w-4" /> {importingResume ? "Reading file" : "Choose resume"}<input accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" disabled={importingResume} onChange={handleResumeFile} type="file" /></label></div>
                <div className="p-4 sm:p-5"><label><span className={LABEL_CLASS}>Resume text</span><textarea className={`${INPUT_CLASS} min-h-48 resize-y text-xs leading-5`} onChange={(event) => setResumeSource(event.target.value)} placeholder="Paste your full current resume here..." value={resumeSource} /></label><div className="mt-3 flex justify-end"><button className={BUTTON_PRIMARY} onClick={applyResumeImport} type="button"><Import className="h-4 w-4" /> Import into profile</button></div></div>
            </section>

            <section className="mt-6 border border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5">
                <h2 className="mb-5 text-base font-semibold">Identity + positioning</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <label><span className={LABEL_CLASS}>Full name</span><input className={INPUT_CLASS} onChange={(event) => updateProfile({ fullName: event.target.value })} value={profile.fullName} /></label>
                    <label><span className={LABEL_CLASS}>Email</span><input className={INPUT_CLASS} onChange={(event) => updateProfile({ email: event.target.value })} type="email" value={profile.email} /></label>
                    <label><span className={LABEL_CLASS}>Phone</span><input className={INPUT_CLASS} onChange={(event) => updateProfile({ phone: event.target.value })} value={profile.phone} /></label>
                    <label><span className={LABEL_CLASS}>Location</span><input className={INPUT_CLASS} onChange={(event) => updateProfile({ location: event.target.value })} value={profile.location} /></label>
                    <label><span className={LABEL_CLASS}>LinkedIn URL</span><input className={INPUT_CLASS} onChange={(event) => updateProfile({ linkedin: event.target.value })} type="url" value={profile.linkedin} /></label>
                    <label><span className={LABEL_CLASS}>Portfolio URL</span><input className={INPUT_CLASS} onChange={(event) => updateProfile({ portfolio: event.target.value })} type="url" value={profile.portfolio} /></label>
                </div>
                <label className="mt-4 block"><span className={LABEL_CLASS}>Base headline</span><input className={INPUT_CLASS} onChange={(event) => updateProfile({ headline: event.target.value })} value={profile.headline} /></label>
                <label className="mt-4 block"><span className={LABEL_CLASS}>Professional summary</span><textarea className={`${INPUT_CLASS} min-h-36 resize-y leading-6`} onChange={(event) => updateProfile({ summary: event.target.value })} value={profile.summary} /></label>
            </section>

            <ProfileArraySection title="Skills" copy="One skill per line or comma-separated. Keep only skills you can explain and demonstrate." onAdd={() => updateProfile({ skillGroups: [...profile.skillGroups, { id: crypto.randomUUID(), name: "New skill group", items: [] }] })}>
                <div className="grid gap-4 lg:grid-cols-2">{profile.skillGroups.map((group, index) => <div className="border border-[#23372f]/12 bg-white p-3" key={group.id}><div className="flex gap-2"><input aria-label="Skill group name" className={`${INPUT_CLASS} font-semibold`} onChange={(event) => updateSkillGroup(index, { name: event.target.value })} value={group.name} /><button aria-label="Remove skill group" className="grid w-10 shrink-0 place-items-center border border-[#a4493d]/20 text-[#a4493d]" onClick={() => updateProfile({ skillGroups: profile.skillGroups.filter((_, groupIndex) => groupIndex !== index) })} title="Remove group" type="button"><Trash2 className="h-4 w-4" /></button></div><textarea aria-label={`${group.name} skills`} className={`${INPUT_CLASS} mt-2 min-h-28 resize-y text-xs leading-5`} onChange={(event) => updateSkillGroup(index, { items: event.target.value.split(/\n|,/).map((item) => item.trim()).filter(Boolean) })} value={group.items.join("\n")} /></div>)}</div>
            </ProfileArraySection>

            <ProfileArraySection title="Experience" copy="Use measurable, truthful bullets. Separate bullets with a new line." onAdd={() => updateProfile({ experiences: [...profile.experiences, { id: crypto.randomUUID(), role: "", company: "", location: "", startDate: "", endDate: "", bullets: [] }] })}>
                <div className="space-y-4">{profile.experiences.map((experience, index) => <details className="border border-[#23372f]/15 bg-white" key={experience.id} open={index === 0}><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold"><span>{experience.role || "New experience"}{experience.company ? ` · ${experience.company}` : ""}</span><ChevronDown className="h-4 w-4" /></summary><div className="border-t border-[#23372f]/12 p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label><span className={LABEL_CLASS}>Role</span><input className={INPUT_CLASS} onChange={(event) => updateExperience(index, { role: event.target.value })} value={experience.role} /></label><label><span className={LABEL_CLASS}>Company</span><input className={INPUT_CLASS} onChange={(event) => updateExperience(index, { company: event.target.value })} value={experience.company} /></label><label><span className={LABEL_CLASS}>Start</span><input className={INPUT_CLASS} onChange={(event) => updateExperience(index, { startDate: event.target.value })} value={experience.startDate} /></label><label><span className={LABEL_CLASS}>End</span><input className={INPUT_CLASS} onChange={(event) => updateExperience(index, { endDate: event.target.value })} value={experience.endDate} /></label></div><label className="mt-3 block"><span className={LABEL_CLASS}>Evidence bullets</span><textarea className={`${INPUT_CLASS} min-h-36 resize-y text-xs leading-5`} onChange={(event) => updateExperience(index, { bullets: event.target.value.split("\n").map((bullet) => bullet.trim()).filter(Boolean) })} value={experience.bullets.join("\n")} /></label><button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#a4493d]" onClick={() => updateProfile({ experiences: profile.experiences.filter((_, experienceIndex) => experienceIndex !== index) })} type="button"><Trash2 className="h-3.5 w-3.5" /> Remove experience</button></div></details>)}</div>
            </ProfileArraySection>

            <ProfileArraySection title="Projects" copy="Projects are useful proof when paid experience does not cover a requirement." onAdd={() => updateProfile({ projects: [...profile.projects, { id: crypto.randomUUID(), name: "", subtitle: "", dates: "", bullets: [] }] })}>
                <div className="space-y-4">{profile.projects.map((project, index) => <details className="border border-[#23372f]/15 bg-white" key={project.id}><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold"><span>{project.name || "New project"}{project.subtitle ? ` · ${project.subtitle}` : ""}</span><ChevronDown className="h-4 w-4" /></summary><div className="border-t border-[#23372f]/12 p-4"><div className="grid gap-3 md:grid-cols-3"><label><span className={LABEL_CLASS}>Project</span><input className={INPUT_CLASS} onChange={(event) => updateProject(index, { name: event.target.value })} value={project.name} /></label><label><span className={LABEL_CLASS}>Subtitle</span><input className={INPUT_CLASS} onChange={(event) => updateProject(index, { subtitle: event.target.value })} value={project.subtitle} /></label><label><span className={LABEL_CLASS}>Dates</span><input className={INPUT_CLASS} onChange={(event) => updateProject(index, { dates: event.target.value })} value={project.dates} /></label></div><label className="mt-3 block"><span className={LABEL_CLASS}>Project bullets</span><textarea className={`${INPUT_CLASS} min-h-28 resize-y text-xs leading-5`} onChange={(event) => updateProject(index, { bullets: event.target.value.split("\n").map((bullet) => bullet.trim()).filter(Boolean) })} value={project.bullets.join("\n")} /></label><button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#a4493d]" onClick={() => updateProfile({ projects: profile.projects.filter((_, projectIndex) => projectIndex !== index) })} type="button"><Trash2 className="h-3.5 w-3.5" /> Remove project</button></div></details>)}</div>
            </ProfileArraySection>

            <ProfileArraySection title="Education" copy="Keep institution, qualification, dates, and result concise." onAdd={() => updateProfile({ education: [...profile.education, { id: crypto.randomUUID(), institution: "", qualification: "", dates: "", detail: "" }] })}>
                <div className="space-y-3">{profile.education.map((education, index) => <div className="grid gap-3 border border-[#23372f]/12 bg-white p-3 md:grid-cols-2 xl:grid-cols-5" key={education.id}><input aria-label="Institution" className={INPUT_CLASS} onChange={(event) => updateEducation(index, { institution: event.target.value })} placeholder="Institution" value={education.institution} /><input aria-label="Qualification" className={`${INPUT_CLASS} xl:col-span-2`} onChange={(event) => updateEducation(index, { qualification: event.target.value })} placeholder="Qualification" value={education.qualification} /><input aria-label="Education dates" className={INPUT_CLASS} onChange={(event) => updateEducation(index, { dates: event.target.value })} placeholder="Dates" value={education.dates} /><div className="flex gap-2"><input aria-label="Education detail" className={INPUT_CLASS} onChange={(event) => updateEducation(index, { detail: event.target.value })} placeholder="CGPA / result" value={education.detail} /><button aria-label="Remove education" className="grid w-10 shrink-0 place-items-center border border-[#a4493d]/20 text-[#a4493d]" onClick={() => updateProfile({ education: profile.education.filter((_, educationIndex) => educationIndex !== index) })} title="Remove education" type="button"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
            </ProfileArraySection>

            <section className="mt-8 border border-[#23372f]/15 bg-[#fbfaf6] p-5">
                <h2 className="text-base font-semibold">Local data controls</h2><p className="mt-1 text-sm leading-6 text-[#68756f]">There is no account database. Download a JSON backup before clearing browser data or moving to another device.</p>
                <div className="mt-4 flex flex-wrap gap-3"><button className={BUTTON_SECONDARY} onClick={exportBackup} type="button"><Download className="h-4 w-4" /> Download backup</button><label className={`${BUTTON_SECONDARY} cursor-pointer`}><Upload className="h-4 w-4" /> Restore backup<input accept="application/json,.json" className="sr-only" onChange={importBackup} type="file" /></label><button className={`${BUTTON_SECONDARY} border-[#a4493d]/25 text-[#a4493d] hover:bg-[#f7e8e5]`} onClick={resetWorkspace} type="button"><RefreshCw className="h-4 w-4" /> Reset {isOwner ? "to Fareeth profile" : "workspace"}</button></div>
            </section>
        </>
    );
}

function ProfileArraySection({ title, copy, onAdd, children }: { title: string; copy: string; onAdd: () => void; children: React.ReactNode }) {
    return (
        <section className="mt-6 border border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-[#68756f]">{copy}</p></div><button aria-label={`Add ${title.toLowerCase()}`} className="grid h-9 w-9 shrink-0 place-items-center border border-[#23372f]/20 bg-white hover:bg-[#e8eee8]" onClick={onAdd} title={`Add ${title.toLowerCase()}`} type="button"><Plus className="h-4 w-4" /></button></div>
            {children}
        </section>
    );
}