"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  AudioLines
} from "lucide-react"

interface AudioPlayerWithWaveformProps {
  audioUrl?: string
  fileName?: string
  className?: string
}

export function AudioPlayerWithWaveform({ 
  audioUrl, 
  fileName,
  className 
}: AudioPlayerWithWaveformProps) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate mock waveform data
  const generateMockWaveform = useCallback(() => {
    const data = Array.from({ length: 150 }, (_, i) => {
      const bass = Math.sin(i * 0.02) * 0.4
      const mid = Math.sin(i * 0.08) * 0.3
      const high = Math.sin(i * 0.2) * 0.2
      const envelope = Math.sin((i / 150) * Math.PI * 2) * 0.5 + 0.5
      return Math.abs((bass + mid + high) * envelope) * 0.8
    })
    setWaveformData(data)
  }, [])

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || waveformData.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2
    
    // Clear the entire canvas first
    ctx.clearRect(0, 0, width, height)
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)')
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw waveform bars
    const barWidth = width / waveformData.length
    const barGap = 1
    const actualBarWidth = barWidth - barGap
    
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth
      const amplitude = waveformData[i]
      const barHeight = Math.abs(amplitude) * (height * 0.4)
      
      ctx.fillStyle = `rgba(59, 130, 246, ${0.7 + Math.abs(amplitude) * 0.3})`
      ctx.fillRect(x, centerY - barHeight / 2, actualBarWidth, barHeight)
    }
    
    // Draw center line
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()
    
    // Draw playback position indicator
    if (duration > 0) {
      const progress = currentTime / duration
      const x = progress * width
      
      // Draw shadow for visibility
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      
      // Draw main indicator line
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      
      // Add position marker at top
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(x, 8, 3, 0, 2 * Math.PI)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [waveformData, currentTime, duration])

  // Animation loop
  const animate = useCallback(() => {
    drawWaveform()
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [drawWaveform, isPlaying])

  // Initialize waveform on mount
  useEffect(() => {
    generateMockWaveform()
  }, [generateMockWaveform])

  // Handle animation
  useEffect(() => {
    if (isPlaying) {
      animate()
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, animate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current)
      }
    }
  }, [])

  // Always redraw waveform when data changes
  useEffect(() => {
    drawWaveform()
  }, [drawWaveform])

  // Audio event handlers
  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration)
      console.log('Audio loaded:', audioRef.current.duration + 's')
    }
    setIsLoading(false)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    if (audioRef.current && !duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current)
    }
  }

  // Control handlers
  const togglePlayPause = async () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current)
      }
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.warn('No audio file - using demo mode')
        setIsPlaying(true)
        startMockPlayback()
      }
    }
  }

  const startMockPlayback = () => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current)
    }
    
    mockIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1
        if (newTime >= duration) {
          setIsPlaying(false)
          if (mockIntervalRef.current) {
            clearInterval(mockIntervalRef.current)
          }
          return 0
        }
        return newTime
      })
    }, 1000)
  }

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration
    setCurrentTime(newTime)
    
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      if (newVolume > 0 && isMuted) {
        audioRef.current.muted = false
        setIsMuted(false)
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted
      audioRef.current.muted = newMuted
      setIsMuted(newMuted)
    }
  }

  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.pause()
    }
    
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/elevator_music.mp3"
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadStart={() => {
          setIsLoading(true)
          setTimeout(() => setIsLoading(false), 3000)
        }}
        onError={() => {
          console.info('elevator_music.mp3 not found - demo mode')
          setIsLoading(false)
          setDuration(180) // 3 minutes demo duration
        }}
        preload="metadata"
      />

      {/* Waveform Visualization */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AudioLines className="h-4 w-4 text-primary" />
              <h5 className="text-sm font-semibold text-foreground">Audio Waveform</h5>
            </div>
            {fileName && (
              <div className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted/50 rounded">
                {fileName}
              </div>
            )}
          </div>
          
          <div className="relative border border-border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20 aspect-[4/1]">
            <canvas
              ref={canvasRef}
              width={800}
              height={120}
              className="w-full h-full cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={(e) => {
                if (!duration) return
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const progress = x / rect.width
                const newTime = progress * duration
                handleSeek([progress * 100])
              }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Audio Controls */}
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-mono tabular-nums">{formatTime(currentTime)}</span>
              <span className="text-muted-foreground font-mono tabular-nums">{formatTime(duration)}</span>
            </div>
            <div className="w-full">
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                onChange={(e) => handleSeek([parseFloat(e.target.value)])}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="h-9 w-9 rounded-full p-0"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 w-8 rounded-full p-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Volume controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </Button>
              
              <div className="w-16 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={isMuted ? 0 : volume * 100}
                  onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}