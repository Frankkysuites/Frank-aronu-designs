import { useState, useEffect } from "react";

export function useListProjects(params?: { category?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        let projects = await response.json();
        
        if (params?.category && params.category !== "All") {
          projects = projects.filter((p: any) => p.category === params.category);
        }
        
        setData(projects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [params?.category]);

  return { data, isLoading };
}

export type ProjectCategory = "Graphics" | "Product Design";
