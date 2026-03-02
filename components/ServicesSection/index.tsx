import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

const services = [
    {
        title: "01. Payment Gateway Integration",
        desc: "Secure integrations with leading payment providers (Stripe, PayPal, local gateways). Recurring billing, webhooks, and reconciliation workflows.",
        highlight: false,
    },
    {
        title: "02. Online Exam & Assessment Software",
        desc: "Robust online testing platforms for schools and certification programs with secure proctoring, auto-grading, and reporting.",
        highlight: false,
    },
    {
        title: "03. Mobile App Development",
        desc: "Native and cross-platform mobile applications (Kotlin, React Native) for customer-facing products and internal tools.",
        highlight: false,
    },
    {
        title: "04. E-Learning & Course Platforms",
        desc: "Build subscription-based course portals, content management, progress tracking, and interactive learning experiences.",
        highlight: false,
    },
    {
        title: "05. Custom Software Solutions",
        desc: "We design and develop tailored software to solve your unique product challenges — scalable, secure, and maintainable.",
        highlight: true,
    },
];

export default function ServicesSection() {
    return (
        <section className="w-full flex flex-col items-center mt-20 mb-10">
            <motion.h2
                className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Digital Product & Software Services
            </motion.h2>
            <motion.p
                className="text-gray-200 text-center max-w-2xl mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                End-to-end product and software engineering services: payment gateway integrations, online exam platforms, e-learning portals, mobile apps, and custom web systems. We build secure, scalable solutions that help people and businesses succeed online.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {services.map((service, idx) => (
                    <motion.div
                        key={service.title}
                        className={`relative rounded-xl border transition-all duration-300 p-6 h-full flex flex-col justify-between group ${service.highlight
                            ? "bg-gradient-to-br from-pink-400/40 via-purple-400/30 to-blue-400/20 border-pink-400/60 shadow-lg"
                            : "border-[#35354d] bg-[#181926]/60 hover:bg-[#23244a]/80"
                            }`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx, duration: 0.6, type: "spring" }}
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(80,0,120,0.15)" }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-lg font-semibold ${service.highlight ? "text-white" : "text-gray-200"}`}>{service.title}</span>
                            <FiArrowUpRight className={`text-2xl ${service.highlight ? "text-white" : "text-gray-400 group-hover:text-pink-400"}`} />
                        </div>
                        <p className={`text-sm ${service.highlight ? "text-white/90" : "text-gray-400"}`}>{service.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
