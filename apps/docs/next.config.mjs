import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: ['@easy-forms/core', '@easy-forms/shadcn'],
};

export default withMDX(config);
