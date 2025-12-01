"use client";

import { useSearchParams } from "next/navigation";

export default function NoAccessPage() {
  const params = useSearchParams();
  const reason = params.get("reason");

  const funnyLines = {
    login: "Pro tip: Logging in usually helps. 😉",
    permissions:
      "Nice try, secret agent… but you don’t have clearance for this mission. 🕵️‍♂️❌",
  };

  return (
    <div className="flex items-center justify-center h-screen text-center px-6">
      <div className="animate-[fadeIn_0.4s_ease-out]">
        {/* Friendly fun emoji */}
        <div className="text-7xl mb-6 animate-bounce">🚫</div>

        <h1 className="text-5xl font-extrabold mb-4">
          Oops!
        </h1>

        {reason === "login" ? (
          <>
            <p className="text-2xl font-semibold">
              You must be logged in to access this page.
            </p>
            <p className="mt-3 text-lg text-red-300 italic">
              {funnyLines.login}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold">
              It looks like you don’t have permission to access this page.
            </p>
            <p className="mt-3 text-lg text-red-300 italic">
              {funnyLines.permissions}
            </p>
          </>
        )}
      </div>

      {/* Fade-in keyframes */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
