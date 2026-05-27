import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Save, Plus, Upload, Link as LinkIcon, LogOut, KeyRound, X, Image, Video, FileText, FolderOpen, Eye } from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
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
  category: "Graphics" | "Product Design";
  description: string;
  image_url: string;
  files: ProjectFile[];
};

type Profile = {
  name: string;
  title: string;
  location: string;
  email: string;
  bio: string;
  image_url: string;
  social: {
    dribbble: string;
    behance: string;
    linkedin: string;
    instagram: string;
    whatsapp: string;
  };
};

const DEFAULT_PROFILE: Profile = {
  name: "Frank Aronu",
  title: "Graphics & Product Designer",
  location: "Africa",
  email: "hello.frankaronu.designs@gmail.com",
  bio: "With over 8 years of experience in graphic design and product design, I help brands create meaningful connections through thoughtful design solutions.",
  image_url: "https://picsum.photos/id/64/400/400",
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
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  
  // New file for current project
  const [newFile, setNewFile] = useState<ProjectFile>({
    id: Date.now(),
    type: "image",
    url: "",
    title: "",
    description: "",
  });
  
  const [newProject, setNewProject] = useState<Project>({
    id: 0,
    title: "",
    category: "Graphics",
    description: "",
    image_url: "",
    files: [],
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
    
    const loadData = async () => {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (projectsData) setProjects(projectsData);
      
      const { data: profileData } = await supabase
        .from('profile')
        .select('*')
        .eq('id', 1)
        .single();
      if (profileData) {
        setProfile({
          name: profileData.name || DEFAULT_PROFILE.name,
          title: profileData.title || DEFAULT_PROFILE.title,
          location: profileData.location || DEFAULT_PROFILE.location,
          email: profileData.email || DEFAULT_PROFILE.email,
          bio: profileData.bio || DEFAULT_PROFILE.bio,
          image_url: profileData.image_url || DEFAULT_PROFILE.image_url,
          social: profileData.social || DEFAULT_PROFILE.social,
        });
      }
    };
    
    loadData();
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
    setPassword("");
    window.location.href = "/admin";
  };

  const handleChangePassword = () => {
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

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCoverImage: boolean = false) => {
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
    
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      if (isCoverImage) {
        if (isEditingProject) {
          setIsEditingProject({ ...isEditingProject, image_url: base64 });
        } else {
          setNewProject({ ...newProject, image_url: base64 });
        }
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleProjectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    let type: "image" | "video" | "pdf" = "image";
    if (file.type.startsWith('video/')) type = "video";
    else if (file.type === 'application/pdf') type = "pdf";
    
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setNewFile({ ...newFile, url: base64, type });
    } catch (error) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const addFileToProject = () => {
    if (!newFile.title || !newFile.url) {
      alert("Please fill in file title and select a file");
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
    if (projectFileInputRef.current) projectFileInputRef.current.value = '';
  };

  const removeFileFromProject = (fileId: number) => {
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

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.image_url) {
      alert("Please fill in title and cover image");
      return;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: newProject.title,
        category: newProject.category,
        description: newProject.description,
        image_url: newProject.image_url,
        files: newProject.files || [],
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project');
      return;
    }
    
    setProjects([data, ...projects]);
    setIsAddingProject(false);
    setNewProject({
      id: 0,
      title: "",
      category: "Graphics",
      description: "",
      image_url: "",
      files: [],
    });
    setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
    alert('Project added successfully!');
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        alert('Failed to delete project');
        return;
      }
      setProjects(projects.filter(p => p.id !== id));
      alert('Project deleted successfully!');
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    const { error } = await supabase
      .from('projects')
      .update({
        title: updatedProject.title,
        category: updatedProject.category,
        description: updatedProject.description,
        image_url: updatedProject.image_url,
        files: updatedProject.files,
      })
      .eq('id', updatedProject.id);
    
    if (error) {
      alert('Failed to update project');
      return;
    }
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsEditingProject(null);
    setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
    alert('Project updated successfully!');
  };

  const handleUpdateProfile = async (updatedProfile: Profile) => {
    const { error } = await supabase
      .from('profile')
      .upsert({
        id: 1,
        name: updatedProfile.name,
        title: updatedProfile.title,
        location: updatedProfile.location,
        email: updatedProfile.email,
        bio: updatedProfile.bio,
        image_url: updatedProfile.image_url,
        social: updatedProfile.social,
        updated_at: new Date(),
      });
    
    if (error) {
      alert('Failed to update profile');
      return;
    }
    
    setProfile(updatedProfile);
    setIsEditingProfile(false);
    alert('Profile updated successfully!');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
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
          <p className="text-sm text-gray-500 mt-4 text-center">Default password: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              <Eye className="w-4 h-4 mr-2" /> View Site
            </Button>
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              <KeyRound className="w-4 h-4 mr-2" /> Change Password
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Profile Settings</h2>
            <Button onClick={() => setIsEditingProfile(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
          <div className="flex gap-6 flex-wrap">
            <img src={profile.image_url} alt={profile.name} className="w-24 h-24 rounded-full object-cover" />
            <div className="space-y-1">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Title:</strong> {profile.title}</p>
              <p><strong>Location:</strong> {profile.location}</p>
              <p><strong>Email:</strong> {profile.email}</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-semibold">Projects ({projects.length})</h2>
            <Button onClick={() => setIsAddingProject(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add New Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex gap-4 items-start flex-wrap">
                  <img src={project.image_url} alt={project.title} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description?.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-400 mt-1">📎 {project.files?.length || 0} additional files</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditingProject(project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
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

      {/* Add/Edit Project Modal with File Upload */}
      <Dialog open={isAddingProject || !!isEditingProject} onOpenChange={() => {
        setIsAddingProject(false);
        setIsEditingProject(null);
        setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>{isEditingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
          <div className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
              <div>
                <Label>Title *</Label>
                <Input
                  value={isEditingProject ? isEditingProject.title : newProject.title}
                  onChange={(e) => isEditingProject 
                    ? setIsEditingProject({...isEditingProject, title: e.target.value})
                    : setNewProject({...newProject, title: e.target.value})
                  }
                  placeholder="Project title"
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={isEditingProject ? isEditingProject.category : newProject.category}
                  onChange={(e) => isEditingProject
                    ? setIsEditingProject({...isEditingProject, category: e.target.value as "Graphics" | "Product Design"})
                    : setNewProject({...newProject, category: e.target.value as "Graphics" | "Product Design"})
                  }
                >
                  <option value="Graphics">Graphics</option>
                  <option value="Product Design">Product Design</option>
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={isEditingProject ? isEditingProject.description : newProject.description}
                  onChange={(e) => isEditingProject
                    ? setIsEditingProject({...isEditingProject, description: e.target.value})
                    : setNewProject({...newProject, description: e.target.value})
                  }
                  rows={4}
                  placeholder="Project description"
                />
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Cover Image</h3>
              <div>
                <Label>Cover Image *</Label>
                <div className="flex gap-4 items-start flex-wrap mt-1">
                  <img 
                    src={isEditingProject ? isEditingProject.image_url : newProject.image_url} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image"}
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('cover-image-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">or enter URL below</p>
                    <Input
                      value={isEditingProject ? isEditingProject.image_url : newProject.image_url}
                      onChange={(e) => isEditingProject
                        ? setIsEditingProject({...isEditingProject, image_url: e.target.value})
                        : setNewProject({...newProject, image_url: e.target.value})
                      }
                      placeholder="https://example.com/image.jpg"
                      className="mt-2 w-80"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Files - Multiple File Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Additional Files</h3>
              
              {/* Current Files List */}
              {((isEditingProject && (isEditingProject.files?.length || 0) > 0) || 
                (!isEditingProject && (newProject.files?.length || 0) > 0)) && (
                <div className="space-y-2">
                  <Label>Files in this project</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {(isEditingProject ? isEditingProject.files : newProject.files).map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm font-medium">{file.title}</span>
                          {file.description && <span className="text-xs text-gray-500">- {file.description.substring(0, 50)}</span>}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeFileFromProject(file.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New File */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <Label className="mb-2 block">Add File to This Project</Label>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <select
                      className="border rounded-md p-2"
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
                      onChange={handleProjectFileUpload}
                      className="hidden"
                      id="project-file-upload"
                      ref={projectFileInputRef}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('project-file-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Choose File'}
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
                    onClick={addFileToProject}
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📎 Total: {(isEditingProject ? isEditingProject.files.length : newProject.files.length)} file(s) attached to this project
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsAddingProject(false);
                setIsEditingProject(null);
                setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
              }}>
                Cancel
              </Button>
              <Button onClick={() => isEditingProject ? handleUpdateProject(isEditingProject) : handleAddProject()}>
                <Save className="w-4 h-4 mr-2" /> 
                {isEditingProject ? "Save Changes" : "Create Project"}
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
              <div className="flex gap-4 items-start flex-wrap mt-1">
                <img 
                  src={profile.image_url} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border"
                  onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/80?text=No+Image"}
                />
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById("profile-image-upload")?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <p className="text-xs text-gray-500">or enter URL below</p>
                  <Input
                    value={profile.image_url}
                    onChange={(e) => setProfile({...profile, image_url: e.target.value})}
                    placeholder="https://example.com/photo.jpg"
                    className="w-80"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows={4} />
            </div>
            
            <div className="border-t pt-4">
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
              <Button onClick={() => handleUpdateProfile(profile)}>Save Profile</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
