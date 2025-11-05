export interface CallActivity {
  id: string
  fileName: string
  dispatcher: string
  callType: string
  status: "queued" | "processing" | "processed" | "failed"
  timestamp: string
  duration?: string
}

export interface Interaction {
  id: string
  fileName: string
  dispatcher: string
  language: string
  model: string
  callType: string
  submitted: string
  processed: string
  duration: string
  status: "queued" | "processing" | "processed" | "failed"
  sentiment: "positive" | "neutral" | "negative"
  sentimentScore: number
  transcript: string
  summary: string
  gradeScore?: number
}

export const interactions: Interaction[] = [
  {
    id: "1",
    fileName: "call_2024_001.mp3",
    dispatcher: "Sarah Johnson",
    language: "English",
    model: "GPT-4",
    callType: "Medical",
    submitted: "2024-01-15 14:23:15",
    processed: "2024-01-15 14:23:45",
    duration: "4:32",
    status: "processed",
    sentiment: "neutral",
    sentimentScore: 65,
    gradeScore: 92,
    summary:
      "Caller reported chest pain. Dispatcher obtained address, confirmed symptoms, and dispatched ambulance. Professional tone maintained throughout.",
    transcript: `Dispatcher: 911, what's your emergency?
Caller: I'm having chest pain, it's really bad.
Dispatcher: Okay, I'm sending help right away. Can you tell me your exact address?
Caller: 123 Main Street, apartment 4B.
Dispatcher: Thank you. Are you having trouble breathing?
Caller: A little bit, yes.
Dispatcher: Help is on the way. Stay on the line with me.`,
  },
  {
    id: "2",
    fileName: "call_2024_002.mp3",
    dispatcher: "Mike Chen",
    language: "English",
    model: "GPT-4",
    callType: "Fire",
    submitted: "2024-01-15 14:18:22",
    processed: "2024-01-15 14:19:05",
    duration: "3:15",
    status: "processing",
    sentiment: "negative",
    sentimentScore: 35,
    summary: "Structure fire reported at commercial building. Multiple units dispatched. Caller evacuated safely.",
    transcript: `Dispatcher: 911, what's your emergency?
Caller: There's a fire! The building is on fire!
Dispatcher: Where are you located?
Caller: 456 Oak Avenue, it's the office building!
Dispatcher: Are you in a safe location?
Caller: Yes, I'm outside now.
Dispatcher: Fire department is on the way. Stay clear of the building.`,
  },
  {
    id: "3",
    fileName: "call_2024_003.mp3",
    dispatcher: "Emily Rodriguez",
    language: "Spanish",
    model: "GPT-4",
    callType: "Traffic",
    submitted: "2024-01-15 14:05:33",
    processed: "2024-01-15 14:06:12",
    duration: "2:48",
    status: "processed",
    sentiment: "neutral",
    sentimentScore: 58,
    gradeScore: 88,
    summary: "Multi-vehicle accident on Highway 101. No injuries reported. Traffic control dispatched.",
    transcript: `Dispatcher: 911, what's your emergency?
Caller: There's been an accident on Highway 101.
Dispatcher: Can you describe what happened?
Caller: Three cars collided. Everyone seems okay.
Dispatcher: What's your location on the highway?
Caller: Near exit 42, northbound.
Dispatcher: Help is on the way. Stay in your vehicle if it's safe.`,
  },
  {
    id: "4",
    fileName: "call_2024_004.mp3",
    dispatcher: "David Kim",
    language: "English",
    model: "GPT-3.5",
    callType: "Shooting",
    submitted: "2024-01-15 13:52:18",
    processed: "2024-01-15 13:52:18",
    duration: "6:21",
    status: "failed",
    sentiment: "negative",
    sentimentScore: 22,
    summary: "Processing failed due to audio quality issues.",
    transcript: "Transcript unavailable - processing failed.",
  },
  {
    id: "5",
    fileName: "call_2024_005.mp3",
    dispatcher: "Lisa Anderson",
    language: "English",
    model: "GPT-4",
    callType: "Medical",
    submitted: "2024-01-15 13:45:09",
    processed: "-",
    duration: "5:12",
    status: "queued",
    sentiment: "neutral",
    sentimentScore: 50,
    summary: "Awaiting processing...",
    transcript: "Transcript will be available after processing.",
  },
  {
    id: "6",
    fileName: "call_2024_006.mp3",
    dispatcher: "Robert Taylor",
    language: "English",
    model: "GPT-4",
    callType: "Other",
    submitted: "2024-01-15 13:32:44",
    processed: "2024-01-15 13:33:22",
    duration: "3:45",
    status: "processed",
    sentiment: "positive",
    sentimentScore: 78,
    gradeScore: 95,
    summary: "Welfare check requested. Officers dispatched. Situation resolved peacefully.",
    transcript: `Dispatcher: 911, what's your emergency?
Caller: I'm worried about my neighbor. I haven't seen them in days.
Dispatcher: What's the address?
Caller: 789 Pine Street, house number 12.
Dispatcher: I'll send officers to check. What's your name?
Caller: Jennifer Smith. Thank you so much.
Dispatcher: Officers are on their way.`,
  },
]

