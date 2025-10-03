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
  { type: "Medical", count: 145, fill: "var(--primary)" },
  { type: "Fire", count: 78, fill: "var(--primary)" },
  { type: "Traffic", count: 92, fill: "var(--primary)" },
  { type: "Shooting", count: 34, fill: "var(--primary)" },
  { type: "Other", count: 67, fill: "var(--primary)" },
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

