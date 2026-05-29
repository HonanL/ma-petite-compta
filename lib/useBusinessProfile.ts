"use client";

import { useEffect, useMemo, useState } from "react";
import { BusinessProfile, defaultBusinessProfile, isBusinessProfile } from "@/lib/businessProfile";

const STORAGE_KEY = "ma-petite-compta-business-profile";

const readStoredProfile = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isBusinessProfile(saved) ? saved : defaultBusinessProfile;
  } catch {
    return defaultBusinessProfile;
  }
};

export const useBusinessProfile = () => {
  const [profile, setProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // localStorage is only available after mount, so this hydration step is intentionally effect-driven.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(readStoredProfile());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.localStorage.setItem(STORAGE_KEY, profile);
    }
  }, [loaded, profile]);

  return useMemo(
    () => ({
      profile,
      loaded,
      setProfile
    }),
    [loaded, profile]
  );
};
