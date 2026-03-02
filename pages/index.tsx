import Navbar from "@/components/Navbar";
import HeroContent from "@/components/HeroContent";
import StatsBar from "@/components/StatsBar";
import ServicesSection from "@/components/ServicesSection";
import WorkSection from "@/components/WorkSection";
import SkillsSection from "@/components/SkillsSection";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Home() {
    return (
        <div
            className="min-h-screen w-full px-0 md:px-10 py-0 bg-gradient-to-br from-[#181926] via-[#23244a] to-[#2d1e3a] relative overflow-x-hidden"
            style={{
                background: "radial-gradient(ellipse at 60% 20%, rgba(255, 0, 255, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(0, 128, 255, 0.08) 0%, transparent 60%)",
            }}
        >
            {/* Theme Switcher - Floating Button */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeSwitcher />
            </div>

            <Navbar />
            <main className="w-full flex flex-col gap-0">
                {/* HeroContent dan StatsBar dalam satu layar penuh */}
                <section id="home" className="min-h-screen w-full flex flex-col justify-center bg-gradient-to-br from-[#181926] via-[#231b2e] to-[#2d1e3a]">
                    <HeroContent />
                    <StatsBar />
                </section>
                {/* ServicesSection satu layar penuh di bawahnya */}
                <section id="services" className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#181926] via-[#231b2e] to-[#2d1e3a]">
                    <ServicesSection />
                </section>
                {/* WorkSection satu layar penuh di bawahnya */}
                <section id="projects" className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#181926] via-[#231b2e] to-[#2d1e3a]">
                    <WorkSection />
                </section>
                {/* SkillsSection satu layar penuh di bawahnya */}
                <section id="experience" className="min-h-screen w-full flex items-center justify-center">
                    <SkillsSection />
                </section>
            </main>
        </div>
    );
}
