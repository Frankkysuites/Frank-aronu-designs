import { useState, useEffect } from "react";

const JSONBIN_BIN_ID = "6a162a588ef04f45381f4b84";
const JSONBIN_API_KEY = "$2a$10$EIl1NhPjoZl3kOB3kTo9kegq0RAxybzMFZC4UE6tgRwI04vlnt1m2";

export function useListProjects(params?: { category?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching projects from cloud...');
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
          headers: { 
            'X-Master-Key': JSONBIN_API_KEY
          }
        });
        
        const result = await response.json();
        console.log('Cloud response:', result);
        
        let projects = [];
        if (result.record && result.record.projects) {
          projects = result.record.projects;
        }
        
        console.log(`Loaded ${projects.length} projects from cloud`);
        
        if (params?.category && params.category !== "All") {
          projects = projects.filter((p: any) => p.category === params.category);
        }
        
        setData(projects);
      } catch (error) {
        console.error('Failed to fetch from cloud:', error);
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
