"use client";

import { useAppStore } from "@/lib/store";
import {
  Search,
  ClipboardList,
  GraduationCap,
  Users,
  UserCircle,
  CheckCircle,
  RotateCcw,
  Hourglass,
  FileText,
  User,
  Mic,
  Award,
  BookOpen,
} from "lucide-react";

export default function HubView() {
  const {
    adminLvl,
    loggedInUstadzId,
    ustadz,
    halaqohs,
    siswas,
    subs,
    surahs,
    segs,
    levels,
    filter,
    search,
    updateState,
    switchView,
  } = useAppStore();

  const uListHub = adminLvl === 2 ? ustadz.filter((x) => x.id == loggedInUstadzId) : ustadz;
  const hl = filter.u !== "all" ? halaqohs.filter((h) => h.ustadzId == filter.u) : halaqohs;
  
  let sl = siswas;
  if (filter.h !== "all") {
    sl = sl.filter((s) => s.halaqohId == filter.h);
  } else if (filter.u !== "all") {
    const ids = hl.map((x) => x.id);
    sl = sl.filter((s) => ids.includes(s.halaqohId));
  }

  let fs = subs;
  const tUidHub = adminLvl === 2 ? loggedInUstadzId : filter.u !== "all" ? Number(filter.u) : null;

  if (tUidHub !== null) {
    const uHals = halaqohs.filter((h) => h.ustadzId === tUidHub).map((h) => h.id);
    const uSws = siswas.filter((s) => uHals.includes(s.halaqohId)).map((s) => s.id);
    fs = fs.filter((sb) => sb.ustadzId === tUidHub || uSws.includes(sb.siswaId));
  }
  if (filter.h !== "all") {
    const tHid = Number(filter.h);
    const hSws = siswas.filter((s) => s.halaqohId === tHid).map((s) => s.id);
    fs = fs.filter((sb) => sb.halaqohId === tHid || hSws.includes(sb.siswaId));
  }
  if (filter.s !== "all") {
    fs = fs.filter((sb) => sb.siswaId === Number(filter.s));
  }
  if (search) {
    const sq = search.toLowerCase();
    fs = fs.filter((x) => {
      const su = surahs.find((y) => y.id === x.surahId);
      const sName = siswas.find((s) => s.id === x.siswaId)?.name || "";
      return (su && su.title.toLowerCase().includes(sq)) || sName.toLowerCase().includes(sq);
    });
  }

  const getSName = (id: number) => siswas.find((x) => x.id == id)?.name || "-";
  const getHName = (id: number) => halaqohs.find((x) => x.id == id)?.name || "-";
  const getUName = (id: number) => ustadz.find((x) => x.id == id)?.name || "-";

  return (
    <div id="main-scroll" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 min-h-0 relative">
      <div className="max-w-6xl mx-auto w-full">
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
            <input
              type="text"
              placeholder="Cari Nama Santri atau Surah..."
              value={search}
              onChange={(e) => updateState({ search: e.target.value })}
              className="input-std !w-full !rounded-full !pl-12 py-3.5 shadow-sm"
            />
          </div>
        </div>

        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-slate-200 dark:border-[#1a2e26] pb-4 mb-6 gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif dark:text-white mb-1 flex items-center gap-2">
                <ClipboardList className="text-emerald-500 w-8 h-8" /> Papan Riwayat
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Pantau status hafalan dan progres santri secara real-time.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15241e] border border-slate-100 dark:border-[#1a2e26] p-2 md:p-3 rounded-[2rem] shadow-soft flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                value={filter.u}
                onChange={(e) => updateState({ filter: { u: e.target.value, h: "all", s: "all" } })}
                className="w-full bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] rounded-2xl py-3.5 pl-12 pr-4 text-[11px] md:text-xs font-bold text-slate-700 dark:text-gray-300 outline-none cursor-pointer hover:border-emerald-300 transition-colors appearance-none"
                disabled={adminLvl === 2}
              >
                {adminLvl !== 2 && <option value="all">-- Semua Ustadz/ah --</option>}
                {uListHub.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                value={filter.h}
                onChange={(e) => updateState({ filter: { ...filter, h: e.target.value, s: "all" } })}
                className="w-full bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] rounded-2xl py-3.5 pl-12 pr-4 text-[11px] md:text-xs font-bold text-slate-700 dark:text-gray-300 outline-none cursor-pointer hover:border-emerald-300 transition-colors appearance-none"
              >
                <option value="all">-- Semua Halaqoh --</option>
                {hl.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                value={filter.s}
                onChange={(e) => updateState({ filter: { ...filter, s: e.target.value } })}
                className="w-full bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] rounded-2xl py-3.5 pl-12 pr-4 text-[11px] md:text-xs font-bold text-slate-700 dark:text-gray-300 outline-none cursor-pointer hover:border-emerald-300 transition-colors appearance-none"
              >
                <option value="all">-- Semua Siswa --</option>
                {sl.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!fs.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#15241e] rounded-[2rem] border border-dashed border-slate-200 dark:border-[#1a2e26]">
            <div className="w-20 h-20 bg-slate-50 dark:bg-[#0a120f] rounded-full flex items-center justify-center text-slate-300 mb-4">
              <ClipboardList className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-medium">
              {search ? "Pencarian tidak ditemukan." : "Belum ada riwayat setoran di sini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fs
              .sort((a, b) => b.id - a.id)
              .map((sb) => {
                const su = surahs.find((x) => x.id === sb.surahId);
                const sg = segs.find((x) => x.id === sb.segmentId);
                const lv = sg ? levels.find((l) => l.id === sg.levelId) : null;

                const sColor =
                  sb.status === "graded"
                    ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800"
                    : sb.status === "need-repeat"
                    ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800"
                    : "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800";
                const sText =
                  sb.status === "graded"
                    ? `LULUS (${sb.grade})`
                    : sb.status === "need-repeat"
                    ? "DIULANG"
                    : "MENUNGGU NILAI";

                const cStu = siswas.find((x) => x.id === sb.siswaId);
                const cHalaqohId = cStu ? cStu.halaqohId : sb.halaqohId;
                const cHalaqoh = halaqohs.find((x) => x.id === cHalaqohId);
                const cUstadzId = cHalaqoh ? cHalaqoh.ustadzId : sb.ustadzId;

                return (
                  <div
                    key={sb.id}
                    className="bg-white border border-slate-100 rounded-[2rem] p-5 md:p-6 shadow-soft flex flex-col gap-4 dark:bg-[#0f1915] dark:border-[#1a2e26] hover:shadow-xl transition-all relative overflow-hidden"
                  >
                    <div
                      className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none ${
                        sb.status === "pending"
                          ? "bg-orange-100 dark:bg-orange-500/10"
                          : sb.status === "need-repeat"
                          ? "bg-red-100 dark:bg-red-500/10"
                          : "bg-emerald-100 dark:bg-emerald-500/10"
                      }`}
                    ></div>

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base leading-tight">
                            {getSName(sb.siswaId)}
                          </h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {getHName(sb.halaqohId)} &bull; {getUName(sb.ustadzId)}
                          </p>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 bg-slate-50 dark:bg-[#15241e] px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-[#1a2e26] shrink-0">
                        {sb.date}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#15241e] rounded-2xl p-4 border border-slate-100 dark:border-[#1a2e26] relative z-10">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="text-emerald-500 w-5 h-5 shrink-0" />
                          <span className="text-sm font-bold text-slate-700 dark:text-gray-200 truncate">
                            {su?.title || "-"}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold bg-white dark:bg-[#0a120f] px-2 py-1 rounded-md text-emerald-600 border border-slate-100 dark:border-[#1a2e26] uppercase tracking-widest shadow-sm shrink-0 ml-2">
                          {lv?.name || "-"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium pl-6">
                        {sg?.title || "-"}
                      </p>
                    </div>

                    <div className="w-full relative z-20">
                      {/* Audio Player Placeholder - In a real React app, this would be a separate component */}
                      {sb.audioUrl ? (
                        <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg text-center">
                          <Mic className="inline w-4 h-4 mr-1" /> Audio Tersedia
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded-lg text-center">
                          Tidak ada audio
                        </div>
                      )}
                    </div>

                    {(sb.note || sb.voiceNote) && (
                      <div className="mt-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center gap-1.5 mb-2">
                          <GraduationCap className="text-orange-500 w-4 h-4" />
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                            Catatan Penguji
                          </span>
                        </div>
                        {sb.note && (
                          <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed mb-3">
                            {sb.note}
                          </p>
                        )}
                        {sb.voiceNote && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg text-center">
                            Voice Note Tersedia
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-4 mt-auto border-t border-slate-100 dark:border-[#1a2e26] flex items-center justify-between gap-3 relative z-20">
                      <div
                        className={`flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-3 py-2.5 rounded-xl border ${sColor} shrink-0`}
                      >
                        {sb.status === "graded" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : sb.status === "need-repeat" ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Hourglass className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline md:hidden xl:inline">{sText}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        {sb.status === "need-repeat" && adminLvl === 0 && (
                          <button
                            onClick={() => {
                              updateState({
                                actSurahId: sb.surahId,
                                actSegId: sb.segmentId,
                                resubmitId: sb.id,
                                hierSel: { u: cUstadzId, h: cHalaqohId, s: sb.siswaId },
                                rec: { is: false, secs: 0, src: "hub" },
                              });
                              switchView("setoran");
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/30 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <Mic className="w-4 h-4" /> Setor Ulang
                          </button>
                        )}
                        {sb.status === "graded" && (
                          <button
                            onClick={() => updateState({ modal: "share_card", modalData: sb.id })}
                            className="px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all dark:bg-[#15241e] dark:border-[#1a2e26] dark:text-emerald-400"
                          >
                            <Award className="w-4 h-4" /> Kartu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