export const recentActivities: CallActivity[] = [
  {
    id: "1",
    fileName: "call_2024_001.mp3",
    dispatcher: "Sarah Johnson",
    callType: "Medical",
    status: "processed",
    timestamp: "2 minutes ago",
    duration: "4:32",
  },
  {
    id: "2",
    fileName: "call_2024_002.mp3",
    dispatcher: "Mike Chen",
    callType: "Fire",
    status: "processing",
    timestamp: "5 minutes ago",
    duration: "3:15",
  },
  {
    id: "3",
    fileName: "call_2024_003.mp3",
    dispatcher: "Emily Rodriguez",
    callType: "Traffic",
    status: "processed",
    timestamp: "12 minutes ago",
    duration: "2:48",
  },
  {
    id: "4",
    fileName: "call_2024_004.mp3",
    dispatcher: "David Kim",
    callType: "Shooting",
    status: "failed",
    timestamp: "18 minutes ago",
    duration: "6:21",
  },
  {
    id: "5",
    fileName: "call_2024_005.mp3",
    dispatcher: "Lisa Anderson",
    callType: "Medical",
    status: "queued",
    timestamp: "25 minutes ago",
    duration: "-",
  },
]

export const callsChartData = [
  { time: "00:00", calls: 12 },
  { time: "02:00", calls: 8 },
  { time: "04:00", calls: 5 },
  { time: "06:00", calls: 15 },
  { time: "08:00", calls: 28 },
  { time: "10:00", calls: 35 },
  { time: "12:00", calls: 42 },
  { time: "14:00", calls: 38 },
  { time: "16:00", calls: 45 },
  { time: "18:00", calls: 52 },
  { time: "20:00", calls: 38 },
  { time: "22:00", calls: 25 },
]

export const callsTrendData = [
  { date: "Jan 8", calls: 245 },
  { date: "Jan 9", calls: 268 },
  { date: "Jan 10", calls: 289 },
  { date: "Jan 11", calls: 312 },
  { date: "Jan 12", calls: 298 },
  { date: "Jan 13", calls: 325 },
  { date: "Jan 14", calls: 342 },
  { date: "Jan 15", calls: 356 },
]

export const callsByTypeData = [
  { type: "Medical", count: 145, fill: "hsl(var(--chart-1))" },
  { type: "Fire", count: 78, fill: "hsl(var(--chart-2))" },
  { type: "Traffic", count: 92, fill: "hsl(var(--chart-3))" },
  { type: "Shooting", count: 34, fill: "hsl(var(--chart-4))" },
  { type: "Other", count: 67, fill: "hsl(var(--chart-5))" },
]

export interface DispatcherStats {
  rank: number
  name: string
  totalCalls: number
  avgScore: number
  trend: "up" | "down" | "stable"
}

export const dispatcherLeaderboard: DispatcherStats[] = [
  { rank: 1, name: "Sarah Johnson", totalCalls: 342, avgScore: 94.5, trend: "up" },
  { rank: 2, name: "Mike Chen", totalCalls: 318, avgScore: 92.8, trend: "up" },
  { rank: 3, name: "Emily Rodriguez", totalCalls: 295, avgScore: 91.2, trend: "stable" },
  { rank: 4, name: "David Kim", totalCalls: 287, avgScore: 89.7, trend: "down" },
  { rank: 5, name: "Lisa Anderson", totalCalls: 276, avgScore: 88.9, trend: "up" },
  { rank: 6, name: "Robert Taylor", totalCalls: 264, avgScore: 87.3, trend: "stable" },
  { rank: 7, name: "Jennifer Smith", totalCalls: 251, avgScore: 86.1, trend: "down" },
  { rank: 8, name: "James Wilson", totalCalls: 239, avgScore: 84.8, trend: "up" },
]

export interface CoachingTask {
  id: string
  callTakerId: string
  callTakerName: string
  focusArea: string
  dueDate: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  issueDescription: string
  coachingSuggestions: string[]
  actionItems: { text: string; completed: boolean }[]
  createdDate: string
  completedDate?: string
  completionNotes?: string
}

