import { FaInstagram, FaLinkedin, FaDribbble, FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";

export default function HeroContent() {
    return (
        <section className="flex flex-col md:flex-row justify-between items-center w-full gap-10 mt-10 px-4 md:px-12">
            <div className="flex-1 flex flex-col gap-6 max-w-xl py-6 md:py-10 px-4 md:px-8 bg-transparent rounded-2xl">
                <motion.h2
                    className="text-white text-xl font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    I am Imam Sodikin
                </motion.h2>
                <motion.h1
                    className="text-4xl md:text-5xl font-bold text-white leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="text-white">Passionate </span>
                    <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Software Engineer</span>
                    <span className="text-white"> in Automation</span>
                </motion.h1>

                <motion.p
                    className="text-gray-300 text-base md:text-lg mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    I am a full-stack Software Engineer specializing in automation systems, including AMR (Autonomous Mobile Robot), FMR (Forklift Mobile Robot), CTU (Carton Transfer Unit), and HMR (Heavy Duty Mobile Robot). I have extensive experience in developing end-to-end software solutions and integrating applications with PLCs to enable seamless industrial automation. My work focuses on building efficient, reliable, and user-friendly systems that optimize operations and enhance productivity.
                </motion.p>

                <motion.div
                    className="flex gap-4 mt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <button className="flex items-center gap-2 bg-[#181926] border border-[#35354d] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#23244a] transition">
                        Download CV <FaDownload />
                    </button>
                    <a href="#" className="bg-[#181926] border border-[#35354d] p-2 rounded-lg text-pink-400 hover:bg-[#23244a] transition"><FaLinkedin size={20} /></a>
                    <a href="#" className="bg-[#181926] border border-[#35354d] p-2 rounded-lg text-pink-400 hover:bg-[#23244a] transition"><FaInstagram size={20} /></a>
                    <a href="#" className="bg-[#181926] border border-[#35354d] p-2 rounded-lg text-pink-400 hover:bg-[#23244a] transition"><FaDribbble size={20} /></a>
                </motion.div>
            </div>
            <motion.div
                className="flex-1 flex justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
            >
                <motion.div
                    className="relative rounded-3xl p-2 bg-gradient-to-br from-transparent to-transparent"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 120 }}
                >
                    {/* Rotating neon ring */}
                    <motion.span
                        className="absolute -inset-1 rounded-3xl pointer-events-none bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 opacity-40 blur-2xl"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                    />

                    <div className="relative z-10 w-[320px] md:w-[380px] p-1 rounded-2xl bg-black/40 border border-white/5 shadow-2xl overflow-hidden">
                        <motion.img
                            // src="/james.jpeg"
                            src={'/infiniti.jpg'}
                            alt="Profile"
                            className="w-full h-[420px] object-cover rounded-xl"
                            initial={{ scale: 0.98 }}
                            whileHover={{ scale: 1.02, rotate: 0.5 }}
                            transition={{ duration: 0.6 }}
                        />

                        {/* Neon corner accents */}
                        <span className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-blue-400 rounded-tl-lg opacity-80" />
                        <span className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-pink-400 rounded-br-lg opacity-80" />

                        {/* Floating badge */}
                        <motion.div
                            className="absolute -top-6 left-6 bg-gradient-to-r from-pink-400 to-purple-400 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            Software Engineer
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
