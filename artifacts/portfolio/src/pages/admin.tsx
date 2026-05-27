import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Save, Plus, Upload, Link as LinkIcon, LogOut, KeyRound, X, Image, Video, FileText, FolderOpen } from "lucide-react";
import { FaDribbble, FaBehance, FaLinkedin, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

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
  created_at?: string;
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

const DEFAULT_PROFILE: Profile = {
  name: "Frank Aronu",
  title: "Graphics & Product Designer",
  location: "Africa",
  email: "hello.frankaronu.designs@gmail.com",
  bio: "With over 8 years of experience in graphic design and product design, I help brands create meaningful connections through thoughtful design solutions.",
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
    id: 0,
    title: "",
    category: "Graphics",
    description: "",
    imageUrl: "",
    files: [],
  });

  const [newFile, setNewFile] = useState<ProjectFile>({
    id: Date.now(),
    type: "image",
    url: "",
    title: "",
    description: "",
  });

  // Check auth on load
  useEffect(() => {
    const storedAuth = localStorage.getItem("admin_auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Load data from Supabase
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      try {
        // Load projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (projectsError) throw projectsError;
        setProjects(projectsData || []);
        
        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        
        if (profileData) {
          setProfile({
            name: profileData.name || DEFAULT_PROFILE.name,
            title: profileData.title || DEFAULT_PROFILE.title,
            location: profileData.location || DEFAULT_PROFILE.location,
            email: profileData.email || DEFAULT_PROFILE.email,
            bio: profileData.bio || DEFAULT_PROFILE.bio,
            imageUrl: profileData.image_url || DEFAULT_PROFILE.imageUrl,
            social: profileData.social || DEFAULT_PROFILE.social,
          });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
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

  const handleChangePassword = async () => {
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

  const saveProjects = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    
    // Save to Supabase
    for (const project of updatedProjects) {
      const { error } = await supabase
        .from('projects')
        .upsert({
          id: project.id,
          title: project.title,
          category: project.category,
          description: project.description,
          image_url: project.imageUrl,
          files: project.files,
        }, { onConflict: 'id' });
      
      if (error) console.error('Error saving project:', error);
    }
    
    // Delete projects that are no longer in the list
    const currentIds = updatedProjects.map(p => p.id);
    const { data: existingProjects } = await supabase.from('projects').select('id');
    if (existingProjects) {
      for (const existing of existingProjects) {
        if (!currentIds.includes(existing.id)) {
          await supabase.from('projects').delete().eq('id', existing.id);
        }
      }
    }
  };

  const saveProfile = async (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    
    const { error } = await supabase
      .from('profile')
      .upsert({
        id: 1,
        name: updatedProfile.name,
        title: updatedProfile.title,
        location: updatedProfile.location,
        email: updatedProfile.email,
        bio: updatedProfile.bio,
        image_url: updatedProfile.imageUrl,
        social: updatedProfile.social,
        updated_at: new Date(),
      });
    
    if (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    } else {
      alert('Profile saved successfully!');
    }
    
    setIsEditingProfile(false);
  };

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.imageUrl) {
      alert("Please fill in title and cover image");
      return;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: newProject.title,
        category: newProject.category,
        description: newProject.description,
        image_url: newProject.imageUrl,
        files: newProject.files,
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
      imageUrl: "",
      files: [],
    });
    setNewFile({ id: Date.now(), type: "image", url: "", title: "", description: "" });
    alert('Project added successfully!');
  };

  const deleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
        return;
      }
      setProjects(projects.filter(p => p.id !== id));
      alert('Project deleted successfully!');
    }
  };

  const updateProject = async (updatedProject: Project) => {
    const { error } = await supabase
      .from('projects')
      .update({
        title: updatedProject.title,
        category: updatedProject.category,
        description: updatedProject.description,
        image_url: updatedProject.imageUrl,
        files: updatedProject.files,
      })
      .eq('id', updatedProject.id);
    
    if (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
      return;
    }
    
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setIsEditingProject(null);
    alert('Project updated successfully!');
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

  // Rest of the component - modals and UI (same as before, omitted for brevity)
  // The UI part remains the same, just the data functions above changed
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
                    <p className="text-sm text-gray-500 mt-1">{project.description?.substring(0, 100)}...</p>
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

      {/* Modals would go here - same as before */}
    </div>
  );
}
