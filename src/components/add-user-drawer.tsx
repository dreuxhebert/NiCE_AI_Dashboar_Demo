import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AddUserDialog {
  closeDrawer: () => void;
  refresh: () => void;
}

export default function AddUserDrawer({ closeDrawer, refresh }: AddUserDialog) {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const { toast } = useToast();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ??
    "https://inform-ai-backend.onrender.com";
  const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

  const getApiUrl = (path: string) => {
    if (USE_PROXY) return `/api/proxy${path}`;
    return `${API_BASE}${path}`;
  };

  const handleAddUserClick = async () => {
    const body = {
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      password,
    };

    const res = await fetch(getApiUrl("/user/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "User Added Successfully" });
    await refresh();
    closeDrawer();
  };

  const inputClass =
    "border border-input bg-background/60 backdrop-blur-sm text-foreground p-3 rounded-xl w-full " +
    "focus:ring-2 focus:ring-primary focus:outline-none transition shadow-sm hover:bg-background/80";

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 30 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-card/80 backdrop-blur-xl shadow-2xl border border-border/40 
                   rounded-3xl w-full max-w-[460px] p-8 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center tracking-tight">
          Create New User
        </h2>

        <div className="grid gap-5">
          <input
            placeholder="First Name"
            className={inputClass}
            value={firstName}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <input
            placeholder="Last Name"
            className={inputClass}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            placeholder="Email Address"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* ✅ Perfectly Themed Role Dropdown */}
            <div className="relative">
            <select
                className="
                appearance-none 
                w-full 
                rounded-xl 
                border border-input 
                bg-background/70 
                backdrop-blur-md
                text-foreground 
                font-sans
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
                <option value="" disabled className="text-muted-foreground">
                Select Role
                </option>

                <option value="PSAP Director / Manager">PSAP Director / Manager</option>
                <option value="Operations Supervisor / Shift Supervisor">
                Operations Supervisor / Shift Supervisor
                </option>
                <option value="Training & Quality Assurance Officer">
                Training & Quality Assurance Officer
                </option>
                <option value="Lead Telecommunicator / Senior Dispatcher">
                Lead Telecommunicator / Senior Dispatcher
                </option>
                <option value="Call Takers">Call Takers</option>
                <option value="Dispatchers">Dispatchers</option>
                <option value="Specialized Dispatchers">Specialized Dispatchers</option>
            </select>

            {/* ✅ Custom Arrow */}
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

          <input
            placeholder="Default Password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 pt-3">
          <Button
            variant="outline"
            className="rounded-xl px-6"
            onClick={closeDrawer}
          >
            Cancel
          </Button>
          <Button className="rounded-xl px-6" onClick={handleAddUserClick}>
            Add User
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
