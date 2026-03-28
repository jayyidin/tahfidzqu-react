"use client";

import { AppProvider, useAppStore } from "@/lib/store";
import Header from "./Header";
import HomeView from "./views/HomeView";
import PlayerView from "./views/PlayerView";
import SetoranView from "./views/SetoranView";
import HubView from "./views/HubView";
import AdminView from "./views/AdminView";
import MasterView from "./views/MasterView";
import Modals from "./Modals";
import { AlertCircle } from "lucide-react";

const AppContent = () => {
  const { view, firebaseError } = useAppStore();

  return (
    <div className="flex flex-col w-full h-full relative z-10">
      {firebaseError && (
        <div className="bg-red-500 text-white text-[10px] md:text-xs font-bold p-3 text-center w-full shadow-md animate-pulse">
          <AlertCircle className="inline-block text-lg align-middle mr-1" />
          {firebaseError}
        </div>
      )}
      
      {view !== "player" && <Header />}
      
      <div className="flex-1 overflow-hidden flex flex-col w-full bg-slate-50/50 dark:bg-[#111c18]">
        {view === "home" && <HomeView />}
        {view === "player" && <PlayerView />}
        {view === "setoran" && <SetoranView />}
        {view === "hub" && <HubView />}
        {view === "admin" && <AdminView />}
        {view === "master" && <MasterView />}
      </div>

      <footer className="shrink-0 pt-4 pb-8 md:pb-4 text-center text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0a120f] border-t border-slate-200 dark:border-[#1a2e26] transition-colors z-40 relative">
        Copyright &copy; 2026 Juman Jayyidin
      </footer>

      <Modals />
    </div>
  );
};

export default function MainApp() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
