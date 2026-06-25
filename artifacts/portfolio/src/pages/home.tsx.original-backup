import { useState } from "react";
import { useListProjects } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FaDribbble, FaBehance, FaLinkedin } from "react-icons/fa";
import { ArrowRight, X } from "lucide-react";
import type { ProjectCategory } from "@workspace/api-client-react";

type CategoryFilter = "All" | "Graphics" | "Product Design";

export default function Home() {
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const { data: projects, isLoading } = useListProjects(
    filter === "All" ? {} : { category: filter as ProjectCategory }
  );

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

      {/* Portfolio Grid Section */}
      <main className="flex-1 px-6 pb-24 max-w-7xl mx-auto w-full">
        {/* Filters */}
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

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                <Skeleton className="w-2/3 h-6 rounded" />
                <Skeleton className="w-1/3 h-4 rounded" />
              </div>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="group flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg overflow-hidden transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted rounded-lg mb-4">
                  <img
                    src={`/api/storage${project.objectPath}`}
                    alt={project.title}
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-semibold mb-1 font-display">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center px-4 bg-muted/30 rounded-2xl border border-border/50 border-dashed">
            <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl text-muted-foreground font-display italic opacity-50">Empty</span>
            </div>
            <h3 className="text-2xl font-display font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground max-w-md">
              The portfolio is currently being curated. Check back soon for updates.
            </p>
          </div>
        )}
      </main>

      {/* Contact Section */}
      <footer className="bg-foreground text-background py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Let's build something beautiful.</h2>
            <a 
              href="mailto:hello@yourportfolio.com" 
              className="inline-flex items-center gap-2 text-lg hover:text-primary transition-colors group"
            >
              hello@yourportfolio.com
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          
          <div className="flex flex-col gap-6 md:text-right">
            <div>
              <p className="font-display text-xl mb-1">Your Name</p>
              <p className="text-muted-foreground/60 text-sm">Designer & Art Director</p>
            </div>
            
            <div className="flex gap-4 md:justify-end">
              <a href="#" className="p-2 bg-background/10 hover:bg-background/20 rounded-full transition-colors" aria-label="Dribbble">
                <FaDribbble className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 hover:bg-background/20 rounded-full transition-colors" aria-label="Behance">
                <FaBehance className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 hover:bg-background/20 rounded-full transition-colors" aria-label="LinkedIn">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedProjectId} onOpenChange={(open) => !open && setSelectedProjectId(null)}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden border-none bg-background/95 backdrop-blur-xl gap-0 shadow-2xl sm:rounded-2xl">
          {selectedProject && (
            <div className="flex flex-col md:flex-row max-h-[90vh]">
              <div className="relative flex-1 bg-black/5 flex items-center justify-center min-h-[40vh] md:min-h-[60vh] overflow-hidden">
                <img
                  src={`/api/storage${selectedProject.objectPath}`}
                  alt={selectedProject.title}
                  className="object-contain w-full h-full max-h-[60vh] md:max-h-[90vh]"
                />
              </div>
              <div className="p-8 md:p-12 md:w-[400px] flex flex-col overflow-y-auto">
                <Badge variant="outline" className="w-fit mb-6 font-normal tracking-wide uppercase text-xs border-primary/20 text-primary">
                  {selectedProject.category}
                </Badge>
                <DialogTitle className="text-3xl font-display font-bold mb-6 leading-tight">
                  {selectedProject.title}
                </DialogTitle>
                <DialogDescription className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {selectedProject.description}
                </DialogDescription>
              </div>
              <DialogClose className="absolute top-4 right-4 p-2 bg-background/50 hover:bg-background/80 backdrop-blur-md rounded-full transition-colors z-10">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
