import { useState, useEffect, useRef } from "react";
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
  ZoomIn,
  Share2
} from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";
import { useLikes } from "@/hooks/useLikes";
import { supabase } from "@/lib/supabase";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [project, setProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const { liked, likeCount, isLoading: likesLoading, toggleLike } = useLikes(slug || "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project by slug
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (projectError) throw projectError;
        setProject(projectData);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (profileData) setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setProject(null);
      }
      setIsLoading(false);
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  const getAllImages = () => {
    if (!project) return [];
    const images = [{ url: project.image_url, type: "cover" }];
    if (project.files) {
      project.files.forEach((file: any) => {
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

  
  
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(project?.title || '')}&url=${encodeURIComponent(window.location.href)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(project?.title || '')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(project?.title + ' - ' + window.location.href)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
      setShowShareMenu(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Press Ctrl+C to copy the link');
    }
  };

  const handleShare = async () => { setShowShareMenu(!showShareMenu); };
    const url = window.location.href;
    const title = project?.title || "Check out this project";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out "${title}" by Frank Aronu`,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Press Ctrl+C to copy the link: ' + url);
      }
    }
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

  const hasVideo = (project.files || []).some((f: any) => f.type === "video");
  const hasPdf = (project.files || []).some((f: any) => f.type === "pdf");
  const videoFiles = (project.files || []).filter((f: any) => f.type === "video");
  const pdfFiles = (project.files || []).filter((f: any) => f.type === "pdf");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Bar */}
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
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
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

      {/* Like and Share Buttons */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleLike}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full transition-all duration-200 group"
          >
            <Heart 
              className={`w-8 h-8 transition-all ${liked ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400 group-hover:text-red-400"}`} 
            />
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{likeCount}</span>
          </button>
          
          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={handleShare}
              className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 group"
            >
              <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Share</span>
            </button>
            
            {showShareMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50 min-w-[200px]">
                <div className="space-y-1">
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaFacebook className="w-5 h-5 text-[#1877f2]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Facebook</span>
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaTwitter className="w-5 h-5 text-[#1da1f2]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Twitter</span>
                  </a>
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaLinkedin className="w-5 h-5 text-[#0077b5]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">LinkedIn</span>
                  </a>
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FaWhatsapp className="w-5 h-5 text-[#25d366]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp</span>
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Copy Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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

            {/* Gallery */}
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
            </section>

            {/* Videos */}
            {videoFiles.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Videos</h2>
                <div className="space-y-4">
                  {videoFiles.map((file: any) => (
                    <div key={file.id} className="rounded-xl overflow-hidden bg-black">
                      <video src={file.url} controls className="w-full" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PDFs */}
            {pdfFiles.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
                <div className="space-y-2">
                  {pdfFiles.map((file: any) => (
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-gray-700 dark:text-gray-300">{project.category}</span>
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
                  <img src={profile?.image_url || "https://picsum.photos/id/64/100/100"} alt="Designer" className="rounded-full" />
                </Avatar>
                <h4 className="font-semibold text-gray-900 dark:text-white">{profile?.name || "Frank Aronu"}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{profile?.title || "Designer"}</p>
                <div className="flex justify-center gap-3">
                  <a href={profile?.social?.behance || "#"} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><FaBehance size={14} /></a>
                  <a href={profile?.social?.dribbble || "#"} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><FaDribbble size={14} /></a>
                  <a href={profile?.social?.linkedin || "#"} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><FaLinkedin size={14} /></a>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={handleContact}>
                <MessageCircle className="w-4 h-4" /> Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
          <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-black/80 backdrop-blur-sm">
            <span className="text-white text-sm">{allImages.length} images</span>
            <button onClick={closeLightbox} className="text-white hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="pb-8">
            {allImages.map((img, idx) => (
              <div key={idx} className="w-full">
                <img src={img.url} alt="" className="w-full h-auto" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
