"use client"

import WavesurferPlayer from "@wavesurfer/react"
import { useState, useRef, useEffect } from "react";
import type WaveSurfer from "wavesurfer.js";

export default function AudioPlayerWithWaveformV2() {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [duration, setDuration] = useState("0:00")
  const [hoverWidth, setHoverWidth] = useState(0)
  const [volume, setVolume] = useState(1)
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
          waveColor="gray"
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onPlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span>{currentTime}/{duration}</span>
      </div>

      <style jsx>{`
        .waveform-container:hover .hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
}