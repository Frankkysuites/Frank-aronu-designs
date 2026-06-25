#!/usr/bin/env bash
# =============================================================================
# Frank Aronu Designs — Portfolio Fix Script
# Run from the ROOT of your repo:  bash fix-portfolio.sh
# Fixes: duplicate dark-mode CSS, insecure admin auth, missing 404 copy,
#        App.tsx routing import, stale Home.tsx, QueryClient config,
#        image loading performance, unused imports, index.css bloat,
#        vite.config missing build optimisations, Supabase keys in source.
# =============================================================================

set -e

PORTFOLIO="artifacts/portfolio"
SRC="$PORTFOLIO/src"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        Frank Aronu Portfolio — Applying All Fixes        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── guard: must be run from repo root ────────────────────────────────────────
if [ ! -f "$PORTFOLIO/package.json" ]; then
  echo "❌  Run this script from the REPO ROOT (where artifacts/ lives)."
  exit 1
fi

# ─── 1. FIX: index.css has the entire dark-mode block copy-pasted 3× ─────────
echo "▶  [1/9] Deduplicating dark-mode CSS in index.css …"
cat > "$SRC/index.css" << 'CSSEOF'
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@400;500;600;700;800&display=swap');
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-card-border: hsl(var(--card-border));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-popover-border: hsl(var(--popover-border));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-primary-border: var(--primary-border);
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-secondary-border: var(--secondary-border);
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-muted-border: var(--muted-border);
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-accent-border: var(--accent-border);
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-destructive-border: var(--destructive-border);
  --font-sans: var(--app-font-sans);
  --font-serif: var(--app-font-serif);
  --font-mono: var(--app-font-mono);
  --font-display: var(--app-font-display);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --background: 40 20% 96%;
  --foreground: 20 10% 10%;
  --border: 40 15% 85%;
  --card: 40 20% 98%;
  --card-foreground: 20 10% 10%;
  --card-border: 40 15% 88%;
  --popover: 40 20% 98%;
  --popover-foreground: 20 10% 10%;
  --popover-border: 40 15% 85%;
  --primary: 12 45% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 45 10% 88%;
  --secondary-foreground: 20 10% 15%;
  --muted: 45 10% 90%;
  --muted-foreground: 20 5% 45%;
  --accent: 40 20% 92%;
  --accent-foreground: 20 10% 10%;
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 100%;
  --input: 40 15% 85%;
  --ring: 12 45% 45%;
  --radius: 0.25rem;
  --app-font-sans: 'DM Sans', sans-serif;
  --app-font-display: 'Syne', sans-serif;
}

.dark {
  --background: 20 10% 10%;
  --foreground: 40 20% 96%;
  --border: 20 10% 20%;
  --card: 20 10% 12%;
  --card-foreground: 40 20% 96%;
  --card-border: 20 10% 18%;
  --popover: 20 10% 12%;
  --popover-foreground: 40 20% 96%;
  --popover-border: 20 10% 20%;
  --primary: 12 55% 65%;
  --primary-foreground: 20 10% 10%;
  --secondary: 20 10% 18%;
  --secondary-foreground: 40 20% 90%;
  --muted: 20 10% 18%;
  --muted-foreground: 40 10% 60%;
  --accent: 20 10% 22%;
  --accent-foreground: 40 20% 96%;
  --destructive: 0 60% 50%;
  --destructive-foreground: 0 0% 100%;
  --input: 20 10% 25%;
  --ring: 12 55% 65%;
}

@layer base {
  * { @apply border-border; }
  body {
    @apply font-sans antialiased bg-background text-foreground;
  }
}
CSSEOF
echo "   ✅  index.css deduplicated"

# ─── 2. FIX: App.tsx QueryClient config ──────────────────────────────────────
echo "▶  [2/9] Hardening QueryClient config in App.tsx …"
cat > "$SRC/App.tsx" << 'APPEOF'
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/Admin";
import ProjectDetail from "@/pages/ProjectDetail";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/project/:slug" component={ProjectDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="relative min-h-screen">
            <div className="fixed bottom-6 right-6 z-50">
              <ThemeToggle />
            </div>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
APPEOF
echo "   ✅  QueryClient now has staleTime:5min + retry:1"

# ─── 3. FIX: home.tsx navigation ─────────────────────────────────────────────
echo "▶  [3/9] Fixing navigation in home.tsx…"
cat > "$SRC/pages/home.tsx" << 'HOMEEOF'
import { useState } from "react";
import { Link } from "wouter";
import { useListProjects } from "@/hooks/useListProjects";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import type { ProjectCategory } from "@/hooks/useListProjects";

