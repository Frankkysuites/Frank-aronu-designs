import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Save, Plus, Upload, Link as LinkIcon, LogOut, KeyRound, X, Image, Video, FileText, FolderOpen } from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";

type ProjectFile = {
  id: number;
  type: "image" | "video" | "pdf";
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
};

type Project = {
  id: number;
  title: string;
  category: "Graphics" | "Product Design";
  description: string;
  imageUrl: string;
  files: ProjectFile[];
  createdAt: number;
};

type SocialLinks = {
  dribbble: string;
  behance: string;
  linkedin: string;
  instagram: string;
  whatsapp: string;
};

type Profile = {
  name: string;
  title: string;
  location: string;
  email: string;
  bio: string;
  imageUrl: string;
  social: SocialLinks;
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Brand Identity System",
    category: "Graphics",
    description: "Complete brand identity including logo, color palette, and brand guidelines for a tech startup.",
    imageUrl: "https://picsum.photos/id/20/800/600",
    files: [],
    createdAt: Date.now(),
  },
  {
    id: 2,
    title: "Minimalist Chair",
    category: "Product Design",
    description: "Ergonomic chair design focusing on comfort, sustainability, and minimal aesthetics.",
    imageUrl: "https://picsum.photos/id/21/800/600",
    files: [],
    createdAt: Date.now(),
  },
  {
    id: 3,
    title: "Poster Collection",
    category: "Graphics",
    description: "Series of typographic posters for cultural events and music festivals.",
    imageUrl: "https://picsum.photos/id/22/800/600",
    files: [],
    createdAt: Date.now(),
  },
  {
    id: 4,
    title: "Smart Lamp",
    category: "Product Design",
    description: "IoT-enabled desk lamp with adaptive lighting and voice control.",
    imageUrl: "https://picsum.photos/id/26/800/600",
    files: [],
    createdAt: Date.now(),
  },
  {
    id: 5,
    title: "Packaging Design",
    category: "Graphics",
    description: "Eco-friendly packaging solution for organic food products.",
    imageUrl: "https://picsum.photos/id/30/800/600",
    files: [],
    createdAt: Date.now(),
  },
  {
    id: 6,
    title: "Wireless Earbuds",
    category: "Product Design",
    description: "Compact, ergonomic earbuds with premium sound quality and charging case.",
    imageUrl: "https://picsum.photos/id/36/800/600",
    files: [],
    createdAt: Date.now(),
  },
];

const DEFAULT_PROFILE: Profile = {
  name: "Frank Aronu",
  title: "Graphics & Product Designer",
  location: "Africa",
  email: "hello.frankaronu.designs@gmail.com",
  bio: "With over 8 years of experience in graphic design and product design, I help brands create meaningful connections through thoughtful design solutions. I believe in the power of simplicity and the beauty of functional aesthetics.",
  imageUrl: "https://picsum.photos/id/64/400/400",
  social: {
    dribbble: "https://dribbble.com/",
    behance: "https://behance.net/",
    linkedin: "https://linkedin.com/in/",
    instagram: "https://instagram.com/",
    whatsapp: "https://wa.me/",
  },
};