export const coachingTasks: CoachingTask[] = [
  {
    id: "ct-001",
    callTakerId: "ct-michael",
    callTakerName: "Michael Chen",
    focusArea: "Information Gathering",
    dueDate: "2025-01-19",
    status: "pending",
    priority: "medium",
    issueDescription:
      "Location verification protocol not followed during emergency call. Address was confirmed only once, which does not meet APCO standards requiring double verification for all location information. This could lead to delayed response times in critical situations.",
    coachingSuggestions: [
      "Review the importance of double location verification in emergency protocols",
      "Use memory aids or checklist during calls to ensure all verification steps are completed",
      "Practice active listening techniques to catch location details accurately",
      "Understand the consequences of incomplete location verification on response times",
    ],
    actionItems: [
      { text: "Complete refresher training module on location verification", completed: false },
      { text: "Shadow experienced call taker during next shift", completed: false },
      { text: "Review APCO location verification standards documentation", completed: false },
      { text: "Practice with simulation scenarios focusing on location gathering", completed: false },
    ],
    createdDate: "2025-01-15",
  },
  {
    id: "ct-002",
    callTakerId: "ct-sarah",
    callTakerName: "Sarah Johnson",
    focusArea: "Caller Management",
    dueDate: "2025-01-22",
    status: "in-progress",
    priority: "low",
    issueDescription:
      "Demonstrated excellent technical skills but could improve on managing highly emotional callers. During a medical emergency call, the caller became increasingly agitated, and while the dispatcher maintained professionalism, additional de-escalation techniques could have been employed.",
    coachingSuggestions: [
      "Learn advanced de-escalation techniques for highly emotional situations",
      "Practice using calming voice modulation and pacing",
      "Develop empathy statements that acknowledge caller emotions while maintaining control",
      "Study crisis intervention communication strategies",
    ],
    actionItems: [
      { text: "Attend emotional intelligence workshop", completed: true },
      { text: "Review de-escalation training videos", completed: true },
      { text: "Role-play scenarios with supervisor", completed: false },
      { text: "Implement learned techniques in next 5 calls", completed: false },
    ],
    createdDate: "2025-01-12",
  },
  {
    id: "ct-003",
    callTakerId: "ct-david",
    callTakerName: "David Kim",
    focusArea: "Protocol Compliance",
    dueDate: "2025-01-25",
    status: "pending",
    priority: "high",
    issueDescription:
      "Failed to follow medical pre-arrival instructions protocol during a cardiac emergency. The dispatcher did not provide CPR instructions to the caller despite the caller indicating the patient was unconscious and not breathing. This is a critical protocol violation that could impact patient outcomes.",
    coachingSuggestions: [
      "Immediate review of medical pre-arrival instruction protocols",
      "Understand the legal and ethical implications of protocol non-compliance",
      "Practice recognition of situations requiring immediate medical instructions",
      "Develop confidence in providing life-saving instructions over the phone",
    ],
    actionItems: [
      { text: "Complete mandatory medical protocol recertification", completed: false },
      { text: "One-on-one session with medical dispatch supervisor", completed: false },
      { text: "Review case study of the incident with QA team", completed: false },
      { text: "Pass medical protocol assessment before returning to active duty", completed: false },
    ],
    createdDate: "2025-01-14",
  },
  {
    id: "ct-004",
    callTakerId: "ct-emily",
    callTakerName: "Emily Rodriguez",
    focusArea: "Communication Clarity",
    dueDate: "2025-01-18",
    status: "completed",
    priority: "medium",
    issueDescription:
      "Occasionally uses technical jargon that may confuse callers. During a traffic accident call, terms like 'ETA' and 'units' were used without explanation, potentially causing confusion for the caller who was already stressed.",
    coachingSuggestions: [
      "Use plain language when communicating with callers",
      "Explain any necessary technical terms in simple words",
      "Practice translating dispatch terminology into civilian-friendly language",
      "Focus on clear, concise communication that reduces caller anxiety",
    ],
    actionItems: [
      { text: "Review plain language communication guidelines", completed: true },
      { text: "Practice call scenarios with focus on language simplification", completed: true },
      { text: "Receive feedback from supervisor on next 10 calls", completed: true },
      { text: "Mentor new call taker on effective communication", completed: true },
    ],
    createdDate: "2025-01-08",
    completedDate: "2025-01-16",
    completionNotes:
      "Emily has shown significant improvement in using plain language. Supervisor feedback indicates consistent use of caller-friendly terminology. Ready to mentor others on this skill.",
  },
  {
    id: "ct-005",
    callTakerId: "ct-lisa",
    callTakerName: "Lisa Anderson",
    focusArea: "Response Time",
    dueDate: "2025-01-20",
    status: "pending",
    priority: "medium",
    issueDescription:
      "Average call processing time is 15% above department standard. While thoroughness is appreciated, efficiency improvements are needed to maintain optimal service levels during high-volume periods.",
    coachingSuggestions: [
      "Identify areas where information gathering can be streamlined",
      "Practice concurrent data entry while maintaining conversation flow",
      "Learn keyboard shortcuts and system navigation efficiency techniques",
      "Balance thoroughness with time management during peak hours",
    ],
    actionItems: [
      { text: "Complete CAD system efficiency training", completed: false },
      { text: "Work with efficiency coach on typing and navigation skills", completed: false },
      { text: "Set personal goal to reduce average call time by 10%", completed: false },
      { text: "Track and review call times weekly with supervisor", completed: false },
    ],
    createdDate: "2025-01-13",
  },
  {
    id: "ct-006",
    callTakerId: "ct-robert",
    callTakerName: "Robert Taylor",
    focusArea: "Stress Management",
    dueDate: "2025-01-21",
    status: "in-progress",
    priority: "high",
    issueDescription:
      "Showing signs of compassion fatigue after handling multiple traumatic calls. Performance remains acceptable, but proactive intervention is recommended to prevent burnout and maintain long-term effectiveness.",
    coachingSuggestions: [
      "Participate in peer support group sessions",
      "Learn and practice stress management and self-care techniques",
      "Consider rotating to different shift patterns to vary call exposure",
      "Utilize employee assistance program resources",
    ],
    actionItems: [
      { text: "Schedule session with department psychologist", completed: true },
      { text: "Attend stress management workshop", completed: true },
      { text: "Implement daily mindfulness practice", completed: false },
      { text: "Monthly check-ins with supervisor on wellness", completed: false },
    ],
    createdDate: "2025-01-11",
  },
]

export const callTakers = [
  { id: "ct-michael", name: "Michael Chen" },
  { id: "ct-sarah", name: "Sarah Johnson" },
  { id: "ct-david", name: "David Kim" },
  { id: "ct-emily", name: "Emily Rodriguez" },
  { id: "ct-lisa", name: "Lisa Anderson" },
  { id: "ct-robert", name: "Robert Taylor" },
  { id: "ct-jennifer", name: "Jennifer Smith" },
  { id: "ct-james", name: "James Wilson" },
]

export interface Evaluation {
  id: string
  date: string
  evaluator: string
  evaluatorType: "AI QA System" | "Human"
  type: "Automated" | "Hybrid" | "Manual"
  score: number
  maxPoints: number
  callTakerName: string
  callType: "Police" | "Medical" | "Fire" | "Traffic" | "Other"
  standardsMet: number
  standardsNotMet: number
  criticalViolations: string[]
  metStandards: string[]
  callId: string
  duration: string
  transcript: string
  summary: string
}

