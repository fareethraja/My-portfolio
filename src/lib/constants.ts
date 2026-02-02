import { Home, User, Clock, FolderGit2, Terminal, Mail } from "lucide-react";

export const SECTIONS = [
    { id: "hero", label: "Home", icon: Home },
    { id: "about", label: "About", icon: User },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "tools", label: "Skills", icon: Terminal },
    { id: "contact", label: "Contact", icon: Mail },
] as const;
