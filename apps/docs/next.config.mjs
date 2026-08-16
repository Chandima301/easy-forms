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
			{
				source: '/docs/enterprise',
				destination: '/pricing',
				permanent: true,
			},
			{
				source: '/enterprise',
				destination: '/pricing',
				permanent: true,
			},
			{
				source: '/docs/pro',
				destination: '/pricing',
				permanent: true,
			},
			{
				source: '/docs/pro/repeating-groups',
				destination: '/docs/components/repeating-group',
				permanent: true,
			},
			{
				source: '/docs/pro/advanced-wizard',
				destination: '/docs/components/advanced-wizard',
				permanent: true,
			},
		];
	},
};

export default withMDX(config);
