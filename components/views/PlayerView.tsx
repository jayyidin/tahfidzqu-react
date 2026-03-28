"use client";

import { useAppStore } from "@/lib/store";
import { fmtT } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import {
  ArrowLeft,
  Plus,
  Link as LinkIcon,
  Youtube as YoutubeIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Minus,
  Clock,
  ListOrdered,
  Edit2,
  Trash2,
  MicVocal,
  Search,
} from "lucide-react";

export default function PlayerView() {
  const {
    surahs,
    levels,
    segs,
    actSurahId,
    actLevelId,
    actSegId,
    search,
    adminLvl,
    isPlay,
    repTarget,
    curRep,
    speed,
    updateState,
    switchView,
    showConfirm,
    dbDelete,
    showAlert,
  } = useAppStore();

  const isSuper = adminLvl === 1;
  const sur = surahs.find((s) => s.id === actSurahId);
  const ml = levels.filter((l) => l.surahId === actSurahId);

  // Determine active level
  let currentLevelId = actLevelId;
  if (!currentLevelId && ml.length > 0) {
    currentLevelId = ml[0].id;
  }

  const allSgs = segs
    .filter((s) => s.surahId === actSurahId && s.levelId === currentLevelId)
    .sort((a, b) => a.start - b.start);

  const sgs = search
    ? allSgs.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          (s.translation && s.translation.toLowerCase().includes(search.toLowerCase()))
      )
    : allSgs;

  const cSg = allSgs.find((x) => x.id === actSegId) || (allSgs.length > 0 ? allSgs[0] : null);
  const td = allSgs.length ? allSgs[allSgs.length - 1].end : 1;

  const playerRef = useRef<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Sync state when level changes
  useEffect(() => {
    if (actLevelId !== currentLevelId) {
      updateState({ actLevelId: currentLevelId });
    }
  }, [currentLevelId, actLevelId, updateState]);

  // Timer for progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlay && playerRef.current) {
      interval = setInterval(async () => {
        try {
          const t = await playerRef.current.getCurrentTime();
          setCurrentTime(t);

          if (cSg && t >= cSg.end) {
            if (curRep + 1 < repTarget) {
              playerRef.current.seekTo(cSg.start);
              updateState({ curRep: curRep + 1 });
            } else {
              playerRef.current.pauseVideo();
              updateState({ isPlay: false, curRep: 0 });
            }
          }
        } catch (e) {}
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlay, cSg, curRep, repTarget, updateState]);

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    event.target.setPlaybackRate(speed);
  };

  const onStateChange = (event: YouTubeEvent) => {
    if (event.data === 1) {
      // PLAYING
      updateState({ isPlay: true });
    } else if (event.data === 2 || event.data === 0) {
      // PAUSED or ENDED
      updateState({ isPlay: false });
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlay) {
        playerRef.current.pauseVideo();
      } else {
        if (cSg) {
          const t = currentTime;
          if (t < cSg.start || t >= cSg.end) {
            playerRef.current.seekTo(cSg.start);
            updateState({ curRep: 0 });
          }
        }
        playerRef.current.playVideo();
      }
    }
  };

  const selectSeg = (id: number) => {
    updateState({ actSegId: id, curRep: 0 });
    const sg = allSgs.find((x) => x.id === id);
    if (sg && playerRef.current) {
      playerRef.current.seekTo(sg.start);
      playerRef.current.playVideo();
      updateState({ isPlay: true });
    }
  };

  const nextSeg = (dir: number) => {
    const idx = allSgs.findIndex((x) => x.id === (cSg?.id || actSegId));
    if (dir === 1 && idx >= 0 && idx < allSgs.length - 1) {
      selectSeg(allSgs[idx + 1].id);
    } else if (dir === -1 && idx > 0) {
      selectSeg(allSgs[idx - 1].id);
    }
  };

  const updateSpeed = (delta: number) => {
    const newSpeed = Math.max(0.25, Math.min(2, speed + delta));
    updateState({ speed: newSpeed });
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(newSpeed);
    }
  };

  const updateRepTarget = (delta: number) => {
    updateState({ repTarget: Math.max(1, repTarget + delta) });
  };

  const handleSetor = () => {
    if (!actSegId && !cSg) {
      showAlert("Pilih segmen hafalan terlebih dahulu!");
    } else {
      if (!actSegId && cSg) updateState({ actSegId: cSg.id });
      updateState({ rec: { is: false, secs: 0, src: "player" }, resubmitId: null });
      switchView("setoran");
    }
  };

  let displayArabic = cSg?.arabic || "";
  const isFatihah = sur?.title.toLowerCase().includes("al-fatihah");
  if (!isFatihah) {
    displayArabic = displayArabic
      .replace(/^[\u200B-\u200D\uFEFF\u200E\u200F]*بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, "")
      .trim();
    displayArabic = displayArabic
      .replace(/^[\u200B-\u200D\uFEFF\u200E\u200F]*بِسْمِ[\s\S]+?ٱلرَّحِيمِ\s*/, "")
      .trim();
  }

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden bg-slate-50 dark:bg-[#0a120f]">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-64 bg-white border-r border-slate-200/60 p-6 flex-col shrink-0 dark:bg-[#15241e] dark:border-[#1a2e26] z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => switchView("home")}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 font-bold text-sm mb-8 whitespace-nowrap shrink-0 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Pilih Level
          </h3>
          {isSuper && (
            <button
              onClick={() => updateState({ modal: "level" })}
              className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 flex items-center justify-center hover:bg-emerald-50 hover:text-white transition-all"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full overflow-y-auto hide-scrollbar pb-10">
          {ml.map((l, i) => (
            <div
              key={l.id}
              onClick={() => updateState({ actLevelId: l.id, actSegId: null })}
              className={`flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3.5 rounded-xl lg:rounded-2xl shrink-0 transition-all cursor-pointer border w-[160px] lg:w-full ${
                currentLevelId === l.id
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 lg:translate-x-2"
                  : "bg-white dark:bg-[#0a120f] border-slate-200 dark:border-[#1a2e26] text-slate-600 dark:text-gray-300 hover:border-emerald-400"
              }`}
            >
              <div
                className={`w-6 h-6 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-[10px] lg:text-sm font-bold shrink-0 ${
                  currentLevelId === l.id ? "bg-white/20" : "bg-slate-100 dark:bg-[#15241e]"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs lg:text-sm font-bold truncate flex-1 text-left">
                {l.name}
              </span>
              {isSuper && (
                <div
                  className={`flex items-center ml-auto gap-0.5 lg:gap-1 pl-2 border-l ${
                    currentLevelId === l.id ? "border-emerald-400" : "border-slate-100 dark:border-[#1a2e26]"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateState({ modal: "level", modalData: l.id });
                    }}
                    className={`p-1.5 hover:text-blue-400 transition-colors ${
                      currentLevelId === l.id ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm("Yakin ingin menghapus data ini secara permanen dari Cloud?", () => {
                        updateState({ levels: levels.filter((x) => x.id !== l.id), actSegId: null });
                        dbDelete("levels", l.id);
                      });
                    }}
                    className={`p-1.5 hover:text-red-400 transition-colors ${
                      currentLevelId === l.id ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {isSuper && (
            <button
              onClick={() => updateState({ modal: "level", modalData: null })}
              className="py-3 lg:py-4 border-2 border-dashed border-slate-200 dark:border-[#1a2e26] rounded-xl lg:rounded-2xl text-emerald-600 font-bold text-[10px] lg:text-xs shrink-0 flex items-center justify-center gap-1.5 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#15241e] transition-colors uppercase tracking-widest w-[140px] lg:w-full"
            >
              <Plus size={14} /> Tambah
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div id="main-scroll" className="flex-1 overflow-y-auto flex flex-col relative w-full bg-slate-50/50 dark:bg-[#111c18]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#15241e] border-b border-slate-100 dark:border-[#1a2e26] sticky top-0 z-30 shadow-sm shrink-0">
          <button
            onClick={() => switchView("home")}
            className="text-slate-500 hover:text-emerald-500 transition-colors p-1 -ml-1"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-bold text-slate-800 dark:text-white truncate px-3 flex-1 text-center tracking-tight">
            {sur?.title}
          </h1>
          {isSuper ? (
            <button
              onClick={() => updateState({ modal: "video" })}
              className="text-slate-400 hover:text-emerald-500 p-1 -mr-1"
            >
              <LinkIcon size={20} />
            </button>
          ) : (
            <div className="w-7"></div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-8 pb-6 max-w-5xl mx-auto w-full shrink-0">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-3xl lg:text-4xl font-serif font-bold dark:text-white tracking-tight flex items-center gap-3">
                  {sur?.title}
                </h1>
                {isSuper && (
                  <button
                    onClick={() => updateState({ modal: "video" })}
                    className="p-2 bg-white dark:bg-[#15241e] rounded-xl border border-slate-200 dark:border-[#1a2e26] text-slate-400 hover:text-emerald-500 hover:border-emerald-300 transition-all shadow-sm"
                  >
                    <LinkIcon size={18} />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <YoutubeIcon className="text-red-500 w-4 h-4" /> Materi Media YouTube
              </p>
            </div>
          </div>
        </div>

        {/* YouTube Player */}
        <div className="w-full lg:max-w-5xl lg:mx-auto lg:px-8 shrink-0 bg-black lg:bg-transparent z-20">
          <div className="relative lg:rounded-3xl overflow-hidden bg-black aspect-video lg:shadow-xl ring-1 ring-slate-900/5 dark:ring-white/5">
            <div className="absolute inset-0">
              {sur?.videoId ? (
                <YouTube
                  videoId={sur.videoId}
                  opts={opts}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Video tidak tersedia
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 lg:p-6 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button
                  onClick={togglePlay}
                  className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] pointer-events-auto transition-all ${
                    isPlay ? "scale-95 opacity-0" : "scale-100 opacity-100 hover:scale-105"
                  }`}
                >
                  <Play className="text-white w-8 h-8 lg:w-10 lg:h-10 ml-1.5" />
                </button>
              </div>
              <div className="w-full mb-3 lg:mb-4 relative">
                <div className="h-1.5 bg-gray-600/60 rounded-full overflow-hidden flex relative backdrop-blur-md">
                  {allSgs.map((s) => (
                    <div
                      key={s.id}
                      className={`absolute h-full border-r border-black/20 ${
                        s.id === cSg?.id ? "bg-emerald-500" : "bg-gray-400 opacity-30"
                      }`}
                      style={{
                        left: `${(s.start / td) * 100}%`,
                        width: `${((s.end - s.start) / td) * 100}%`,
                      }}
                    ></div>
                  ))}
                </div>
                <div
                  className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-[0_0_10px_white] transition-all"
                  style={{ left: `${Math.min(100, (currentTime / td) * 100)}%`, marginLeft: "-6px" }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-white relative">
                <div className="flex gap-6 pointer-events-auto items-center">
                  <button onClick={() => nextSeg(-1)} className="hover:text-emerald-400 transition-colors">
                    <SkipBack size={20} />
                  </button>
                  <button onClick={togglePlay} className="hover:text-emerald-400 transition-colors">
                    {isPlay ? <Pause size={30} /> : <Play size={30} />}
                  </button>
                  <button onClick={() => nextSeg(1)} className="hover:text-emerald-400 transition-colors">
                    <SkipForward size={20} />
                  </button>
                </div>
                <div className="text-[10px] lg:text-xs font-mono font-medium tracking-wider bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-md">
                  {fmtT(currentTime)} / {fmtT(cSg?.end || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Levels */}
        <div className="lg:hidden w-full bg-white dark:bg-[#15241e] border-b border-slate-100 dark:border-[#1a2e26] p-3 overflow-x-auto hide-scrollbar shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3 w-max px-1">
            {ml.map((l, i) => (
              <div
                key={l.id}
                onClick={() => updateState({ actLevelId: l.id, actSegId: null })}
                className={`flex items-center gap-2 p-2.5 rounded-xl shrink-0 transition-all cursor-pointer border w-[160px] ${
                  currentLevelId === l.id
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                    : "bg-white dark:bg-[#0a120f] border-slate-200 dark:border-[#1a2e26] text-slate-600 dark:text-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    currentLevelId === l.id ? "bg-white/20" : "bg-slate-100 dark:bg-[#15241e]"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs font-bold truncate flex-1 text-left">{l.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full flex flex-col gap-4 lg:gap-6 shrink-0 pb-24 lg:pb-10">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-3 lg:gap-5">
            <div className="bg-white border border-slate-100 shadow-sm dark:bg-[#15241e] dark:border-[#1a2e26] rounded-2xl p-3 lg:p-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <span className="text-[9px] lg:text-[10px] text-emerald-600 font-bold tracking-widest uppercase mb-2 block">
                Pengulangan
              </span>
              <div className="flex justify-between items-center">
                <div className="text-lg lg:text-2xl font-bold dark:text-white leading-none">
                  <span>{repTarget}x</span>
                  <span className="text-[9px] lg:text-[10px] text-emerald-500 font-normal ml-0.5">
                    {curRep > 0 ? `(Ke-${curRep})` : ""}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateRepTarget(-1)}
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-base flex items-center justify-center"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateRepTarget(1)}
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-base flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm dark:bg-[#15241e] dark:border-[#1a2e26] rounded-2xl p-3 lg:p-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <span className="text-[9px] lg:text-[10px] text-emerald-600 font-bold tracking-widest uppercase mb-2 block">
                Kecepatan (Speed)
              </span>
              <div className="flex justify-between items-center">
                <span className="text-lg lg:text-2xl font-bold dark:text-white leading-none">
                  {speed}x
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateSpeed(-0.25)}
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-xs flex items-center justify-center"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => updateSpeed(0.25)}
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-slate-50 dark:bg-[#0a120f] border border-slate-100 dark:border-[#1a2e26] text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-xs flex items-center justify-center"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quran Text */}
          {cSg && (
            <div className="bg-white border border-slate-100 shadow-sm dark:bg-[#15241e] dark:border-[#1a2e26] rounded-2xl lg:rounded-3xl p-5 lg:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 dark:bg-emerald-500/5 rounded-bl-full -mr-5 -mt-5 pointer-events-none"></div>
              <h3 className="inline-block bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-[10px] lg:text-[11px] px-3 py-1.5 rounded-lg mb-5 lg:mb-6 uppercase tracking-widest text-left relative z-10">
                {cSg.title}
              </h3>
              <p className="font-arabic text-3xl lg:text-4xl dark:text-white mb-6 lg:mb-8 relative z-10 leading-[2.5] lg:leading-[2.5] text-right">
                {displayArabic}
              </p>
              <div className="border-t border-slate-100 dark:border-[#1a2e26] pt-4 lg:pt-5">
                <p className="text-[11px] lg:text-sm text-slate-500 dark:text-gray-400 italic text-left leading-relaxed relative z-10">
                  {cSg.translation}
                </p>
              </div>
            </div>
          )}

          {/* Mobile Segments */}
          <div className="lg:hidden mt-2 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-bold dark:text-white flex items-center gap-1.5">
                <ListOrdered className="text-emerald-500 w-5 h-5" /> Daftar Ayat
              </h2>
              {isSuper && (
                <button
                  onClick={() => updateState({ modal: "segment", modalData: null })}
                  className="text-[9px] bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-md text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-widest"
                >
                  <Plus size={12} /> Baru
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari Ayat/Arti..."
                value={search}
                onChange={(e) => updateState({ search: e.target.value })}
                className="input-std !w-full !rounded-xl !pl-10 !py-3 shadow-sm text-xs"
              />
            </div>
            <div className="flex-1 space-y-2 mt-1">
              {sgs.length > 0 ? (
                sgs.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => selectSeg(s.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      s.id === cSg?.id
                        ? "bg-emerald-50 border-emerald-300 dark:bg-[#152b22] dark:border-emerald-500/50 shadow-md"
                        : "bg-white dark:bg-[#15241e] border-slate-100 dark:border-[#1a2e26] shadow-sm hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4
                          className={`font-bold text-xs ${
                            s.id === cSg?.id
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-slate-700 dark:text-gray-200"
                          }`}
                        >
                          {s.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                          <Clock size={12} /> {fmtT(s.start)} - {fmtT(s.end)}
                        </p>
                      </div>
                      <div className="flex gap-1 items-center">
                        {isSuper && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateState({ modal: "segment", modalData: s.id });
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 bg-white dark:bg-[#0a120f] rounded-lg shadow-sm border border-slate-200 dark:border-[#1a2e26] transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirm("Yakin ingin menghapus?", () => {
                                  updateState({ segs: segs.filter((x) => x.id !== s.id) });
                                  dbDelete("segs", s.id);
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-[#0a120f] rounded-lg shadow-sm border border-slate-200 dark:border-[#1a2e26] transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            s.id === cSg?.id
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/40"
                              : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-emerald-500 dark:bg-[#0a120f] dark:border-[#1a2e26]"
                          }`}
                        >
                          <Play size={14} className="ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 border border-dashed rounded-xl dark:border-[#1a2e26] text-slate-400 text-[10px] italic">
                  Pencarian tidak ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Setor Button */}
        <div className="lg:hidden sticky bottom-0 left-0 w-full p-4 bg-white/90 dark:bg-[#0a120f]/90 backdrop-blur-md border-t border-slate-200/60 dark:border-[#1a2e26] z-40 mt-auto">
          <button
            onClick={handleSetor}
            className="btn-std w-full shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            <MicVocal size={20} /> Setor Hafalan
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Right (Segments) */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-white dark:bg-[#15241e] border-l border-slate-200/60 dark:border-[#1a2e26] flex-col shrink-0 h-full z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-100 dark:border-[#1a2e26] shrink-0">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2 tracking-tight">
              <ListOrdered className="text-emerald-500 w-6 h-6" /> Daftar Ayat
            </h2>
            {isSuper && (
              <button
                onClick={() => updateState({ modal: "segment", modalData: null })}
                className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg text-emerald-600 font-bold flex items-center gap-1 hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest"
              >
                <Plus size={14} /> Baru
              </button>
            )}
          </div>
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari Ayat/Arti..."
              value={search}
              onChange={(e) => updateState({ search: e.target.value })}
              className="input-std !w-full !rounded-2xl !pl-12 py-3 shadow-sm"
            />
          </div>
          <button
            onClick={handleSetor}
            className="btn-std !py-3.5 !text-sm flex items-center justify-center gap-2 shadow-xl"
          >
            <MicVocal size={20} /> Setor Hafalan
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sgs.length > 0 ? (
            sgs.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSeg(s.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  s.id === cSg?.id
                    ? "bg-emerald-50 border-emerald-300 dark:bg-[#152b22] dark:border-emerald-500/50 shadow-md"
                    : "bg-white dark:bg-[#15241e] border-slate-100 dark:border-[#1a2e26] shadow-sm hover:border-emerald-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4
                      className={`font-bold text-sm ${
                        s.id === cSg?.id
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-700 dark:text-gray-200"
                      }`}
                    >
                      {s.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                      <Clock size={12} /> {fmtT(s.start)} - {fmtT(s.end)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {isSuper && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateState({ modal: "segment", modalData: s.id });
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 bg-white dark:bg-[#0a120f] rounded-lg shadow-sm border border-slate-200 dark:border-[#1a2e26] transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm("Yakin ingin menghapus?", () => {
                              updateState({ segs: segs.filter((x) => x.id !== s.id) });
                              dbDelete("segs", s.id);
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-[#0a120f] rounded-lg shadow-sm border border-slate-200 dark:border-[#1a2e26] transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        s.id === cSg?.id
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/40"
                          : "bg-slate-50 border border-slate-200 text-slate-400 hover:text-emerald-500 dark:bg-[#0a120f] dark:border-[#1a2e26]"
                      }`}
                    >
                      <Play size={16} className="ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 border border-dashed rounded-2xl dark:border-[#1a2e26] text-slate-400 text-xs italic">
              Pencarian tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
