import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setProfile({
            name: data.name || DEFAULT_PROFILE.name,
            title: data.title || DEFAULT_PROFILE.title,
            location: data.location || DEFAULT_PROFILE.location,
            email: data.email || DEFAULT_PROFILE.email,
            bio: data.bio || DEFAULT_PROFILE.bio,
            imageUrl: data.image_url || DEFAULT_PROFILE.imageUrl,
            social: data.social || DEFAULT_PROFILE.social,
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  return { profile, isLoading };
}
