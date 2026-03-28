"use client";

import { useAppStore } from "@/lib/store";
import { Q_SURAHS } from "@/lib/constants";
import {
  Search,
  Library,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
  ListOrdered,
  Youtube,
  VideoOff,
} from "lucide-react";

export default function HomeView() {
  const {
    juzs,
    surahs,
    segs,
    actJuzId,
    search,
    adminLvl,
    updateState,
    switchView,
    showConfirm,
    dbDelete,
  } = useAppStore();

  const isSuper = adminLvl === 1;
  const jName = juzs.find((j) => j.id === actJuzId)?.name || "";

  let sList = search
    ? surahs.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    : surahs.filter((s) => s.juzId === actJuzId);

  sList.sort(
    (a, b) =>
      (Q_SURAHS.find((q) => q.name === a.title.replace("Surah ", ""))?.no ||
        999) -
      (Q_SURAHS.find((q) => q.name === b.title.replace("Surah ", ""))?.no ||
        999)
  );

  const openSurah = (surahId: number, videoId: string) => {
    updateState({
      actSurahId: surahId,
      actSegId: null,
      actLevelId: null,
      isPlay: false,
    });
    switchView("player");
  };

  const confirmDelete = (type: string, id: number) => {
    showConfirm("Yakin ingin menghapus data ini secara permanen dari Cloud?", () => {
      if (type === "juz") {
        updateState({ juzs: juzs.filter((x) => x.id !== id) });
        dbDelete("juzs", id);
      }
      if (type === "surah") {
        updateState({ surahs: surahs.filter((x) => x.id !== id) });
        dbDelete("surahs", id);
      }
    });
  };

  return (
    <div id="main-scroll" className="flex-1 overflow-y-auto p-4 md:p-10 min-h-0 relative">
      <div className="max-w-7xl mx-auto w-full">
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
            <input
              type="text"
              placeholder="Cari Judul Surah..."
              value={search}
              onChange={(e) => updateState({ search: e.target.value })}
              className="input-std !w-full !rounded-full !pl-12 py-3.5 shadow-sm"
            />
          </div>
        </div>

        <div className="mb-6 md:mb-10 shrink-0">
          <h1 className="text-2xl md:text-4xl font-serif dark:text-white mb-1.5 md:mb-2 flex items-center gap-2 md:gap-3 tracking-tight">
            <Library className="text-emerald-500 w-8 h-8 md:w-10 md:h-10" /> Perpustakaan Surah
          </h1>
          <p className="text-[11px] md:text-sm text-slate-500">
            Pilih materi hafalan dari daftar surah yang tersedia di sistem.
          </p>
        </div>

        {!search && (
          <div className="flex items-center gap-2 md:gap-3 border-b border-slate-200/60 dark:border-[#1a2e26] pb-4 md:pb-6 mb-6 md:mb-8 overflow-x-auto hide-scrollbar shrink-0">
            {juzs.map((j) => (
              <div key={j.id} className="flex shrink-0 mr-1">
                <button
                  onClick={() => updateState({ actJuzId: j.id })}
                  className={j.id === actJuzId ? "tab-active" : "tab-inactive"}
                >
                  {j.name}
                </button>
                {isSuper && (
                  <div className="flex ml-1 md:ml-2 items-center">
                    <button
                      onClick={() => updateState({ modal: "juz", modalData: j.id })}
                      className="p-1.5 md:p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => confirmDelete("juz", j.id)}
                      className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isSuper && (
              <button
                onClick={() => updateState({ modal: "juz", modalData: null })}
                className="tab-inactive !bg-transparent border-dashed border-2 hover:border-emerald-400 flex items-center gap-1.5"
              >
                <Plus size={18} /> Tambah
              </button>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mb-6 md:mb-8 shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-bold dark:text-white tracking-tight">
              {search ? "Hasil Pencarian" : "Daftar Surah"}
            </h2>
            <p className="text-[10px] md:text-xs text-slate-400 mt-1">
              {search ? `Menampilkan: "${search}"` : `Juz yang dipilih: ${jName}`}
            </p>
          </div>
          {isSuper && (
            <button
              onClick={() => updateState({ modal: "surah", modalData: null })}
              className="bg-emerald-500 hover:scale-105 transition-transform shadow-lg shadow-emerald-500/30 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-full font-bold flex gap-1.5 items-center text-[11px] md:text-sm"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Tambah Surah</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 lg:gap-6 pb-10">
          {sList.length > 0 ? (
            sList.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-100 shadow-sm dark:bg-[#15241e] dark:border-[#1a2e26] rounded-2xl md:rounded-3xl p-4 md:p-5 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden group"
                onClick={() => openSurah(s.id, s.videoId || "")}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 group-hover:rotate-3">
                    <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-bold dark:text-white truncate tracking-tight mb-0.5 md:mb-1">
                      {s.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-400 font-mono mb-4 flex items-center gap-1.5">
                      <ListOrdered size={14} /> {segs.filter((x) => x.surahId == s.id).length} Segmen Hafalan
                    </p>
                  </div>
                  <div
                    className={`shrink-0 p-2 md:p-2.5 rounded-lg md:rounded-xl ${
                      s.videoId
                        ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                        : "bg-slate-50 dark:bg-[#111c18] text-slate-300"
                    }`}
                  >
                    {s.videoId ? <Youtube size={20} /> : <VideoOff size={20} />}
                  </div>
                </div>
                {isSuper && (
                  <div className="flex gap-2 border-t border-slate-100 dark:border-[#1a2e26] pt-3 md:pt-4 mt-3 md:mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateState({ modal: "surah", modalData: s.id });
                      }}
                      className="flex-1 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-200 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1.5 dark:bg-[#0a120f] dark:border-[#1a2e26] dark:hover:bg-[#15241e]"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete("surah", s.id);
                      }}
                      className="flex-1 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1.5 dark:bg-[#0a120f] dark:border-[#1a2e26] dark:hover:bg-[#15241e]"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 md:py-20 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-[#15241e] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-slate-300">
                <Library className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                Belum ada data materi hafalan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
