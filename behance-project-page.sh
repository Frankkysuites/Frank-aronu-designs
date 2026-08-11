#!/usr/bin/env bash
# =============================================================================
# Redesign ProjectDetail.tsx — Behance-style layout
# Run from repo root: bash behance-project-page.sh
# =============================================================================

set -e

echo ""
echo "▶  Writing Behance-style ProjectDetail …"

cat > "artifacts/portfolio/src/pages/ProjectDetail.tsx" << 'EOF'
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Eye, Share2, MessageCircle, X,
  ChevronLeft, ChevronRight, ArrowLeft, ExternalLink,
} from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useLikes } from "@/hooks/useLikes";
import { supabase } from "@/lib/supabase";

type ProjectFile = {
  id: number;
  type: "image" | "video" | "pdf";
  url: string;
  title: string;
  description?: string;
};
type Project = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  image_url: string;
  files: ProjectFile[];
};
type Profile = {
  name: string;
  title: string;
  email: string;
  image_url: string;
  location: string;
  social: Record<string, string>;
};

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [viewCount] = useState(() => Math.floor(Math.random() * 4000) + 800);
  const shareRef = useRef<HTMLDivElement>(null);
  const { liked, likeCount, toggleLike } = useLikes(slug ?? "");

  // Fetch project + profile in parallel
  useEffect(() => {
    if (!slug) return;
    window.scrollTo(0, 0);
    (async () => {
      try {
        const [{ data: proj }, { data: prof }] = await Promise.all([
          supabase.from("projects").select("*").eq("slug", slug).single(),
          supabase.from("profile").select("*").eq("id", 1).single(),
        ]);
        setProject(proj ?? null);
        if (prof) setProfile(prof);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [slug]);

  // Close share on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node))
        setShowShare(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIdx((i) => Math.min(i + 1, allImages.length - 1));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  // Always restore scroll on unmount
  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  const allImages = project
    ? [
        { url: project.image_url, title: "Cover" },
        ...(project.files ?? [])
          .filter((f) => f.type === "image")
          .map((f) => ({ url: f.url, title: f.title })),
      ]
    : [];

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: project?.title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
    setShowShare(false);
  }, [project]);

  const handleContact = useCallback(() => {
    const email = profile?.email ?? "hello.frankaronu.designs@gmail.com";
    const sub = encodeURIComponent(`Project inquiry: ${project?.title}`);
    const body = encodeURIComponent(`Hi Frank,\n\nI came across your project "${project?.title}" and would love to discuss it.\n\n`);
    window.location.href = `mailto:${email}?subject=${sub}&body=${body}`;
  }, [profile, project]);

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a1a1a] animate-pulse">
        <div className="h-16 bg-gray-100 dark:bg-gray-800 border-b" />
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-[60vh] bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#1a1a1a]">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <button onClick={() => setLocation("/")} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
          Back to Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100">

      {/* ── Top Nav (Behance-style) ───────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Back */}
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Title (truncated on mobile) */}
          <h2 className="text-sm font-semibold truncate max-w-[200px] md:max-w-sm hidden sm:block">
            {project.title}
          </h2>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={toggleLike}
              aria-label="Like"
              aria-pressed={liked}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                liked
                  ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-600 dark:text-gray-300"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likeCount}</span>
            </button>

            {/* Share */}
            <div className="relative" ref={shareRef}>
              <button
                onClick={() => setShowShare((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              {showShare && (
                <div className="absolute right-0 top-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 w-48 z-50">
                  <button onClick={handleShare} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Copy link
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleContact}
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Hire Me
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Project Title & Meta */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs uppercase tracking-wide">{project.category}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{project.title}</h1>

          {/* Author row */}
          {profile && (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-gray-100 dark:border-gray-700">
                  <AvatarImage src={profile.image_url} alt={profile.name} />
                  <AvatarFallback>{profile.name?.[0] ?? "F"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{profile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{profile.title} · {profile.location}</p>
                </div>
              </div>
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {viewCount.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {likeCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Cover Image ──────────────────────────────────── */}
        <div
          className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in mb-2"
          onClick={() => openLightbox(0)}
        >
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full object-cover"
          />
        </div>

        {/* ── Additional Images — full-width stacked like Behance ── */}
        {allImages.slice(1).map((img, idx) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in mt-4"
            onClick={() => openLightbox(idx + 1)}
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full object-cover"
              loading="lazy"
            />
            {img.title && (
              <p className="text-xs text-center text-gray-400 py-2">{img.title}</p>
            )}
          </div>
        ))}

        {/* ── Description ───────────────────────────────────── */}
        <div className="mt-10 pb-10 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">About this project</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* ── Owner Card ────────────────────────────────────── */}
        {profile && (
          <div className="mt-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-700 shadow-sm">
                <AvatarImage src={profile.image_url} alt={profile.name} />
                <AvatarFallback className="text-xl">{profile.name?.[0] ?? "F"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{profile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.title}</p>
                <div className="flex gap-3 mt-2">
                  {profile.social?.dribbble  && <a href={profile.social.dribbble}  target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors"><FaDribbble  size={16} /></a>}
                  {profile.social?.behance   && <a href={profile.social.behance}   target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors"><FaBehance   size={16} /></a>}
                  {profile.social?.linkedin  && <a href={profile.social.linkedin}  target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors"><FaLinkedin  size={16} /></a>}
                  {profile.social?.instagram && <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors"><FaInstagram size={16} /></a>}
                  {profile.social?.whatsapp  && <a href={profile.social.whatsapp}  target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors"><FaWhatsapp  size={16} /></a>}
                </div>
              </div>
            </div>
            <button
              onClick={handleContact}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" /> Get in touch
            </button>
          </div>
        )}

        {/* ── Like banner ───────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 px-8 py-3 rounded-full border-2 text-sm font-semibold transition-all ${
              liked
                ? "bg-red-50 border-red-300 text-red-500 dark:bg-red-900/20 dark:border-red-700"
                : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            {liked ? "You appreciated this" : "Appreciate"} · {likeCount}
          </button>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIdx + 1} / {allImages.length}
          </span>

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i - 1); }}
              className="absolute left-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next */}
          {lightboxIdx < allImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i + 1); }}
              className="absolute right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-5xl max-h-[90vh] w-full px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[lightboxIdx].url}
              alt={allImages[lightboxIdx].title}
              className="w-full h-full object-contain rounded-lg"
            />
            {allImages[lightboxIdx].title && (
              <p className="text-center text-white/50 text-sm mt-3">
                {allImages[lightboxIdx].title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
EOF

echo "   ✅  ProjectDetail.tsx rewritten — Behance-style layout"
echo ""
echo "▶  Committing and pushing …"
git add -A && git commit -m "feat: Behance-style project detail page" && git push
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Done ✅  Vercel will deploy in ~1 min                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
