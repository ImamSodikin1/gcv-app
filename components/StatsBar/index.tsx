import { FaStar } from "react-icons/fa";

export default function StatsBar() {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-between items-center w-full mt-8 px-4 md:px-8 py-6">
      <div className="flex items-center gap-3 bg-[#181926] border border-[#35354d] px-6 py-4 rounded-xl shadow">
        <span className="text-white font-bold text-lg">Fiverr</span>
        <span className="flex items-center gap-1 text-yellow-400 text-base font-semibold">5 STARS <FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></span>
      </div>
      <div className="flex gap-10 md:gap-16">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white">02+</span>
          <span className="text-gray-300 text-sm mt-1">Years Of Experience</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white">40+</span>
          <span className="text-gray-300 text-sm mt-1">Project Completed</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-white">18+</span>
          <span className="text-gray-300 text-sm mt-1">Happy Clients</span>
        </div>
      </div>
    </div>
  );
}
