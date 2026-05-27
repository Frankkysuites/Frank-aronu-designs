import { useState, useEffect } from "react";

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

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/6a162a588ef04f45381f4b84/latest`, {
          headers: { 
            'X-Master-Key': '$2a$10$EIl1NhPjoZl3kOB3kTo9kegq0RAxybzMFZC4UE6tgRwI04vlnt1m2'
          }
        });
        const result = await response.json();
        
        if (result.record && result.record.profile) {
          setProfile(result.record.profile);
          console.log('✅ Profile loaded from cloud');
        } else {
          const stored = localStorage.getItem("portfolio_profile");
          if (stored) {
            setProfile(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        const stored = localStorage.getItem("portfolio_profile");
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  return { profile, isLoading };
}
