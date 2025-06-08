"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageCircle, Send } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function ConfessionPage() {
  const [confession, setConfession] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("Your confession has been recorded anonymously.")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confession.trim()) return

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/confessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: confession }),
      })
      if (!res.ok) {
        let msg = "Submission failed. Please try again later."
        try {
          const data = await res.json()
          if (data?.error) msg = data.error
        } catch {}
        setDialogMessage(msg)
        setShowDialog(true)
        setIsSubmitting(false)
        return
      }
      setConfession("")
      setDialogMessage("Your confession has been recorded anonymously.")
      setShowDialog(true)
    } catch (err) {
      setDialogMessage("Submission failed. Please try again later.")
      setShowDialog(true)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-blue-900 relative overflow-hidden">
      {/* Decorative Background Images - Behind content */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Behind main card - top far left */}
        <div className="absolute top-10 left-2 z-0">
          <Image
            src="/a.png"
            alt="Student"
            width={160}
            height={160}
            className="opacity-80 border-transparent"
          />
        </div>

        {/* Behind main card - top far right */}
        <div className="absolute top-8 right-8 z-0">
          <Image
            src="/b.png"
            alt="Student"
            width={120}
            height={120}
            className="opacity-80 border-transparent"
          />
        </div>

        {/* Bottom left, more spread */}
        <div className="absolute bottom-10 left-24 z-0">
          <Image
            src="/c.png"
            alt="Student"
            width={180}
            height={180}
            className="opacity-80 border-transparent"
          />
        </div>

        {/* Bottom right, more spread */}
        <div className="absolute bottom-20 right-32 z-0">
          <Image
            src="/a.png"
            alt="Student"
            width={110}
            height={110}
            className="opacity-80 border-transparent"
          />
        </div>

        {/* Center left, vertically offset */}
        <div className="absolute top-1/3 left-1/6 z-0">
          <Image
            src="/b.png"
            alt="Student"
            width={90}
            height={90}
            className="opacity-80 border-transparent"
          />
        </div>

        {/* Center right, vertically offset */}
        <div className="absolute top-2/3 right-1/5 z-0">
          <Image
            src="/c.png"
            alt="Student"
            width={130}
            height={130}
            className="opacity-80 border-transparent"
          />
        </div>

        {/* Additional for mobile, more spaced */}
        <div className="absolute top-1/5 right-2 z-0">
          <Image src="/b.png" alt="Student" width={70} height={70} className="opacity-80 border-transparent" />
        </div>

        <div className="absolute bottom-1/4 left-8 z-0">
          <Image src="/a.png" alt="Student" width={60} height={60} className="opacity-80 border-transparent" />
        </div>

        {/* New: Top center */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-0">
          <Image
            src="/d.png"
            alt="Student"
            width={100}
            height={100}
            className="opacity-80 border-transparent md:w-[180px] md:h-[180px]"
          />
        </div>

        {/* New: Far bottom left */}
        <div className="absolute bottom-4 left-4 z-0">
          <Image
            src="/e.png"
            alt="Student"
            width={90}
            height={90}
            className="opacity-80 border-transparent md:w-[160px] md:h-[160px]"
          />
        </div>

        {/* New: Far bottom right */}
        <div className="absolute bottom-6 right-6 z-0">
          <Image
            src="/f.png"
            alt="Student"
            width={120}
            height={120}
            className="opacity-80 border-transparent md:w-[200px] md:h-[200px]"
          />
        </div>

        {/* New: Mid left */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 z-0">
          <Image
            src="/g.png"
            alt="Student"
            width={80}
            height={80}
            className="opacity-80 border-transparent md:w-[140px] md:h-[140px]"
          />
        </div>

        {/* New: Mid right */}
        <div className="absolute top-2/5 right-12 z-0">
          <Image
            src="/h.png"
            alt="Student"
            width={110}
            height={110}
            className="opacity-80 border-transparent md:w-[180px] md:h-[180px]"
          />
        </div>

        {/* New: Center, slightly lower */}
        <div className="absolute top-3/5 left-1/2 -translate-x-1/2 z-0">
          <Image
            src="/i.png"
            alt="Student"
            width={70}
            height={70}
            className="opacity-80 border-transparent md:w-[120px] md:h-[120px]"
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
          <div className="text-center space-y-2 px-2 relative">
            {/* PNG above title, always visible */}
            <div className="flex justify-center mb-2">
              <Image
                src="/above.png"
                alt="Student"
                width={900}
                height={900}
                className="" // No border, no shadow, no rounding
                priority
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg"
              >
                GSS Confessions
              </h1>
            </div>
          </div>

          <div className="relative">
            {/* Background images behind the card */}
            <div className="absolute -top-8 -left-8 opacity-12 hidden lg:block">
              <Image
                src="/a.png"
                alt="Student"
                width={120}
                height={120}
                className="opacity-80 border-transparent"
              />
            </div>
            <div className="absolute -bottom-12 -right-6 opacity-10 hidden md:block">
              <Image
                src="/b.png"
                alt="Student"
                width={140}
                height={140}
                className="opacity-80 border-transparent"
              />
            </div>

            <Card className="shadow-lg bg-white/10 border-border backdrop-blur-sm mx-1 sm:mx-0 relative z-10">
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2 relative">
                    {/* Background image behind textarea */}
                    <div className="absolute -top-4 -right-4 opacity-8 hidden sm:block">
                      <Image
                        src="/c.png"
                        alt="Student"
                        width={60}
                        height={60}
                        className="opacity-80 border-transparent"
                      />
                    </div>
                    <Label htmlFor="confession" className="text-blue-100 text-sm sm:text-base relative z-10">
                      Your Confession
                    </Label>
                    <Textarea
                      id="confession"
                      placeholder="What's on your mind? Share your thoughts, feelings, or secrets..."
                      value={confession}
                      onChange={(e) => setConfession(e.target.value)}
                      rows={5}
                      maxLength={1000}
                      required
                      className="min-h-[100px] sm:min-h-[140px] text-sm sm:text-base resize-none relative z-10 border-border text-white"
                    />
                    <div className="text-xs sm:text-sm text-blue-100 text-right relative z-10">
                      {confession.length}/1000 characters
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 text-sm sm:text-base relative z-10"
                    disabled={isSubmitting || !confession.trim()}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Submit Confession
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xs sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confession Recorded</DialogTitle>
          </DialogHeader>
          <div className="text-center text-blue-900 py-2">
            {dialogMessage}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
