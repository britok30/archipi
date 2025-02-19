/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.(mtl|obj)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "static/assets/", // Where to put the files in the output directory
            publicPath: "/_next/static/assets/", // Path to access the files from the browser
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