// _id 68f7723cb6844a3c3f81a94c
// id  68f7723cb6844a3c3f81a94b
// dispatcher_id "Jim Finley"
// call_id "d6fda85d-5cc4-4fd9-95f4-3b2d5b2ccaf1"
// duration_seconds 320
// direction "Inbound"
// language "English"
// model "general"
// callType "Fire"
// status "processed"
// sentiment "positive"
// transcript "Dispatcher: Hover County 911, what is the location of your emergency? …"
// summary "A 911 call reports a house fire on Route 7 at Abington, below McCombis…"
// created_at "2025-10-21T11:45:00.448+00:00"
// callEvaluationType "Automated"
// score 63
// scores Array (7)

export const evaluations: Evaluation[] = [
  {
    id: "eval-001",
    date: "2025-01-15 14:23",
    evaluator: "AI QA System",
    evaluatorType: "AI QA System",
    type: "Automated",
    score: 31,
    maxPoints: 100,
    callTakerName: "Michael Chen",
    callType: "Medical",
    standardsMet: 3,
    standardsNotMet: 4,
    criticalViolations: [
      "Obtained Callback Number",
      "Demonstrated Empathy",
      "Verified Location Accuracy",
      "Provided Pre-Arrival Instructions",
    ],
    metStandards: ["Assessed Call Priority", "Maintained Professional Tone", "Dispatched Appropriate Resources"],
    callId: "call-2024-001",
    duration: "4:32",
    transcript: "Dispatcher: 911, what's your emergency?\nCaller: I need help...",
    summary:
      "Medical emergency call with multiple protocol violations. Operator failed to obtain callback number, verify location accuracy, and provide pre-arrival instructions. Immediate coaching required on information gathering and medical protocols.",
  },
  {
    id: "eval-002",
    date: "2025-01-15 13:45",
    evaluator: "Robert Williams",
    evaluatorType: "Human",
    type: "Manual",
    score: 87,
    maxPoints: 100,
    callTakerName: "Sarah Johnson",
    callType: "Fire",
    standardsMet: 8,
    standardsNotMet: 1,
    criticalViolations: ["Follow-up Documentation Incomplete"],
    metStandards: [
      "Obtained Callback Number",
      "Verified Location Accuracy",
      "Assessed Call Priority",
      "Maintained Professional Tone",
      "Demonstrated Empathy",
      "Provided Clear Instructions",
      "Dispatched Appropriate Resources",
      "Confirmed Caller Safety",
    ],
    callId: "call-2024-002",
    duration: "3:15",
    transcript: "Dispatcher: 911, what's your emergency?\nCaller: There's a fire...",
    summary:
      "Excellent fire emergency response with strong adherence to protocols. Operator demonstrated professionalism, empathy, and clear communication. Only minor improvement needed in follow-up documentation.",
  },
  {
    id: "eval-003",
    date: "2025-01-15 12:18",
    evaluator: "AI QA System",
    evaluatorType: "AI QA System",
    type: "Automated",
    score: 72,
    maxPoints: 100,
    callTakerName: "Emily Rodriguez",
    callType: "Traffic",
    standardsMet: 6,
    standardsNotMet: 2,
    criticalViolations: ["Callback Number Not Verified", "Location Confirmation Delayed"],
    metStandards: [
      "Assessed Call Priority",
      "Maintained Professional Tone",
      "Dispatched Appropriate Resources",
      "Provided Clear Instructions",
      "Documented Call Details",
      "Confirmed Scene Safety",
    ],
    callId: "call-2024-003",
    duration: "2:48",
    transcript: "Dispatcher: 911, what's your emergency?\nCaller: There's been an accident...",
    summary:
      "Traffic accident call handled adequately with room for improvement. Operator maintained professionalism and dispatched appropriate resources. Needs coaching on callback verification and timely location confirmation.",
  },
  {
    id: "eval-004",
    date: "2025-01-15 11:52",
    evaluator: "AI QA System",
    evaluatorType: "AI QA System",
    type: "Hybrid",
    score: 94,
    maxPoints: 100,
    callTakerName: "David Kim",
    callType: "Medical",
    standardsMet: 9,
    standardsNotMet: 0,
    criticalViolations: [],
    metStandards: [
      "Obtained Callback Number",
      "Verified Location Accuracy",
      "Assessed Call Priority",
      "Maintained Professional Tone",
      "Demonstrated Empathy",
      "Provided Pre-Arrival Instructions",
      "Dispatched Appropriate Resources",
      "Confirmed Caller Safety",
      "Documented Call Thoroughly",
    ],
    callId: "call-2024-004",
    duration: "6:21",
    transcript: "Dispatcher: 911, what's your emergency?\nCaller: My father is having chest pain...",
    summary:
      "Outstanding medical emergency response demonstrating exemplary protocol adherence. Operator exhibited excellent information gathering, empathy, and provided comprehensive pre-arrival instructions. Model performance for training purposes.",
  },
  {
    id: "eval-005",
    date: "2025-01-15 10:33",
    evaluator: "Jennifer Martinez",
    evaluatorType: "Human",
    type: "Manual",
    score: 55,
    maxPoints: 100,
    callTakerName: "Lisa Anderson",
    callType: "Police",
    standardsMet: 4,
    standardsNotMet: 3,
    criticalViolations: [
      "Failed to Obtain Suspect Description",
      "Location Verification Incomplete",
      "Officer Safety Information Not Relayed",
    ],
    metStandards: [
      "Maintained Professional Tone",
      "Dispatched Appropriate Resources",
      "Documented Call Details",
      "Confirmed Caller Safety",
    ],
    callId: "call-2024-005",
    duration: "5:12",
    transcript: "Dispatcher: 911, what's your emergency?\nCaller: Someone broke into my car...",
    summary:
      "Police call with significant protocol gaps requiring immediate attention. Operator failed to obtain critical suspect description and complete location verification. Officer safety information not properly relayed. Comprehensive retraining recommended.",
  },
  {
    id: "eval-006",
    date: "2025-01-14 16:45",
    evaluator: "AI QA System",
    evaluatorType: "AI QA System",
    type: "Automated",
    score: 88,
    maxPoints: 100,
    callTakerName: "Robert Taylor",
    callType: "Medical",
    standardsMet: 8,
    standardsNotMet: 1,
    criticalViolations: ["Pre-Arrival Instructions Could Be More Detailed"],
    metStandards: [
      "Obtained Callback Number",
      "Verified Location Accuracy",
      "Assessed Call Priority",
      "Maintained Professional Tone",
      "Demonstrated Empathy",
      "Dispatched Appropriate Resources",
      "Confirmed Caller Safety",
      "Documented Call Thoroughly",
    ],
    callId: "call-2024-006",
    duration: "3:45",
    transcript: "Dispatcher: 911, what's your emergency?\nCaller: My neighbor needs help...",
    summary:
      "Strong medical emergency response with minor improvement opportunity. Operator demonstrated excellent protocol adherence and empathy. Pre-arrival instructions could be more detailed and specific to enhance caller support.",
  },
]

