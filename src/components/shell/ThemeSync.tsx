import { useEffect } from "react";
import { useValue } from "@/store/hooks";

export function ThemeSync() {
  const theme = (useValue("theme") as string) ?? "light";
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}