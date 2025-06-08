"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.ok) {
      toast("Login successful", {
        description: "Welcome to the admin dashboard.",
      })
      router.push("/admin")
    } else {
      toast("Login failed", {
        description: "Invalid username or password.",
        className: "bg-red-600 text-white"
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Confessions
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          </div>
          <p className="text-blue-100">Access the admin dashboard to view confessions</p>
        </div>

        <Card className="shadow-lg bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-blue-100">Enter your admin credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-blue-100">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-100">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
