import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('id', { ascending: false });
    
    setProjects(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">My Portfolio</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div 
              key={project.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => window.location.href = `/project/${project.slug}`}
            >
              <img 
                src={project.image_url} 
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                <p className="text-gray-600 text-sm">{project.category}</p>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
        {projects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No projects yet. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
