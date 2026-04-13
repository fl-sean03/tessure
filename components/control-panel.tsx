"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, MousePointer2, Move3d, ZoomIn } from "lucide-react"

export default function ControlPanel() {
  return (
    <div className="absolute top-6 left-6 z-10 pointer-events-none">
      <Card className="p-6 backdrop-blur-md bg-card/80 border-border/50 pointer-events-auto max-w-sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Info className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-sans font-semibold text-lg text-card-foreground">Interactive 3D Space</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Explore geometric forms in an immersive environment
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm">
              <MousePointer2 className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Click shapes to interact</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Move3d className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Drag to rotate view</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ZoomIn className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Scroll to zoom in/out</span>
            </div>
          </div>

          <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">Learn More</Button>
        </div>
      </Card>
    </div>
  )
}
