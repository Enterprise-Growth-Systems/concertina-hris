import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthError } from "next-auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string, t?: string }> }) {
    const params = await searchParams;

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div key={params?.t || "card"} className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Concertina HR</h1>
                    <p className="text-sm text-muted-foreground mt-2">Sign in to manage your time and leaves.</p>
                </div>


                <form
                    action={async (formData) => {
                        "use server";
                        try {
                            await signIn("credentials", formData);
                        } catch (error) {
                            if (error instanceof AuthError) {
                                // Add a timestamp to the error to force re-render/re-shake if they fail again
                                redirect(`/login?error=InvalidCredentials&t=${Date.now()}`);
                            }
                            // Rethrow all other errors (like NEXT_REDIRECT for successful logins)
                            throw error;
                        }
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm"
                            placeholder="youremail@company.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            key={params?.t ? `pw-err-${params.t}` : "pw"}
                            name="password"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <SubmitButton className="w-full shadow-md hover:shadow-lg transition-shadow">
                        Sign In
                    </SubmitButton>
                    {params?.error === "InvalidCredentials" && (
                        <p className="text-sm text-destructive text-center mt-4">
                            Incorrect login details. Please try again.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
