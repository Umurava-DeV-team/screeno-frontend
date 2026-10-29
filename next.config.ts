import { realpathSync } from "node:fs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Resolve from the physical folder, including when launched through a junction.
    root: realpathSync(__dirname),
  },
};

export default nextConfig;
