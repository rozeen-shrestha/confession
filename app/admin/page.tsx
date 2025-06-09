"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, MessageCircle, LogOut, Calendar, Trash2, RefreshCw, ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"
import * as htmlToImage from "html-to-image"
import React, { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Noto_Sans } from "next/font/google"
import { signOut } from "next-auth/react"

const notoSansHeader = Noto_Sans({
  variable: "--font-noto-header",
  subsets: ["latin"],
  weight: "800",
})

const notoSansText = Noto_Sans({
  variable: "--font-noto-text",
  subsets: ["latin"],
  weight: "600",
})

interface Confession {
  id: string
  name: string
  text: string
  createdAt: string
}

interface ConfessionApiResponse {
  confessions: Confession[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

export default function AdminDashboard() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const [previewConfession, setPreviewConfession] = useState<Confession | null>(null)
  const [perPage, setPerPage] = useState(40)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const router = useRouter()
  const exportRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConfessions(page, perPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, page, perPage])

  const loadConfessions = async (pageParam = page, perPageParam = perPage) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/confessions?page=${pageParam}&perPage=${perPageParam}`)
      const data: ConfessionApiResponse = await res.json()
      setConfessions(data.confessions)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch {
      toast("Failed to load confessions")
    }
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast("Logged out", {
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  }



  const handleDownload = async () => {
    if (!exportRef.current) return
    // Make export container visible for snapshot
    exportRef.current.style.display = "block"
    await new Promise((r) => setTimeout(r, 50)) // allow DOM to update
    try {
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 2,
      })
      const link = document.createElement("a")
      link.download = "confessions.png"
      link.href = dataUrl
      link.click()
    } catch (err) {
      toast("Failed to export image")
    }
    exportRef.current.style.display = "none"
  }

  // Download confession as image (for single confession)
  const handlePreviewDownload = async (confession: Confession) => {
    setPreviewConfession(confession)
    setPreviewOpen(true)
    setPreviewImg(null)

    // Wait for DOM to update and container to be ready
    await new Promise((r) => setTimeout(r, 100))

    if (!previewRef.current) return

    // Temporarily move container to visible area for capture
    const originalStyle = {
      position: previewRef.current.style.position,
      left: previewRef.current.style.left,
      top: previewRef.current.style.top,
      zIndex: previewRef.current.style.zIndex,
    }

    previewRef.current.style.position = "absolute"
    previewRef.current.style.left = "0"
    previewRef.current.style.top = "0"
    previewRef.current.style.zIndex = "9999"

    // Wait for repositioning
    await new Promise((r) => setTimeout(r, 50))

    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 2,
        width: 600,
        // height removed to make image height dynamic
      })
      setPreviewImg(dataUrl)
    } catch (error) {
      console.error("Image generation error:", error)
      toast("Failed to generate image preview")
    }

    // Restore original positioning
    previewRef.current.style.position = originalStyle.position
    previewRef.current.style.left = originalStyle.left
    previewRef.current.style.top = originalStyle.top
    previewRef.current.style.zIndex = originalStyle.zIndex
  }

  const handleDownloadImage = () => {
    if (!previewImg) return
    const link = document.createElement("a")
    link.download = "confession.png"
    link.href = previewImg
    link.click()
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-200 hover:text-blue-100 hover:bg-blue-900/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              <h1 className="text-xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="flex-1 sm:flex-none gap-2 border-none text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Confessions</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Latest Submission</CardTitle>
              <Calendar className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-100">
                {confessions.length > 0 ? formatDate(confessions[0].createdAt) : "No submissions yet"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confessions List */}
        <Card className="shadow-lg bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">All Confessions</CardTitle>
              <CardDescription className="text-blue-100">Manage and review submitted confessions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Button
                onClick={() => loadConfessions(1, perPage)}
                variant="secondary"
                size="sm"
                className="gap-2 border-blue-300/20 text-blue-200 bg-blue-900/30 hover:bg-blue-900/50 self-start sm:self-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <div className="flex items-center gap-2">
                <label htmlFor="perPage" className="text-blue-100 text-xs">Per page:</label>
                <select
                  id="perPage"
                  value={perPage}
                  onChange={e => {
                    setPerPage(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded bg-blue-950 text-blue-100 border border-blue-300/20 px-2 py-1 text-xs"
                >
                  {[10, 20, 40, 80, 100].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {confessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-blue-100 mx-auto mb-4" />
                <p className="text-blue-100">No confessions</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {confessions.map((confession, index) => (
                    <div key={confession.id}>
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex flex-wrap items-center gap-1 text-sm text-blue-100">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs sm:text-sm">{formatDate(confession.createdAt)}</span>
                            <span className="ml-2 px-2 py-0.5 rounded bg-blue-900/40 text-blue-200 text-xs font-semibold">
                              {confession.name}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed bg-white/5 text-white p-3 rounded-lg border border-white/10 break-words">
                            {confession.text}
                          </p>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                          <Button
                            onClick={() => handlePreviewDownload(confession)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 sm:flex-none text-blue-200 bg-blue-900/30 hover:bg-blue-900/50"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sm:hidden ml-2">Download</span>
                          </Button>
                        </div>
                      </div>
                      {index < confessions.length - 1 && <Separator className="my-4 bg-white/10" />}
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-blue-100 text-xs">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Hidden export container for image download */}
        <div
          ref={exportRef}
          style={{
            display: "none",
            width: 494,
            background: "#fff",
            color: "#444",
            fontFamily: "sans-serif",
            borderRadius: 12,
            boxShadow: "0 2px 16px #0002",
            padding: 24,
            margin: "0 auto",
          }}
        >
          {confessions.map((confession, idx) => (
            <div key={confession.id} style={{ marginBottom: 32 }}>
              <div style={{
                fontWeight: 700,
                color: "#444",
                fontSize: 18,
                marginBottom: 8,
                letterSpacing: 0.2,
              }}>
                -{confession.name.charAt(0).toUpperCase() + confession.name.slice(1)}{" "}
                {new Date(confession.createdAt).toISOString().slice(0, 16).replace("T", " ")}
              </div>
              <ul style={{ margin: 0, paddingLeft: 24 }}>
                <li style={{
                  fontSize: 18,
                  color: "#444",
                  lineHeight: 1.5,
                  textAlign: "left",
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                }}>
                  {confession.text}
                </li>
              </ul>
            </div>
          ))}
        </div>

<div
  ref={previewRef}
  style={{
    display: "block",
    width: 490, // reduced width
    minHeight: 500, // increased minimum height
    background: "#fff",
    color: "#333",
    fontFamily: notoSansText.style.fontFamily,
    borderRadius: 0,
    boxShadow: "none",
    padding: 40,
    margin: "0 auto",
    position: "fixed",
    left: "-9999px",
    top: "0",
    zIndex: -1000,
    opacity: previewOpen ? 1 : 0,
    pointerEvents: "none",
  }}
>
  {previewConfession && (
    <div style={{ marginBottom: 40, minHeight: 320 /* ensures extra space below */ }}>
      <div style={{
        fontFamily: notoSansHeader.style.fontFamily,
        fontWeight: 800,
        color: "#000", // changed to black
        fontSize: 24,
        marginBottom: 32,
        letterSpacing: 0,
        lineHeight: 1.3,
      }}>
        -{previewConfession.name.charAt(0).toUpperCase() + previewConfession.name.slice(1)}{" "}
        {
          new Date(previewConfession.createdAt)
  .toLocaleString("en-US", { timeZone: "Asia/Kathmandu", hour12: false })
        }
      </div>
      <div style={{
        fontFamily: notoSansText.style.fontFamily,
        fontWeight: 600,
        fontSize: 20,
        color: "#333",
        lineHeight: 1.6,
        textAlign: "left",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        marginLeft: 20,
        maxWidth: 420, // match width - padding
        minHeight: 120, // ensures some vertical space
        marginBottom: 60, // extra bottom gap
      }}>
        • {previewConfession.text}
      </div>
    </div>
  )}
</div>

        {/* Dialog for confession image preview */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-sm sm:max-w-lg mx-4">
            <DialogHeader>
              <DialogTitle>Confession Preview</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center">
              {previewImg ? (
                <img
                  src={previewImg}
                  alt="Confession Preview"
                  className="w-full max-w-[494px] rounded-xl shadow-lg bg-white"
                />
              ) : (
                <div className="text-center text-blue-400 py-8">Generating image...</div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleDownloadImage} disabled={!previewImg} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
