"use client"

import WavesurferPlayer from "@wavesurfer/react"
import { useState } from "react";
import type WaveSurfer from "wavesurfer.js";

export default function AudioPlayerWithWaveformV2() {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws)
    setIsPlaying(false)
  }

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }

  return (
    <>
      <WavesurferPlayer
        height={100}
        waveColor="violet"
        url="/elevator_music.mp3"
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button onClick={onPlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </>
  )
}