export interface ProtocolQuestion {
  id: string
  question: string
  points: number
  answer?: "Yes" | "No" | "Refused" | "N/A"
  isActive?: boolean
  prompt?: string
}

export interface ProtocolSection {
  id: string
  title: string
  totalPoints: number
  questions: ProtocolQuestion[]
}

export interface Protocol {
  id: string
  type: "Fire" | "Police" | "EMS"
  name: string
  color: string
  sections: ProtocolSection[]
}

export const protocols: Protocol[] = [
  {
    id: "protocol-fire",
    type: "Fire",
    name: "Call Taking for Fire Incidents",
    color: "bg-red-500",
    sections: [
      {
        id: "fire-interview",
        title: "Interview Questions",
        totalPoints: 325,
        questions: [
          {
            id: "fire-q1",
            question: "Verified address of occurrence?",
            points: 200,
            isActive: true,
            prompt: "Confirm the exact address where the fire is occurring.",
          },
          {
            id: "fire-q2",
            question: "Caller's telephone number verified?",
            points: 30,
            isActive: true,
            prompt: "Obtain and confirm the caller's callback number.",
          },
          {
            id: "fire-q3",
            question: "Asked about occupants in building?",
            points: 20,
            isActive: true,
            prompt: "Determine if people are inside.",
          },
          {
            id: "fire-q4",
            question: "Occupants told to evacuate if safe?",
            points: 25,
            isActive: true,
            prompt: "Advise to evacuate safely.",
          },
          {
            id: "fire-q5",
            question: "Asked other incident specific questions?",
            points: 20,
            isActive: true,
            prompt: "Ask follow-up questions.",
          },
          {
            id: "fire-q6",
            question: "Caller's name obtained?",
            points: 10,
            isActive: true,
            prompt: "Get caller's name.",
          },
          {
            id: "fire-q7",
            question: "Asked about time of occurrence?",
            points: 15,
            isActive: true,
            prompt: "When did fire start?",
          },
          {
            id: "fire-q8",
            question: "Caller's address obtained?",
            points: 5,
            isActive: true,
            prompt: "Get caller's address.",
          },
        ],
      },
      {
        id: "fire-cad",
        title: "CAD Skills",
        totalPoints: 115,
        questions: [
          {
            id: "fire-cad1",
            question: "Checked prior incidents?",
            points: 15,
            isActive: true,
            prompt: "Verify prior records.",
          },
          {
            id: "fire-cad2",
            question: "Complete info added to CAD?",
            points: 50,
            isActive: true,
            prompt: "Add all information.",
          },
          {
            id: "fire-cad3",
            question: "Accurate info added to CAD?",
            points: 50,
            isActive: true,
            prompt: "Verify accuracy.",
          },
        ],
      },
      {
        id: "fire-telephone",
        title: "Telephone Protocol/Skill",
        totalPoints: 305,
        questions: [
          {
            id: "fire-tel1",
            question: "Answered within 3 seconds?",
            points: 50,
            isActive: true,
            prompt: "Check answer time.",
          },
          {
            id: "fire-tel2",
            question: "Proper greeting used?",
            points: 10,
            isActive: true,
            prompt: "Verify greeting.",
          },
          {
            id: "fire-tel3",
            question: "Listens and comprehends?",
            points: 80,
            isActive: true,
            prompt: "Assess listening.",
          },
          {
            id: "fire-tel4",
            question: "Takes control with judgment?",
            points: 25,
            isActive: true,
            prompt: "Evaluate control.",
          },
          { id: "fire-tel5", question: "Remained calm?", points: 30, isActive: true, prompt: "Assess composure." },
          { id: "fire-tel6", question: "Proper tone used?", points: 15, isActive: true, prompt: "Verify tone." },
          {
            id: "fire-tel7",
            question: "Professional language?",
            points: 20,
            isActive: true,
            prompt: "Check language.",
          },
          { id: "fire-tel8", question: "Courteous?", points: 25, isActive: true, prompt: "Assess courtesy." },
          {
            id: "fire-tel9",
            question: "No dead time on phone?",
            points: 10,
            isActive: true,
            prompt: "Check engagement.",
          },
          {
            id: "fire-tel10",
            question: "Advises of transfer?",
            points: 15,
            isActive: true,
            prompt: "Inform of transfer.",
          },
          {
            id: "fire-tel11",
            question: "Stays on line for transfer?",
            points: 15,
            isActive: true,
            prompt: "Verify handoff.",
          },
          {
            id: "fire-tel12",
            question: "Directs to proper agency?",
            points: 10,
            isActive: true,
            prompt: "Verify agency direction.",
          },
        ],
      },
      {
        id: "fire-supervisor",
        title: "Supervisor's Overview",
        totalPoints: 100,
        questions: [
          {
            id: "fire-super1",
            question: "Overall call handled properly?",
            points: 100,
            isActive: true,
            prompt: "Overall assessment.",
          },
        ],
      },
    ],
  },
  {
    id: "protocol-police",
    type: "Police",
    name: "Call Taking for Police Incident",
    color: "bg-blue-500",
    sections: [
      {
        id: "police-interview",
        title: "Interview Questions",
        totalPoints: 585,
        questions: [
          { id: "police-q1", question: "Verified address?", points: 200, isActive: true, prompt: "Confirm address." },
          {
            id: "police-q2",
            question: "Caller's phone verified?",
            points: 30,
            isActive: true,
            prompt: "Get callback.",
          },
          {
            id: "police-q3",
            question: "Time of occurrence?",
            points: 30,
            isActive: true,
            prompt: "When did it happen?",
          },
          { id: "police-q4", question: "Asked about weapons?", points: 80, isActive: true, prompt: "Any weapons?" },
          { id: "police-q5", question: "Alcohol/drug use?", points: 50, isActive: true, prompt: "Substance involved?" },
          { id: "police-q6", question: "Need ambulance?", points: 15, isActive: true, prompt: "Medical help?" },
          {
            id: "police-q7",
            question: "Description obtained?",
            points: 20,
            isActive: true,
            prompt: "Describe suspect.",
          },
          { id: "police-q8", question: "Offender location?", points: 25, isActive: true, prompt: "Where is suspect?" },
          { id: "police-q9", question: "Number of offenders?", points: 20, isActive: true, prompt: "How many?" },
          { id: "police-q10", question: "Caller's name?", points: 5, isActive: true, prompt: "Name?" },
          { id: "police-q11", question: "Caller's address?", points: 5, isActive: true, prompt: "Address?" },
          {
            id: "police-q12",
            question: "Want to see officer?",
            points: 20,
            isActive: true,
            prompt: "Response wanted?",
          },
          { id: "police-q13", question: "Other questions?", points: 20, isActive: true, prompt: "Follow-up?" },
        ],
      },
      {
        id: "police-cad",
        title: "CAD Skills",
        totalPoints: 115,
        questions: [
          {
            id: "police-cad1",
            question: "Checked prior incidents?",
            points: 15,
            isActive: true,
            prompt: "Check history.",
          },
          { id: "police-cad2", question: "Complete info added?", points: 50, isActive: true, prompt: "All info." },
          { id: "police-cad3", question: "Accurate info?", points: 50, isActive: true, prompt: "Accuracy check." },
        ],
      },
      {
        id: "police-telephone",
        title: "Telephone Protocol/Skill",
        totalPoints: 305,
        questions: [
          { id: "police-tel1", question: "Answered within 3 seconds?", points: 50, isActive: true, prompt: "Speed." },
          { id: "police-tel2", question: "Proper greeting?", points: 10, isActive: true, prompt: "Greeting." },
          { id: "police-tel3", question: "Comprehends?", points: 80, isActive: true, prompt: "Understanding." },
          { id: "police-tel4", question: "Control with judgment?", points: 25, isActive: true, prompt: "Control." },
          { id: "police-tel5", question: "Calm?", points: 30, isActive: true, prompt: "Composure." },
          { id: "police-tel6", question: "Tone?", points: 15, isActive: true, prompt: "Tone." },
          { id: "police-tel7", question: "Professional language?", points: 20, isActive: true, prompt: "Language." },
          { id: "police-tel8", question: "Courteous?", points: 25, isActive: true, prompt: "Courtesy." },
          { id: "police-tel9", question: "No dead time?", points: 10, isActive: true, prompt: "Engagement." },
          { id: "police-tel10", question: "Transfer advised?", points: 15, isActive: true, prompt: "Transfer info." },
          { id: "police-tel11", question: "Stays on line?", points: 15, isActive: true, prompt: "Handoff." },
          { id: "police-tel12", question: "Directs properly?", points: 10, isActive: true, prompt: "Agency." },
        ],
      },
      {
        id: "police-supervisor",
        title: "Supervisor's Overview",
        totalPoints: 100,
        questions: [
          {
            id: "police-super1",
            question: "Overall handled properly?",
            points: 100,
            isActive: true,
            prompt: "Assessment.",
          },
        ],
      },
    ],
  },
  {
    id: "protocol-ems",
    type: "EMS",
    name: "Call Taking for EMS Incidents",
    color: "bg-green-500",
    sections: [
      {
        id: "ems-interview",
        title: "Interview Questions",
        totalPoints: 470,
        questions: [
          { id: "ems-q1", question: "Verified address?", points: 200, isActive: true, prompt: "Address." },
          { id: "ems-q2", question: "Caller's phone verified?", points: 30, isActive: true, prompt: "Callback." },
          { id: "ems-q3", question: "Why ambulance needed?", points: 25, isActive: true, prompt: "Reason." },
          { id: "ems-q4", question: "Patient age?", points: 20, isActive: true, prompt: "Age." },
          { id: "ems-q5", question: "Patient conscious?", points: 25, isActive: true, prompt: "Alert." },
          { id: "ems-q6", question: "Patient breathing?", points: 25, isActive: true, prompt: "Breathing." },
          { id: "ems-q7", question: "Protocol followed?", points: 30, isActive: true, prompt: "Protocol." },
          { id: "ems-q8", question: "Instructions given?", points: 30, isActive: true, prompt: "First aid." },
          { id: "ems-q9", question: "Number injured?", points: 15, isActive: true, prompt: "Count." },
          { id: "ems-q10", question: "Caller's name?", points: 10, isActive: true, prompt: "Name." },
          { id: "ems-q11", question: "Caller's address?", points: 5, isActive: true, prompt: "Address." },
        ],
      },
      {
        id: "ems-cad",
        title: "CAD Skills",
        totalPoints: 115,
        questions: [
          { id: "ems-cad1", question: "Checked prior incidents?", points: 15, isActive: true, prompt: "History." },
          { id: "ems-cad2", question: "Complete info?", points: 50, isActive: true, prompt: "All info." },
          { id: "ems-cad3", question: "Accurate info?", points: 50, isActive: true, prompt: "Accuracy." },
        ],
      },
      {
        id: "ems-telephone",
        title: "Telephone Protocol/Skill",
        totalPoints: 305,
        questions: [
          { id: "ems-tel1", question: "Answered within 3 seconds?", points: 50, isActive: true, prompt: "Speed." },
          { id: "ems-tel2", question: "Proper greeting?", points: 10, isActive: true, prompt: "Greeting." },
          { id: "ems-tel3", question: "Comprehends?", points: 80, isActive: true, prompt: "Understanding." },
          { id: "ems-tel4", question: "Control?", points: 25, isActive: true, prompt: "Control." },
          { id: "ems-tel5", question: "Calm?", points: 30, isActive: true, prompt: "Composure." },
          { id: "ems-tel6", question: "Tone?", points: 15, isActive: true, prompt: "Tone." },
          { id: "ems-tel7", question: "Professional?", points: 20, isActive: true, prompt: "Language." },
          { id: "ems-tel8", question: "Courteous?", points: 25, isActive: true, prompt: "Courtesy." },
          { id: "ems-tel9", question: "No dead time?", points: 10, isActive: true, prompt: "Engagement." },
          { id: "ems-tel10", question: "Transfer advised?", points: 15, isActive: true, prompt: "Transfer." },
          { id: "ems-tel11", question: "Stays on line?", points: 15, isActive: true, prompt: "Handoff." },
          { id: "ems-tel12", question: "Directs properly?", points: 10, isActive: true, prompt: "Agency." },
        ],
      },
      {
        id: "ems-supervisor",
        title: "Supervisor's Overview",
        totalPoints: 100,
        questions: [
          {
            id: "ems-super1",
            question: "Overall handled properly?",
            points: 100,
            isActive: true,
            prompt: "Assessment.",
          },
        ],
      },
    ],
  },
]

