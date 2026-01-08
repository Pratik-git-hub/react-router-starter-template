import { createRequestHandler } from "react-router";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		
		// Handle Turnstile form submission at /api/submit-form
		if (url.pathname === '/api/submit-form' && request.method === 'POST') {
			try {
				const formData = await request.formData();
				const token = formData.get('cf-turnstile-response');
				
				if (!token) {
					return new Response(JSON.stringify({ success: false, error: 'No token provided' }), {
						status: 400,
						headers: { 'Content-Type': 'application/json' }
					});
				}

				// Validate Turnstile token
				const ip = request.headers.get('CF-Connecting-IP');
				const verifyFormData = new FormData();
				verifyFormData.append('secret', env.TURNSTILE_SECRET_KEY);
				verifyFormData.append('response', token as string);
				verifyFormData.append('remoteip', ip || '');

				const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
					method: 'POST',
					body: verifyFormData,
				});

				const outcome = await verifyResponse.json();

				if (!outcome.success) {
					return new Response(JSON.stringify({ 
						success: false, 
						error: 'Verification failed',
						errors: outcome['error-codes']
					}), {
						status: 400,
						headers: { 'Content-Type': 'application/json' }
					});
				}

				// Forward to Salesforce
				const salesforceFormData = new URLSearchParams();
				salesforceFormData.append('oid', formData.get('oid') as string);
				salesforceFormData.append('retURL', formData.get('retURL') as string);
				salesforceFormData.append('first_name', formData.get('first_name') as string);
				salesforceFormData.append('last_name', formData.get('last_name') as string);
				salesforceFormData.append('email', formData.get('email') as string);
				salesforceFormData.append('company', formData.get('company') as string);

				await fetch(
					'https://test.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00D7z00000Op4lN',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: salesforceFormData.toString(),
					}
				);

				return new Response(JSON.stringify({ success: true }), {
					headers: { 'Content-Type': 'application/json' }
				});

			} catch (error) {
				return new Response(JSON.stringify({ 
					success: false, 
					error: (error as Error).message 
				}), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
