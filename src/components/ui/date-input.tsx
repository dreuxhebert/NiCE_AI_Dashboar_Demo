"use client";

import React from "react";

import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;
    mode?: "date" | "datetime" | "datetime-local"; // dynamic modes
    placeholder?: string;
    className?: string;
    title?: string;
};

export default function DateInput({
    value,
    onChange,
    mode = "date",
    placeholder,
    className,
    title,
}: Props) {
    const [manualValue, setManualValue] = useState("");

    // Resolve correct placeholder
    const resolvedPlaceholder =
        placeholder ||
        (mode === "date"
            ? "dd-mm-yyyy"
            : mode === "datetime"
            ? "dd-mm-yyyy hh:mm AM/PM"
            : "dd-mm-yyyy hh:mm");

    // Format actual picker value into readable UI text
    const getDisplayValue = () => {
        if (manualValue) return manualValue; // when user is typing manually

        if (!value) return "";

        try {
            const dt = new Date(value);

            if (mode === "date") {
                return dt.toLocaleDateString("en-GB").replace(/\//g, "-");
            }

            if (mode === "datetime") {
                return dt.toLocaleString("en-GB", {
                    hour12: true,
                }).replace(",", "");
            }

            if (mode === "datetime-local") {
                return dt.toLocaleString("en-GB", {
                    hour12: false,
                }).replace(",", "");
            }
        } catch {
            return value;
        }
    };

    const displayValue = getDisplayValue();

    // Map UI mode to correct HTML <input> type
    const htmlInputType =
        mode === "date"
            ? "date"
            : mode === "datetime"
            ? "datetime-local" // native datetime picker supports AM/PM on many browsers
            : "datetime-local";

    const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManualValue(e.target.value);
        onChange(e.target.value);
    };

    return (
        <div
            title={title}
            className={cn("relative h-10 cursor-pointer", className)}
            onClick={(e) => {
                const input = e.currentTarget.querySelector<HTMLInputElement>(
                    "input[type='date'], input[type='datetime-local']"
                );
                (input as any)?.showPicker?.();
            }}
        >
            {/* Visible display input (manual typing allowed) */}
            <input
                type="text"
                value={displayValue}
                placeholder={resolvedPlaceholder}
                onChange={handleManualInput}
                className={cn(
                    "flex h-10 w-full items-center rounded-md",
                    "border border-border bg-background px-3 py-2 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    "focus:ring-offset-2 focus:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                )}
            />

            {/* Native hidden date/datetime picker */}
            <input
                type={htmlInputType}
                value={value}
                onChange={(e) => {
                    setManualValue(""); // reset manual editing
                    onChange(e.target.value);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />

            {/* Icon changes based on mode */}
            {mode === "date" ? (
                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            ) : (
                <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            )}
        </div>
    );
}