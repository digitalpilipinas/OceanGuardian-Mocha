import { useState, useEffect } from "react";
import { useAuth } from "@getmocha/users-service/react";
import type { UserProfile } from "@/shared/types";

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/profiles/me");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    return { profile, loading };
}
