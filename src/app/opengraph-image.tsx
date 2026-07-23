import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fareeth Raja | Product Manager & Technical Product Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "72px",
                    background:
                        "radial-gradient(ellipse at 20% 0%, rgba(167,139,250,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(56,189,248,0.30) 0%, transparent 55%), #09090b",
                    color: "white",
                    fontFamily: "ui-sans-serif, system-ui, -apple-system",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 9999,
                            background: "#d4ff4a",
                            boxShadow: "0 0 24px #d4ff4a",
                        }}
                    />
                    <span
                        style={{
                            fontSize: 22,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "#d4ff4a",
                            fontFamily: "ui-monospace, monospace",
                        }}
                    >
                        fareeth.vercel.app
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div
                        style={{
                            fontSize: 96,
                            lineHeight: 1.02,
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <span>Fareeth Raja</span>
                        <span
                            style={{
                                background:
                                    "linear-gradient(135deg, #d4ff4a 0%, #34d399 50%, #38bdf8 100%)",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            Product · AI · FinTech
                        </span>
                    </div>
                    <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", maxWidth: 920 }}>
                        Technical product builder translating founder goals into Finverse AI chat,
                        screeners, strategy backtesting, paper trading, payments.
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 20,
                        color: "rgba(255,255,255,0.55)",
                    }}
                >
                    <span>github.com/fareethraja</span>
                    <span>linkedin.com/in/fareethraja</span>
                </div>
            </div>
        ),
        { ...size },
    );
}
