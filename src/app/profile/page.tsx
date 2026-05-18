import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { SubmitButton } from "@/components/ui/submit-button";
import { PasswordForm } from "./components/password-form";

const prisma = new PrismaClient();

export default async function ProfilePage() {
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!session || !sessionUser) {
    return <div>Unauthorized</div>;
  }

  // Fetch full user details
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      manager: true,
    }
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">View and update your personal information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Read-Only Employment Information */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">Employment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Full Name</label>
              <div className="text-foreground mt-1">{user.name}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Email Address</label>
              <div className="text-foreground/80 mt-1">{user.email}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Role / Access Level</label>
              <div className="text-foreground/80 mt-1">{user.role}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Department</label>
                <div className="text-foreground/80 mt-1">{user.department || "—"}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Position</label>
                <div className="text-foreground/80 mt-1">{user.position || "—"}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">IC ID</label>
                <div className="text-foreground/80 mt-1">{user.icId || "—"}</div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Manager</label>
                <div className="text-foreground/80 mt-1">{user.manager?.name || "—"}</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Contact HR if any of your employment information is incorrect.
          </p>
        </div>

        <div className="space-y-8">
          {/* Read-Only Personal Information */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                 <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                   Contact Number
                 </label>
                 <div className="text-foreground mt-1">{user.contactNumber || "—"}</div>
              </div>
              
              <div>
                 <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                   Emergency Contact
                 </label>
                 <div className="text-foreground mt-1">{user.emergencyContact || "—"}</div>
              </div>

              <div>
                 <label className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                   Home Address
                 </label>
                 <div className="text-foreground mt-1 whitespace-pre-wrap">{user.address || "—"}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Contact HR if any of your personal information needs to be updated.
            </p>
          </div>

          {/* Security Settings (Change Password) */}
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
