import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useLikes(slug: string) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const fetchLikes = async () => {
      try {
        const { count, error } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('project_slug', slug);
        
        if (!error) {
          setLikeCount(count || 0);
        }
        
        const hasLiked = localStorage.getItem(`liked_${slug}`) === 'true';
        setLiked(hasLiked);
      } catch (error) {
        console.error('Error fetching likes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLikes();
  }, [slug]);
  
  const toggleLike = async () => {
    try {
      if (liked) {
        setLiked(false);
        setLikeCount(prev => prev - 1);
        localStorage.removeItem(`liked_${slug}`);
      } else {
        setLiked(true);
        setLikeCount(prev => prev + 1);
        localStorage.setItem(`liked_${slug}`, 'true');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  return { liked, likeCount, isLoading, toggleLike };
}
