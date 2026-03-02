import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <motion.img
        src="/file.svg"
        alt="Avatar"
        className="w-32 h-32 rounded-full border-4 border-primary shadow-lg mb-4 bg-white"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
      />

      <motion.h1
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        Hi, I&apos;m <span className="text-primary">Your Name</span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-gray-600 max-w-xl"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        A passionate Frontend Developer crafting beautiful and interactive web experiences.
      </motion.p>

      <motion.div
        className="flex gap-6 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform"
        >
          <FaGithub size={32} className="text-gray-700 hover:text-black" />
        </a>
        <a
          href="https://linkedin.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform"
        >
          <FaLinkedin size={32} className="text-blue-700 hover:text-blue-900" />
        </a>
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:scale-110 transition-transform"
        >
          <FaTwitter size={32} className="text-blue-400 hover:text-blue-600" />
        </a>
      </motion.div>
    </section>
  );
}
