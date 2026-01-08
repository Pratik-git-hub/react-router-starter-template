import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { useEffect} from 'react';
export function Welcome({ message }: { message: string }) {
	useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Send to Cloudflare Worker instead of directly to Salesforce
      const response = await fetch(
        "https://react-router-starter-template.pratikcmkulkarni.workers.dev",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        window.location.href =
          "http://adworks--teamdev.sandbox.lightning.force.com/lightning/page/home";
      } else {
        alert("Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again.");
    }
  };
	return (
		<main className="flex items-center justify-center pt-16 pb-4">
			<div className="flex-1 flex flex-col items-center gap-16 min-h-0">
				<header className="flex flex-col items-center gap-9">
					<div className="w-[500px] max-w-[100vw] p-4">
						<img
							src={logoLight}
							alt="React Router"
							className="block w-full dark:hidden"
						/>
						<img
							src={logoDark}
							alt="React Router"
							className="hidden w-full dark:block"
						/>
					</div>
				</header>
				<div className="max-w-[300px] w-full space-y-6 px-4">
					<nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
						<p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
							What&apos;s next?
						</p>
						<form onSubmit={handleSubmit}>
                <input type="hidden" name="oid" value="00D7z00000Op4lN" />
                <input
                  type="hidden"
                  name="retURL"
                  value="http://adworks--teamdev.sandbox.lightning.force.com/lightning/page/home"
                />

                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  maxLength={40}
                  name="first_name"
                  size={20}
                  type="text"
                />
                <br />

                <label htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  maxLength={80}
                  name="last_name"
                  size={20}
                  type="text"
                />
                <br />

                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  maxLength={80}
                  name="email"
                  size={20}
                  type="text"
                />
                <br />

                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  maxLength={40}
                  name="company"
                  size={20}
                  type="text"
                />
                <br />

                <div
                  className="cf-turnstile"
                  data-sitekey="0x4AAAAAACLP3NxG40XTe6Pm"
                  data-theme="light"
                  data-size="normal"
                ></div>

                <input type="submit" value="Submit" />
              </form>
					</nav>
				</div>
			</div>
		</main>
	);
}
