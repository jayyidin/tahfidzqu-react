"use client";

import { useAppStore } from "@/lib/store";
import { fmtT, blobToBase64 } from "@/lib/utils";
import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  MicVocal,
  Activity,
  GraduationCap,
  Users,
  UserCircle,
  Square,
  Mic,
  Send,
  Upload,
} from "lucide-react";

export default function SetoranView() {
  const {
    surahs,
    segs,
    ustadz,
    halaqohs,
    siswas,
    subs,
    actSurahId,
    actSegId,
    hierSel,
    adminLvl,
    loggedInUstadzId,
    rec,
    resubmitId,
    currentStudentAudioUrl,
    updateState,
    switchView,
    showAlert,
    dbSave,
  } = useAppStore();

  const seg = segs.find((s) => s.id === actSegId);
  const sur = surahs.find((s) => s.id === actSurahId);

  // Enforce logged-in ustadz if adminLvl === 2
  useEffect(() => {
    if (adminLvl === 2 && hierSel.u !== loggedInUstadzId) {
      updateState({ hierSel: { ...hierSel, u: loggedInUstadzId } });
    }
  }, [adminLvl, loggedInUstadzId, hierSel, updateState]);

  const uId = hierSel.u || "";
  const hId = hierSel.h || "";
  const sId = hierSel.s || "";

  const hList = halaqohs.filter((h) => h.ustadzId == uId);
  const sList = siswas.filter((s) => s.halaqohId == hId);
  const isResubmit = resubmitId !== null;
  const uListSetoran = adminLvl === 2 ? ustadz.filter((x) => x.id == loggedInUstadzId) : ustadz;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecord = async () => {
    if (!hierSel.s) {
      showAlert("Pilih identitas santri terlebih dahulu!");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
        mimeType = "audio/webm;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";

      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const b = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
        const url = await blobToBase64(b);
        updateState({ currentStudentAudioUrl: url });
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      updateState({ rec: { ...rec, is: true, secs: 0 } });

      timerRef.current = setInterval(() => {
        updateState((prev) => ({ rec: { ...prev.rec, secs: prev.rec.secs + 1 } }));
      }, 1000);
    } catch (e) {
      showAlert("Gagal mengakses mikrofon. Pastikan browser diizinkan merekam suara.");
    }
  };

  const stopRecord = () => {
    if (mediaRecorderRef.current && rec.is) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      updateState({ rec: { ...rec, is: false } });
    }
  };

  const toggleRecord = () => {
    if (!rec.is) startRecord();
    else stopRecord();
  };

  const submitRec = async (type: "mic" | "file", file?: File) => {
    if (!hierSel.s) {
      showAlert("Pilih identitas santri terlebih dahulu!");
      return;
    }

    if (!resubmitId) {
      const sIdNum = Number(hierSel.s);
      const segIdNum = actSegId;
      const hIdNum = Number(hierSel.h);

      const exists = subs.some(
        (x) => x.siswaId === sIdNum && x.segmentId === segIdNum && x.halaqohId === hIdNum
      );
      if (exists) {
        showAlert(
          "Santri ini sudah pernah menyetorkan hafalan untuk segmen ini di Halaqoh saat ini. Tidak bisa mengirim data ganda."
        );
        return;
      }
    }

    const mediaType = type === "mic" ? "rekaman mic" : "file audio";
    const tDate = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let audioData = currentStudentAudioUrl;
    if (type === "file" && file) {
      audioData = await blobToBase64(file);
    }

    if (resubmitId) {
      const existingSub = subs.find((x) => x.id === resubmitId);
      if (existingSub) {
        const updated = {
          ...existingSub,
          status: "pending",
          type: mediaType,
          date: tDate,
          audioUrl: audioData,
          duration: rec.secs,
        };
        updateState({ subs: subs.map((s) => (s.id === resubmitId ? updated : s)) });
        dbSave("subs", existingSub.id, updated);
      }
      updateState({ resubmitId: null });
    } else {
      const nid = Date.now();
      const subData = {
        id: nid,
        siswaId: Number(hierSel.s),
        halaqohId: Number(hierSel.h),
        ustadzId: Number(hierSel.u),
        surahId: actSurahId,
        segmentId: actSegId,
        type: mediaType,
        date: tDate,
        status: "pending",
        grade: null,
        note: null,
        audioUrl: audioData,
        duration: rec.secs,
      };
      updateState({ subs: [...subs, subData] });
      dbSave("subs", nid, subData);
    }

    updateState({ currentStudentAudioUrl: null, rec: { ...rec, is: false, secs: 0 } });
    if (timerRef.current) clearInterval(timerRef.current);
    switchView(rec.src as any);
    showAlert("Setoran Berhasil Terkirim ke Cloud!");
  };

  const handleCancel = () => {
    if (rec.is) stopRecord();
    updateState({ resubmitId: null });
    switchView(rec.src as any);
  };

  return (
    <div id="main-scroll" className="flex-1 flex flex-col w-full h-full bg-slate-50 dark:bg-[#111c18] overflow-y-auto">
      <header className="h-16 md:h-20 flex justify-between items-center px-5 md:px-8 bg-white border-b border-slate-200/60 dark:bg-[#0a120f] dark:border-[#1a2e26] shrink-0 sticky top-0 z-20">
        <button
          onClick={handleCancel}
          className="font-bold text-slate-500 hover:text-emerald-500 flex gap-2 items-center text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Batal
        </button>
        <div className="text-emerald-500 font-bold text-lg md:text-xl flex items-center gap-2 tracking-tight">
          <MicVocal size={24} /> {isResubmit ? "Setor Ulang Hafalan" : "Ujian Hafalan"}
        </div>
        <div className="w-16 md:w-20"></div>
      </header>

      <div className="flex-1 p-4 py-8 md:p-10 relative bg-gradient-to-br from-emerald-50/50 to-slate-100 dark:from-[#0a120f] dark:to-[#111c18]">
        <div className="w-full max-w-[480px] bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl dark:bg-[#15241e] dark:border-[#1a2e26] text-center mx-auto mt-2 md:mt-6 relative">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] mb-4 dark:bg-emerald-900/30 shadow-inner">
            <Activity size={36} />
          </div>
          <h2 className="text-emerald-600 font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-2">
            {sur?.title}
          </h2>
          <h1 className="text-2xl md:text-3xl font-serif font-bold dark:text-white mb-8 tracking-tight">
            {seg?.title}
          </h1>

          <div className="text-left flex flex-col gap-4 mb-8 bg-slate-50 p-5 rounded-3xl border border-slate-100 dark:bg-[#0a120f] dark:border-[#1a2e26]">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="text-emerald-500 w-4 h-4" /> Penguji
              </label>
              <select
                value={uId}
                onChange={(e) => updateState({ hierSel: { u: e.target.value, h: "", s: "" } })}
                className={`input-std !bg-white dark:!bg-[#15241e] cursor-pointer ${
                  isResubmit || adminLvl === 2 ? "opacity-50 pointer-events-none" : ""
                }`}
                disabled={isResubmit || adminLvl === 2}
              >
                {adminLvl !== 2 && (
                  <option value="" disabled>
                    -- Pilih Ustadz --
                  </option>
                )}
                {uListSetoran.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="text-blue-500 w-4 h-4" /> Halaqoh
                </label>
                <select
                  value={hId}
                  onChange={(e) => updateState({ hierSel: { ...hierSel, h: e.target.value, s: "" } })}
                  className={`input-std !bg-white dark:!bg-[#15241e] cursor-pointer ${
                    !uId || isResubmit ? "opacity-50 pointer-events-none" : ""
                  }`}
                  disabled={!uId || isResubmit}
                >
                  <option value="" disabled>
                    -- Pilih --
                  </option>
                  {hList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCircle className="text-purple-500 w-4 h-4" /> Santri
                </label>
                <select
                  value={sId}
                  onChange={(e) => updateState({ hierSel: { ...hierSel, s: e.target.value } })}
                  className={`input-std !bg-white dark:!bg-[#15241e] cursor-pointer ${
                    !hId || isResubmit ? "opacity-50 pointer-events-none" : ""
                  }`}
                  disabled={!hId || isResubmit}
                >
                  <option value="" disabled>
                    -- Pilih --
                  </option>
                  {sList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.kelas})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-dashed border-emerald-200 p-8 rounded-[2rem] mb-5 dark:bg-transparent dark:border-emerald-500/20">
            <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-4">
              {rec.is && (
                <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping pointer-events-none"></div>
              )}
              <button
                onClick={toggleRecord}
                className={`relative w-full h-full ${
                  rec.is
                    ? "bg-red-500"
                    : "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/40 hover:-translate-y-1"
                } text-white rounded-full flex items-center justify-center transition-all duration-300 active:scale-95`}
              >
                {rec.is ? <Square size={40} /> : <Mic size={40} />}
              </button>
            </div>
            <div className="text-base md:text-lg font-mono text-slate-700 dark:text-gray-200 font-bold tracking-widest">
              {rec.is
                ? fmtT(rec.secs)
                : rec.secs > 0
                ? `Selesai: ${fmtT(rec.secs)}`
                : "Ketuk untuk Merekam"}
            </div>

            {rec.secs > 0 && !rec.is && (
              <div className="flex gap-3 mt-8 pt-8 border-t border-slate-100 dark:border-[#1a2e26]">
                <button
                  onClick={() => updateState({ rec: { ...rec, secs: 0 }, currentStudentAudioUrl: null })}
                  className="flex-1 py-4 bg-slate-100 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors dark:bg-[#0a120f] dark:hover:bg-[#1A2E26]"
                >
                  Ulangi
                </button>
                <button
                  onClick={() => submitRec("mic")}
                  className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Kirim
                </button>
              </div>
            )}
          </div>

          {rec.secs === 0 && !rec.is && (
            <div className="pt-2">
              <div className="relative flex items-center py-2 mb-3">
                <div className="flex-grow border-t border-slate-200 dark:border-[#1a2e26]"></div>
                <span className="mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Atau
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-[#1a2e26]"></div>
              </div>
              <input
                type="file"
                id="au-up"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    submitRec("file", e.target.files[0]);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (!hierSel.s) {
                    showAlert("Pilih identitas santri terlebih dahulu!");
                    return;
                  }
                  document.getElementById("au-up")?.click();
                }}
                className="w-full py-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-white hover:border-emerald-400 hover:text-emerald-600 hover:shadow-md transition-all dark:bg-[#0a120f] dark:border-[#1a2e26] dark:text-gray-400 text-xs uppercase tracking-widest"
              >
                <Upload size={18} /> Upload File Audio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
