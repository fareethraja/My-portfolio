export type SkillGroup = {
    id: string;
    name: string;
    items: string[];
};

export type ExperienceEntry = {
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
};

export type ProjectEntry = {
    id: string;
    name: string;
    subtitle: string;
    dates: string;
    bullets: string[];
};

export type EducationEntry = {
    id: string;
    institution: string;
    qualification: string;
    dates: string;
    detail: string;
};

export type CandidateProfile = {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github: string;
    summary: string;
    sourceText: string;
    skillGroups: SkillGroup[];
    experiences: ExperienceEntry[];
    projects: ProjectEntry[];
    education: EducationEntry[];
    certifications: string[];
    achievements: string[];
};

export type JobStatus =
    | "saved"
    | "applied"
    | "recruiter_screen"
    | "hr_round"
    | "aptitude_round"
    | "assignment_round"
    | "technical_round"
    | "manager_round"
    | "final_round"
    | "other_round"
    | "offer"
    | "rejected"
    | "withdrawn";

export type JobStatusHistoryEntry = {
    id: string;
    status: JobStatus;
    label: string;
    changedAt: string;
};

export type JobRecord = {
    id: string;
    title: string;
    company: string;
    location: string;
    url: string;
    description: string;
    employmentType: string;
    postedAt: string;
    source: string;
    status: JobStatus;
    customStage: string;
    nextRoundAt: string;
    statusHistory: JobStatusHistoryEntry[];
    notes: string;
    savedAt: string;
    updatedAt: string;
};

export type RoleTrack =
    | "product"
    | "analytics"
    | "finance"
    | "marketing"
    | "operations"
    | "people"
    | "technology"
    | "general";

export type JobAnalysis = {
    jobId: string;
    score: number;
    fitLabel: string;
    roleTrack: RoleTrack;
    roleLabel: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    priorityKeywords: string[];
    topRequirements: string[];
    strengths: string[];
    watchouts: string[];
    shortlistSteps: string[];
    interviewQuestions: string[];
    generatedAt: string;
};

export type TailoredResume = {
    jobId: string;
    targetTitle: string;
    targetCompany: string;
    headline: string;
    summary: string;
    skillGroups: SkillGroup[];
    experiences: ExperienceEntry[];
    projects: ProjectEntry[];
    education: EducationEntry[];
    certifications: string[];
    achievements: string[];
    selectedKeywords: string[];
    generatedAt: string;
};

export type PlanCategory = "aptitude" | "role" | "company" | "interview" | "application";

export type PlanTask = {
    id: string;
    day: number;
    date: string;
    title: string;
    detail: string;
    category: PlanCategory;
    durationMinutes: number;
    studyNotes: string[];
    practiceQuestions: string[];
    resources: StudyResource[];
    completed: boolean;
};

export type PreparationPlan = {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    durationDays: 7 | 14;
    createdAt: string;
    tasks: PlanTask[];
};

export type StudyResource = {
    title: string;
    provider: string;
    url: string;
    note: string;
};

export type LearningDay = {
    day: number;
    title: string;
    objective: string;
    lesson: string;
    practice: string;
    checkpoint: string;
    resourceIndexes: number[];
    completed: boolean;
};

export type LearningRoadmap = {
    id: string;
    jobId: string;
    skill: string;
    roleLabel: string;
    createdAt: string;
    resources: StudyResource[];
    days: LearningDay[];
    verified: boolean;
    evidenceNote: string;
};

export type CareerLevel = "internship" | "entry" | "associate" | "any";
export type RemotePreference = "any" | "onsite" | "hybrid" | "remote";

export type CareerPreferences = {
    educationContext: string;
    interests: string;
    workStyles: string[];
    industries: string[];
    targetLevel: CareerLevel;
    preferredLocation: string;
    preferredCountry: string;
    preferredCities: string[];
    customLocation: string;
    remotePreference: RemotePreference;
    selectedRoleTitles: string[];
    targetCompanies: string[];
    recencyDays: 1 | 3 | 7 | 14 | 30;
};

export type RoleSuggestion = {
    id: string;
    title: string;
    track: RoleTrack;
    fitScore: number;
    fitBreakdown: {
        baseline: number;
        profileEvidence: number;
        interestsAndIndustry: number;
        education: number;
        workStyle: number;
    };
    summary: string;
    fitReasons: string[];
    expectedWork: string[];
    supportedSkills: string[];
    bridgeSkills: string[];
    youtubeSearchUrl: string;
};

