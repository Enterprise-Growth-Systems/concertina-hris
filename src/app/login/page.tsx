import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthError } from "next-auth";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Concertina HR</h1>
                    <p className="text-sm text-muted-foreground mt-2">Sign in to manage your time and leaves.</p>
                </div>

                {searchParams?.error === "InvalidCredentials" && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-6 border border-red-500/20 font-medium">
                        Invalid email or password. Please try again.
                    </div>
                )}

                <form
                    action={async (formData) => {
                        "use server";
                        try {
                            await signIn("credentials", formData);
                        } catch (error) {
                            if (error instanceof AuthError) {
                                redirect("/login?error=InvalidCredentials");
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
                </form>
            </div>
        </div>
    );
}
