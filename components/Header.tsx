"use client";

import { useAppStore } from "@/lib/store";
import {
  MonitorPlay,
  Sun,
  Moon,
  LogOut,
  Lock,
  Search,
  Home,
  ClipboardList,
  Inbox,
  Database,
} from "lucide-react";

export default function Header() {
  const {
    schLogo,
    schSub,
    theme,
    adminLvl,
    view,
    subs,
    search,
    updateState,
    switchView,
  } = useAppStore();

  const pend = subs.filter((s) => s.status === "pending").length;
  const isAdmin = adminLvl > 0;

  const handleThemeToggle = () => {
    updateState({ theme: theme === "dark" ? "light" : "dark" });
  };

  const handleLogout = () => {
    updateState({
      adminLvl: 0,
      loggedInUstadzId: null,
      filter: { u: "all", h: "all", s: "all" },
    });
    switchView("home");
  };

  let searchPh = "Cari...";
  if (view === "home") searchPh = "Cari Judul Surah...";
  else if (view === "hub" || view === "admin")
    searchPh = "Cari Nama Santri atau Surah...";
  else if (view === "master") searchPh = "Cari Ustadz / Halaqoh / Santri...";

  return (
    <header className="shrink-0 border-b border-slate-200/60 dark:border-[#1a2e26] sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-[#0a120f]/90 shadow-sm">
      <div className="flex items-center justify-between px-5 md:px-8 py-3.5 md:py-4">
        <div
          className="flex items-center gap-3 text-emerald-500 font-extrabold cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => switchView("home")}
        >
          {schLogo ? (
            <img
              src={schLogo}
              alt="Logo"
              className="h-8 md:h-10 max-w-[120px] object-contain"
            />
          ) : (
            <MonitorPlay className="w-8 h-8 md:w-10 md:h-10" />
          )}
          <div className="flex flex-col justify-center">
            <span className="text-xl md:text-2xl leading-none tracking-tight text-slate-800 dark:text-white">
              Tahfidz<span className="text-emerald-500">Qu</span>
            </span>
            {schSub && (
              <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                {schSub}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={handleThemeToggle}
            className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#15241e] text-slate-500 flex items-center justify-center transition-transform active:scale-95"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="w-11 h-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center transition-transform active:scale-95"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={() => updateState({ modal: "login" })}
              className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#15241e] text-slate-500 flex items-center justify-center transition-transform active:scale-95"
            >
              <Lock size={18} />
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchPh}
              value={search}
              onChange={(e) => updateState({ search: e.target.value })}
              className="input-std !w-full !rounded-full !pl-14 transition-all focus:!w-80 shadow-sm"
            />
          </div>
          <button
            onClick={handleThemeToggle}
            className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#15241e] text-slate-500 hover:text-emerald-500 flex items-center justify-center transition shadow-sm"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition shadow-sm"
              title="Keluar Akun"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <button
              onClick={() => updateState({ modal: "login" })}
              className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#15241e] text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition shadow-sm"
            >
              <Lock size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 md:px-8 flex gap-8 text-[13px] font-bold pt-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => switchView("home")}
          className={`${
            view === "home"
              ? "text-emerald-600 border-b-[3px] border-emerald-500"
              : "text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white"
          } pb-3 transition whitespace-nowrap flex items-center gap-1.5`}
        >
          <Home size={18} /> Beranda
        </button>
        <button
          onClick={() => switchView("hub")}
          className={`${
            view === "hub"
              ? "text-emerald-600 border-b-[3px] border-emerald-500"
              : "text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white"
          } pb-3 transition whitespace-nowrap flex items-center gap-1.5`}
        >
          <ClipboardList size={18} /> Setoran Hub
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => switchView("admin")}
              className={`${
                view === "admin"
                  ? "text-orange-500 border-b-[3px] border-orange-500"
                  : "text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white"
              } pb-3 transition whitespace-nowrap flex items-center gap-1.5`}
            >
              <Inbox size={18} /> Antrean{" "}
              {pend > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md">
                  {pend}
                </span>
              )}
            </button>
            <button
              onClick={() => switchView("master")}
              className={`${
                view === "master"
                  ? "text-purple-600 border-b-[3px] border-purple-500"
                  : "text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white"
              } pb-3 transition whitespace-nowrap flex items-center gap-1.5`}
            >
              <Database size={18} /> Data Master
            </button>
          </>
        )}
      </div>
    </header>
  );
}
