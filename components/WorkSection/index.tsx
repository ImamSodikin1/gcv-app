import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { FaIndustry, FaMobileAlt, FaBoxes, FaCogs } from "react-icons/fa";



const filters = ["All", "Payment", "Exam", "E-Learning", "Mobile", "Custom"];
const works = [
    {
        title: "Payment Gateway Integration",
        desc: "Secure integration with Stripe/PayPal and local payment providers; automated reconciliation and subscription billing.",
        icon: <FaIndustry className="text-blue-400 text-2xl" />,
        type: "Payment",
        highlight: true,
    },
    {
        title: "Online Exam Platform",
        desc: "A secure, scalable assessment platform with auto-grading, timeboxing, and proctoring options for educational institutions.",
        icon: <FaBoxes className="text-pink-400 text-2xl" />,
        type: "Exam",
        highlight: false,
    },
    {
        title: "E-Learning & Course Portal",
        desc: "Subscription-based learning platforms with course management, progress tracking, and interactive content.",
        icon: <FaCogs className="text-purple-400 text-2xl" />,
        type: "E-Learning",
        highlight: false,
    },
    {
        title: "Mobile App Development",
        desc: "Native Android apps (Kotlin) and cross-platform mobile apps for customer-facing experiences and internal tools.",
        icon: <FaMobileAlt className="text-green-400 text-2xl" />,
        type: "Mobile",
        highlight: false,
    },
    {
        title: "Custom Web Applications",
        desc: "End-to-end web systems tailored to your workflow — dashboards, integrations, and admin tooling.",
        icon: <FiArrowUpRight className="text-yellow-400 text-2xl" />,
        type: "Custom",
        highlight: false,
    },
];

export default function WorkSection() {
    const [active, setActive] = useState("All");
    const filtered = active === "All" ? works : works.filter(w => w.type === active);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center w-full py-12 px-6">
            <motion.h2
                className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Project Highlights
            </motion.h2>

            <motion.p
                className="text-gray-300 text-center max-w-3xl mb-8 text-sm md:text-base"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.6 }}
            >
                A curated selection of projects spanning payment integrations, online assessment systems, e-learning platforms, mobile applications, and bespoke web solutions — built for reliability, performance, and clarity.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3 justify-center mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                {filters.map((f) => (
                    <motion.button
                        key={f}
                        onClick={() => setActive(f)}
                        whileHover={{ scale: 1.04 }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${active === f ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow" : "bg-[#23244a] text-gray-300 hover:bg-[#2b2b3d]"
                            }`}
                    >
                        {f}
                    </motion.button>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl">
                {filtered.map((work, idx) => (
                    <motion.div
                        key={work.title}
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: idx * 0.06, duration: 0.55 }}
                        whileHover={{ y: -6, scale: 1.03 }}
                        className={`relative rounded-2xl p-6 border border-white/6 bg-gradient-to-br ${work.highlight ? 'from-[#081226]/40 via-[#0b1224]/20 to-[#07101a]/40' : 'from-[#0d0f14]/60'} shadow-lg flex flex-col justify-between`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-tr from-white/5 to-white/3 border border-white/8">
                                {work.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">{work.title}</h3>
                                <p className="text-sm text-gray-300 mt-1">{work.desc}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white/3">{work.type}</span>
                            <button className="inline-flex items-center gap-2 text-sm text-white bg-gradient-to-r from-pink-400 to-purple-400 px-3 py-1.5 rounded-md shadow-sm hover:brightness-110 transition">
                                View <FiArrowUpRight />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
