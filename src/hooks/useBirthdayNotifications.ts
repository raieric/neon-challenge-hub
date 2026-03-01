import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useBirthdayNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkBirthdays = async () => {
      const today = new Date();
      const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const { data } = await supabase
        .from("user_birthdays")
        .select("name, birthday")
        .eq("user_id", user.id);

      if (!data) return;

      data.forEach((b: any) => {
        const bd = b.birthday as string; // YYYY-MM-DD
        if (bd.slice(5) === monthDay) {
          toast(`🎂 Happy Birthday ${b.name}!`, {
            description: "Today is their special day! 🎉",
            duration: 10000,
          });
        }
      });
    };

    // Check once on mount, mark as checked for this session
    const key = `birthday-check-${new Date().toDateString()}`;
    if (!sessionStorage.getItem(key)) {
      checkBirthdays();
      sessionStorage.setItem(key, "1");
    }
  }, [user]);
};
