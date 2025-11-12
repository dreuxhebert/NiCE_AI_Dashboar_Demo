import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AudioPlayerWithWaveformV2 from "@/components/audio-player-with-waveform-v2"
import { Volume2 } from "lucide-react"

export default function DevPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Development Page</h1>
        <p className="text-muted-foreground">Audio Player V2 Component Showcase</p>
      </div>
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl font-bold">Audio Player V2</CardTitle>
            <p className="text-muted-foreground mt-2">
              Interactive waveform audio player component
            </p>
          </div>
          <Volume2 className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Audio Player Controls</h3>
            <AudioPlayerWithWaveformV2 /> {/*This is where the component is from the audio player*/}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Waveform</div>
              <div className="text-sm text-muted-foreground">Visualized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Interactive</div>
              <div className="text-sm text-muted-foreground">Controls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Responsive</div>
              <div className="text-sm text-muted-foreground">Design</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Info Card */}
      <Card className="w-full max-w-4xl mx-auto mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Component Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Visual waveform representation</li>
            <li>• Play/pause functionality</li>
            <li>• Built with WaveSurfer.js</li>
            <li>• React hooks integration</li>
            <li>• Customizable wave color</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}