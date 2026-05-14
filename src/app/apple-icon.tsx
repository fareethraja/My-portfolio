import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "radial-gradient(circle at 30% 30%, #a78bfa 0%, #38bdf8 60%, #0f172a 100%)",
                    color: "white",
                    fontSize: 110,
                    fontWeight: 700,
                    fontFamily: "ui-sans-serif, system-ui",
                    letterSpacing: "-0.06em",
                }}
            >
                F
            </div>
        ),
        { ...size },
    );
}
