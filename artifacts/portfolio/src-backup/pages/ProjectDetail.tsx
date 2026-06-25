import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Download,
  ExternalLink,
  MessageCircle,
  X,
  ZoomIn
} from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
import type { Project, ProjectFile } from "@/types/project";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(89);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const storedProjects = localStorage.getItem("portfolio_projects");
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const found = projects.find(p => p.id === parseInt(id!));
      setProject(found || null);
    }
    
    const storedProfile = localStorage.getItem("portfolio_profile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    
    const storedLikes = localStorage.getItem("project_likes");
    if (storedLikes) {
      const likes = JSON.parse(storedLikes);
      if (likes[id!]) {
        setLiked(likes[id!].liked);
        setLikeCount(likes[id!].count);
      }
    }
    
    setIsLoading(false);
    window.scrollTo(0, 0);
  }, [id]);

  const getAllImages = () => {
    if (!project) return [];
    const images = [{ url: project.imageUrl, type: "cover" }];
    if (project.files) {
      project.files.forEach(file => {
        if (file.type === "image") {
          images.push({ url: file.url, type: "file" });
        }
      });
    }
    return images;
  };

  const allImages = getAllImages();

  const openLightbox = (startIndex: number) => {
    setLightboxStartIndex(startIndex);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleLike = () => {
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setLiked(newLiked);
    setLikeCount(newCount);
    
    const storedLikes = localStorage.getItem("project_likes");
    const likes = storedLikes ? JSON.parse(storedLikes) : {};
    likes[id!] = { liked: newLiked, count: newCount };
    localStorage.setItem("project_likes", JSON.stringify(likes));
  };

  const handleContact = () => {
    const email = profile?.email || "hello.frankaronu.designs@gmail.com";
    window.location.href = `mailto:${email}?subject=Inquiry about ${project?.title}&body=Hi Frank, I'm interested in your project "${project?.title}"...`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Button onClick={() => window.location.href = "/"}>Back to Home</Button>
      </div>
    );
  }

  const hasVideo = (project.files || []).some(f => f.type === "video");
  const hasPdf = (project.files || []).some(f => f.type === "pdf");
  const videoFiles = (project.files || []).filter(f => f.type === "video");
  const pdfFiles = (project.files || []).filter(f => f.type === "pdf");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Bar - Sticky */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/"}
              className="gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-black">
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img 
            src={project.imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        
        {/* Project Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto">
            <Badge className="mb-3 bg-white/20 text-white border-white/30">
              {project.category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold max-w-4xl">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Like Button - Under Cover Photo */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-start">
          <button
            onClick={handleLike}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full transition-all duration-200 group"
          >
            <Heart 
              className={`w-8 h-8 transition-all ${liked ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400 group-hover:text-red-400"}`} 
            />
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{likeCount}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {project.description}
              </p>
            </section>

            <div className="flex flex-wrap gap-2">
              {["Adobe Suite", "Figma", "Illustrator", "Photoshop"].map(tool => (
                <span key={tool} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                  {tool}
                </span>
              ))}
            </div>

            {/* Image Gallery - Tiles Grid */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gallery</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{allImages.length} images</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                    onClick={() => openLightbox(idx)}
                  >
                    <img
                      src={img.url}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => openLightbox(0)}
                className="w-full mt-4 text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                View all {allImages.length} images →
              </button>
            </section>

            {/* Videos Section */}
            {videoFiles.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Videos</h2>
                <div className="space-y-4">
                  {videoFiles.map((file) => (
                    <div key={file.id} className="rounded-xl overflow-hidden bg-black">
                      <video src={file.url} controls className="w-full" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PDF Documents */}
            {pdfFiles.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
                <div className="space-y-2">
                  {pdfFiles.map((file) => (
                    <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 font-bold text-xs">PDF</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.title}</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-gray-700 dark:text-gray-300">{project.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Published</span>
                    <span className="text-gray-700 dark:text-gray-300">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Images</span>
                    <span className="text-gray-700 dark:text-gray-300">{allImages.length}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Views</span>
                      <span className="text-gray-700 dark:text-gray-300"><Eye className="w-3 h-3 inline mr-1" /> 1.2K</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  {(() => {
                    try {
                      const storedProfile = localStorage.getItem("portfolio_profile");
                      const profileData = storedProfile ? JSON.parse(storedProfile) : {};
                      return <img src={profileData.imageUrl || "https://picsum.photos/id/64/100/100"} alt="Designer" className="rounded-full" />;
                    } catch {
                      return <AvatarFallback>FA</AvatarFallback>;
                    }
                  })()}
                </Avatar>
                <h4 className="font-semibold text-gray-900 dark:text-white">Frank Aronu</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Designer</p>
                <div className="flex justify-center gap-3">
                  <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><FaBehance size={14} /></a>
                  <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><FaDribbble size={14} /></a>
                  <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><FaLinkedin size={14} /></a>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={handleContact}>
                <MessageCircle className="w-4 h-4" /> Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Scroll Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
          <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-black/80 backdrop-blur-sm">
            <span className="text-white text-sm">{allImages.length} images</span>
            <button
              onClick={closeLightbox}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="pb-8">
            {allImages.map((img, idx) => (
              <div key={idx} className="w-full">
                <img 
                  src={img.url} 
                  alt=""
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