export type JobSearchResult = {
    id: string;
    title: string;
    company: string;
    location: string;
    url: string;
    description: string;
    employmentType: string;
    postedAt: string;
    source: string;
    isRemote: boolean;
    isTargetCompany: boolean;
    discoveredAt: string;
};

export type SearchLauncher = {
    id: string;
    label: string;
    description: string;
    url: string;
    kind: "target" | "board";
};

export type RoundGuidance = {
    title: string;
    goal: string;
    checklist: string[];
    practice: string[];
    resources: Array<{ label: string; url: string }>;
};

export type OfferCompensation = {
    statedCtcAnnual: number;
    basicAnnual: number;
    annualGrossSalary: number;
    annualVariablePay: number;
    variablePayoutPercent: number;
    performanceBonusAnnual: number;
    performanceBonusPayoutPercent: number;
    joiningBonus: number;
    retentionBonus: number;
    retentionPayoutPercent: number;
    employerPfAnnual: number;
    employeePfAnnual: number;
    gratuityAnnual: number;
    insuranceBenefitsAnnual: number;
    otherCtcAnnual: number;
    otherTaxableIncomeAnnual: number;
    professionalTaxMonthly: number;
    otherDeductionMonthly: number;
    oldRegimeDeductionsAnnual: number;
    grossWasEstimated: boolean;
    employeePfWasEstimated: boolean;
};

export type OfferDetails = {
    company: string;
    role: string;
    location: string;
    workMode: string;
    joiningDate: string;
    acceptanceDeadline: string;
    probationMonths: number;
    noticeDays: number;
};

export type OfferFindingSeverity = "warning" | "clarify" | "standard" | "positive";

export type OfferFinding = {
    id: string;
    severity: OfferFindingSeverity;
    title: string;
    explanation: string;
    excerpt: string;
    question: string;
};

export type OfferNegotiationInputs = {
    currentCtcAnnual: number;
    competingOfferAnnual: number;
    marketMinimumAnnual: number;
    marketMedianAnnual: number;
    marketMaximumAnnual: number;
    leverageNotes: string;
    priorities: string[];
};

export type OfferAnalysis = {
    id: string;
    source: "tracked" | "standalone";
    jobId: string;
    fileName: string;
    rawText: string;
    analyzedAt: string;
    details: OfferDetails;
    compensation: OfferCompensation;
    findings: OfferFinding[];
    negotiation: OfferNegotiationInputs;
    notes: string;
};

export type TaxRegime = "new" | "old";

export type TakeHomeEstimate = {
    regime: TaxRegime;
    financialYear: "2026-27";
    annualCashGross: number;
    expectedVariablePay: number;
    taxableIncome: number;
    incomeTaxBeforeCess: number;
    surcharge: number;
    cess: number;
    annualTax: number;
    annualEmployeePf: number;
    annualProfessionalTax: number;
    annualOtherDeductions: number;
    annualNetCash: number;
    regularMonthlyInHand: number;
    averageMonthlyEquivalent: number;
    effectiveTaxRate: number;
    assumptions: string[];
    warnings: string[];
};

export type NegotiationAdvice = {
    offerAnnual: number;
    marketPosition: string;
    recommendation: "clarify-first" | "optional" | "consider-asking" | "strong-case";
    suggestedAskLow: number;
    suggestedAskHigh: number;
    rationale: string[];
    nonCashOptions: string[];
    hrReply: string;
};

export type WorkspaceState = {
    version: 1;
    profile: CandidateProfile;
    jobs: JobRecord[];
    latestJobId: string;
    analyses: Record<string, JobAnalysis>;
    resumes: Record<string, TailoredResume>;
    plans: PreparationPlan[];
    activePlanId: string;
    learningRoadmaps: LearningRoadmap[];
    activeLearningRoadmapId: string;
    careerPreferences: CareerPreferences;
    roleSuggestions: RoleSuggestion[];
    jobSearchResults: JobSearchResult[];
    lastJobSearchAt: string;
    offerAnalyses: Record<string, OfferAnalysis>;
    activeOfferJobId: string;
};

export type ExtractedJob = {
    title: string;
    company: string;
    location: string;
    description: string;
    employmentType: string;
    postedAt: string;
    source: string;
    url: string;
};