"use client";

import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    Check,
    ChevronDown,
    Clock3,
    Compass,
    ExternalLink,
    LoaderCircle,
    MapPin,
    Plus,
    Radar,
    Search,
    Sparkles,
    Target,
    X,
    Youtube,
} from "lucide-react";
import { useMemo, useState } from "react";

import { buildSearchLaunchers } from "@/lib/job-assistant/career";
import { composePreferredLocation, LOCATION_CATALOG } from "@/lib/job-assistant/locations";
import type {
    CareerLevel,
    CareerPreferences,
    JobSearchResult,
    RemotePreference,
    RoleSuggestion,
} from "@/lib/job-assistant/types";

const INPUT_CLASS =
    "w-full rounded-lg border border-[#23372f]/20 bg-white px-3 py-2.5 text-sm text-[#17211c] outline-none transition placeholder:text-[#8b958f] focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/20";
const LABEL_CLASS = "mb-1.5 block font-jetbrains text-[10px] font-semibold uppercase tracking-[0.12em] text-[#58665f]";
const BUTTON_PRIMARY =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#19372d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f7453] disabled:cursor-not-allowed disabled:opacity-50";
const BUTTON_SECONDARY =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#23372f]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#23372f] transition hover:border-[#ff7a1a] hover:bg-[#fff5ec] disabled:cursor-not-allowed disabled:opacity-50";

const WORK_STYLES = ["Analytical", "Problem solving", "Cross-functional", "Building", "Customer-facing", "Independent research", "Structured execution", "Creative", "Fast-paced"];
const INDUSTRIES = ["FinTech", "SaaS", "AI", "E-commerce", "Banking", "Consulting", "Consumer apps", "Healthcare", "Education", "Logistics"];
const RECENCY_OPTIONS = [1, 3, 7, 14, 30] as const;

function PageHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: React.ReactNode }) {
    return (
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#23372f]/15 pb-5 sm:flex-row sm:items-end">
            <div>
                <p className="mb-2 font-jetbrains text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f7453]">{eyebrow}</p>
                <h1 className="text-2xl font-semibold leading-tight text-[#17211c] sm:text-[1.75rem]" style={{ fontFamily: "var(--font-display)", letterSpacing: 0 }}>{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6862]">{copy}</p>
            </div>
            {action}
        </div>
    );
}

function fitTone(score: number): string {
    if (score >= 75) return "bg-[#e3f1e6] text-[#275f43]";
    if (score >= 55) return "bg-[#f8efd9] text-[#80571d]";
    return "bg-[#eef0ed] text-[#58665f]";
}