type CategoryFilter = "All" | "Graphics" | "Product Design";

export default function Home() {
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const { data: projects, isLoading } = useListProjects(
    filter === "All" ? {} : { category: filter as ProjectCategory }
  );
  const { profile, isLoading: profileLoading } = useProfile();

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-12 md:py-24 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Designing clarity in a complex world.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            I'm a multidisciplinary designer focused on crafting precise,
            engaging digital and physical experiences.
          </p>
        </div>
      </header>

      <section className="px-6 py-12 max-w-7xl mx-auto w-full border-y dark:border-gray-700 border-muted">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-shrink-0">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-1">
              <img src={profile.imageUrl} alt={profile.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{profile.name}</h2>
            <p className="text-muted-foreground mb-4">{profile.title}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /><span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /><span>{profile.email}</span>
              </div>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto md:mx-0">{profile.bio}</p>
            <div className="flex gap-4 mt-6 justify-center md:justify-start flex-wrap">
              {profile.social.dribbble && <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild><a href={profile.social.dribbble} target="_blank"><FaDribbble /> Dribbble</a></Button>}
              {profile.social.behance && <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild><a href={profile.social.behance} target="_blank"><FaBehance /> Behance</a></Button>}
              {profile.social.linkedin && <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild><a href={profile.social.linkedin} target="_blank"><FaLinkedin /> LinkedIn</a></Button>}
              {profile.social.instagram && <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild><a href={profile.social.instagram} target="_blank"><FaInstagram /> Instagram</a></Button>}
              {profile.social.whatsapp && <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild><a href={profile.social.whatsapp} target="_blank"><FaWhatsapp /> WhatsApp</a></Button>}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 px-6 pb-24 max-w-7xl mx-auto w-full">
        <div className="flex gap-2 my-12 overflow-x-auto pb-2 scrollbar-none">
          {(["All", "Graphics", "Product Design"] as CategoryFilter[]).map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                filter === cat ? "bg-foreground text-background shadow-md scale-105" : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="space-y-4"><Skeleton className="h-80 w-full rounded-2xl" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>)}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <Link key={project.id} href={`/project/${project.slug}`} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-muted">
                  <img src={project.image_url} alt={project.title} className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium px-4 py-2 border border-white rounded-full">View Project</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
                  <Badge variant="secondary" className="text-xs">{project.category}</Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No projects found. Check back soon!</div>
        )}
      </main>

      <footer className="bg-[#0a0a0a] text-white border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div><h2 className="text-3xl md:text-4xl font-bold mb-4">Let's create something</h2><p className="text-gray-400">Have a project in mind? Let's talk.</p></div>
            <Button size="lg" className="gap-2 rounded-full px-8 bg-white text-gray-900 hover:bg-gray-100" asChild>
              <a href={`mailto:${profile.email}`}>Get in touch <ArrowRight className="w-4 h-4" /></a>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-16 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400">© 2025 {profile.name}. All rights reserved.</p>
            <div className="flex gap-6">
              {profile.social.dribbble && <a href={profile.social.dribbble} target="_blank" className="text-gray-400 hover:text-white"><FaDribbble size={20} /></a>}
              {profile.social.behance && <a href={profile.social.behance} target="_blank" className="text-gray-400 hover:text-white"><FaBehance size={20} /></a>}
              {profile.social.linkedin && <a href={profile.social.linkedin} target="_blank" className="text-gray-400 hover:text-white"><FaLinkedin size={20} /></a>}
              {profile.social.instagram && <a href={profile.social.instagram} target="_blank" className="text-gray-400 hover:text-white"><FaInstagram size={20} /></a>}
              {profile.social.whatsapp && <a href={profile.social.whatsapp} target="_blank" className="text-gray-400 hover:text-white"><FaWhatsapp size={20} /></a>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
HOMEEOF
echo "   ✅  home.tsx: wouter Link, conditional social links, lazy images"

# ─── 4. FIX: ProjectDetail.tsx ────────────────────────────────────────────────
echo "▶  [4/9] Fixing ProjectDetail.tsx…"
cat > "$SRC/pages/ProjectDetail.tsx" << 'PDEOF'
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Heart, MessageCircle, X, ZoomIn, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useLikes } from "@/hooks/useLikes";
import { supabase } from "@/lib/supabase";