// Extended operator performance data
export interface OperatorPerformanceMetrics {
  operatorName: string
  rank: number
  weeklyScores: { week: string; score: number; calls: number }[]
  callTypeDistribution: { type: string; count: number; avgScore: number }[]
  skillsAssessment: { skill: string; score: number; trend: "up" | "down" | "stable" }[]
  recentCallPerformance: {
    date: string
    time: string
    type: string
    duration: string
    score: number
    sentiment: "positive" | "neutral" | "negative"
  }[]
  monthlyMetrics: {
    month: string
    totalCalls: number
    avgScore: number
    complianceRate: number
    avgHandleTime: string
  }[]
}

export const operatorMetrics: { [key: string]: OperatorPerformanceMetrics } = {
  "Sarah Johnson": {
    operatorName: "Sarah Johnson",
    rank: 1,
    weeklyScores: [
      { week: "Week 1", score: 91, calls: 82 },
      { week: "Week 2", score: 93, calls: 88 },
      { week: "Week 3", score: 94, calls: 86 },
      { week: "Week 4", score: 94.5, calls: 86 },
    ],
    callTypeDistribution: [
      { type: "Medical", count: 120, avgScore: 95 },
      { type: "Fire", count: 52, avgScore: 94 },
      { type: "Police", count: 88, avgScore: 93 },
      { type: "Traffic", count: 50, avgScore: 96 },
      { type: "Other", count: 32, avgScore: 94 },
    ],
    skillsAssessment: [
      { skill: "Information Gathering", score: 96, trend: "up" },
      { skill: "Caller Management", score: 94, trend: "stable" },
      { skill: "Protocol Compliance", score: 95, trend: "up" },
      { skill: "Communication", score: 97, trend: "up" },
      { skill: "Response Time", score: 93, trend: "stable" },
      { skill: "Documentation", score: 94, trend: "up" },
    ],
    recentCallPerformance: [
      { date: "2025-01-15", time: "14:23", type: "Medical", duration: "4:32", score: 96, sentiment: "neutral" },
      { date: "2025-01-15", time: "13:45", type: "Fire", duration: "3:15", score: 95, sentiment: "negative" },
      { date: "2025-01-15", time: "12:18", type: "Traffic", duration: "2:48", score: 97, sentiment: "positive" },
      { date: "2025-01-15", time: "11:52", type: "Police", duration: "6:21", score: 93, sentiment: "neutral" },
      { date: "2025-01-15", time: "10:33", type: "Medical", duration: "5:12", score: 94, sentiment: "neutral" },
    ],
    monthlyMetrics: [
      { month: "Oct 2024", totalCalls: 312, avgScore: 92.8, complianceRate: 94.2, avgHandleTime: "4:15" },
      { month: "Nov 2024", totalCalls: 328, avgScore: 93.5, complianceRate: 95.1, avgHandleTime: "4:10" },
      { month: "Dec 2024", totalCalls: 298, avgScore: 94.2, complianceRate: 95.8, avgHandleTime: "4:05" },
      { month: "Jan 2025", totalCalls: 342, avgScore: 94.5, complianceRate: 96.2, avgHandleTime: "4:02" },
    ],
  },
  "Mike Chen": {
    operatorName: "Mike Chen",
    rank: 2,
    weeklyScores: [
      { week: "Week 1", score: 89, calls: 76 },
      { week: "Week 2", score: 91, calls: 80 },
      { week: "Week 3", score: 92, calls: 82 },
      { week: "Week 4", score: 92.8, calls: 80 },
    ],
    callTypeDistribution: [
      { type: "Medical", count: 108, avgScore: 93 },
      { type: "Fire", count: 48, avgScore: 92 },
      { type: "Police", count: 82, avgScore: 92 },
      { type: "Traffic", count: 48, avgScore: 94 },
      { type: "Other", count: 32, avgScore: 92 },
    ],
    skillsAssessment: [
      { skill: "Information Gathering", score: 94, trend: "up" },
      { skill: "Caller Management", score: 91, trend: "up" },
      { skill: "Protocol Compliance", score: 92, trend: "stable" },
      { skill: "Communication", score: 93, trend: "up" },
      { skill: "Response Time", score: 91, trend: "stable" },
      { skill: "Documentation", score: 93, trend: "up" },
    ],
    recentCallPerformance: [
      { date: "2025-01-15", time: "15:10", type: "Fire", duration: "3:45", score: 94, sentiment: "negative" },
      { date: "2025-01-15", time: "14:22", type: "Medical", duration: "5:01", score: 91, sentiment: "neutral" },
      { date: "2025-01-15", time: "13:05", type: "Police", duration: "4:18", score: 93, sentiment: "positive" },
      { date: "2025-01-15", time: "11:48", type: "Traffic", duration: "3:12", score: 95, sentiment: "neutral" },
      { date: "2025-01-15", time: "10:15", type: "Medical", duration: "4:55", score: 90, sentiment: "neutral" },
    ],
    monthlyMetrics: [
      { month: "Oct 2024", totalCalls: 289, avgScore: 91.2, complianceRate: 92.8, avgHandleTime: "4:22" },
      { month: "Nov 2024", totalCalls: 305, avgScore: 91.8, complianceRate: 93.4, avgHandleTime: "4:18" },
      { month: "Dec 2024", totalCalls: 282, avgScore: 92.3, complianceRate: 94.1, avgHandleTime: "4:15" },
      { month: "Jan 2025", totalCalls: 318, avgScore: 92.8, complianceRate: 94.5, avgHandleTime: "4:12" },
    ],
  },
  "Emily Rodriguez": {
    operatorName: "Emily Rodriguez",
    rank: 3,
    weeklyScores: [
      { week: "Week 1", score: 88, calls: 70 },
      { week: "Week 2", score: 90, calls: 74 },
      { week: "Week 3", score: 91, calls: 76 },
      { week: "Week 4", score: 91.2, calls: 75 },
    ],
    callTypeDistribution: [
      { type: "Medical", count: 100, avgScore: 92 },
      { type: "Fire", count: 44, avgScore: 90 },
      { type: "Police", count: 74, avgScore: 91 },
      { type: "Traffic", count: 44, avgScore: 92 },
      { type: "Other", count: 33, avgScore: 91 },
    ],
    skillsAssessment: [
      { skill: "Information Gathering", score: 92, trend: "stable" },
      { skill: "Caller Management", score: 90, trend: "up" },
      { skill: "Protocol Compliance", score: 91, trend: "stable" },
      { skill: "Communication", score: 92, trend: "up" },
      { skill: "Response Time", score: 90, trend: "up" },
      { skill: "Documentation", score: 91, trend: "stable" },
    ],
    recentCallPerformance: [
      { date: "2025-01-15", time: "16:05", type: "Medical", duration: "4:18", score: 92, sentiment: "neutral" },
      { date: "2025-01-15", time: "14:50", type: "Traffic", duration: "2:55", score: 93, sentiment: "positive" },
      { date: "2025-01-15", time: "13:30", type: "Police", duration: "5:10", score: 89, sentiment: "neutral" },
      { date: "2025-01-15", time: "12:15", type: "Fire", duration: "3:40", score: 90, sentiment: "negative" },
      { date: "2025-01-15", time: "11:00", type: "Medical", duration: "4:45", score: 92, sentiment: "neutral" },
    ],
    monthlyMetrics: [
      { month: "Oct 2024", totalCalls: 268, avgScore: 89.8, complianceRate: 91.5, avgHandleTime: "4:28" },
      { month: "Nov 2024", totalCalls: 282, avgScore: 90.3, complianceRate: 92.1, avgHandleTime: "4:24" },
      { month: "Dec 2024", totalCalls: 265, avgScore: 90.8, complianceRate: 92.8, avgHandleTime: "4:20" },
      { month: "Jan 2025", totalCalls: 295, avgScore: 91.2, complianceRate: 93.2, avgHandleTime: "4:18" },
    ],
  },
}

// Helper function to get operator metrics
export const getOperatorMetrics = (operatorName: string): OperatorPerformanceMetrics | undefined => {
  return operatorMetrics[operatorName]
}