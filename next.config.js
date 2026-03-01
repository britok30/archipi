/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  turbopack: {
    rules: {
      '*.mtl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.obj': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  webpack: (/** @type {any} */ config) => {
    // Handle .mtl and .obj 3D model files
    config.module.rules.push({
      test: /\.(mtl|obj)$/,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
