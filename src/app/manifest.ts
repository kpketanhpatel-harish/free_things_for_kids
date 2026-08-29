import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Free Kids List",
    short_name: "Free Kids List",
    description:
      "Find something free to do with your kids today in Chicago.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1d4ed8",
  };
}
