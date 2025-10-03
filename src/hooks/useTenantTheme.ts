import { useEffect } from "react";
import { useProfile } from "./useProfile";

export const useTenantTheme = () => {
  const { data: profile } = useProfile();

  useEffect(() => {
    if (profile?.tenants?.primary_color) {
      // Convert hex to HSL
      const hexToHSL = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;

        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r:
              h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
              break;
            case g:
              h = ((b - r) / d + 2) / 6;
              break;
            case b:
              h = ((r - g) / d + 4) / 6;
              break;
          }
        }

        return {
          h: Math.round(h * 360),
          s: Math.round(s * 100),
          l: Math.round(l * 100),
        };
      };

      const hsl = hexToHSL(profile.tenants.primary_color);
      if (hsl) {
        const root = document.documentElement;
        root.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty("--primary-hover", `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 10, 0)}%`);
        root.style.setProperty("--accent", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty("--sidebar-primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty("--ring", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    }
  }, [profile?.tenants?.primary_color]);

  return {
    tenantName: profile?.tenants?.name || "Academia",
    tenantLogo: profile?.tenants?.logo_url,
    primaryColor: profile?.tenants?.primary_color,
  };
};
