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
