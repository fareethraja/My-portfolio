import { SocialConnect } from "@/components/ui/connect-with-us";

export function Contact() {
    return (
        <section id="contact" className="min-h-screen relative z-30 w-full py-24">
            <div className="mx-auto w-full max-w-5xl px-6 md:px-8">
                <div className="flex flex-col items-center text-center">
                    <span className="eyebrow mb-5">Contact</span>
                    <h2 className="font-display mt-5 text-4xl md:text-6xl font-bold tracking-[-0.03em] text-foreground">
                        Let&apos;s build something{" "}
                        <span className="text-gradient-accent">together</span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
                        Open to product, fintech, and AI roles. Pick whichever channel feels easiest.
                    </p>
                </div>
            </div>
            <SocialConnect />
        </section>
    );
}
