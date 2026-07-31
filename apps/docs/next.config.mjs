import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: ['@easy-forms/core'],
	async redirects() {
		return [
			{
				source: '/docs/api/form',
				destination: '/docs/api/use-form-runtime',
				permanent: true,
			},
			{
				source: '/docs/pro-install',
				destination: '/docs/pro/install',
				permanent: true,
			},
		];
	},
};

export default withMDX(config);