function StructuredLocationPicker({
    preferences,
    updatePreferences,
}: {
    preferences: CareerPreferences;
    updatePreferences: (patch: Partial<CareerPreferences>) => void;
}) {
    const [showCustom, setShowCustom] = useState(Boolean(preferences.customLocation));
    const countryEntry = LOCATION_CATALOG.find((entry) => entry.country === preferences.preferredCountry);
    const availableCities = countryEntry?.cities.filter((city) => !preferences.preferredCities.includes(city)) ?? [];

    function applyLocation(country: string, cities: string[], customLocation: string) {
        updatePreferences({
            preferredCountry: country,
            preferredCities: cities,
            customLocation,
            preferredLocation: composePreferredLocation(country, cities, customLocation),
        });
    }

    function changeCountry(value: string) {
        if (value === "__other") {
            setShowCustom(true);
            applyLocation("", [], "");
            return;
        }
        setShowCustom(false);
        applyLocation(value, [], "");
    }

    function addCity(city: string) {
        if (!city || preferences.preferredCities.includes(city) || preferences.preferredCities.length >= 3) return;
        applyLocation(preferences.preferredCountry, [...preferences.preferredCities, city], preferences.customLocation);
    }

    function removeCity(city: string) {
        applyLocation(
            preferences.preferredCountry,
            preferences.preferredCities.filter((candidate) => candidate !== city),
            preferences.customLocation,
        );
    }

    return (
        <div>
            <span className={LABEL_CLASS}>Preferred job location</span>
            <div className="grid gap-3 sm:grid-cols-2">
                <label>
                    <span className="sr-only">Country</span>
                    <select className={INPUT_CLASS} onChange={(event) => changeCountry(event.target.value)} value={preferences.preferredCountry || (showCustom ? "__other" : "")}>
                        <option value="">Choose country</option>
                        {LOCATION_CATALOG.map((entry) => <option key={entry.country} value={entry.country}>{entry.country}</option>)}
                        <option value="__other">Other country / location</option>
                    </select>
                </label>
                <label>
                    <span className="sr-only">Add preferred city</span>
                    <select
                        className={INPUT_CLASS}
                        disabled={!countryEntry || preferences.preferredCities.length >= 3}
                        onChange={(event) => {
                            addCity(event.target.value);
                            event.target.value = "";
                        }}
                        value=""
                    >
                        <option value="">{preferences.preferredCities.length >= 3 ? "3 cities selected" : "Add city"}</option>
                        {availableCities.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                </label>
            </div>
            {preferences.preferredCities.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {preferences.preferredCities.map((city) => (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#e5f1e8] px-2.5 py-1.5 text-xs font-semibold text-[#275f43]" key={city}>
                            {city}
                            <button aria-label={`Remove ${city}`} onClick={() => removeCity(city)} title={`Remove ${city}`} type="button"><X className="h-3 w-3" /></button>
                        </span>
                    ))}
                </div>
            ) : null}
            {showCustom || preferences.customLocation ? (
                <label className="mt-2 block">
                    <span className="sr-only">Other city, state, or country</span>
                    <input className={INPUT_CLASS} onChange={(event) => applyLocation(preferences.preferredCountry, preferences.preferredCities, event.target.value)} placeholder="Other city, state, or country" value={preferences.customLocation} />
                </label>
            ) : (
                <button className="mt-2 text-xs font-semibold text-[#a84708]" onClick={() => setShowCustom(true)} type="button">Can&apos;t find the place?</button>
            )}
            <p className="mt-2 text-[10px] leading-4 text-[#718079]">Search location: {preferences.preferredLocation || "Anywhere"}</p>
        </div>
    );
}

