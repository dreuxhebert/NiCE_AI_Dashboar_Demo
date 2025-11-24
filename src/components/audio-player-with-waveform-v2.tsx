"use client"

import WavesurferPlayer from "@wavesurfer/react"
import { useState, useRef, useEffect } from "react"
import type WaveSurfer from "wavesurfer.js"
import { Volume2, VolumeX } from "lucide-react"

export default function AudioPlayerWithWaveformV2() {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [duration, setDuration] = useState("0:00")
  const [hoverWidth, setHoverWidth] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secondsRemainder = Math.round(seconds) % 60
    const paddedSeconds = `0${secondsRemainder}`.slice(-2)
    return `${minutes}:${paddedSeconds}`
  }

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws)
    setIsPlaying(false)
    setDuration(formatTime(ws.getDuration()))
  }

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }

  const skipBackward = () => {
    if (wavesurfer) {
      const currentTime = wavesurfer.getCurrentTime()
      wavesurfer.setTime(Math.max(0, currentTime - 10))
    }
  }

  const skipForward = () => {
    if (wavesurfer) {
      const currentTime = wavesurfer.getCurrentTime()
      const duration = wavesurfer.getDuration()
      wavesurfer.setTime(Math.min(duration, currentTime + 10))
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (wavesurfer) {
      wavesurfer.setVolume(newVolume)
      if (newVolume > 0 && isMuted) {
        setIsMuted(false)
      }
    }
  }

  const toggleMute = () => {
    if (wavesurfer) {
      const newMuted = !isMuted
      setIsMuted(newMuted)
      wavesurfer.setVolume(newMuted ? 0 : volume)
    }
  }

  useEffect(() => {
    if (!wavesurfer) return

    const subscriptions = [
      wavesurfer.on('timeupdate', (time) => {
        setCurrentTime(formatTime(time))
      }),
      wavesurfer.on('decode', (dur) => {
        setDuration(formatTime(dur))
      })
    ]

    return () => {
      subscriptions.forEach(unsub => unsub())
    }
  }, [wavesurfer])

  useEffect(() => {
    const root = document.documentElement
    setIsDark(root.classList.contains("dark"))

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"))
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setHoverWidth(e.nativeEvent.offsetX)
  }

  return (
    <>
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="waveform-container"
        style={{ 
          position: 'relative', 
          cursor: 'pointer'
        }}
      >
        <div
          className="hover-overlay"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 10,
            pointerEvents: 'none',
            height: '100%',
            width: `${hoverWidth}px`,
            mixBlendMode: 'overlay',
            background: 'rgba(255, 255, 255, 0.5)',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <WavesurferPlayer
          height={100}
          waveColor={isDark ? "#4a5568" : "gray"}
          progressColor="#3087df"
          url="/elevator_music.mp3"
          onReady={onReady}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          barWidth={2}
          barGap={2}
          normalize={false}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px 0',
        gap: '16px'
      }}>
        <button 
          onClick={onPlayPause}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #3087df',
            background: isPlaying ? '#3087df' : 'transparent',
            color: isPlaying ? 'white' : '#3087df',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <span style={{ 
          fontFamily: 'monospace',
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#666'
        }}>
          {currentTime}/{duration}
        </span>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginLeft: 'auto'
        }}>
          <button
            onClick={toggleMute}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: isDark ? '#9ca3af' : '#666'
            }}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            background: isDark ? '#374151' : '#f5f5f5',
            borderRadius: '12px',
            border: isDark ? '1px solid #4b5563' : '1px solid #e0e0e0'
          }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{
                width: '80px',
                cursor: 'pointer',
                // @ts-ignore
                '--value': `${(isMuted ? 0 : volume) * 100}%`,
                '--track-bg': isDark ? '#6b7280' : '#d0d0d0',
                '--thumb-border': isDark ? '#1f2937' : 'white'
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .waveform-container:hover .hover-overlay {
          opacity: 1 !important;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: var(--track-bg);
          height: 6px;
          border-radius: 3px;
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-track {
          height: 6px;
          background: var(--track-bg);
          border-radius: 3px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3087df;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          border: 2px solid var(--thumb-border);
        }
        
        input[type="range"]::-moz-range-track {
          height: 6px;
          background: var(--track-bg);
          border-radius: 3px;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3087df;
          cursor: pointer;
          border: 2px solid var(--thumb-border);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        input[type="range"]::-ms-track {
          height: 6px;
          background: var(--track-bg);
          border: none;
          border-radius: 3px;
          color: transparent;
        }
        
        input[type="range"]::-ms-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3087df;
          cursor: pointer;
          border: 2px solid var(--thumb-border);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        button:hover {
          opacity: 0.8;
        }
      `}</style>
    </>
  )
}