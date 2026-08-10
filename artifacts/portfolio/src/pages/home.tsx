import { useState, useEffect } from "react";
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

  // Preload the first 3 project images as soon as we have them
  // so they appear instantly when the grid renders
  useEffect(() => {
    if (!projects || projects.length === 0) return;
    projects.slice(0, 3).forEach((p: any) => {
      if (!p.image_url) return;
      const img = new Image();
      img.src = p.image_url;
    });
  }, [projects]);
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