export function CareerDiscoveryView({
    preferences,
    suggestions,
    updatePreferences,
    generateSuggestions,
    continueToSearch,
}: {
    preferences: CareerPreferences;
    suggestions: RoleSuggestion[];
    updatePreferences: (patch: Partial<CareerPreferences>) => void;
    generateSuggestions: () => void;
    continueToSearch: () => void;
}) {
    const [customIndustry, setCustomIndustry] = useState("");
    const industryOptions = [
        ...INDUSTRIES,
        ...preferences.industries.filter((industry) => !INDUSTRIES.includes(industry)),
    ];

    function toggleArrayValue(key: "workStyles" | "industries", value: string) {
        const values = preferences[key];
        updatePreferences({ [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] });
    }

    function addCustomIndustry() {
        const industry = customIndustry.trim();
        if (!industry || preferences.industries.some((item) => item.toLowerCase() === industry.toLowerCase())) return;
        if (preferences.industries.length >= 12) return;
        updatePreferences({ industries: [...preferences.industries, industry] });
        setCustomIndustry("");
    }

    function toggleRole(title: string) {
        const selected = preferences.selectedRoleTitles;
        if (selected.includes(title)) {
            updatePreferences({ selectedRoleTitles: selected.filter((role) => role !== title) });
            return;
        }
        if (selected.length >= 6) return;
        updatePreferences({ selectedRoleTitles: [...selected, title] });
    }

    return (
        <>
            <PageHeader
                eyebrow="Stage 01 · Direction"
                title="Discover roles that fit"
                copy="Use education, demonstrated skills, interests, and preferred work style to narrow the field before applying everywhere."
                action={preferences.selectedRoleTitles.length ? <button className={BUTTON_PRIMARY} onClick={continueToSearch} type="button">Find openings <ArrowRight className="h-4 w-4" /></button> : undefined}
            />

            <section className="pd-surface grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 lg:grid-cols-[1fr_0.78fr]">
                <div className="bg-[#fbfaf6] p-4 sm:p-5">
                    <label>
                        <span className={LABEL_CLASS}>Education + current context</span>
                        <textarea className={`${INPUT_CLASS} min-h-28 resize-y leading-6`} onChange={(event) => updatePreferences({ educationContext: event.target.value })} placeholder="MBA Finance and Marketing, BA Economics, final year..." value={preferences.educationContext} />
                    </label>
                    <label className="mt-4 block">
                        <span className={LABEL_CLASS}>What do you enjoy or want to explore?</span>
                        <textarea className={`${INPUT_CLASS} min-h-32 resize-y leading-6`} onChange={(event) => updatePreferences({ interests: event.target.value })} placeholder="I like solving business problems, talking to users, working with data, building products..." value={preferences.interests} />
                    </label>
                    <label className="mt-4 block"><span className={LABEL_CLASS}>Career level</span><select className={INPUT_CLASS} onChange={(event) => updatePreferences({ targetLevel: event.target.value as CareerLevel })} value={preferences.targetLevel}><option value="any">Open to suitable level</option><option value="internship">Internship</option><option value="entry">Entry level / fresher</option><option value="associate">Associate</option></select></label>
                    <div className="mt-4"><StructuredLocationPicker preferences={preferences} updatePreferences={updatePreferences} /></div>
                </div>

                <div className="bg-[#fbfaf6] p-4 sm:p-5">
                    <div>
                        <span className={LABEL_CLASS}>Work that feels natural</span>
                        <div className="flex flex-wrap gap-2">{WORK_STYLES.map((style) => { const active = preferences.workStyles.includes(style); return <button className={`border px-2.5 py-1.5 text-xs transition ${active ? "border-[#2f7453] bg-[#e4f1e7] font-semibold text-[#275f43]" : "border-[#23372f]/18 bg-white text-[#66736c] hover:border-[#2f7453]"}`} key={style} onClick={() => toggleArrayValue("workStyles", style)} type="button">{active ? <Check className="mr-1 inline h-3 w-3" /> : null}{style}</button>; })}</div>
                    </div>
                    <div className="mt-5">
                        <span className={LABEL_CLASS}>Industries to prioritize</span>
                        <div className="flex flex-wrap gap-2">{industryOptions.map((industry) => { const active = preferences.industries.includes(industry); return <button className={`border px-2.5 py-1.5 text-xs transition ${active ? "border-[#2f7453] bg-[#e4f1e7] font-semibold text-[#275f43]" : "border-[#23372f]/18 bg-white text-[#66736c] hover:border-[#ff7a1a]"}`} key={industry} onClick={() => toggleArrayValue("industries", industry)} type="button">{active ? <Check className="mr-1 inline h-3 w-3" /> : null}{industry}</button>; })}</div>
                        <div className="mt-3 flex max-w-sm rounded-lg border border-[#23372f]/18 bg-white p-1">
                            <input className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" onChange={(event) => setCustomIndustry(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomIndustry(); } }} placeholder="Add another industry or domain" value={customIndustry} />
                            <button aria-label="Add custom industry" className="grid h-8 w-8 place-items-center text-[#a84708]" disabled={!customIndustry.trim() || preferences.industries.length >= 12} onClick={addCustomIndustry} title="Add industry" type="button"><Plus className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <div className="mt-6 border-l-2 border-[#ff7a1a] bg-[#19372d] px-4 py-3 text-xs leading-5 text-white/70">
                        Recommendations use the evidence in <strong className="text-white">My profile</strong>. Missing evidence lowers fit and appears as a bridge skill.
                    </div>
                </div>
            </section>

            <div className="mt-5 flex justify-end">
                <button className={BUTTON_PRIMARY} disabled={!preferences.educationContext.trim() || !preferences.interests.trim()} onClick={generateSuggestions} type="button"><Compass className="h-4 w-4" /> Generate role shortlist</button>
            </div>

            <details className="mt-5 border border-[#23372f]/15 bg-[#fbfaf6]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-[#58665f]">How role suggestions are calculated <ChevronDown className="h-4 w-4" /></summary>
                <div className="border-t border-[#23372f]/10 p-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {[["Profile evidence", "38 points"], ["Interests + industry", "25 points"], ["Education", "12 points"], ["Work style", "10 points"], ["Eligibility baseline", "15 points"]].map(([label, value]) => <div className="rounded-lg bg-[#f2f3ee] p-3" key={label}><p className="font-jetbrains text-[8px] uppercase tracking-[0.08em] text-[#718079]">{label}</p><p className="mt-1 text-sm font-semibold text-[#19372d]">{value}</p></div>)}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#68756f]">The score is capped at 96 because it is a direction signal, not a hiring probability. Location is deliberately excluded from role fit; it only filters the opening search.</p>
                </div>
            </details>

            {suggestions.length ? (
                <section className="mt-9">
                    <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="font-jetbrains text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2f7453]">Recommended directions</p><h2 className="mt-1 text-lg font-semibold">Choose up to six roles to search</h2></div><p className="text-xs text-[#718079]">{preferences.selectedRoleTitles.length}/6 selected</p></div>
                    <div className="grid gap-4 xl:grid-cols-2">
                        {suggestions.map((role, index) => {
                            const selected = preferences.selectedRoleTitles.includes(role.title);
                            return (
                                <article className={`pd-hover-lift border bg-[#fbfaf6] ${selected ? "border-[#a84708] shadow-[4px_4px_0_#ff7a1a]" : "border-[#23372f]/15"}`} key={role.id}>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 gap-3"><span className="font-jetbrains text-[10px] text-[#718079]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="text-base font-semibold">{role.title}</h3><p className="mt-2 text-sm leading-6 text-[#66736c]">{role.summary}</p></div></div>
                                            <span className={`shrink-0 px-2.5 py-1.5 font-jetbrains text-[10px] font-semibold ${fitTone(role.fitScore)}`}>{role.fitScore}% fit</span>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2"><button className={selected ? BUTTON_PRIMARY : BUTTON_SECONDARY} disabled={!selected && preferences.selectedRoleTitles.length >= 6} onClick={() => toggleRole(role.title)} type="button">{selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{selected ? "Selected" : "Target this role"}</button><a className={`${BUTTON_SECONDARY} text-[#a33a31]`} href={role.youtubeSearchUrl} rel="noreferrer" target="_blank"><Youtube className="h-4 w-4" /> Day in the life</a></div>
                                    </div>
                                    <details className="border-t border-[#23372f]/12">
                                        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-xs font-semibold text-[#58665f]">What this role actually involves <ChevronDown className="h-4 w-4" /></summary>
                                        <div className="border-t border-[#23372f]/10 px-5 py-4">
                                            <div className="grid gap-5 lg:grid-cols-2">
                                                <div><p className={LABEL_CLASS}>Typical day-to-day</p><ul className="space-y-2">{role.expectedWork.map((item) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={item}><ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f7453]" /> {item}</li>)}</ul></div>
                                                <div><p className={LABEL_CLASS}>Why it may fit</p><ul className="space-y-2">{role.fitReasons.map((reason) => <li className="flex gap-2 text-xs leading-5 text-[#58665f]" key={reason}><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#ff7a1a] ring-1 ring-[#a84708]" /> {reason}</li>)}</ul></div>
                                            </div>
                                            <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className={LABEL_CLASS}>Supported now</p><div className="flex flex-wrap gap-1.5">{role.supportedSkills.length ? role.supportedSkills.map((skill) => <span className="bg-[#e5f1e8] px-2 py-1 text-[10px] text-[#275f43]" key={skill}>{skill}</span>) : <span className="text-xs text-[#718079]">Build a proof project first.</span>}</div></div><div><p className={LABEL_CLASS}>Bridge skills</p><div className="flex flex-wrap gap-1.5">{role.bridgeSkills.map((skill) => <span className="bg-[#fbefd8] px-2 py-1 text-[10px] text-[#80571d]" key={skill}>{skill}</span>)}</div></div></div>
                                            <div className="mt-5 border-t border-[#23372f]/10 pt-4"><p className={LABEL_CLASS}>This role&apos;s fit score</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[
                                                ["Evidence", role.fitBreakdown.profileEvidence, 38],
                                                ["Interests", role.fitBreakdown.interestsAndIndustry, 25],
                                                ["Education", role.fitBreakdown.education, 12],
                                                ["Work style", role.fitBreakdown.workStyle, 10],
                                                ["Baseline", role.fitBreakdown.baseline, 15],
                                            ].map(([label, value, maximum]) => <div className="rounded-lg bg-[#f2f3ee] px-2 py-2 text-center" key={String(label)}><p className="font-jetbrains text-[8px] uppercase tracking-[0.06em] text-[#718079]">{label}</p><p className="mt-1 text-xs font-semibold text-[#19372d]">{value}/{maximum}</p></div>)}</div></div>
                                        </div>
                                    </details>
                                </article>
                            );
                        })}
                    </div>
                    <div className="mt-6 flex justify-end"><button className={BUTTON_PRIMARY} disabled={!preferences.selectedRoleTitles.length} onClick={continueToSearch} type="button">Lock direction + find jobs <ArrowRight className="h-4 w-4" /></button></div>
                </section>
            ) : (
                <div className="pd-surface mt-8 border border-dashed border-[#23372f]/25 bg-[#f8f7f2] px-6 py-10 text-center"><Radar className="mx-auto h-7 w-7 text-[#718079]" /><h3 className="mt-3 text-base font-semibold">Your role shortlist appears here</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#66736c]">Describe what you enjoy and generate a shortlist before starting the opening search.</p></div>
            )}
        </>
    );
}

export function JobHuntView({
    inviteId,
    preferences,
    results,
    lastSearchAt,
    updatePreferences,
    completeSearch,
    saveResult,
    savedJobUrls,
    notify,
    backToDiscovery,
}: {
    inviteId: string;
    preferences: CareerPreferences;
    results: JobSearchResult[];
    lastSearchAt: string;
    updatePreferences: (patch: Partial<CareerPreferences>) => void;
    completeSearch: (results: JobSearchResult[], searchedAt: string) => void;
    saveResult: (result: JobSearchResult, tailorNow: boolean) => void;
    savedJobUrls: string[];
    notify: (message: string) => void;
    backToDiscovery: () => void;
}) {
    const [searching, setSearching] = useState(false);
    const [recentlySavedId, setRecentlySavedId] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [customCompany, setCustomCompany] = useState("");
    const launchers = useMemo(() => buildSearchLaunchers(preferences), [preferences]);
    const targetLaunchers = launchers.filter((launcher) => launcher.kind === "target");
    const boardLaunchers = launchers.filter((launcher) => launcher.kind === "board");

    function addCustomRole() {
        const role = customRole.trim();
        if (!role || preferences.selectedRoleTitles.some((item) => item.toLowerCase() === role.toLowerCase())) return;
        if (preferences.selectedRoleTitles.length >= 6) {
            notify("Choose no more than six target roles for a focused search.");
            return;
        }
        updatePreferences({ selectedRoleTitles: [...preferences.selectedRoleTitles, role] });
        setCustomRole("");
    }

    function addTargetCompany() {
        const company = customCompany.trim();
        if (!company || preferences.targetCompanies.some((item) => item.toLowerCase() === company.toLowerCase())) return;
        if (preferences.targetCompanies.length >= 10) return;
        updatePreferences({ targetCompanies: [...preferences.targetCompanies, company] });
        setCustomCompany("");
    }

    function saveOpening(result: JobSearchResult) {
        setRecentlySavedId(result.id);
        saveResult(result, false);
    }

    async function runLiveSearch() {
        if (!preferences.selectedRoleTitles.length) {
            notify("Select at least one role before searching.");
            return;
        }
        setSearching(true);
        try {
            const response = await fetch("/api/job-assistant/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inviteId,
                    roles: preferences.selectedRoleTitles,
                    location: preferences.preferredLocation,
                    cities: preferences.preferredCities,
                    country: preferences.preferredCountry,
                    remotePreference: preferences.remotePreference,
                    recencyDays: preferences.recencyDays,
                    targetCompanies: preferences.targetCompanies,
                }),
            });
            const payload = (await response.json()) as { results?: JobSearchResult[]; searchedAt?: string; searchedSources?: number; warnings?: string[]; error?: string };
            if (!response.ok || !payload.results || !payload.searchedAt) throw new Error(payload.error ?? "Unable to search live feeds.");
            completeSearch(payload.results, payload.searchedAt);
            const warning = payload.warnings?.length ? ` ${payload.warnings.join(" ")}` : "";
            notify(`Found ${payload.results.length} recent matching openings across ${payload.searchedSources ?? 0} public feeds.${warning}`);
        } catch (error) {
            notify(error instanceof Error ? error.message : "Live search failed. Use the direct search launchers below.");
        } finally {
            setSearching(false);
        }
    }

    return (
        <>
            <PageHeader
                eyebrow="Stage 02 · Hunt"
                title="Find matching openings"
                copy="Search public live feeds, then use target-company and major-board launchers for broader India and location-specific coverage."
                action={<button className={BUTTON_SECONDARY} onClick={backToDiscovery} type="button"><Compass className="h-4 w-4" /> Review roles</button>}
            />

            <section className="border border-[#23372f]/15 bg-[#fbfaf6] p-4 sm:p-5">
                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <span className={LABEL_CLASS}>Target roles · up to 6</span>
                        <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-[#23372f]/20 bg-white p-2">
                            {preferences.selectedRoleTitles.map((role) => <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#e5f1e8] px-2.5 py-1.5 text-xs font-semibold text-[#275f43]" key={role}>{role}<button aria-label={`Remove ${role}`} onClick={() => updatePreferences({ selectedRoleTitles: preferences.selectedRoleTitles.filter((item) => item !== role) })} title={`Remove ${role}`} type="button"><X className="h-3 w-3" /></button></span>)}
                            <div className="flex min-w-[190px] flex-1"><input className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" onChange={(event) => setCustomRole(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomRole(); } }} placeholder="Add another role" value={customRole} /><button aria-label="Add custom role" className="grid h-8 w-8 place-items-center text-[#2f7453]" onClick={addCustomRole} title="Add role" type="button"><Plus className="h-4 w-4" /></button></div>
                        </div>
                    </div>
                    <div><span className={LABEL_CLASS}>Target companies · up to 10</span><div className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-[#23372f]/20 bg-white p-2">{preferences.targetCompanies.map((company) => <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff0e4] px-2.5 py-1.5 text-xs font-semibold text-[#8f3d08]" key={company}>{company}<button aria-label={`Remove ${company}`} onClick={() => updatePreferences({ targetCompanies: preferences.targetCompanies.filter((item) => item !== company) })} title={`Remove ${company}`} type="button"><X className="h-3 w-3" /></button></span>)}<div className="flex min-w-[180px] flex-1"><input className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none" onChange={(event) => setCustomCompany(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTargetCompany(); } }} placeholder="Add company" value={customCompany} /><button aria-label="Add target company" className="grid h-8 w-8 place-items-center text-[#a84708]" disabled={!customCompany.trim() || preferences.targetCompanies.length >= 10} onClick={addTargetCompany} title="Add company" type="button"><Plus className="h-4 w-4" /></button></div></div></div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <StructuredLocationPicker preferences={preferences} updatePreferences={updatePreferences} />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                        <label><span className={LABEL_CLASS}>Work mode</span><select className={INPUT_CLASS} onChange={(event) => updatePreferences({ remotePreference: event.target.value as RemotePreference })} value={preferences.remotePreference}><option value="any">Any work mode</option><option value="onsite">On-site preferred</option><option value="hybrid">Hybrid preferred</option><option value="remote">Remote only</option></select></label>
                        <div><span className={LABEL_CLASS}>Opening recency</span><div className="flex h-[42px] rounded-lg border border-[#23372f]/20 bg-white p-1">{RECENCY_OPTIONS.map((days) => <button className={`min-w-0 flex-1 text-[10px] font-semibold ${preferences.recencyDays === days ? "bg-[#19372d] text-white" : "text-[#66736c] hover:bg-[#edf3ee]"}`} key={days} onClick={() => updatePreferences({ recencyDays: days })} type="button">{days}d</button>)}</div></div>
                    </div>
                </div>
                <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-[#23372f]/12 pt-4 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-[#718079]">Live results: Remotive, Arbeitnow, and Jobicy. Direct launchers cover LinkedIn, Indeed, Naukri, Wellfound, and Internshala.</p><button className={`${BUTTON_PRIMARY} shrink-0`} disabled={searching || !preferences.selectedRoleTitles.length} onClick={runLiveSearch} type="button">{searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{searching ? "Hunting online" : "Search live openings"}</button></div>
            </section>

            {targetLaunchers.length ? (
                <section className="mt-8"><div className="mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-[#2f7453]" /><h2 className="text-sm font-semibold">Target companies first</h2></div><div className="pd-surface grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 sm:grid-cols-2 xl:grid-cols-3">{targetLaunchers.map((launcher) => <a className="group bg-[#fbfaf6] p-4 hover:bg-[#edf3ee]" href={launcher.url} key={launcher.id} rel="noreferrer" target="_blank"><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold">{launcher.label}</span><ExternalLink className="h-4 w-4 shrink-0 text-[#2f7453]" /></div><p className="mt-2 text-xs leading-5 text-[#68756f]">{launcher.description}</p></a>)}</div></section>
            ) : null}

            <section className="mt-8">
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2"><Radar className="h-4 w-4 text-[#2f7453]" /><h2 className="text-sm font-semibold">Live public-feed matches</h2></div>{lastSearchAt ? <p className="mt-1 text-xs text-[#718079]">Last searched {new Date(lastSearchAt).toLocaleString("en-IN")}</p> : null}</div><span className="font-jetbrains text-[10px] uppercase tracking-[0.1em] text-[#718079]">{results.length} openings</span></div>
                {results.length ? (
                    <div className="grid gap-3 xl:grid-cols-2">
                        {results.map((job) => {
                            const isSaved = savedJobUrls.includes(job.url);
                            return (
                            <article className={`pd-hover-lift border bg-[#fbfaf6] p-4 ${job.isTargetCompany ? "border-[#a84708] shadow-[3px_3px_0_#ff7a1a]" : "border-[#23372f]/15"}`} key={job.id}>
                                <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2">{job.isTargetCompany ? <span className="bg-[#ff7a1a] px-2 py-1 font-jetbrains text-[8px] font-semibold uppercase tracking-[0.08em] text-[#19372d]">Target company</span> : null}<span className="bg-[#eef0ed] px-2 py-1 font-jetbrains text-[8px] uppercase tracking-[0.08em] text-[#58665f]">{job.source}</span></div><h3 className="mt-2 text-base font-semibold">{job.title}</h3><p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#58665f]"><Building2 className="h-3.5 w-3.5" /> {job.company}</p></div><a aria-label={`Open ${job.title}`} className="grid h-9 w-9 shrink-0 place-items-center border border-[#23372f]/15 bg-white hover:bg-[#edf3ee]" href={job.url} rel="noreferrer" target="_blank" title="Open listing"><ExternalLink className="h-4 w-4" /></a></div>
                                <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-[#718079]"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || "Not listed"}</span><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {job.postedAt ? new Date(job.postedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Date not listed"}</span>{job.employmentType ? <span>{job.employmentType.replaceAll("_", " ")}</span> : null}</div>
                                {job.description ? <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#68756f]">{job.description}</p> : null}
                                <div className="mt-4 flex flex-wrap gap-2"><button aria-live="polite" className={`${BUTTON_SECONDARY} ${recentlySavedId === job.id ? "pd-save-confirm" : ""} ${isSaved ? "pd-save-success" : ""}`} onClick={() => saveOpening(job)} type="button">{isSaved ? <Check className="h-4 w-4" /> : <BriefcaseBusiness className="h-4 w-4" />} {isSaved ? "Saved" : "Save"}</button><button className={BUTTON_PRIMARY} onClick={() => saveResult(job, true)} type="button"><Sparkles className="h-4 w-4" /> {isSaved ? "Open + tailor" : "Save + tailor"}</button></div>
                            </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="pd-surface border border-dashed border-[#23372f]/25 bg-[#f8f7f2] px-6 py-10 text-center"><Search className="mx-auto h-7 w-7 text-[#718079]" /><h3 className="mt-3 text-base font-semibold">No live search run yet</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#66736c]">Run the live search above. If remote feeds are sparse for your location, use the direct board searches below.</p></div>
                )}
            </section>

            <section className="mt-8"><div className="mb-3 flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[#2f7453]" /><h2 className="text-sm font-semibold">Continue on major job boards</h2></div><div className="pd-surface grid gap-px border border-[#23372f]/15 bg-[#23372f]/15 sm:grid-cols-2 xl:grid-cols-5">{boardLaunchers.map((launcher) => <a className="group bg-[#fbfaf6] p-4 hover:bg-[#edf3ee]" href={launcher.url} key={launcher.id} rel="noreferrer" target="_blank"><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{launcher.label}</span><ExternalLink className="h-4 w-4 shrink-0 text-[#2f7453]" /></div><p className="mt-2 text-xs leading-5 text-[#68756f]">{launcher.description}</p></a>)}</div></section>
        </>
    );
}