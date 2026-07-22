"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Banknote,
    Building2,
    Calculator,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Copy,
    ExternalLink,
    FileSearch,
    FileText,
    Info,
    LoaderCircle,
    MessageSquareText,
    Scale,
    ShieldAlert,
    Sparkles,
    Target,
    ThumbsUp,
    Upload,
    WalletCards,
} from "lucide-react";

import { extractOfferFileText } from "@/lib/job-assistant/offer-import";
import {
    buildNegotiationAdvice,
    calculateTakeHome,
    formatInr,
    parseOfferLetter,
    refreshOfferFindings,
} from "@/lib/job-assistant/offer";
import type {
    JobRecord,
    OfferAnalysis,
    OfferCompensation,
    OfferDetails,
    OfferFindingSeverity,
    OfferNegotiationInputs,
    TaxRegime,
} from "@/lib/job-assistant/types";

const INPUT_CLASS =
    "w-full rounded-lg border border-[#23372f]/20 bg-white px-3 py-2.5 text-sm text-[#17211c] outline-none transition placeholder:text-[#8b958f] focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/20";
const LABEL_CLASS = "mb-1.5 block font-jetbrains text-[10px] font-semibold uppercase tracking-[0.12em] text-[#58665f]";
const BUTTON_PRIMARY =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#19372d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f7453] disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_SECONDARY =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#23372f]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#23372f] transition hover:border-[#ff7a1a] hover:bg-[#fff5ec] disabled:cursor-not-allowed disabled:opacity-50";

const PRIORITIES = ["Higher fixed pay", "Lower variable share", "Joining bonus", "Earlier review", "Hybrid/remote", "Role/title", "Notice buyout", "Learning budget"];
const NEW_STANDALONE_OFFER = "__standalone_new__";
const EMPTY_STANDALONE_DETAILS = { company: "", role: "", location: "" };

function PageHeader({ action }: { action?: ReactNode }) {
    return (
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#23372f]/15 pb-5 sm:flex-row sm:items-end">
            <div>
                <p className="mb-2 font-jetbrains text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f7453]">Stage 06 · Decide</p>
                <h1 className="text-2xl font-semibold leading-tight text-[#17211c] sm:text-[1.75rem]" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>Offer letter analyzer</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6862]">Understand CTC versus cash, estimate take-home, inspect clauses, and prepare a calm HR conversation before accepting.</p>
            </div>
            {action}
        </div>
    );
}

function CurrencyInput({ label, value, onChange, hint, disabled = false }: { label: string; value: number; onChange: (value: number) => void; hint?: string; disabled?: boolean }) {
    return (
        <label>
            <span className={LABEL_CLASS}>{label}</span>
            <div className="relative"><span className="pointer-events-none absolute left-3 top-2.5 text-sm text-[#718079]">₹</span><input aria-label={label} className={`${INPUT_CLASS} pl-7`} disabled={disabled} inputMode="numeric" min="0" onChange={(event) => onChange(Number(event.target.value) || 0)} placeholder="0" type="number" value={value || ""} /></div>
            {hint ? <span className="mt-1 block text-[10px] leading-4 text-[#7a857f]">{hint}</span> : null}
        </label>
    );
}

function Metric({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: "default" | "green" | "amber" | "blue" }) {
    const color = tone === "green" ? "text-[#2f7453]" : tone === "amber" ? "text-[#94611d]" : tone === "blue" ? "text-[#2c698d]" : "text-[#17211c]";
    return <div className="border-b border-r border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5"><p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.11em] text-[#68756f]">{label}</p><p className={`mt-3 text-2xl font-semibold ${color}`} style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>{value}</p><p className="mt-1 text-xs leading-5 text-[#718079]">{detail}</p></div>;
}

function severityStyle(severity: OfferFindingSeverity): { icon: typeof AlertTriangle; border: string; badge: string; label: string } {
    if (severity === "warning") return { icon: ShieldAlert, border: "border-l-[#a4493d]", badge: "bg-[#f7e6e3] text-[#8a3c33]", label: "Warning" };
    if (severity === "clarify") return { icon: MessageSquareText, border: "border-l-[#a66d20]", badge: "bg-[#fbefd8] text-[#80571d]", label: "Clarify" };
    if (severity === "positive") return { icon: ThumbsUp, border: "border-l-[#2f7453]", badge: "bg-[#e4f1e7] text-[#275f43]", label: "Good" };
    return { icon: Info, border: "border-l-[#52728a]", badge: "bg-[#e7f0f5] text-[#355d75]", label: "Standard" };
}

function CopyButton({ value, copiedKey, label, onCopied }: { value: string; copiedKey: string; label: string; onCopied: (key: string) => void }) {
    return <button className={BUTTON_SECONDARY} onClick={async () => { await navigator.clipboard.writeText(value); onCopied(copiedKey); }} type="button"><Copy className="h-4 w-4" /> {label}</button>;
}

