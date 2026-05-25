import { useState } from "react";
import { useListProjects } from "@/hooks/useListProjects";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { ArrowRight, X, Mail, MapPin } from "lucide-react";
import type { ProjectCategory } from "@/hooks/useListProjects";

type CategoryFilter = "All" | "Graphics" | "Product Design";

export default function Home() {
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const { data: projects, isLoading } = useListProjects(
    filter === "All" ? {} : { category: filter as ProjectCategory }
  );
  const { profile, isLoading: profileLoading } = useProfile();

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-12 md:py-24 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Designing clarity in a complex world.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            I'm a multidisciplinary designer focused on crafting precise, engaging digital and physical experiences. Based in nowhere, working everywhere.
          </p>
        </div>
      </header>

      {/* Profile Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full border-y dark:border-gray-700 border-muted">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-shrink-0">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-1">
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{profile.name}</h2>
            <p className="text-muted-foreground mb-4">{profile.title}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>hello.frankaronu.designs@gmail.com</span>
              </div>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto md:mx-0">
              {profile.bio}
            </p>
            <div className="flex gap-4 mt-6 justify-center md:justify-start flex-wrap">
              <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild>
                <a href={profile.social.dribbble} target="_blank" rel="noopener noreferrer">
                  <FaDribbble /> Dribbble
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild>
                <a href={profile.social.behance} target="_blank" rel="noopener noreferrer">
                  <FaBehance /> Behance
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild>
                <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin /> LinkedIn
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild>
                <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer">
                  <FaInstagram /> Instagram
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-full" asChild>
                <a href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <main className="flex-1 px-6 pb-24 max-w-7xl mx-auto w-full">
        <div className="flex gap-2 mb-12 overflow-x-auto pb-2 scrollbar-none">
          {(["All", "Graphics", "Product Design"] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap ${
                filter === cat
                  ? "bg-foreground text-background shadow-md scale-105"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-80 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project) => (
              <div
                key={project.id}
                onClick={() => window.location.href = `/project/${project.id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium px-4 py-2 border border-white rounded-full">
                      View Project
                    </span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's create something</h2>
              <p className="text-gray-400">
                Have a project in mind? Let's talk.
              </p>
            </div>
              <Button size="lg" className="gap-2 rounded-full px-8 dark:bg-gray-800 bg-white dark:text-white text-gray-900 hover:bg-gray-100" asChild>

                <a href="mailto:hello.frankaronu.designs@gmail.com">

                  Get in touch <ArrowRight className="w-4 h-4" />

                </a>

              </Button>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-16 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              © 2025 {profile.name}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href={profile.social.dribbble} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaDribbble size={20} />
              </a>
              <a href={profile.social.behance} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaBehance size={20} />
              </a>
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Project Modal */}
      <Dialog open={!!selectedProjectId} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
          {selectedProject && (
            <div className="relative">
              <DialogClose className="absolute right-4 top-4 z-10 rounded-full bg-black/50 text-white p-2 hover:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </DialogClose>
              <div className="grid md:grid-cols-2">
                <div className="aspect-square md:aspect-auto">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <DialogTitle className="text-2xl md:text-3xl mb-3">
                    {selectedProject.title}
                  </DialogTitle>
                  <Badge className="mb-4">{selectedProject.category}</Badge>
                  <DialogDescription className="text-base leading-relaxed">
                    {selectedProject.description}
                  </DialogDescription>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
