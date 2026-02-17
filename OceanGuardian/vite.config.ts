import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

const PUBLIC_API_CACHE_PATHS = [
	/^\/api\/dashboard\/stats$/,
	/^\/api\/missions$/,
	/^\/api\/sightings$/,
	/^\/api\/leaderboard\/global$/,
	/^\/api\/leaderboard\/streak$/,
	/^\/api\/coral\/heatmap$/,
	/^\/api\/learning\/facts$/,
];

export default defineConfig({
	plugins: [
		react(),
		cloudflare(),

		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
			manifest: {
				name: "OceanGuardian",
				short_name: "OceanGuardian",
				description: "Protecting our oceans through community action and citizen science.",
				theme_color: "#0ea5e9",
				background_color: "#0f172a",
				display: "standalone",
				categories: ["education", "environment", "productivity"],
				orientation: "portrait",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any maskable",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
				shortcuts: [
					{
						name: "Report Sighting",
						short_name: "Report",
						description: "Report a new marine sighting",
						url: "/report",
						icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
					},
				],
			},
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "gstatic-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
						},
						{
							urlPattern: ({ request, url }) =>
								request.method === "GET" &&
								PUBLIC_API_CACHE_PATHS.some((pattern) => pattern.test(url.pathname)),
							handler: "NetworkFirst",
							options: {
								cacheName: "api-cache",
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24, // 1 day
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
		}),
	],
	server: {
		allowedHosts: true,
	},
	ssr: {
		resolve: {
			conditions: ["workerd", "worker", "browser"],
		},
	},
	build: {
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				// manualChunks removed to let Vite handle splitting
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
