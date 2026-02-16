import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

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
		chunkSizeWarningLimit: 5000,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});

