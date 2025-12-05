import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface UpdateUserDialog {
  closeDrawer: () => void;
  refresh: () => void;
  user: any; // existing user object
}

export default function UpdateUserDrawer({ closeDrawer, refresh, user }: UpdateUserDialog) {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [teamNumber, setTeamNumber] = useState<number>();
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const { toast } = useToast();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ??
    "https://inform-ai-backend.onrender.com";
  const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

  const getApiUrl = (path: string) => {
    if (USE_PROXY) return `/api/proxy${path}`;
    return `${API_BASE}${path}`;
  };

  const tabOptions = [
    "Overview",
    "Evaluations",
    "Coaching",
    "Analytics",
    "Search and Replay",
    "Protocol",
    "Administrator",
  ];

  // ✅ Load existing user values
  useEffect(() => {
    if (!user) return;
    setFirstname(user.first_name || "");
    setLastName(user.last_name || "");
    setEmail(user.email || "");
    setTeamNumber(user.team_number || undefined);
    setRole(user.role || "");
    setPermissions(user.permissions || []);
  }, [user]);

  const handleUpdateUser = async () => {
    const body = {
      first_name: firstName,
      last_name: lastName,
      team_number: teamNumber,
      email: email,
      role: role,
      password: user.password || undefined,
      permissions: permissions,
      theme: user.theme || "light"
    };

    const res = await fetch(getApiUrl(`/user/${user._id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "User Updated Successfully" });
    await refresh();
    closeDrawer();
  };

  const inputClass =
    "border border-input bg-background/70 backdrop-blur-sm text-foreground " +
    "p-3 rounded-xl w-full " +
    "focus:ring-2 focus:ring-primary focus:outline-none transition shadow-sm " +
    "placeholder:text-muted-foreground";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="
          bg-card/80 
          backdrop-blur-xl 
          shadow-2xl 
          border border-border/40 
          rounded-3xl 
          w-full 
          max-w-[720px]        /* ✅ Wider */
          p-10 
          space-y-7
        "
      >
        <h2 className="text-2xl font-semibold text-center tracking-tight">
          Update User
        </h2>

        {/* ✅ Two-column layout */}
        <div className="grid grid-cols-2 gap-6">

          <input
            placeholder="First Name"
            className={inputClass}
            value={firstName}
            title="First Name"
            onChange={(e) => setFirstname(e.target.value)}
          />

          <input
            placeholder="Last Name"
            className={inputClass}
            value={lastName}
            title="Last Name"
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            placeholder="Email Address"
            type="email"
            className={inputClass}
            value={email}
            title="User Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Team Number"
            type="number"
            className={inputClass}
            value={teamNumber}
            title="Team Number"
            onChange={(e) => setTeamNumber(Number(e.target.value))}
          />

          {/* Role dropdown full width in column */}
          <div className="col-span-2 relative">
            <select
              className="
                appearance-none 
                w-full 
                rounded-xl 
                border border-input 
                bg-background/70 
                backdrop-blur-md
                text-foreground 
                p-3 pr-12 
                shadow-sm 
                transition 
                cursor-pointer
                hover:bg-background/90
                focus:ring-2 focus:ring-primary focus:outline-none
              "
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="" disabled>Select Role</option>
              <option value="PSAP Director / Manager">PSAP Director / Manager</option>
              <option value="Operations Supervisor / Shift Supervisor">Operations Supervisor / Shift Supervisor</option>
              <option value="Training & Quality Assurance Officer">Training & Quality Assurance Officer</option>
              <option value="Lead Telecommunicator / Senior Dispatcher">Lead Telecommunicator / Senior Dispatcher</option>
              <option value="Call Takers">Call Takers</option>
              <option value="Dispatchers">Dispatchers</option>
              <option value="Specialized Dispatchers">Specialized Dispatchers</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">Tab Access</p>

          <div className="grid grid-cols-2 gap-4">
            {tabOptions.map((tab) => (
              <label
                key={tab}
                className="
                  flex items-center gap-3
                  p-3 
                  rounded-xl 
                  border border-input 
                  bg-background/60 
                  backdrop-blur-sm 
                  shadow-sm
                  hover:bg-background/80
                  cursor-pointer
                  transition
                "
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={permissions.includes(tab)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPermissions([...permissions, tab]);
                    } else {
                      setPermissions(permissions.filter((t) => t !== tab));
                    }
                  }}
                />
                <span className="text-[0.95rem]">{tab}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" className="rounded-xl px-6 py-2.5 text-sm" onClick={closeDrawer}>
            Cancel
          </Button>
          <Button className="rounded-xl px-6 py-2.5 text-sm" onClick={handleUpdateUser}>
            Update User
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
