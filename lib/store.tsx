"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth, db, safeId } from "./firebase";

export type ViewType = "home" | "player" | "setoran" | "hub" | "admin" | "master";

interface AppState {
  theme: string;
  adminLvl: number;
  view: ViewType;
  schLogo: string;
  schSub: string;
  search: string;
  searchSiswa: string;
  loginAttempts: number;
  lockoutTime: number;
  loginError: string;
  customDialog: { show: boolean; type: string; message: string; onConfirm: (() => void) | null };
  juzs: any[];
  surahs: any[];
  levels: any[];
  segs: any[];
  ustadz: any[];
  halaqohs: any[];
  siswas: any[];
  subs: any[];
  actJuzId: number | null;
  actSurahId: number | null;
  actLevelId: number | null;
  actSegId: number | null;
  isPlay: boolean;
  repTarget: number;
  curRep: number;
  speed: number;
  modal: string | null;
  modalData: any;
  filter: { u: string | number; h: string | number; s: string | number };
  hierSel: { u: string | number | null; h: string | number | null; s: string | number | null };
  rec: { is: boolean; secs: number; src: string };
  resubmitId: number | null;
  currentGradingAudioUrl: string | null;
  currentStudentAudioUrl: string | null;
  loggedInUstadzId: number | null;
  firebaseError: string;
}

interface AppContextType extends AppState {
  updateState: (updates: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => void;
  dbSave: (col: string, id: string | number, data: any) => Promise<void>;
  dbDelete: (col: string, id: string | number) => Promise<void>;
  switchView: (view: ViewType) => void;
  showAlert: (msg: string) => void;
  showConfirm: (msg: string, cb: () => void) => void;
  closeDialog: () => void;
}

const defaultState: AppState = {
  theme: "light",
  adminLvl: 0,
  view: "home",
  schLogo: "",
  schSub: "Madrasah Tahfidz Quran",
  search: "",
  searchSiswa: "",
  loginAttempts: 0,
  lockoutTime: 0,
  loginError: "",
  customDialog: { show: false, type: "alert", message: "", onConfirm: null },
  juzs: [],
  surahs: [],
  levels: [],
  segs: [],
  ustadz: [],
  halaqohs: [],
  siswas: [],
  subs: [],
  actJuzId: 30,
  actSurahId: null,
  actLevelId: null,
  actSegId: null,
  isPlay: false,
  repTarget: 7,
  curRep: 0,
  speed: 1,
  modal: null,
  modalData: null,
  filter: { u: "all", h: "all", s: "all" },
  hierSel: { u: null, h: null, s: null },
  rec: { is: false, secs: 0, src: "player" },
  resubmitId: null,
  currentGradingAudioUrl: null,
  currentStudentAudioUrl: null,
  loggedInUstadzId: null,
  firebaseError: "",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [fbUser, setFbUser] = useState<any>(null);

  const updateState = (updates: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setState((prev) => ({ ...prev, ...(typeof updates === "function" ? updates(prev) : updates) }));
  };

  const dbSave = async (col: string, id: string | number, data: any) => {
    if (fbUser) {
      try {
        await set(ref(db, `artifacts/${safeId}/public/data/${col}/${id}`), data);
      } catch (e) {
        updateState({ firebaseError: "Gagal menyimpan data: Aturan (Rules) Database Firebase menolak akses." });
      }
    } else {
      updateState({ firebaseError: "Gagal terhubung ke Cloud: Autentikasi Firebase belum aktif." });
    }
  };

  const dbDelete = async (col: string, id: string | number) => {
    if (fbUser) {
      try {
        await remove(ref(db, `artifacts/${safeId}/public/data/${col}/${id}`));
      } catch (e) {
        updateState({ firebaseError: "Gagal menghapus data: Aturan (Rules) Database Firebase menolak akses." });
      }
    }
  };

  const switchView = (viewTarget: ViewType) => {
    updateState({
      view: viewTarget,
      search: "",
      searchSiswa: "",
      ...(state.adminLvl === 2 && {
        hierSel: { ...state.hierSel, u: state.loggedInUstadzId },
        filter: { ...state.filter, u: state.loggedInUstadzId || "all" },
      }),
    });
  };

  const showAlert = (msg: string) => {
    updateState({ customDialog: { show: true, type: "alert", message: msg, onConfirm: null } });
  };

  const showConfirm = (msg: string, cb: () => void) => {
    updateState({ customDialog: { show: true, type: "confirm", message: msg, onConfirm: cb } });
  };

  const closeDialog = () => {
    updateState({ customDialog: { ...state.customDialog, show: false } });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        updateState({ firebaseError: "Gagal login ke Cloud: Pastikan 'Anonymous Sign-in' telah DIAKTIFKAN." });
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      if (!u) return;

      onValue(ref(db, `artifacts/${safeId}/public/data/settings/app`), (snap) => {
        const obj = snap.val();
        if (obj) {
          updateState({ schLogo: obj.logo || "", schSub: obj.subtitle || "" });
        }
      });

      const collections = ["juzs", "surahs", "levels", "segs", "ustadz", "halaqohs", "siswas", "subs"];
      collections.forEach((c) => {
        onValue(
          ref(db, `artifacts/${safeId}/public/data/${c}`),
          (snap) => {
            const obj = snap.val();
            const dataArr = obj ? Object.keys(obj).map((k) => ({ id: isNaN(Number(k)) ? k : Number(k), ...obj[k] })) : [];
            
            setState((prev) => {
              let nextState = { ...prev, [c]: dataArr };
              if (c === "juzs" && dataArr.length > 0) {
                if (!dataArr.some((j: any) => j.id == prev.actJuzId)) {
                  let defaultJuz = dataArr.find((j: any) => j.id == 30 || String(j.name).includes("30"));
                  nextState.actJuzId = defaultJuz ? defaultJuz.id : dataArr[0].id;
                }
              }
              return nextState;
            });
          },
          (error) => {
            if (error.message.includes("permission_denied")) {
              updateState({ firebaseError: "Akses Cloud Ditolak! Ubah Aturan (Rules) Realtime Database." });
            }
          }
        );
      });
    });

    return () => unsubscribe();
  }, []);

  // Theme effect
  useEffect(() => {
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.theme]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        updateState,
        dbSave,
        dbDelete,
        switchView,
        showAlert,
        showConfirm,
        closeDialog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
};
