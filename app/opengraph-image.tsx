import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"

export const alt = "CreatorDeal - Sponsorship Management for Creators"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const LOGO_BASE64 = (() => {
  try {
    const buf = readFileSync(join(process.cwd(), "public", "logo-sm.png"))
    return `data:image/png;base64,${buf.toString("base64")}`
  } catch {
    return ""
  }
})()

export default async function Image() {
  const logoSrc = LOGO_BASE64

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0c1a2e 0%, #132238 50%, #0f1d36 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45,212,168,0.15) 0%, transparent 70%)",
          }}
        />
        {/* Decorative glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45,212,168,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Logo + Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              width={72}
              height={72}
              style={{ borderRadius: 16 }}
              alt=""
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: "linear-gradient(135deg, #0f1d36, #2dd4a8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                C
              </span>
            </div>
          )}
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: -1,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            CreatorDeal
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#2dd4a8",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 900,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Sponsorship Management for Creators
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            marginTop: 20,
            maxWidth: 700,
            lineHeight: 1.4,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Track brand deals · Generate invoices · Get paid faster
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 20,
            background: "rgba(45,212,168,0.15)",
            border: "1px solid rgba(45,212,168,0.3)",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#2dd4a8",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Free plan available
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
