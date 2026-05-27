import { useState, useEffect } from "react";

const JSONBIN_BIN_ID = "6a162a588ef04f45381f4b84";
const JSONBIN_API_KEY = "$2a$10$EIl1NhPjoZl3kOB3kTo9kegq0RAxybzMFZC4UE6tgRwI04vlnt1m2";

export function useLikes(projectId: number) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
          headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const result = await response.json();
        const likes = result.record?.likes || {};
        setLiked(likes[projectId]?.liked || false);
        setLikeCount(likes[projectId]?.count || 0);
      } catch (error) {
        console.error('Failed to fetch likes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLikes();
  }, [projectId]);

  const toggleLike = async () => {
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
      });
      const result = await response.json();
      const currentLikes = result.record?.likes || {};
      
      const updatedLikes = {
        ...currentLikes,
        [projectId]: { liked: newLiked, count: newCount }
      };
      
      await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify({
          projects: result.record?.projects || [],
          profile: result.record?.profile || {},
          likes: updatedLikes
        })
      });
      
      setLiked(newLiked);
      setLikeCount(newCount);
    } catch (error) {
      console.error('Failed to save like:', error);
    }
  };

  return { liked, likeCount, isLoading, toggleLike };
}
