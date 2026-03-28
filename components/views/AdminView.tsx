"use client";

import { useAppStore } from "@/lib/store";
import {
  Search,
  Inbox,
  GraduationCap,
  Users,
  UserCircle,
  CheckCircle,
  RotateCcw,
  Hourglass,
  Star,
  Edit2,
  Trash2,
  Award,
  User,
  BookOpen,
  FileText,
  Mic,
} from "lucide-react";

export default function AdminView() {
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
    dbDelete,
    showConfirm,
  } = useAppStore();

  const isSuper = adminLvl === 1;

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
  const tUidAdmin = adminLvl === 2 ? loggedInUstadzId : filter.u !== "all" ? Number(filter.u) : null;

  if (tUidAdmin !== null) {
    const uHals = halaqohs.filter((h) => h.ustadzId === tUidAdmin).map((h) => h.id);
    const uSws = siswas.filter((s) => uHals.includes(s.halaqohId)).map((s) => s.id);
    fs = fs.filter((sb) => sb.ustadzId === tUidAdmin || uSws.includes(sb.siswaId));
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
  const getSKelas = (id: number) => siswas.find((x) => x.id == id)?.kelas || "-";
  const getHName = (id: number) => halaqohs.find((x) => x.id == id)?.name || "-";

  return (
    <div id="main-scroll" className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 min-h-0 relative">
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
              <h1 className="text-3xl md:text-4xl font-serif text-orange-500 dark:text-orange-400 mb-2 flex items-center gap-3 tracking-tight">
                <Inbox className="w-10 h-10" /> Antrean Setoran
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Daftar rekaman hafalan yang menunggu penilaian.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#15241e] border border-slate-100 dark:border-[#1a2e26] p-2 md:p-3 rounded-[2rem] shadow-soft flex flex-col md:flex-row gap-2 mb-6 md:mb-8">
            <div className="flex-1 relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                value={filter.u}
                onChange={(e) => updateState({ filter: { u: e.target.value, h: "all", s: "all" } })}
                className="w-full bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] rounded-2xl py-3.5 pl-12 pr-4 text-[11px] md:text-xs font-bold text-slate-700 dark:text-gray-300 outline-none cursor-pointer hover:border-emerald-300 transition-colors appearance-none"
                disabled={adminLvl === 2}
              >
                {adminLvl !== 2 && <option value="all">Semua Ustadz/ah</option>}
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
                <option value="all">Semua Halaqoh</option>
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
                <option value="all">Semua Siswa</option>
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
              <CheckCircle className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-medium">
              {search ? "Pencarian tidak ditemukan." : "Luar biasa! Tidak ada antrean saat ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fs
              .sort((a, b) => {
                if (a.status === "pending" && b.status !== "pending") return -1;
                if (a.status !== "pending" && b.status === "pending") return 1;
                return b.id - a.id;
              })
              .map((sb) => {
                const su = surahs.find((x) => x.id === sb.surahId);
                const sg = segs.find((x) => x.id === sb.segmentId);
                const lv = sg ? levels.find((l) => l.id === sg.levelId) : null;

                const sColor =
                  sb.status === "pending"
                    ? "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800"
                    : sb.status === "need-repeat"
                    ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800"
                    : "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800";
                const sText =
                  sb.status === "pending"
                    ? "MENUNGGU"
                    : sb.status === "need-repeat"
                    ? "DIULANG"
                    : `LULUS (${sb.grade})`;

                return (
                  <div
                    key={sb.id}
                    className="bg-white border border-slate-100 rounded-[2rem] p-5 md:p-6 shadow-soft flex flex-col gap-4 dark:bg-[#0f1915] dark:border-[#1a2e26] hover:shadow-xl transition-all relative overflow-hidden"
                  >
                    {sb.status === "pending" && (
                      <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-100 dark:bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    )}

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-[#15241e] rounded-full flex items-center justify-center text-slate-400 shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base leading-tight">
                            {getSName(sb.siswaId)}
                          </h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {getHName(sb.halaqohId)} &bull; Kelas {getSKelas(sb.siswaId)}
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
                      {(sb.note || sb.voiceNote) && (
                        <div className="text-[10px] text-slate-400 mt-3 italic flex flex-wrap gap-3 relative z-10">
                          {sb.note && (
                            <span className="flex items-center gap-1">
                              <FileText className="text-emerald-500 w-4 h-4" /> Teks
                            </span>
                          )}
                          {sb.voiceNote && (
                            <span className="flex items-center gap-1">
                              <Mic className="text-blue-500 w-4 h-4" /> Voice Note
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-full relative z-20">
                      {/* Audio Player Placeholder */}
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

                    <div className="pt-4 mt-auto border-t border-slate-100 dark:border-[#1a2e26] flex items-center justify-between gap-3 relative z-20">
                      <div
                        className={`flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-3 py-2.5 rounded-xl border ${sColor} shrink-0`}
                      >
                        {sb.status === "pending" ? (
                          <Hourglass className="w-4 h-4" />
                        ) : sb.status === "need-repeat" ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline md:hidden xl:inline">{sText}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        {isSuper && (
                          <button
                            onClick={() => {
                              showConfirm("Yakin ingin menghapus data ini secara permanen dari Cloud?", () => {
                                updateState({ subs: subs.filter((x) => x.id !== sb.id) });
                                dbDelete("subs", sb.id);
                              });
                            }}
                            className="bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-colors dark:bg-[#15241e] dark:border-[#1a2e26] shrink-0"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {sb.status === "graded" && (
                          <button
                            onClick={() => updateState({ modal: "share_card", modalData: sb.id })}
                            className="bg-slate-50 hover:bg-emerald-50 text-emerald-600 border border-slate-200 w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all dark:bg-[#0a120f] dark:border-[#1a2e26] dark:hover:border-emerald-500/50 shrink-0"
                            title="Kartu Prestasi"
                          >
                            <Award className="w-5 h-5" />
                          </button>
                        )}
                        {sb.status === "pending" ? (
                          <button
                            onClick={() => updateState({ modal: "grade", modalData: sb.id })}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 py-2.5 px-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                          >
                            <Star className="w-4 h-4" /> Nilai
                          </button>
                        ) : (
                          <button
                            onClick={() => updateState({ modal: "grade", modalData: sb.id })}
                            className="flex-1 bg-slate-50 hover:bg-blue-50 text-blue-600 border border-slate-200 py-2.5 px-3 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all dark:bg-[#0a120f] dark:border-[#1a2e26] dark:hover:border-blue-500/50"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
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
