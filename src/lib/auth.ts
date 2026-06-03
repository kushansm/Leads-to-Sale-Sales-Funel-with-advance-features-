import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	plugins: [
		organization(),
	],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url, token }) => {
			console.log("=========================================");
			console.log(`[Mock Email] Password Reset for ${user.email}`);
			console.log(`Click here to reset your password: ${url}`);
			console.log("=========================================");
		},
	},
});