export function OfferAnalyzerView({
    inviteId,
    jobs,
    selectedOfferId,
    offers,
    setSelectedOfferId,
    saveOffer,
    deleteOffer,
    markOfferReceived,
    notify,
}: {
    inviteId: string;
    jobs: JobRecord[];
    selectedOfferId: string;
    offers: Record<string, OfferAnalysis>;
    setSelectedOfferId: (offerId: string) => void;
    saveOffer: (offer: OfferAnalysis) => void;
    deleteOffer: (offerId: string) => void;
    markOfferReceived: (jobId: string) => void;
    notify: (message: string) => void;
}) {
    const selectedJob = jobs.find((job) => job.id === selectedOfferId);
    const offer = selectedOfferId !== NEW_STANDALONE_OFFER ? offers[selectedOfferId] : undefined;
    const standaloneMode = selectedOfferId === NEW_STANDALONE_OFFER || offer?.source === "standalone" || Boolean(offer && !offer.jobId);
    const standaloneOffers = Object.entries(offers).filter(([, candidate]) => candidate.source === "standalone" || !candidate.jobId);
    const [sourceText, setSourceText] = useState("");
    const [fileName, setFileName] = useState("Pasted offer letter");
    const [readingFile, setReadingFile] = useState(false);
    const [regime, setRegime] = useState<TaxRegime>("new");
    const [copied, setCopied] = useState("");
    const [standaloneDetails, setStandaloneDetails] = useState(EMPTY_STANDALONE_DETAILS);

    useEffect(() => {
        setSourceText(offer?.rawText ?? "");
        setFileName(offer?.fileName ?? "Pasted offer letter");
        setStandaloneDetails(offer && (offer.source === "standalone" || !offer.jobId)
            ? { company: offer.details.company, role: offer.details.role, location: offer.details.location }
            : EMPTY_STANDALONE_DETAILS);
    }, [offer, selectedOfferId]);

    async function handleOfferFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (file.size > 10_000_000) {
            notify("Choose an offer file smaller than 10 MB.");
            return;
        }
        setReadingFile(true);
        try {
            let usedTransientFallback = false;
            let text: string;
            try {
                text = await Promise.race([
                    extractOfferFileText(file),
                    new Promise<never>((_, reject) => window.setTimeout(
                        () => reject(new Error("Local PDF parser did not initialize in time.")),
                        12_000,
                    )),
                ]);
            } catch (localError) {
                const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                if (!isPdf) throw localError;
                const form = new FormData();
                form.set("inviteId", inviteId);
                form.set("file", file);
                const response = await fetch("/api/job-assistant/offer-text", { method: "POST", body: form });
                const payload = (await response.json()) as { text?: string; error?: string };
                if (!response.ok || !payload.text) throw new Error(payload.error ?? "Unable to read this signed PDF.");
                text = payload.text;
                usedTransientFallback = true;
            }
            setSourceText(text);
            setFileName(file.name);
            notify(usedTransientFallback
                ? `The browser parser stalled, so ${file.name} was read through the authenticated transient fallback. The file was not stored.`
                : `Offer text extracted locally from ${file.name}. Review it, then analyze.`);
        } catch (error) {
            notify(error instanceof Error ? error.message : "That offer file could not be read.");
        } finally {
            setReadingFile(false);
        }
    }

    function analyze() {
        if (!selectedJob && !standaloneMode) {
            notify("Choose a tracked job or standalone offer.");
            return;
        }
        if (standaloneMode && (!standaloneDetails.company.trim() || !standaloneDetails.role.trim())) {
            notify("Add the company and role for this standalone offer.");
            return;
        }
        if (sourceText.trim().length < 80) {
            notify("Upload or paste a fuller offer letter before analysis.");
            return;
        }
        const analysis = parseOfferLetter(sourceText, selectedJob, fileName);
        if (standaloneMode) {
            analysis.source = "standalone";
            analysis.jobId = "";
            analysis.details = {
                ...analysis.details,
                company: standaloneDetails.company.trim(),
                role: standaloneDetails.role.trim(),
                location: standaloneDetails.location.trim(),
            };
            if (offer) analysis.id = offer.id;
        }
        if (offer) {
            analysis.negotiation = offer.negotiation;
            analysis.notes = offer.notes;
        }
        saveOffer(analysis);
        notify(standaloneMode
            ? "Standalone offer analyzed and saved separately from the job tracker. Verify every parsed amount."
            : "Tracked offer analyzed. Verify every parsed amount against the salary annexure.");
    }

    function updateCompensation(key: keyof OfferCompensation, value: number | boolean) {
        if (!offer) return;
        const next = {
            ...offer,
            compensation: {
                ...offer.compensation,
                [key]: value,
                ...(key === "annualGrossSalary" ? { grossWasEstimated: false } : {}),
                ...(key === "employeePfAnnual" ? { employeePfWasEstimated: false } : {}),
            },
        };
        saveOffer(refreshOfferFindings(next));
    }

    function updateDetails(key: keyof OfferDetails, value: string | number) {
        if (!offer) return;
        const next = { ...offer, details: { ...offer.details, [key]: value } };
        saveOffer(key === "noticeDays" ? refreshOfferFindings(next) : next);
    }

    function updateNegotiation(key: keyof OfferNegotiationInputs, value: number | string | string[]) {
        if (!offer) return;
        saveOffer({ ...offer, negotiation: { ...offer.negotiation, [key]: value } });
    }

    function togglePriority(priority: string) {
        if (!offer) return;
        const priorities = offer.negotiation.priorities.includes(priority)
            ? offer.negotiation.priorities.filter((item) => item !== priority)
            : [...offer.negotiation.priorities, priority];
        updateNegotiation("priorities", priorities);
    }

    const newEstimate = offer ? calculateTakeHome(offer.compensation, "new") : undefined;
    const oldEstimate = offer ? calculateTakeHome(offer.compensation, "old") : undefined;
    const estimate = regime === "new" ? newEstimate : oldEstimate;
    const computedCtc = offer ?
        offer.compensation.annualGrossSalary +
        offer.compensation.annualVariablePay +
        offer.compensation.employerPfAnnual +
        offer.compensation.gratuityAnnual +
        offer.compensation.insuranceBenefitsAnnual +
        offer.compensation.otherCtcAnnual
        : 0;
    const ctcGap = offer?.compensation.statedCtcAnnual ? computedCtc - offer.compensation.statedCtcAnnual : 0;
    const advice = offer ? buildNegotiationAdvice(offer) : undefined;
    const clarificationReply = offer ? [
        "Subject: Clarification on offer terms",
        "",
        "Hi [HR name],",
        "",
        `Thank you for sharing the offer for the ${offer.details.role || "role"} position. I am excited about the opportunity and would like to clarify a few points before confirming:`,
        "",
        ...offer.findings.filter((finding) => finding.severity === "warning" || finding.severity === "clarify").slice(0, 5).map((finding, index) => `${index + 1}. ${finding.question}`),
        "",
        "These questions are only to make sure I understand the structure and terms correctly. I appreciate your help and remain very interested in the role.",
        "",
        "Best regards,",
        "[Your name]",
    ].join("\n") : "";
    const salarySearchQuery = encodeURIComponent(`${selectedJob?.title ?? offer?.details.role ?? standaloneDetails.role ?? "role"} salary ${selectedJob?.location ?? offer?.details.location ?? standaloneDetails.location ?? "India"}`);

    return (
        <>
            <PageHeader action={<label><span className={LABEL_CLASS}>Offer source</span><select className={`${INPUT_CLASS} min-w-[290px]`} onChange={(event) => setSelectedOfferId(event.target.value)} value={selectedOfferId}><option value={NEW_STANDALONE_OFFER}>+ New standalone offer</option>{standaloneOffers.length ? <optgroup label="Saved standalone offers">{standaloneOffers.map(([offerId, candidate]) => <option key={offerId} value={offerId}>{candidate.details.role || "Offer"} · {candidate.details.company || candidate.fileName}</option>)}</optgroup> : null}{jobs.length ? <optgroup label="Tracked jobs">{jobs.map((job) => <option key={job.id} value={job.id}>{job.title || "Untitled role"} · {job.company || "Company"}</option>)}</optgroup> : null}</select></label>} />

            <div className="mb-6 flex gap-3 border-l-4 border-[#52728a] bg-[#e8f0f3] px-4 py-3 text-xs leading-5 text-[#35566a]"><Scale className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Decision support, not legal/tax advice.</strong> Parsing can miss table structure, payroll depends on employer/state facts, and clause enforceability is context-specific. Verify amounts with HR, use the official Income Tax estimator, and consult a CA or employment lawyer for material decisions.</p></div>

            <section className="border border-[#23372f]/15 bg-[#fbfaf6]">
                <div className="grid gap-px bg-[#23372f]/12 lg:grid-cols-[0.72fr_1.28fr]">
                    <div className="bg-[#e8eee8] p-5">
                        <p className={LABEL_CLASS}>{standaloneMode ? "Standalone offer" : "Connected application"}</p>
                        {standaloneMode ? <div className="space-y-3"><label><span className="sr-only">Standalone company</span><input className={INPUT_CLASS} onChange={(event) => setStandaloneDetails((current) => ({ ...current, company: event.target.value }))} placeholder="Company *" value={standaloneDetails.company} /></label><label><span className="sr-only">Standalone role</span><input className={INPUT_CLASS} onChange={(event) => setStandaloneDetails((current) => ({ ...current, role: event.target.value }))} placeholder="Role title *" value={standaloneDetails.role} /></label><label><span className="sr-only">Standalone location</span><input className={INPUT_CLASS} onChange={(event) => setStandaloneDetails((current) => ({ ...current, location: event.target.value }))} placeholder="Location (optional)" value={standaloneDetails.location} /></label><span className="inline-flex border border-[#a84708]/25 bg-[#fff0e4] px-2.5 py-1.5 font-jetbrains text-[9px] uppercase tracking-[0.08em] text-[#8f3d08]">Not linked to tracker</span></div> : selectedJob ? <div><h2 className="text-base font-semibold">{selectedJob.title || "Untitled role"}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-[#68756f]"><Building2 className="h-3.5 w-3.5" /> {selectedJob.company || "Company not set"}</p><span className="mt-3 inline-flex border border-[#2f7453]/25 bg-[#e4f1e7] px-2.5 py-1.5 font-jetbrains text-[9px] uppercase tracking-[0.08em] text-[#275f43]">Stage: {selectedJob.status.replaceAll("_", " ")}</span></div> : <p className="text-sm text-[#68756f]">Choose a source above.</p>}
                        <label className={`${BUTTON_SECONDARY} mt-5 w-full cursor-pointer`}><Upload className="h-4 w-4" /> {readingFile ? "Reading locally" : "Upload offer letter"}<input accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="sr-only" disabled={readingFile} onChange={handleOfferFile} type="file" /></label>
                        <p className="mt-2 text-[10px] leading-4 text-[#718079]">PDF, DOCX, TXT, or MD · max 10 MB. Local first; stalled PDFs use an authenticated in-memory fallback and are not stored.</p>
                    </div>
                    <div className="bg-[#fbfaf6] p-4 sm:p-5">
                        <label><span className={LABEL_CLASS}>Offer letter text</span><textarea className={`${INPUT_CLASS} min-h-[230px] resize-y text-xs leading-5`} onChange={(event) => { setSourceText(event.target.value); setFileName("Pasted offer letter"); }} placeholder="Upload the offer or paste all pages, including the compensation annexure and employment terms..." value={sourceText} /></label>
                        <div className="mt-3 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center"><p className="text-[10px] text-[#718079]">{sourceText.length.toLocaleString("en-IN")} characters · {fileName}</p><button className={BUTTON_PRIMARY} disabled={sourceText.trim().length < 80 || readingFile || (standaloneMode && (!standaloneDetails.company.trim() || !standaloneDetails.role.trim()))} onClick={analyze} type="button">{readingFile ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />} Analyze offer</button></div>
                    </div>
                </div>
            </section>

            {!offer ? (
                <div className="pd-surface mt-7 border border-dashed border-[#23372f]/25 bg-[#f8f7f2] px-6 py-10 text-center"><FileText className="mx-auto h-7 w-7 text-[#718079]" /><h2 className="mt-3 text-base font-semibold">Offer results appear here</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#66736c]">Connect the tracked job, provide the complete offer text, and analyze. All resulting data stays under this username in this browser.</p></div>
            ) : (
                <div className="mt-9 space-y-9">
                    <section>
                        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2f7453]">Verify parser output</p><h2 className="mt-1 text-lg font-semibold">Offer facts + compensation</h2><p className="mt-1 text-xs text-[#718079]">{offer.source === "standalone" ? "Standalone analysis · no tracker status or saved job data is used." : "Linked to the selected tracked job."}</p></div><div className="flex flex-wrap gap-2">{selectedJob && offer.jobId ? <button className={BUTTON_SECONDARY} onClick={() => markOfferReceived(offer.jobId)} type="button"><ClipboardCheck className="h-4 w-4" /> Mark job as offer received</button> : null}{offer.source === "standalone" ? <button className={`${BUTTON_SECONDARY} text-[#9a4438]`} onClick={() => deleteOffer(offer.id)} type="button"><FileText className="h-4 w-4" /> Delete standalone analysis</button> : null}</div></div>
                        <div className="border border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label><span className={LABEL_CLASS}>Company</span><input className={INPUT_CLASS} onChange={(event) => updateDetails("company", event.target.value)} value={offer.details.company} /></label><label><span className={LABEL_CLASS}>Role</span><input className={INPUT_CLASS} onChange={(event) => updateDetails("role", event.target.value)} value={offer.details.role} /></label><label><span className={LABEL_CLASS}>Location</span><input className={INPUT_CLASS} onChange={(event) => updateDetails("location", event.target.value)} value={offer.details.location} /></label><label><span className={LABEL_CLASS}>Work mode</span><input className={INPUT_CLASS} onChange={(event) => updateDetails("workMode", event.target.value)} placeholder="Hybrid" value={offer.details.workMode} /></label><label><span className={LABEL_CLASS}>Joining date</span><input className={INPUT_CLASS} onChange={(event) => updateDetails("joiningDate", event.target.value)} placeholder="As written" value={offer.details.joiningDate} /></label><label><span className={LABEL_CLASS}>Acceptance deadline</span><input className={INPUT_CLASS} onChange={(event) => updateDetails("acceptanceDeadline", event.target.value)} placeholder="As written" value={offer.details.acceptanceDeadline} /></label><label><span className={LABEL_CLASS}>Probation · months</span><input className={INPUT_CLASS} min="0" onChange={(event) => updateDetails("probationMonths", Number(event.target.value) || 0)} type="number" value={offer.details.probationMonths || ""} /></label><label><span className={LABEL_CLASS}>Notice · days</span><input className={INPUT_CLASS} min="0" onChange={(event) => updateDetails("noticeDays", Number(event.target.value) || 0)} type="number" value={offer.details.noticeDays || ""} /></label></div>
                        </div>

                        {offer.compensation.grossWasEstimated ? <div className="mt-3 flex gap-2 border-l-4 border-[#a66d20] bg-[#fbefd8] px-4 py-3 text-xs leading-5 text-[#80571d]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Annual gross was inferred from CTC minus detected components. Replace it with the employer’s actual annual gross before relying on take-home.</span></div> : null}
                        {offer.compensation.employeePfWasEstimated ? <div className="mt-3 flex gap-2 border-l-4 border-[#a66d20] bg-[#fbefd8] px-4 py-3 text-xs leading-5 text-[#80571d]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Employee PF was estimated as 12% of basic pay. Replace it with the employer’s actual annual payroll deduction because PF caps and policy can differ.</span></div> : null}

                        <div className="pd-surface mt-4 grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 lg:grid-cols-3">
                            <div className="bg-[#fbfaf6] p-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Banknote className="h-4 w-4 text-[#2f7453]" /> Headline + recurring cash</h3><div className="space-y-4"><CurrencyInput hint="Headline amount in the letter." label="Stated annual CTC" onChange={(value) => updateCompensation("statedCtcAnnual", value)} value={offer.compensation.statedCtcAnnual} /><CurrencyInput hint="Useful for PF/HRA checks." label="Annual basic pay" onChange={(value) => updateCompensation("basicAnnual", value)} value={offer.compensation.basicAnnual} /><CurrencyInput hint="Recurring cash before employee PF, professional tax, and TDS." label="Annual gross salary" onChange={(value) => updateCompensation("annualGrossSalary", value)} value={offer.compensation.annualGrossSalary} /></div></div>
                            <div className="bg-[#fbfaf6] p-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-[#94611d]" /> Conditional + one-time</h3><div className="space-y-4"><CurrencyInput hint="Variable amount included in the stated CTC table." label="In-CTC variable pay" onChange={(value) => updateCompensation("annualVariablePay", value)} value={offer.compensation.annualVariablePay} /><label><span className={LABEL_CLASS}>Expected in-CTC variable payout</span><div className="flex items-center gap-3"><input className="h-2 flex-1 accent-[#2f7453]" max="100" min="0" onChange={(event) => updateCompensation("variablePayoutPercent", Number(event.target.value))} type="range" value={offer.compensation.variablePayoutPercent ?? 100} /><span className="w-12 text-right font-jetbrains text-xs">{offer.compensation.variablePayoutPercent ?? 100}%</span></div></label><CurrencyInput hint="Separate discretionary upside; excluded from core CTC reconciliation." label="Additional performance bonus" onChange={(value) => updateCompensation("performanceBonusAnnual", value)} value={offer.compensation.performanceBonusAnnual ?? 0} /><label><span className={LABEL_CLASS}>Expected performance bonus payout</span><div className="flex items-center gap-3"><input className="h-2 flex-1 accent-[#ff7a1a]" max="100" min="0" onChange={(event) => updateCompensation("performanceBonusPayoutPercent", Number(event.target.value))} type="range" value={offer.compensation.performanceBonusPayoutPercent ?? 0} /><span className="w-12 text-right font-jetbrains text-xs">{offer.compensation.performanceBonusPayoutPercent ?? 0}%</span></div></label><CurrencyInput label="Joining / sign-on bonus" onChange={(value) => updateCompensation("joiningBonus", value)} value={offer.compensation.joiningBonus} /><CurrencyInput hint="Included in annual equivalent only when eligibility is expected." label="Retention bonus" onChange={(value) => updateCompensation("retentionBonus", value)} value={offer.compensation.retentionBonus} /><label><span className={LABEL_CLASS}>Expected retention eligibility</span><div className="flex items-center gap-3"><input className="h-2 flex-1 accent-[#ff7a1a]" max="100" min="0" onChange={(event) => updateCompensation("retentionPayoutPercent", Number(event.target.value))} type="range" value={offer.compensation.retentionPayoutPercent ?? 100} /><span className="w-12 text-right font-jetbrains text-xs">{offer.compensation.retentionPayoutPercent ?? 100}%</span></div></label></div></div>
                            <div className="bg-[#fbfaf6] p-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><WalletCards className="h-4 w-4 text-[#2c698d]" /> Employer CTC, not monthly cash</h3><div className="space-y-4"><CurrencyInput label="Employer PF" onChange={(value) => updateCompensation("employerPfAnnual", value)} value={offer.compensation.employerPfAnnual} /><CurrencyInput label="Gratuity provision" onChange={(value) => updateCompensation("gratuityAnnual", value)} value={offer.compensation.gratuityAnnual} /><CurrencyInput label="Insurance / benefits value" onChange={(value) => updateCompensation("insuranceBenefitsAnnual", value)} value={offer.compensation.insuranceBenefitsAnnual} /><CurrencyInput label="Other CTC components" onChange={(value) => updateCompensation("otherCtcAnnual", value)} value={offer.compensation.otherCtcAnnual} /></div></div>
                        </div>

                        <div className="mt-4 border border-[#23372f]/15 bg-[#fbfaf6] p-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Calculator className="h-4 w-4 text-[#2f7453]" /> Employee deductions + tax inputs</h3><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><CurrencyInput hint="Annual payroll deduction." label="Employee PF / year" onChange={(value) => updateCompensation("employeePfAnnual", value)} value={offer.compensation.employeePfAnnual} /><CurrencyInput label="Professional tax / month" onChange={(value) => updateCompensation("professionalTaxMonthly", value)} value={offer.compensation.professionalTaxMonthly} /><CurrencyInput label="Other deductions / month" onChange={(value) => updateCompensation("otherDeductionMonthly", value)} value={offer.compensation.otherDeductionMonthly} /><CurrencyInput label="Other taxable income / year" onChange={(value) => updateCompensation("otherTaxableIncomeAnnual", value)} value={offer.compensation.otherTaxableIncomeAnnual} /><CurrencyInput hint="80C/HRA/NPS etc. beyond standard deduction; verify eligibility." label="Old-regime deductions" onChange={(value) => updateCompensation("oldRegimeDeductionsAnnual", value)} value={offer.compensation.oldRegimeDeductionsAnnual} /></div></div>
                    </section>

                    {estimate && newEstimate && oldEstimate ? (
                        <section>
                            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2f7453]">FY 2026-27 salary estimate</p><h2 className="mt-1 text-lg font-semibold">What may reach the bank</h2></div><div className="flex border border-[#23372f]/20 bg-white p-1">{(["new", "old"] as TaxRegime[]).map((value) => <button className={`min-h-9 px-4 text-xs font-semibold ${regime === value ? "bg-[#19372d] text-white" : "text-[#58665f]"}`} key={value} onClick={() => setRegime(value)} type="button">{value === "new" ? "New regime" : "Old regime"}</button>)}</div></div>

                            {ctcGap !== 0 && Math.abs(ctcGap) > Math.max(5_000, offer.compensation.statedCtcAnnual * 0.01) ? <div className="mb-3 flex gap-2 border-l-4 border-[#a66d20] bg-[#fbefd8] px-4 py-3 text-xs leading-5 text-[#80571d]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>Entered components total {formatInr(computedCtc)}, which differs from stated CTC by {formatInr(Math.abs(ctcGap))}. Check for a missing or double-counted item.</span></div> : null}

                            <div className="pd-surface grid border-l border-t border-[#23372f]/15 sm:grid-cols-2 xl:grid-cols-4"><Metric detail="Recurring gross minus estimated monthly TDS, employee PF, professional tax, and other payroll deductions." label="Regular month in-hand" tone="green" value={formatInr(estimate.regularMonthlyInHand)} /><Metric detail="Includes expected variable and one-time bonuses, spread across 12 months for comparison." label="Monthly equivalent" tone="blue" value={formatInr(estimate.averageMonthlyEquivalent)} /><Metric detail={`${regime === "new" ? "New/default" : "Old"} regime including surcharge estimate and 4% cess.`} label="Estimated annual tax" tone="amber" value={formatInr(estimate.annualTax)} /><Metric detail="Cash after modeled tax and employee payroll deductions; employer PF/gratuity/insurance excluded." label="Estimated annual net cash" value={formatInr(estimate.annualNetCash)} /></div>

                            <div className="pd-surface mt-4 grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 lg:grid-cols-[1fr_0.8fr]">
                                <div className="bg-[#fbfaf6] p-5"><h3 className="text-sm font-semibold">Annual flow</h3><dl className="mt-4 divide-y divide-[#23372f]/10 text-xs">{[
                                    ["Annual cash gross", estimate.annualCashGross],
                                    ["Taxable income", estimate.taxableIncome],
                                    ["Income tax before cess", estimate.incomeTaxBeforeCess],
                                    ["Surcharge", estimate.surcharge],
                                    ["Health + education cess", estimate.cess],
                                    ["Employee PF", estimate.annualEmployeePf],
                                    ["Professional tax", estimate.annualProfessionalTax],
                                    ["Other payroll deductions", estimate.annualOtherDeductions],
                                    ["Net cash estimate", estimate.annualNetCash],
                                ].map(([label, amount], index) => <div className={`flex items-center justify-between gap-4 py-2.5 ${index === 8 ? "font-semibold text-[#2f7453]" : "text-[#58665f]"}`} key={String(label)}><dt>{label}</dt><dd>{formatInr(Number(amount))}</dd></div>)}</dl></div>
                                <div className="bg-[#f2f3ee] p-5"><h3 className="text-sm font-semibold">Regime check</h3><div className="mt-4 space-y-3"><div className={`border p-3 ${newEstimate.annualTax <= oldEstimate.annualTax ? "border-[#2f7453] bg-[#e4f1e7]" : "border-[#23372f]/15 bg-white"}`}><p className="font-jetbrains text-[9px] uppercase tracking-[0.1em] text-[#58665f]">New regime</p><p className="mt-1 text-lg font-semibold">{formatInr(newEstimate.annualTax)}</p></div><div className={`border p-3 ${oldEstimate.annualTax < newEstimate.annualTax ? "border-[#2f7453] bg-[#e4f1e7]" : "border-[#23372f]/15 bg-white"}`}><p className="font-jetbrains text-[9px] uppercase tracking-[0.1em] text-[#58665f]">Old regime</p><p className="mt-1 text-lg font-semibold">{formatInr(oldEstimate.annualTax)}</p></div></div><p className="mt-4 text-xs leading-5 text-[#68756f]">Lower modeled tax: <strong>{newEstimate.annualTax <= oldEstimate.annualTax ? "new regime" : "old regime"}</strong>. This is only as accurate as the entered eligible old-regime deductions and other income.</p><a className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2f7453]" href="https://www.incometax.gov.in/iec/foportal/income-tax-estimator" rel="noreferrer" target="_blank">Verify with official estimator <ExternalLink className="h-3.5 w-3.5" /></a></div>
                            </div>

                            <details className="mt-4 border border-[#23372f]/15 bg-[#fbfaf6]"><summary className="cursor-pointer px-4 py-3 text-xs font-semibold">Calculation assumptions + limitations</summary><div className="border-t border-[#23372f]/10 p-4"><ul className="space-y-2">{estimate.assumptions.map((assumption) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={assumption}><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f7453]" /> {assumption}</li>)}{estimate.warnings.map((warning) => <li className="flex gap-2 text-xs leading-5 text-[#80571d]" key={warning}><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {warning}</li>)}</ul><a className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2f7453]" href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2098353" rel="noreferrer" target="_blank">Government slab source <ExternalLink className="h-3.5 w-3.5" /></a></div></details>
                        </section>
                    ) : null}

                    <section>
                        <div className="mb-4"><p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2f7453]">Clause scan</p><h2 className="mt-1 text-lg font-semibold">Warnings, questions, and good terms</h2><p className="mt-1 text-sm leading-6 text-[#68756f]">Search-based review of the extracted text, not a legal conclusion. Read each excerpt in the original letter.</p></div>
                        <div className="pd-surface grid border-l border-t border-[#23372f]/15 sm:grid-cols-4">{(["warning", "clarify", "standard", "positive"] as OfferFindingSeverity[]).map((severity) => { const style = severityStyle(severity); return <div className="border-b border-r border-[#23372f]/15 bg-[#fbfaf6] p-4" key={severity}><p className={`inline-flex px-2 py-1 font-jetbrains text-[8px] uppercase tracking-[0.08em] ${style.badge}`}>{style.label}</p><p className="mt-3 text-2xl font-semibold">{offer.findings.filter((finding) => finding.severity === severity).length}</p></div>; })}</div>
                        <div className="mt-4 space-y-3">{offer.findings.map((finding) => { const style = severityStyle(finding.severity); const Icon = style.icon; return <article className={`border border-l-4 border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5 ${style.border}`} key={finding.id}><div className="flex items-start gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{finding.title}</h3><span className={`px-2 py-1 font-jetbrains text-[8px] uppercase tracking-[0.08em] ${style.badge}`}>{style.label}</span></div><p className="mt-2 text-xs leading-5 text-[#58665f]">{finding.explanation}</p>{finding.excerpt ? <blockquote className="mt-3 border-l-2 border-[#23372f]/25 bg-[#f2f3ee] px-3 py-2 text-[11px] italic leading-5 text-[#68756f]">{finding.excerpt}</blockquote> : null}<div className="mt-3 flex gap-2 bg-white px-3 py-2 text-xs leading-5 text-[#355d4c]"><MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span><strong>Ask HR:</strong> {finding.question}</span></div></div></div></article>; })}</div>
                    </section>

                    {advice ? (
                        <section>
                            <div className="mb-4"><p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2f7453]">Optional conversation</p><h2 className="mt-1 text-lg font-semibold">Market value + negotiation</h2><p className="mt-1 text-sm leading-6 text-[#68756f]">Negotiating is not mandatory. First compare fixed-to-fixed pay using credible, role-level and location-matched sources.</p></div>
                            <div className="pd-surface grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 lg:grid-cols-[0.9fr_1.1fr]">
                                <div className="bg-[#fbfaf6] p-5">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-[#2f7453]" /> Evidence inputs</h3>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2"><CurrencyInput label="Current CTC" onChange={(value) => updateNegotiation("currentCtcAnnual", value)} value={offer.negotiation.currentCtcAnnual} /><CurrencyInput label="Competing offer" onChange={(value) => updateNegotiation("competingOfferAnnual", value)} value={offer.negotiation.competingOfferAnnual} /><CurrencyInput label="Market minimum" onChange={(value) => updateNegotiation("marketMinimumAnnual", value)} value={offer.negotiation.marketMinimumAnnual} /><CurrencyInput label="Market median" onChange={(value) => updateNegotiation("marketMedianAnnual", value)} value={offer.negotiation.marketMedianAnnual} /><CurrencyInput label="Market maximum" onChange={(value) => updateNegotiation("marketMaximumAnnual", value)} value={offer.negotiation.marketMaximumAnnual} /></div>
                                    <div className="mt-4"><span className={LABEL_CLASS}>Research market range</span><div className="flex flex-wrap gap-2"><a className={BUTTON_SECONDARY} href={`https://www.google.com/search?q=${salarySearchQuery}+AmbitionBox`} rel="noreferrer" target="_blank">AmbitionBox search <ExternalLink className="h-3.5 w-3.5" /></a><a className={BUTTON_SECONDARY} href={`https://www.google.com/search?q=${salarySearchQuery}+Glassdoor`} rel="noreferrer" target="_blank">Glassdoor search <ExternalLink className="h-3.5 w-3.5" /></a><a className={BUTTON_SECONDARY} href={`https://www.google.com/search?q=${salarySearchQuery}+salary+report`} rel="noreferrer" target="_blank">More sources <ExternalLink className="h-3.5 w-3.5" /></a></div><p className="mt-2 text-[10px] leading-4 text-[#718079]">Use at least two recent sources. Match experience, city, role scope, company size, and fixed versus total compensation.</p></div>
                                    <label className="mt-4 block"><span className={LABEL_CLASS}>Your leverage · factual only</span><textarea className={`${INPUT_CLASS} min-h-24 resize-y text-xs leading-5`} onChange={(event) => updateNegotiation("leverageNotes", event.target.value)} placeholder="Competing offer, scarce skill, quantified outcome, expanded role scope..." value={offer.negotiation.leverageNotes} /></label>
                                    <div className="mt-4"><span className={LABEL_CLASS}>What matters most</span><div className="flex flex-wrap gap-2">{PRIORITIES.map((priority) => { const active = offer.negotiation.priorities.includes(priority); return <button className={`border px-2.5 py-1.5 text-xs ${active ? "border-[#2f7453] bg-[#e4f1e7] font-semibold text-[#275f43]" : "border-[#23372f]/18 bg-white text-[#66736c]"}`} key={priority} onClick={() => togglePriority(priority)} type="button">{active ? <Check className="mr-1 inline h-3 w-3" /> : null}{priority}</button>; })}</div></div>
                                </div>

                                <div className="bg-[#f2f3ee] p-5">
                                    <div className="flex items-start justify-between gap-4"><div><p className={LABEL_CLASS}>Guidance</p><h3 className="text-lg font-semibold">{advice.marketPosition}</h3></div><span className={`shrink-0 px-2.5 py-1.5 font-jetbrains text-[9px] uppercase tracking-[0.08em] ${advice.recommendation === "strong-case" ? "bg-[#e4f1e7] text-[#275f43]" : advice.recommendation === "consider-asking" ? "bg-[#fbefd8] text-[#80571d]" : "bg-white text-[#58665f]"}`}>{advice.recommendation.replaceAll("-", " ")}</span></div>
                                    {advice.suggestedAskLow ? <div className="mt-5 border-y border-[#23372f]/15 py-4"><p className={LABEL_CLASS}>Discussion anchor · not a guarantee</p><p className="text-2xl font-semibold text-[#2f7453]" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>{advice.suggestedAskLow === advice.suggestedAskHigh ? formatInr(advice.suggestedAskLow) : `${formatInr(advice.suggestedAskLow)} - ${formatInr(advice.suggestedAskHigh)}`}</p><p className="mt-1 text-xs leading-5 text-[#718079]">Ask once, explain the evidence, then let HR respond. Never bluff another offer.</p></div> : <div className="mt-5 border-y border-[#23372f]/15 py-4 text-xs leading-5 text-[#68756f]">No responsible numeric anchor yet. Add a credible market range or competing offer, or simply clarify the package without negotiating.</div>}
                                    <ul className="mt-5 space-y-2">{advice.rationale.length ? advice.rationale.map((reason) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={reason}><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f7453]" /> {reason}</li>) : <li className="text-xs leading-5 text-[#718079]">Add market evidence to receive a position-specific explanation.</li>}</ul>
                                    <div className="mt-5"><p className={LABEL_CLASS}>Alternatives when the band is fixed</p><div className="space-y-2">{advice.nonCashOptions.map((option) => <p className="flex gap-2 text-xs leading-5 text-[#58665f]" key={option}><ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f7453]" /> {option}</p>)}</div></div>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                <div className="border border-[#23372f]/15 bg-[#fbfaf6] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className={LABEL_CLASS}>Clarify without negotiating</p><h3 className="text-sm font-semibold">Questions-first reply</h3></div><CopyButton copiedKey="clarify" label={copied === "clarify" ? "Copied" : "Copy reply"} onCopied={setCopied} value={clarificationReply} /></div><pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap border-t border-[#23372f]/10 pt-4 font-sans text-xs leading-5 text-[#58665f]">{clarificationReply}</pre></div>
                                <div className="border border-[#23372f]/15 bg-[#fbfaf6] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className={LABEL_CLASS}>Optional salary discussion</p><h3 className="text-sm font-semibold">Evidence-led negotiation reply</h3></div><CopyButton copiedKey="negotiate" label={copied === "negotiate" ? "Copied" : "Copy reply"} onCopied={setCopied} value={advice.hrReply} /></div><pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap border-t border-[#23372f]/10 pt-4 font-sans text-xs leading-5 text-[#58665f]">{advice.hrReply}</pre></div>
                            </div>

                            <div className="mt-4 flex gap-3 border-l-4 border-[#2f7453] bg-[#e4f1e7] px-4 py-3 text-xs leading-5 text-[#275f43]"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>It is valid to accept without negotiating.</strong> Negotiate only when a change matters to you and you can explain the request respectfully. Do not risk a role you value for a scripted percentage with no evidence.</p></div>
                        </section>
                    ) : null}
                </div>
            )}
        </>
    );
}