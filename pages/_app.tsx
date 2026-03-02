import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import Sidebar from "@/components/Sidebar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Pages yang tidak perlu sidebar (login, register, dll)
  const noSidebarPages = ['/login', '/register'];
  const showSidebar = !noSidebarPages.includes(router.pathname);

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-[#0f0f1a]">
        <div className={`flex ${showSidebar ? '' : ''}`}>
          {showSidebar && <Sidebar />}
          <main className="flex-1 min-h-screen min-w-0 transition-all duration-300">
            {/* Theme Switcher - Floating pada halaman tanpa sidebar */}
            {!showSidebar && (
              <div className="fixed top-4 right-4 z-50">
                <ThemeSwitcher />
              </div>
            )}
            <Component {...pageProps} />
          </main>
        </div>
        <Analytics />
      </div>
    </ThemeProvider>
  );
}

