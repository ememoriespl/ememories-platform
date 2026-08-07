"use client"

import { useCallback, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

/** Cover banner aspect ratio — kept in sync with the banner in EnekrologView. */
export const COVER_ASPECT = 16 / 6

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener("load", () => resolve(img))
    img.addEventListener("error", reject)
    img.crossOrigin = "anonymous"
    img.src = url
  })
}

/** Crop `imageSrc` to `pixelCrop` and return a JPEG blob. */
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(pixelCrop.width)
  canvas.height = Math.round(pixelCrop.height)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("no canvas context")
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.9)
  })
}

/**
 * Crop the selected image to the cover aspect ratio (zoom + pan) and hand the parent a
 * cropped JPEG File to upload.
 */
export function CoverCropDialog({
  imageSrc,
  open,
  onOpenChange,
  onCropped,
}: {
  imageSrc: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCropped: (file: File) => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_area: Area, pixels: Area) => setAreaPixels(pixels), [])

  async function handleSave() {
    if (!imageSrc || !areaPixels) return
    setSaving(true)
    try {
      const blob = await getCroppedBlob(imageSrc, areaPixels)
      onCropped(new File([blob], "cover.jpg", { type: "image/jpeg" }))
      onOpenChange(false)
    } finally {
      setSaving(false)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Kadruj zdjęcie w tle</DialogTitle>
        </DialogHeader>

        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={COVER_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground">Powiększenie</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
        </div>

        <DialogFooter>
          <Button color="tertiary" onClick={() => onOpenChange(false)}>Anuluj</Button>
          <Button onClick={handleSave} disabled={saving || !areaPixels}>
            {saving ? "Zapisywanie…" : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
