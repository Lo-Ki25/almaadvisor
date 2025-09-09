import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { QueryProvider } from "@/providers/query-provider"

export const metadata: Metadata = {
  title: "ALMA-ADVISOR - Digital Transformation Platform",
  description: "Professional consulting platform for digital transformation reports",
  generator: "ALMA-ADVISOR",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <QueryProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Navigation />
          </Suspense>
          <div className="lg:pl-64">
            <main className="lg:p-8 p-4">{children}</main>
          </div>
          <Toaster />
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  )
}
