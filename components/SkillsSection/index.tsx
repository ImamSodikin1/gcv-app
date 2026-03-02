
import { SiAndroid, SiKotlin, SiReact, SiJavascript, SiPython, SiLinux, SiMongodb, SiMysql, SiDocker } from "react-icons/si";
import { FaMobileAlt, FaLaptopCode } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

const experienceList = [
    {
        period: "2024 - Present",
        role: "Software Engineer",
        company: "Full Time",
        bullets: [
            "Building web services and backend integrations (APIs, payment gateways)",
            "Designing scalable, testable systems and deploying cloud-ready apps",
            "Collaborating on product requirements, CI/CD, and observability"
        ]
    },
    {
        period: "2022 - Present",
        role: "Mobile App Developer",
        company: "Freelance / Projects",
        bullets: [
            "Developing native Android apps with Kotlin and modern architecture",
            "Building cross-platform prototypes and integrating native SDKs (push, auth)",
            "Optimizing UX and performance for production mobile releases"
        ]
    }
];

export default function SkillsSection() {
    return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center py-12 bg-gradient-to-br from-[#181926] via-[#231b2e] to-[#2d1e3a] relative">
            <motion.h2
                className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Experience
            </motion.h2>

            <motion.p
                className="text-gray-200 text-center max-w-2xl mb-8 text-base md:text-lg"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.6 }}
            >
                Professional experience focused on software engineering since 2024, and ongoing work as a mobile app developer &mdash; delivering production-ready apps and integrations for clients.
            </motion.p>

            <div className="w-full max-w-6xl flex flex-col md:flex-col gap-8 px-4 items-stretch">
                <div className="flex-1 flex flex-col gap-6">
                    {experienceList.map((exp, idx) => {
                        const Icon = exp.role.toLowerCase().includes('mobile') ? FaMobileAlt : FaLaptopCode;
                        return (
                            <motion.article
                                key={exp.role}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, duration: 0.6 }}
                                whileHover={{ y: -8, scale: 1.025 }}
                                className="group relative overflow-hidden bg-gradient-to-br from-[#0d0f14]/60 rounded-2xl p-6 border border-white/6 shadow-lg transition-all duration-300 flex flex-col h-full"
                            >
                                {/* glow overlay */}
                                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400/12 to-purple-400/8 opacity-0 scale-95 transform transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 blur-md" />
                                {/* animated border */}
                                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-colors duration-300 group-hover:border-pink-400/30" />
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm text-pink-200 font-semibold">{exp.period}</div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white mt-1 flex items-center gap-3">
                                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-white/5 to-white/3 border border-white/6">
                                                <Icon className="text-xl text-blue-300" />
                                            </span>
                                            <span>{exp.role}</span>
                                        </h3>
                                        <div className="text-gray-300 text-sm mt-1">{exp.company}</div>
                                    </div>
                                    <div className="text-sm text-white/80 px-3 py-1 rounded-md bg-gradient-to-r from-pink-400 to-purple-400/80 font-medium">{exp.role.includes('Software') ? 'Senior' : 'Experienced'}</div>
                                </div>

                                <ul className="mt-4 space-y-3 text-gray-300 text-sm">
                                    {exp.bullets.map((b, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="mt-1 text-pink-300"><FiCheck /></span>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.article>
                        );
                    })}
                </div>

                <div className="flex-1 flex flex-col items-center">
                    <motion.h3
                        className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Skillset
                    </motion.h3>
                    <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full self-stretch items-stretch" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        {[
                            { icon: <SiLinux size={28} className="text-orange-300" />, label: 'Linux' },
                            { icon: <SiMongodb size={28} className="text-green-400" />, label: 'MongoDB' },
                            { icon: <SiMysql size={28} className="text-blue-400" />, label: 'MySQL' },
                            { icon: <SiDocker size={28} className="text-cyan-400" />, label: 'Docker' },
                            { icon: <SiReact size={28} className="text-cyan-300" />, label: 'React' },
                            { icon: <SiJavascript size={28} className="text-yellow-300" />, label: 'JavaScript' },
                            { icon: <SiPython size={28} className="text-blue-300" />, label: 'Python' },
                            { icon: <SiKotlin size={28} className="text-orange-400" />, label: 'Kotlin' },
                            { icon: <SiAndroid size={28} className="text-green-400" />, label: 'Android' },
                            { icon: <FaMobileAlt size={28} className="text-pink-400" />, label: 'Mobile Dev' },
                        ].map((s, i) => (
                            <motion.div
                                key={s.label}
                                whileHover={{ scale: 1.03 }}
                                initial={{ opacity: 0, y: 6 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.06 * i }}
                                className="group relative flex flex-col items-center gap-3 bg-gradient-to-br from-[#0d0f14]/60 rounded-lg p-4 border border-white/6 overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_rgba(124,58,237,0.08)] hover:scale-105 text-center"
                            >
                                {/* subtle bloom on hover */}
                                <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-tr from-pink-400/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                                {/* animated ring/border */}
                                <div className="absolute -inset-0.5 rounded-lg pointer-events-none ring-0 transition-all duration-300 group-hover:ring-4 group-hover:ring-pink-400/20" />
                                <div className="w-14 h-14 flex items-center justify-center rounded-md bg-gradient-to-tr from-white/5 to-white/3 relative z-10">
                                    {s.icon}
                                </div>
                                <div className="text-sm text-gray-200 font-medium z-10">{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
