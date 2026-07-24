type HeadingSet = {
    summary: string;
    skills: string;
    experience: string;
    projects: string;
    education: string;
    certifications: string;
    courses: string;
    achievements: string;
    languages: string;
    volunteering: string;
};

export type ResumeCorpusCase = {
    id: string;
    text: string;
    expectedName: string;
};

const HEADING_SETS: HeadingSet[] = [
    { summary: "Professional Summary", skills: "Skills", experience: "Experience", projects: "Projects", education: "Education", certifications: "Certifications", courses: "Courses", achievements: "Achievements", languages: "Languages", volunteering: "Volunteer Experience" },
    { summary: "Summary", skills: "Technical Skills", experience: "Work Experience", projects: "Academic Projects", education: "Academic Background", certifications: "Professional Certifications", courses: "Relevant Coursework", achievements: "Awards", languages: "Language Proficiency", volunteering: "Community Involvement" },
    { summary: "Profile", skills: "Core Competencies", experience: "Professional Experience", projects: "Personal Projects", education: "Educational Qualifications", certifications: "Licenses & Certifications", courses: "Training", achievements: "Honors", languages: "Languages Known", volunteering: "Volunteering" },
    { summary: "Career Objective", skills: "Key Skills", experience: "Employment History", projects: "Selected Projects", education: "Qualifications", certifications: "Certificates", courses: "Courses & Training", achievements: "Awards & Achievements", languages: "Languages", volunteering: "Social Work" },
    { summary: "About Me", skills: "Areas of Expertise", experience: "Career History", projects: "Portfolio Projects", education: "Education & Qualifications", certifications: "Credentials", courses: "Professional Development", achievements: "Accomplishments", languages: "Language Skills", volunteering: "Volunteer Work" },
    { summary: "Executive Summary", skills: "Tools & Technologies", experience: "Internships & Experience", projects: "Key Projects", education: "Education Details", certifications: "Certifications & Licenses", courses: "Completed Courses", achievements: "Notable Achievements", languages: "Languages", volunteering: "Leadership & Volunteering" },
    { summary: "Personal Profile", skills: "Professional Skills", experience: "Work History", projects: "Project Experience", education: "Academic Qualifications", certifications: "Certifications", courses: "Coursework", achievements: "Recognition", languages: "Language Proficiency", volunteering: "Community Service" },
    { summary: "Objective", skills: "Skill Set", experience: "Experience & Internships", projects: "Projects Undertaken", education: "Educational Background", certifications: "Professional Credentials", courses: "Training Programs", achievements: "Awards and Honors", languages: "Known Languages", volunteering: "Volunteer Activities" },
    { summary: "Career Summary", skills: "Technical Competencies", experience: "Professional Background", projects: "Case Studies & Projects", education: "Academic Record", certifications: "Certificates & Credentials", courses: "Learning & Development", achievements: "Key Achievements", languages: "Languages", volunteering: "Civic Engagement" },
    { summary: "Profile Summary", skills: "Expertise", experience: "Employment Experience", projects: "Product Case Studies / Projects", education: "Education History", certifications: "Licences and Certifications", courses: "Courses Completed", achievements: "Distinctions", languages: "Communication Languages", volunteering: "Nonprofit Experience" },
];

const BULLETS = ["-", "•", "*", "–", "▪"];

function section(heading: string, body: string, style: number): string {
    const title = style % 2 === 0 ? heading.toUpperCase() : `${heading}:`;
    return `${title}\n${body}`;
}

function experienceBody(index: number, bullet: string): string {
    if (index % 3 === 0) return `Business Analyst | Acme ${index} Pvt Ltd | Chennai | Jan 2023 - Present\n${bullet} Improved reporting turnaround by 20% using SQL and Excel.\ncontinued across three operating teams.`;
    if (index % 3 === 1) return `Business Analyst\nAcme ${index} Pvt Ltd\nJan 2023 - Present\n${bullet} Improved reporting turnaround by 20% using SQL and Excel.\n${bullet} Presented weekly insights to senior stakeholders.`;
    return `Business Analyst at Acme ${index} Pvt Ltd | Jan 2023 - Present\n${bullet} Improved reporting turnaround by 20% using SQL and Excel.`;
}

function projectBody(index: number, bullet: string): string {
    return `Inventory Insight Dashboard | Power BI | 2024\n${bullet} Built a dashboard covering stock, ageing, and service-level trends for case ${index}.`;
}

function orderedSections(values: string[], rotation: number): string[] {
    const offset = rotation % values.length;
    return [...values.slice(offset), ...values.slice(0, offset)];
}

export const RESUME_CORPUS: ResumeCorpusCase[] = Array.from({ length: 50 }, (_, index) => {
    const headings = HEADING_SETS[index % HEADING_SETS.length];
    const style = index % 5;
    const bullet = BULLETS[style];
    const name = `Candidate Test ${String(index + 1).padStart(2, "0")}`;
    const sections = [
        section(headings.summary, `Business graduate who solves customer and operations problems with data, structured communication, and practical execution for corpus case ${index + 1}.`, style),
        section(headings.skills, `${bullet} Analytics: SQL, Microsoft Excel, Power BI\ncontinued with dashboard design and data cleaning\n${bullet} Collaboration: Stakeholder management, presentation`, style),
        section(headings.experience, experienceBody(index, bullet), style),
        section(headings.projects, projectBody(index, bullet), style),
        section(headings.education, `${bullet} Example University | Bachelor of Business Administration | 2020 - 2023 | CGPA: 8.${index % 10}/10`, style),
        section(headings.certifications, `${bullet} Google Data Analytics Professional Certificate\n${bullet} Scrum Fundamentals Certified`, style),
        section(headings.courses, `${bullet} Financial Modeling and Valuation\n${bullet} Advanced SQL for Business`, style),
        section(headings.achievements, `${bullet} Won first place in a national business case competition.`, style),
        section(headings.languages, `${bullet} English - Professional\n${bullet} Tamil - Native`, style),
        section(headings.volunteering, `${bullet} Coordinated weekend learning sessions for 40 students.`, style),
        section("Publications", `${bullet} Wrote an article on responsible AI adoption.`, style),
        section("Declaration", "I confirm that the information above is accurate.", style),
    ];

    return {
        id: `resume-${String(index + 1).padStart(2, "0")}`,
        expectedName: name,
        text: [
            name,
            `candidate${index + 1}@example.com | +91 90000 ${String(index + 1).padStart(5, "0")} | Chennai, India`,
            `linkedin.com/in/candidate-test-${index + 1}`,
            "Business Analyst | Analytics | Operations",
            ...orderedSections(sections, index),
        ].join("\n\n"),
    };
});