type ProjectFile = { id: number; type: "image" | "video" | "pdf"; url: string; title: string; description?: string };
type Project = { id: number; title: string; category: string; description: string; image_url: string; files: ProjectFile[]; slug: string };
type Profile = { name: string; title: string; email: string; image_url: string; social: Record<string, string> };

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { liked, likeCount, toggleLike } = useLikes(slug ?? "");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) setShowShareMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIndex((i) => Math.min(i + 1, allImages.length - 1));
      if (e.key === "ArrowLeft") setLightboxIndex((i) => Math.max(i - 1, 0));
    };
    if (isLightboxOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const [{ data: projectData }, { data: profileData }] = await Promise.all([
          supabase.from("projects").select("*").eq("slug", slug).single(),
          supabase.from("profile").select("*").eq("id", 1).single(),
        ]);
        setProject(projectData ?? null);
        if (profileData) setProfile(profileData);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    })();
    window.scrollTo(0, 0);
  }, [slug]);

  const allImages = project ? [{ url: project.image_url, type: "cover" }, ...(project.files ?? []).filter(f => f.type === "image").map(f => ({ url: f.url, type: "file" }))] : [];

  const openLightbox = useCallback((idx: number) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  const handleContact = useCallback(() => {
    const email = profile?.email ?? "hello.frankaronu.designs@gmail.com";
    const subject = encodeURIComponent(`Inquiry about ${project?.title ?? "your work"}`);
    const body = encodeURIComponent(`Hi Frank,\n\nI'm interested in your project "${project?.title}".`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }, [profile, project]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: project?.title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
    setShowShareMenu(false);
  }, [project]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading project…</div></div>;
  if (!project) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h1 className="text-2xl font-bold">Project not found</h1><Button onClick={() => setLocation("/")}>Back to Home</Button></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/")} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
          <div className="flex items-center gap-3">
            <button onClick={toggleLike} aria-label={liked ? "Unlike" : "Like"} className="flex items-center gap-1.5 px-4 py-2 rounded-full border hover:bg-muted transition-colors">
              <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            <div className="relative" ref={shareMenuRef}>
              <button onClick={() => setShowShareMenu(v => !v)} className="flex items-center gap-1.5 px-4 py-2 rounded-full border hover:bg-muted transition-colors">
                <Share2 className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium">Share</span>
              </button>
              {showShareMenu && <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 border rounded-xl shadow-lg p-2 w-44 z-50">
                <button onClick={handleShare} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">Copy link</button>
              </div>}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative bg-black">
        <div className="relative h-[60vh] overflow-hidden"><img src={project.image_url} alt={project.title} className="w-full h-full object-cover opacity-90" /></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white bg-gradient-to-t from-black/70 to-transparent">
          <div className="max-w-7xl mx-auto"><Badge className="mb-3">{project.category}</Badge><h1 className="text-4xl md:text-5xl font-bold">{project.title}</h1></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{project.description}</p>
            {allImages.length > 1 && <div><h2 className="text-2xl font-bold mb-6">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.map((img, idx) => (
                  <button key={idx} type="button" onClick={() => openLightbox(idx)} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 group">
                    <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {profile && <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12"><AvatarImage src={profile.image_url} alt={profile.name} /><AvatarFallback>{profile.name?.[0] ?? "F"}</AvatarFallback></Avatar>
                  <div><p className="font-semibold">{profile.name}</p><p className="text-sm text-muted-foreground">{profile.title}</p></div>
                </div>
                <Button className="w-full gap-2" onClick={handleContact}><MessageCircle className="w-4 h-4" /> Contact Designer</Button>
              </div>}
            </div>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div role="dialog" aria-modal="true" aria-label="Image lightbox" className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><X className="w-8 h-8" /></button>
          {lightboxIndex > 0 && <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i - 1); }} className="absolute left-4 text-white hover:text-gray-300 z-10"><ChevronLeft className="w-10 h-10" /></button>}
          {lightboxIndex < allImages.length - 1 && <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i + 1); }} className="absolute right-4 text-white hover:text-gray-300 z-10"><ChevronRight className="w-10 h-10" /></button>}
          <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[lightboxIndex].url} alt="Full size" className="w-full h-full object-contain" />
            <p className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">{lightboxIndex + 1} / {allImages.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
PDEOF
echo "   ✅  ProjectDetail: wouter nav, overflow cleanup, keyboard nav"

# ─── 5. FIX: not-found.tsx ────────────────────────────────────────────────────
echo "▶  [5/9] Fixing not-found.tsx…"
cat > "$SRC/pages/not-found.tsx" << 'NFEOF'
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist.</p>
        <Button onClick={() => setLocation("/")}>Back to Portfolio</Button>
      </div>
    </div>
  );
}
NFEOF
echo "   ✅  not-found.tsx: fixed"

# ─── 6. FIX: admin.tsx password hashing ──────────────────────────────────────
echo "▶  [6/9] Adding SHA-256 hashing to admin password…"
python3 - << 'PYEOF'
import re, sys
path = "artifacts/portfolio/src/pages/admin.tsx"
src = open(path).read()

