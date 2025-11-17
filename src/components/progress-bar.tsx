"use client";

import { Check } from "lucide-react";

const steps = ["Auto-Scored", "Validating", "Completed", "Finalized"];

export default function ProgressBar({ currentStep }: { currentStep: string }) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full flex flex-col items-center">

      {/* Circles + Lines */}
      <div className="flex items-center w-full justify-between ml-6">

        {/* Step 1 — Auto-Scored */}
        <div className="flex ml-0.5 items-center w-full relative">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center z-10
            ${0 <= currentIndex ? "bg-teal-500 text-white" : "bg-gray-300"}`}
          >
            {0 <= currentIndex ? <Check size={14} /> : null}
          </div>

          {/* Line → to step 2 */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 left-6 right-0 h-[2px]
            ${0 < currentIndex ? "bg-teal-400" : "bg-gray-300"}`}
          />
        </div>

        {/* Step 2 — Validating */}
        <div className="flex items-center w-full relative">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center z-10
            ${1 <= currentIndex ? "bg-teal-500 text-white" : "bg-gray-300"}`}
          >
            {1 <= currentIndex ? <Check size={14} /> : null}
          </div>

          {/* Line → to step 3 */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 left-6 right-0 h-[2px]
            ${1 < currentIndex ? "bg-teal-400" : "bg-gray-300"}`}
          />
        </div>

        {/* Step 3 — Completed */}
        <div className="flex items-center w-full relative">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center z-10
            ${2 <= currentIndex ? "bg-teal-500 text-white" : "bg-gray-300"}`}
          >
            {2 <= currentIndex ? <Check size={14} /> : null}
          </div>

          {/* Line → to step 4 */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 left-6 right-0 h-[2px]
            ${2 < currentIndex ? "bg-teal-400" : "bg-gray-300"}`}
          />
        </div>

        {/* Step 4 — Finalized */}
        <div className="flex items-center w-full relative">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center z-10
            ${3 <= currentIndex ? "bg-teal-500 text-white" : "bg-gray-300"}`}
          >
            {3 <= currentIndex ? <Check size={14} /> : null}
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex w-full mt-1.5">

        <div className="text-[10px] text-center w-15">
          Auto-Scored
        </div>

        <div className="text-[10px] ml-2.5 text-center w-15">
          Validating
        </div>

        <div className="text-[10px] ml-2.5 text-center w-15">
          Completed
        </div>

        <div className="text-[10px] ml-3 text-center w-15">
          Finalized
        </div>

      </div>
    </div>
  );
}
