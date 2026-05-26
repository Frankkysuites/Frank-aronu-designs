import { useState, useEffect } from "react";

const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Brand Identity System",
    category: "Graphics",
    description: "Complete brand identity including logo, color palette, and brand guidelines for a tech startup.",
    imageUrl: "https://picsum.photos/id/20/800/600",
  },
  {
    id: 2,
    title: "Minimalist Chair",
    category: "Product Design",
    description: "Ergonomic chair design focusing on comfort, sustainability, and minimal aesthetics.",
    imageUrl: "https://picsum.photos/id/21/800/600",
  },
  {
    id: 3,
    title: "Poster Collection",
    category: "Graphics",
    description: "Series of typographic posters for cultural events and music festivals.",
    imageUrl: "https://picsum.photos/id/22/800/600",
  },
  {
    id: 4,
    title: "Smart Lamp",
    category: "Product Design",
    description: "IoT-enabled desk lamp with adaptive lighting and voice control.",
    imageUrl: "https://picsum.photos/id/26/800/600",
  },
];

export function useListProjects(params?: { category?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("portfolio_projects");
    let projects = stored ? JSON.parse(stored) : DEFAULT_PROJECTS;
    
    const timer = setTimeout(() => {
      let filtered = [...projects];
      
      if (params?.category && params.category !== "All") {
        filtered = projects.filter(p => p.category === params.category);
      }
      
      setData(filtered);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [params?.category]);

  return { data, isLoading };
}

export type ProjectCategory = "Graphics" | "Product Design";
