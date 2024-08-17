import { toast } from "vue-sonner";

export async function logout() {
  const fetcher = $fetch("/api/auth/logout", { method: "POST" });
  toast.promise(fetcher, {
    loading: "Logging out...",
    success: () => {
      window.location.href = "/login";

      return "Logged out successfully";
    },
    error: () => {
      window.location.href = "/login";
      return "Failed to log out";
    },
  });
}