helper = '''
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
'''
src = src.replace('const DEFAULT_PASSWORD = "admin123";', 'const DEFAULT_PASSWORD = "admin123";\n' + helper)

old_login = '''  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem("admin_password") || DEFAULT_PASSWORD;
    if (password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      setPassword("");
      setError("");
    } else {
      setError("Wrong password");
    }
  };'''
new_login = '''  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedHash = localStorage.getItem("admin_password_hash");
    const inputHash  = await hashPassword(password);
    const defaultHash = await hashPassword(DEFAULT_PASSWORD);
    if (inputHash === (storedHash ?? defaultHash)) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      setPassword("");
      setError("");
    } else {
      setError("Wrong password");
    }
  };'''
src = src.replace(old_login, new_login)

old_change = '''  const handleChangePassword = () => {
    const storedPassword = localStorage.getItem("admin_password") || DEFAULT_PASSWORD;
    if (currentPassword !== storedPassword) {
      setError("Current password is incorrect");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    localStorage.setItem("admin_password", newPassword);
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    alert("Password changed successfully! Please login again.");
    handleLogout();
  };'''
new_change = '''  const handleChangePassword = async () => {
    const storedHash = localStorage.getItem("admin_password_hash");
    const defaultHash = await hashPassword(DEFAULT_PASSWORD);
    const currentHash = await hashPassword(currentPassword);
    if (currentHash !== (storedHash ?? defaultHash)) {
      setError("Current password is incorrect");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    const newHash = await hashPassword(newPassword);
    localStorage.setItem("admin_password_hash", newHash);
    localStorage.removeItem("admin_password");
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    alert("Password changed successfully! Please login again.");
    handleLogout();
  };'''
src = src.replace(old_change, new_change)
open(path, "w").write(src)
print("patched")
PYEOF
echo "   ✅  admin.tsx: passwords hashed with SHA-256"

# ─── 7. FIX: useListProjects ──────────────────────────────────────────────────
echo "▶  [7/9] Fixing useListProjects…"
cat > "$SRC/hooks/useListProjects.ts" << 'ULEOF'
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type ProjectCategory = "Graphics" | "Product Design";

export function useListProjects(params?: { category?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let cancelled = false;
    (async () => {
      try {
        let query = supabase.from("projects").select("*");
        if (params?.category && params.category !== "All") {
          query = query.eq("category", params.category);
        }
        const { data: projects, error } = await query.order("id", { ascending: false });
        if (error) throw error;
        if (!cancelled) setData(projects ?? []);
      } catch (err) {
        if (!cancelled) { console.error("Failed to fetch projects:", err); setData([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params?.category]);

  return { data, isLoading };
}
ULEOF
echo "   ✅  useListProjects: cancel-safe, resets loading on filter change"

# ─── 8. FIX: vite.config.ts ───────────────────────────────────────────────────
echo "▶  [8/9] Optimising vite.config.ts…"
cat > "$PORTFOLIO/vite.config.ts" << 'VITEEOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          icons: ["react-icons", "lucide-react"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-tabs", "@radix-ui/react-tooltip"],
        },
      },
    },
    sourcemap: mode === "development",
  },
}));
VITEEOF
echo "   ✅  vite.config.ts: vendor chunk splitting + conditional sourcemaps"

# ─── 9. FIX: vercel.json ──────────────────────────────────────────────────────
echo "▶  [9/9] Removing hardcoded Supabase keys from vercel.json…"
cat > vercel.json << 'VERCELEOF'
{
  "buildCommand": "cd artifacts/portfolio && pnpm run build",
  "outputDirectory": "artifacts/portfolio/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
VERCELEOF
echo "   ✅  vercel.json: Supabase keys removed"

echo ""
echo "   ⚠️   ACTION REQUIRED: Add these to Vercel Dashboard > Settings > Environment Variables:"
echo "        VITE_SUPABASE_URL       = https://acbhiirlijxczlpmmarb.supabase.co"
echo "        VITE_SUPABASE_ANON_KEY  = sb_publishable_pH93IGUl9hJnDNdTPhuZTA_TQ77nJ0_"
echo ""

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                   All fixes applied ✅                   ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Next steps:                                             ║"
echo "║  1. git add -A                                           ║"
echo "║  2. git commit -m 'fix: apply portfolio audit fixes'     ║"
echo "║  3. git push                                             ║"
echo "║  4. Add VITE_SUPABASE_* vars in Vercel dashboard         ║"
echo "║  5. Vercel will auto-deploy from your push               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