const DEFAULT_PASSWORD = "admin123";

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [isEditingProject, setIsEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isManagingFiles, setIsManagingFiles] = useState<Project | null>(null);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newProject, setNewProject] = useState<Project>({
    id: Date.now(),
    title: "",
    category: "Graphics",
    description: "",
    imageUrl: "",
    files: [],
    createdAt: Date.now(),
  });

  const [newFile, setNewFile] = useState<ProjectFile>({
    id: Date.now(),
    type: "image",
    url: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem("admin_auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const storedProjects = localStorage.getItem("portfolio_projects");
    const storedProfile = localStorage.getItem("portfolio_profile");
    
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      setProjects(DEFAULT_PROJECTS);
    }
    
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
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
  };

  const handleChangePassword = () => {
    setError("");
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
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
    setPassword("");
  };

  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    setUploadingImage(true);
    try {
      const base64Url = await handleImageUpload(file);
      setProfile({ ...profile, imageUrl: base64Url });
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    setUploadingImage(true);
    try {
      const base64Url = await handleImageUpload(file);
      if (isEditingProject) {
        setIsEditingProject({ ...isEditingProject, imageUrl: base64Url });
      } else {
        setNewProject({ ...newProject, imageUrl: base64Url });
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    let type: "image" | "video" | "pdf" = "image";
    if (file.type.startsWith('video/')) type = "video";
    else if (file.type === 'application/pdf') type = "pdf";
    
    setUploadingImage(true);
    try {
      const base64Url = await handleImageUpload(file);
      setNewFile({ ...newFile, url: base64Url, type });
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem("portfolio_projects", JSON.stringify(updatedProjects));
  };

  const saveProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    localStorage.setItem("portfolio_profile", JSON.stringify(updatedProfile));
    setIsEditingProfile(false);
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.imageUrl) {
      alert("Please fill in title and cover image");
      return;
    }
    const projectToAdd = { ...newProject, id: Date.now(), createdAt: Date.now() };
    saveProjects([...projects, projectToAdd]);
    setIsAddingProject(false);
    setNewProject({
      id: Date.now(),
      title: "",
      category: "Graphics",
      description: "",
      imageUrl: "",
      files: [],
      createdAt: Date.now(),
    });
    setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
  };

  const deleteProject = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      saveProjects(projects.filter(p => p.id !== id));
    }
  };

  const updateProject = (updatedProject: Project) => {
    saveProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsEditingProject(null);
    setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
  };

  const addFileToCurrentProject = () => {
    if (!newFile.title || !newFile.url) {
      alert("Please fill in file title and upload a file");
      return;
    }
    
    if (isEditingProject) {
      setIsEditingProject({
        ...isEditingProject,
        files: [...(isEditingProject.files || []), { ...newFile, id: Date.now() }]
      });
    } else {
      setNewProject({
        ...newProject,
        files: [...(newProject.files || []), { ...newFile, id: Date.now() }]
      });
    }
    
    setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
    alert("File added! You can add more or save the project.");
  };

  const removeFileFromCurrentProject = (fileId: number) => {
    if (isEditingProject) {
      setIsEditingProject({
        ...isEditingProject,
        files: (isEditingProject.files || []).filter(f => f.id !== fileId)
      });
    } else {
      setNewProject({
        ...newProject,
        files: (newProject.files || []).filter(f => f.id !== fileId)
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case "video": return <Video className="w-4 h-4" />;
      case "pdf": return <FileText className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 bg-gray-50 px-4">
        <div className="max-w-md w-full dark:bg-gray-800 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Default password: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              <KeyRound className="w-4 h-4 mr-2" /> Change Password
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              View Site
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Profile Settings</h2>
            <Button onClick={() => setIsEditingProfile(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
          <div className="flex gap-6 flex-wrap">
            <img src={profile.imageUrl} alt={profile.name} className="w-24 h-24 rounded-full object-cover" />
            <div className="space-y-1">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Title:</strong> {profile.title}</p>
              <p><strong>Location:</strong> {profile.location}</p>
              <p><strong>Email:</strong> {profile.email}</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="dark:bg-gray-800 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-semibold">Projects ({projects.length})</h2>
            <Button onClick={() => setIsAddingProject(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add New Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="dark:border-gray-700 border rounded-lg p-4">
                <div className="flex gap-4 items-start flex-wrap">
                  <img src={project.imageUrl} alt={project.title} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <p className="text-sm dark:text-gray-300 text-gray-600">{project.category}</p>
                    <p className="text-sm text-gray-500 mt-1">{project.description.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-400 mt-1">📎 {project.files?.length || 0} additional files</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditingProject(project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No projects yet. Click "Add New Project" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent className="max-w-md">
          <DialogTitle>Change Admin Password</DialogTitle>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 4 characters)"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsChangingPassword(false)}>Cancel</Button>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Project Modal with Full File Management */}
      <Dialog open={isAddingProject || !!isEditingProject} onOpenChange={() => {
        setIsAddingProject(false);
        setIsEditingProject(null);
        setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>{isEditingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
          <div className="space-y-4 mt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:border-gray-700 border-b pb-2">Basic Information</h3>
              
              <div>
                <Label>Project Title *</Label>
                <Input
                  value={isEditingProject ? isEditingProject.title : newProject.title}
                  onChange={(e) => isEditingProject 
                    ? setIsEditingProject({...isEditingProject, title: e.target.value})
                    : setNewProject({...newProject, title: e.target.value})
                  }
                  placeholder="e.g., Brand Identity for Tech Startup"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Category *</Label>
                <select
                  className="w-full dark:border-gray-700 border rounded-md p-2 mt-1"
                  value={isEditingProject ? isEditingProject.category : newProject.category}
                  onChange={(e) => isEditingProject
                    ? setIsEditingProject({...isEditingProject, category: e.target.value as "Graphics" | "Product Design"})
                    : setNewProject({...newProject, category: e.target.value as "Graphics" | "Product Design"})
                  }
                >
                  <option value="Graphics">Graphics Design</option>
                  <option value="Product Design">Product Design</option>
                </select>
              </div>
              
              <div>
                <Label>Project Description *</Label>
                <Textarea
                  value={isEditingProject ? isEditingProject.description : newProject.description}
                  onChange={(e) => isEditingProject
                    ? setIsEditingProject({...isEditingProject, description: e.target.value})
                    : setNewProject({...newProject, description: e.target.value})
                  }
                  rows={4}
                  placeholder="Describe the project: what was the goal, your approach, and the outcome..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:border-gray-700 border-b pb-2">Cover Image</h3>
              
              <div>
                <Label>Project Cover Image *</Label>
                <div className="flex gap-4 items-start flex-wrap mt-1">
                  <div className="relative">
                    <img 
                      src={isEditingProject ? isEditingProject.imageUrl : newProject.imageUrl} 
                      alt="Cover preview" 
                      className="w-40 h-40 object-cover rounded-lg dark:border-gray-700 border"
                      onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=No+Image"}
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProjectImageUpload}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('cover-image-upload')?.click()}
                      disabled={uploadingImage}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <p className="text-xs text-gray-500">or enter image URL below</p>
                    <Input
                      value={isEditingProject ? isEditingProject.imageUrl : newProject.imageUrl}
                      onChange={(e) => isEditingProject
                        ? setIsEditingProject({...isEditingProject, imageUrl: e.target.value})
                        : setNewProject({...newProject, imageUrl: e.target.value})
                      }
                      placeholder="https://example.com/cover-image.jpg"
                      className="w-80"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Project Files */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg dark:border-gray-700 border-b pb-2">Additional Project Files</h3>
              
              {/* Current Files List */}
              {((isEditingProject && (isEditingProject.files?.length || 0) > 0) || 
                (!isEditingProject && (newProject.files?.length || 0) > 0)) && (
                <div className="space-y-2">
                  <Label>Files in this project</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto dark:border-gray-700 border rounded-lg p-2">
                    {(isEditingProject ? isEditingProject.files : newProject.files).map((file) => (
                      <div key={file.id} className="flex items-center justify-between dark:bg-gray-900 bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm font-medium">{file.title}</span>
                          {file.description && <span className="text-xs text-gray-500">- {file.description.substring(0, 50)}</span>}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeFileFromCurrentProject(file.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New File */}
              <div className="dark:border-gray-700 border rounded-lg p-4 dark:bg-gray-900 bg-gray-50">
                <Label className="mb-2 block">Add File to This Project</Label>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <select
                      className="dark:border-gray-700 border rounded-md p-2"
                      value={newFile.type}
                      onChange={(e) => setNewFile({...newFile, type: e.target.value as "image" | "video" | "pdf"})}
                    >
                      <option value="image">📷 Image</option>
                      <option value="video">🎥 Video</option>
                      <option value="pdf">📄 PDF Document</option>
                    </select>
                    <input
                      type="file"
                      accept="image/*,video/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-input"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Choose File'}
                    </Button>
                  </div>
                  {newFile.url && <p className="text-xs text-green-600">✓ File ready to add</p>}
                  <Input
                    placeholder="File title (e.g., Logo Design, Brand Guidelines, Poster)"
                    value={newFile.title}
                    onChange={(e) => setNewFile({...newFile, title: e.target.value})}
                  />
                  <Textarea
                    placeholder="File description (optional)"
                    value={newFile.description || ""}
                    onChange={(e) => setNewFile({...newFile, description: e.target.value})}
                    rows={2}
                  />
                  <Button 
                    size="sm" 
                    onClick={addFileToCurrentProject}
                    disabled={!newFile.title || !newFile.url}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add This File
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Add multiple files - logos, mockups, process work, final deliverables, etc.
                </p>
              </div>
              
              {/* File Count */}
              {((isEditingProject && (isEditingProject.files?.length || 0) > 0) || 
                (!isEditingProject && (newProject.files?.length || 0) > 0)) && (
                <div className="bg-blue-50 dark:border-gray-700 border dark:border-gray-700 border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📎 Total: {(isEditingProject ? isEditingProject.files.length : newProject.files.length)} file(s) attached to this project
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 dark:border-gray-700 border-t">
              <Button variant="outline" onClick={() => {
                setIsAddingProject(false);
                setIsEditingProject(null);
                setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
              }}>
                Cancel
              </Button>
              <Button onClick={() => isEditingProject ? updateProject(isEditingProject) : handleAddProject()}>
                <Save className="w-4 h-4 mr-2" /> 
                {isEditingProject ? "Save Project Changes" : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>Edit Profile</DialogTitle>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Profile Picture</Label>
              <div className="flex gap-4 items-center">
                <img src={profile.imageUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                    ref={fileInputRef}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload New Photo'}
                  </Button>
                </div>
              </div>
              <Input
                value={profile.imageUrl}
                onChange={(e) => setProfile({...profile, imageUrl: e.target.value})}
                className="mt-2"
              />
            </div>
            <div><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} /></div>
            <div><Label>Title</Label><Input value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} /></div>
            <div><Label>Location</Label><Input value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} /></div>
            <div><Label>Bio</Label><Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows={4} /></div>
            
            <div className="dark:border-gray-700 border-t pt-4">
              <h3 className="font-semibold mb-3">Social Media Links</h3>
              <div className="space-y-3">
                <div><Label className="flex items-center gap-2"><FaDribbble /> Dribbble</Label><Input value={profile.social.dribbble} onChange={(e) => setProfile({...profile, social: {...profile.social, dribbble: e.target.value}})} /></div>
                <div><Label className="flex items-center gap-2"><FaBehance /> Behance</Label><Input value={profile.social.behance} onChange={(e) => setProfile({...profile, social: {...profile.social, behance: e.target.value}})} /></div>
                <div><Label className="flex items-center gap-2"><FaLinkedin /> LinkedIn</Label><Input value={profile.social.linkedin} onChange={(e) => setProfile({...profile, social: {...profile.social, linkedin: e.target.value}})} /></div>
                <div><Label className="flex items-center gap-2"><FaInstagram /> Instagram</Label><Input value={profile.social.instagram} onChange={(e) => setProfile({...profile, social: {...profile.social, instagram: e.target.value}})} /></div>
                <div><Label className="flex items-center gap-2"><FaWhatsapp /> WhatsApp</Label><Input value={profile.social.whatsapp} onChange={(e) => setProfile({...profile, social: {...profile.social, whatsapp: e.target.value}})} placeholder="https://wa.me/yournumber" /></div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
              <Button onClick={() => saveProfile(profile)}>Save Profile</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
