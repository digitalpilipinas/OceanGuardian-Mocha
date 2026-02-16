import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";
import { VitePWA } from "vite-plugin-pwa";

// Only include auxiliary workers if they exist (Mocha platform environment)
const emailsConfigPath = "/mocha/emails-service/wrangler.json";
const auxiliaryWorkers = fs.existsSync(emailsConfigPath)
	? [{ configPath: emailsConfigPath }]
	: [];

export default defineConfig({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	plugins: [
		...mochaPlugins(process.env as any),
		react(),
		cloudflare({
			auxiliaryWorkers,
		}),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
			manifest: {
				name: "OceanGuardian",
				short_name: "OceanGuardian",
				description: "Protecting our oceans through community action and citizen science.",
				theme_color: "#0ea5e9",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
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
				manualChunks: {
					vendor: ["react", "react-dom", "react-router", "react-router-dom"],
					ui: ["lucide-react", "clsx", "tailwind-merge"],
					maps: ["leaflet", "react-leaflet", "react-leaflet-cluster"],
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});

