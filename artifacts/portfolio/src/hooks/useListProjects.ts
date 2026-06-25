import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type ProjectCategory = "Graphics" | "Product Design";

export function useListProjects(params?: { category?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let cancelled = false;
    (async () => {
      try {
        let query = supabase.from("projects").select("*");
        if (params?.category && params.category !== "All") {
          query = query.eq("category", params.category);
        }
        const { data: projects, error } = await query.order("id", { ascending: false });
        if (error) throw error;
        if (!cancelled) setData(projects ?? []);
      } catch (err) {
        if (!cancelled) { console.error("Failed to fetch projects:", err); setData([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params?.category]);

  return { data, isLoading };
}
