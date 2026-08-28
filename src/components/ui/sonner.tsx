"use client";

import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";
import { useSettings } from "../../contexts/SettingsContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { darkMode } = useSettings();

  return (
    <Sonner
      theme={darkMode ? "dark" : "light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
