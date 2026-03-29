"use client";

import { useAppStore } from "@/lib/store";
import { Q_SURAHS } from "@/lib/constants";
import { extractVideoId, getPredikat, blobToBase64 } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { domToPng } from "modern-screenshot";
import {
  Lock,
  X,
  AlertCircle,
  Info,
  Star,
  Mic,
  Trash2,
  Square,
  Share2,
  Download,
  Loader2,
} from "lucide-react";

export default function Modals() {
  const store = useAppStore();
  const {
    modal,
    modalData,
    customDialog,
    updateState,
    dbSave,
    juzs,
    surahs,
    levels,
    segs,
    ustadz,
    halaqohs,
    siswas,
    subs,
    actJuzId,
    actSurahId,
    hierSel,
    schLogo,
    schSub,
    loginAttempts,
    lockoutTime,
    loginError,
    currentGradingAudioUrl,
    showAlert,
    closeDialog,
  } = store;

  // Local state for forms
  const [formData, setFormData] = useState<any>({});
  const [isGradingRecording, setIsGradingRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const gradingMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const gradingAudioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (modal) {
      if (modal === "juz") {
        const j = modalData ? juzs.find((x) => x.id === modalData) : null;
        setFormData({ name: j?.name || "" });
      } else if (modal === "surah") {
        const s = modalData ? surahs.find((x) => x.id === modalData) : null;
        setFormData({
          title: s?.title || "",
          videoId: s?.videoId ? `https://youtu.be/${s.videoId}` : "",
        });
      } else if (modal === "video") {
        const s = surahs.find((x) => x.id === actSurahId);
        setFormData({ videoId: s?.videoId ? `https://youtu.be/${s.videoId}` : "" });
      } else if (modal === "level") {
        const l = modalData ? levels.find((x) => x.id === modalData) : null;
        setFormData({ name: l?.name || "" });
      } else if (modal === "segment") {
        const sg = modalData ? segs.find((x) => x.id === modalData) : null;
        setFormData({
          title: sg?.title || "",
          arabic: sg?.arabic || "",
          translation: sg?.translation || "",
          sm: sg ? Math.floor(sg.start / 60) : 0,
          ss: sg ? sg.start % 60 : 0,
          em: sg ? Math.floor(sg.end / 60) : 0,
          es: sg ? sg.end % 60 : 0,
          startAyat: 1,
          endAyat: 1,
        });
        // In a real app, we'd fetch Quran data here. For now, we skip auto-fill logic to keep it simple.
      } else if (modal === "ustadz") {
        const u = modalData ? ustadz.find((x) => x.id === modalData) : null;
        setFormData({
          name: u?.name || "",
          phone: u?.phone || "",
          username: u?.username || "",
          password: u?.password || "",
        });
      } else if (modal === "halaqoh") {
        const h = modalData ? halaqohs.find((x) => x.id === modalData) : null;
        setFormData({ name: h?.name || "" });
      } else if (modal === "siswa") {
        const s = modalData ? siswas.find((x) => x.id === modalData) : null;
        setFormData({ name: s?.name || "", kelas: s?.kelas || "" });
      } else if (modal === "grade") {
        const sb = subs.find((x) => x.id === modalData);
        setFormData({ note: sb?.note || "" });
        updateState({ currentGradingAudioUrl: null });
      } else if (modal === "login") {
        setFormData({ username: "", password: "" });
      } else if (modal.startsWith("import_")) {
        setFormData({ text: "" });
      }
    }
  }, [modal, modalData]);

  if (!modal && !customDialog.show) return null;

  const handleClose = () => {
    updateState({ modal: null, currentGradingAudioUrl: null });
  };

  const handleLogin = () => {
    const u = formData.username.trim();
    const p = formData.password.trim();

    if (Date.now() < lockoutTime) {
      const remain = Math.ceil((lockoutTime - Date.now()) / 1000);
      updateState({ loginError: `Akses Terkunci! Tunggu ${remain} detik.` });
      return;
    }

    if (u === "jayyidin" && p === "offthewallba123") {
      updateState({
        adminLvl: 1,
        modal: null,
        loginError: "",
        loginAttempts: 0,
        loggedInUstadzId: null,
        filter: { ...store.filter, u: "all" },
      });
      store.switchView("admin");
    } else {
      const ust = ustadz.find((x) => x.username === u && x.password === p);
      if (ust) {
        updateState({
          adminLvl: 2,
          modal: null,
          loginError: "",
          loginAttempts: 0,
          loggedInUstadzId: ust.id,
          filter: { ...store.filter, u: ust.id },
          hierSel: { ...hierSel, u: ust.id },
        });
        store.switchView("admin");
      } else {
        const newAttempts = loginAttempts + 1;
        if (newAttempts >= 3) {
          updateState({
            loginAttempts: newAttempts,
            lockoutTime: Date.now() + 30000,
            loginError: "Akun terkunci sementara karena gagal 3 kali berturut-turut.",
          });
        } else {
          updateState({
            loginAttempts: newAttempts,
            loginError: `Username atau Password salah! (Sisa percobaan: ${3 - newAttempts})`,
          });
        }
      }
    }
  };

  const handleSaveJuz = (e: React.FormEvent) => {
    e.preventDefault();
    const id = modalData || Date.now();
    const nD = { id, name: formData.name };
    if (!modalData) updateState({ juzs: [...juzs, nD], actJuzId: nD.id });
    else updateState({ juzs: juzs.map((x) => (x.id === id ? nD : x)) });
    dbSave("juzs", id, nD);
    handleClose();
  };

  const handleSaveSurah = (e: React.FormEvent) => {
    e.preventDefault();
    const id = modalData || Date.now();
    const v = extractVideoId(formData.videoId) || formData.videoId || "";
    const nD = { id, juzId: modalData ? surahs.find((x) => x.id === id)?.juzId : actJuzId, title: formData.title, videoId: v };
    
    if (!modalData) {
      updateState({ surahs: [...surahs, nD] });
      const lid = Date.now() + 1;
      const nL = { id: lid, surahId: nD.id, name: "Level 1" };
      updateState({ levels: [...levels, nL] });
      dbSave("levels", lid, nL);
    } else {
      updateState({ surahs: surahs.map((x) => (x.id === id ? nD : x)) });
    }
    dbSave("surahs", id, nD);
    handleClose();
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(formData.videoId) || formData.videoId;
    if (id && id.length >= 10) {
      const o = surahs.find((x) => x.id === actSurahId);
      if (o) {
        const updated = { ...o, videoId: id };
        updateState({ surahs: surahs.map((x) => (x.id === actSurahId ? updated : x)) });
        dbSave("surahs", actSurahId!, updated);
      }
      handleClose();
    } else {
      showAlert("Tautan URL YouTube tidak valid!");
    }
  };

  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    const id = modalData || Date.now();
    const nD = { id, surahId: actSurahId, name: formData.name };
    if (!modalData) updateState({ levels: [...levels, nD] });
    else updateState({ levels: levels.map((x) => (x.id === id ? nD : x)) });
    dbSave("levels", id, nD);
    handleClose();
  };

  const handleSaveSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const id = modalData || Date.now();
    const start = Number(formData.sm) * 60 + Number(formData.ss);
    const end = Number(formData.em) * 60 + Number(formData.es);
    const nD = {
      id,
      surahId: actSurahId,
      levelId: store.actLevelId || levels.find((l) => l.surahId === actSurahId)?.id,
      title: formData.title,
      start,
      end,
      arabic: formData.arabic,
      translation: formData.translation,
    };
    if (!modalData) updateState({ segs: [...segs, nD] });
    else updateState({ segs: segs.map((x) => (x.id === id ? nD : x)) });
    dbSave("segs", id, nD);
    handleClose();
  };

  const handleSaveUstadz = (e: React.FormEvent) => {
    e.preventDefault();
    const id = modalData || Date.now();
    const nD = { id, ...formData };
    if (!modalData) updateState({ ustadz: [...ustadz, nD] });
    else updateState({ ustadz: ustadz.map((x) => (x.id === id ? nD : x)) });
    dbSave("ustadz", id, nD);
    handleClose();
  };

  const handleSaveHalaqoh = (e: React.FormEvent) => {
    e.preventDefault();
    const id = modalData || Date.now();
    const nD = { id, ustadzId: hierSel.u, name: formData.name };
    if (!modalData) updateState({ halaqohs: [...halaqohs, nD] });
    else updateState({ halaqohs: halaqohs.map((x) => (x.id === id ? { ...x, name: formData.name } : x)) });
    dbSave("halaqohs", id, nD);
    handleClose();
  };

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    const id = modalData || Date.now();
    const nD = { id, halaqohId: hierSel.h, name: formData.name, kelas: formData.kelas };
    if (!modalData) updateState({ siswas: [...siswas, nD] });
    else updateState({ siswas: siswas.map((x) => (x.id === id ? { ...x, name: formData.name, kelas: formData.kelas } : x)) });
    dbSave("siswas", id, nD);
    handleClose();
  };

  const processImport = (type: string) => {
    if (!formData.text.trim()) {
      showAlert("Paste data dari spreadsheet terlebih dahulu!");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const rows = formData.text.split("\n").map((r: string) => r.trim()).filter((r: string) => r.length > 0);
      let successCount = 0;
      const baseId = Date.now();

      if (type === "ustadz") {
        const newUstadz: any[] = [];
        rows.forEach((row: string, idx: number) => {
          const cols = row.split(/\t|\||,/);
          const name = cols[0] ? cols[0].trim().replace(/^"|"$/g, "") : "";
          const phone = cols.length > 1 ? cols[1].trim().replace(/^"|"$/g, "") : "";
          const username = cols.length > 2 ? cols[2].trim().replace(/^"|"$/g, "") : "";
          const password = cols.length > 3 ? cols[3].trim().replace(/^"|"$/g, "") : "";
          if (name && username && password) {
            const nD = { id: baseId + idx, name, phone, username, password };
            newUstadz.push(nD);
            dbSave("ustadz", nD.id, nD);
            successCount++;
          }
        });
        updateState({ ustadz: [...ustadz, ...newUstadz] });
      } else if (type === "halaqoh") {
        const newHalaqohs: any[] = [];
        rows.forEach((row: string, idx: number) => {
          const cols = row.split(/\t|\||,/);
          const name = cols[0] ? cols[0].trim().replace(/^"|"$/g, "") : "";
          if (name) {
            const nD = { id: baseId + idx, ustadzId: hierSel.u, name };
            newHalaqohs.push(nD);
            dbSave("halaqohs", nD.id, nD);
            successCount++;
          }
        });
        updateState({ halaqohs: [...halaqohs, ...newHalaqohs] });
      } else if (type === "siswa") {
        const newSiswas: any[] = [];
        rows.forEach((row: string, idx: number) => {
          const cols = row.split(/\t|\||,/);
          const name = cols[0] ? cols[0].trim().replace(/^"|"$/g, "") : "";
          const kelas = cols.length > 1 ? cols[1].trim().replace(/^"|"$/g, "") : "-";
          if (name) {
            const nD = { id: baseId + idx, halaqohId: hierSel.h, name, kelas };
            newSiswas.push(nD);
            dbSave("siswas", nD.id, nD);
            successCount++;
          }
        });
        updateState({ siswas: [...siswas, ...newSiswas] });
      }
      setIsProcessing(false);
      handleClose();
      showAlert(`Berhasil mengimpor ${successCount} data.`);
    }, 100);
  };

  const toggleGradingRecord = async () => {
    if (isGradingRecording && gradingMediaRecorderRef.current) {
      gradingMediaRecorderRef.current.stop();
      setIsGradingRecording(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        let mimeType = "";
        if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
        else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
        else if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";

        const options = mimeType ? { mimeType } : {};
        const recorder = new MediaRecorder(s, options);
        gradingMediaRecorderRef.current = recorder;
        gradingAudioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) gradingAudioChunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          const b = new Blob(gradingAudioChunksRef.current, { type: mimeType || "audio/webm" });
          const url = await blobToBase64(b);
          updateState({ currentGradingAudioUrl: url });
          s.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        setIsGradingRecording(true);
      } catch (e) {
        showAlert("Akses mikrofon ditolak oleh browser.");
      }
    }
  };

  const submitGrade = (grade: string) => {
    const sb = subs.find((x) => x.id === modalData);
    if (sb) {
      const updated = {
        ...sb,
        status: grade === "repeat" ? "need-repeat" : "graded",
        grade: grade === "repeat" ? null : grade,
        note: formData.note,
        voiceNote: currentGradingAudioUrl,
      };
      updateState({ subs: subs.map((x) => (x.id === sb.id ? updated : x)) });
      dbSave("subs", sb.id, updated);
    }
    handleClose();
  };

  const simulateScreenshot = () => {
    const f = document.createElement("div");
    f.style.position = "fixed";
    f.style.top = "0";
    f.style.left = "0";
    f.style.width = "100vw";
    f.style.height = "100vh";
    f.style.backgroundColor = "#ffffff";
    f.style.zIndex = "999999";
    f.style.opacity = "0.9";
    f.style.transition = "opacity 0.4s ease-out";
    document.body.appendChild(f);
    setTimeout(() => {
      f.style.opacity = "0";
    }, 50);
    setTimeout(() => {
      if (f.parentNode) f.parentNode.removeChild(f);
    }, 500);
  };

  const downloadCard = () => {
    const node = document.getElementById("achievement-card-node");
    if (!node) return;
    setIsProcessing(true);
    simulateScreenshot();
    setTimeout(() => {
      domToPng(node, { scale: 3, backgroundColor: null })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "Syahadah_TahfidzQu.png";
          link.href = dataUrl;
          link.click();
          setIsProcessing(false);
        })
        .catch((error) => {
          showAlert("Gagal screenshot kartu. " + error);
          setIsProcessing(false);
        });
    }, 300);
  };

  const shareCard = () => {
    const node = document.getElementById("achievement-card-node");
    if (!node) return;
    setIsProcessing(true);
    simulateScreenshot();
    setTimeout(() => {
      domToPng(node, { scale: 3, backgroundColor: null })
        .then(async (dataUrl) => {
          try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], "Syahadah_TahfidzQu.png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: "Syahadah Tahfidz",
                text: "Alhamdulillah, pencapaian hafalan baru!",
                files: [file],
              });
            } else {
              showAlert("Perangkat ini tidak mendukung fitur Share gambar langsung. Silakan Download gambarnya terlebih dahulu.");
            }
          } catch (e) {
            showAlert("Gagal membagikan kartu. Coba gunakan fitur Download.");
          }
          setIsProcessing(false);
        })
        .catch((error) => {
          showAlert("Gagal memproses kartu. " + error);
          setIsProcessing(false);
        });
    }, 300);
  };

  // --- Render Custom Dialog ---
  if (customDialog.show) {
    const isConf = customDialog.type === "confirm";
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 text-center animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#15241e] border border-slate-200 dark:border-[#1a2e26] rounded-3xl w-full max-w-sm p-6 shadow-2xl">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isConf
                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            }`}
          >
            {isConf ? <AlertCircle size={32} /> : <Info size={32} />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {isConf ? "Konfirmasi" : "Informasi"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-gray-300 mb-6">{customDialog.message}</p>
          <div className="flex gap-3 justify-center">
            {isConf && (
              <button
                onClick={closeDialog}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#0a120f] dark:text-gray-400 dark:hover:bg-[#1a2e26] transition"
              >
                Batal
              </button>
            )}
            <button
              onClick={() => {
                if (customDialog.onConfirm) customDialog.onConfirm();
                closeDialog();
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition ${
                isConf ? "bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20" : "bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20"
              }`}
            >
              {isConf ? "Ya, Lanjutkan" : "Mengerti"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Modals ---
  return (
    <div className="modal-overlay !flex">
      {modal === "login" && (
        <div className="modal-box text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-emerald-900/30">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">Akses Admin</h2>
          {loginError && (
            <div className="mb-4 text-[11px] font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-transparent animate-pulse">
              {loginError}
            </div>
          )}
          <input
            type="text"
            value={formData.username || ""}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="input-std mb-3 text-center"
            placeholder="Username"
          />
          <input
            type="password"
            value={formData.password || ""}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="input-std mb-4 text-center tracking-widest"
            placeholder="Password"
          />
          <button onClick={handleLogin} className="btn-std mb-2">
            Login
          </button>
          <button
            onClick={handleClose}
            className="w-full py-3 text-slate-500 font-bold hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition"
          >
            Batal
          </button>
        </div>
      )}

      {modal === "juz" && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">{modalData ? "Edit" : "Tambah"} Juz</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveJuz}>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-std mb-6"
              placeholder="Nama Juz"
            />
            <button type="submit" className="btn-std">
              Simpan
            </button>
          </form>
        </div>
      )}

      {modal === "surah" && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">{modalData ? "Edit" : "Tambah"} Surah</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveSurah}>
            <select
              required
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-std cursor-pointer mb-4"
            >
              <option value="" disabled>
                -- Pilih Surah --
              </option>
              {Q_SURAHS.map((q) => (
                <option key={q.no} value={`Surah ${q.name}`}>
                  Surah {q.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.videoId || ""}
              onChange={(e) => setFormData({ ...formData, videoId: e.target.value })}
              placeholder="Link YouTube (Opsional)"
              className="input-std mb-6"
            />
            <button type="submit" className="btn-std">
              Simpan
            </button>
          </form>
        </div>
      )}

      {modal === "video" && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Ganti Video</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveVideo}>
            <input
              type="text"
              required
              value={formData.videoId || ""}
              onChange={(e) => setFormData({ ...formData, videoId: e.target.value })}
              className="input-std mb-6"
              placeholder="Paste link YouTube di sini..."
            />
            <button type="submit" className="btn-std">
              Simpan
            </button>
          </form>
        </div>
      )}

      {modal === "level" && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">{modalData ? "Edit" : "Tambah"} Level</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveLevel}>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-std mb-6"
              placeholder="Contoh: Level 2..."
            />
            <button type="submit" className="btn-std">
              Simpan
            </button>
          </form>
        </div>
      )}

      {modal === "segment" && (
        <div className="modal-box !max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">{modalData ? "Edit" : "Tambah"} Ayat</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveSegment}>
            <div className="mb-4">
              <label className="block text-[10px] text-emerald-600 font-bold mb-1">JUDUL</label>
              <input
                type="text"
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-std"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[10px] text-slate-500 font-bold mb-1">TEKS ARAB</label>
              <textarea
                rows={3}
                dir="rtl"
                value={formData.arabic || ""}
                onChange={(e) => setFormData({ ...formData, arabic: e.target.value })}
                className="input-std font-arabic text-xl"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[10px] text-slate-500 font-bold mb-1">TERJEMAH</label>
              <textarea
                rows={2}
                value={formData.translation || ""}
                onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                className="input-std text-xs md:text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold text-center mb-2">MULAI (M:D)</label>
                <div className="flex justify-center items-center gap-1">
                  <input
                    type="number"
                    value={formData.sm || ""}
                    onChange={(e) => setFormData({ ...formData, sm: e.target.value })}
                    className="input-std !w-14 !p-1.5 text-center"
                  />
                  <span className="font-bold">:</span>
                  <input
                    type="number"
                    value={formData.ss || ""}
                    onChange={(e) => setFormData({ ...formData, ss: e.target.value })}
                    className="input-std !w-14 !p-1.5 text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold text-center mb-2">SELESAI (M:D)</label>
                <div className="flex justify-center items-center gap-1">
                  <input
                    type="number"
                    value={formData.em || ""}
                    onChange={(e) => setFormData({ ...formData, em: e.target.value })}
                    className="input-std !w-14 !p-1.5 text-center"
                  />
                  <span className="font-bold">:</span>
                  <input
                    type="number"
                    value={formData.es || ""}
                    onChange={(e) => setFormData({ ...formData, es: e.target.value })}
                    className="input-std !w-14 !p-1.5 text-center"
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-std w-full">
              Simpan Segmen
            </button>
          </form>
        </div>
      )}

      {modal === "ustadz" && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">{modalData ? "Edit" : "Tambah"} Ustadz</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveUstadz}>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-std mb-3"
              placeholder="Nama Lengkap"
            />
            <input
              type="text"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-std mb-3"
              placeholder="No. WhatsApp (Opsional)"
            />
            <input
              type="text"
              required
              value={formData.username || ""}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-std mb-3"
              placeholder="Username Login"
            />
            <input
              type="password"
              required
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-std mb-6"
              placeholder="Password"
            />
            <button type="submit" className="btn-std">
              Simpan
            </button>
          </form>
        </div>
      )}

      {modal === "halaqoh" && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">{modalData ? "Edit" : "Tambah"} Halaqoh</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveHalaqoh}>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-std mb-6"
              placeholder="Nama Halaqoh"
            />
            <button type="submit" className="btn-std">
              Simpan
            </button>
          </form>
        </div>
      )}

      {modal === "siswa" && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">{modalData ? "Edit" : "Tambah"} Santri</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveSiswa}>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-std mb-3"
              placeholder="Nama Santri"
            />
            <input
              type="text"
              required
              value={formData.kelas || ""}
              onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
              className="input-std mb-6"
              placeholder="Kelas / Tingkat"
            />
            <button type="submit" className="btn-std">
              Simpan
            </button>
          </form>
        </div>
      )}

      {modal?.startsWith("import_") && (
        <div className="modal-box">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Import Data</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <textarea
            rows={6}
            value={formData.text || ""}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            className="input-std mb-4"
            placeholder="Paste data dari Excel/Spreadsheet di sini..."
          />
          <button
            onClick={() => processImport(modal?.split("_")[1] || "")}
            disabled={isProcessing}
            className="btn-std flex justify-center items-center gap-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : "Proses Import"}
          </button>
        </div>
      )}

      {modal === "grade" && (
        <div className="modal-box text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={24} />
          </div>
          <h2 className="text-lg md:text-xl font-bold mb-1 dark:text-white">Beri Nilai</h2>
          <p className="text-xs md:text-sm text-emerald-600 font-bold mb-6">
            {siswas.find((x) => x.id === subs.find((s) => s.id === modalData)?.siswaId)?.name}
          </p>
          <div className="text-left mb-4">
            <label className="block text-[10px] md:text-[11px] text-slate-500 font-bold mb-1.5">
              Catatan Teks:
            </label>
            <textarea
              value={formData.note || ""}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="input-std"
              rows={2}
            />
          </div>
          <div className="text-left mb-6">
            <label className="block text-[10px] md:text-[11px] text-slate-500 font-bold mb-1.5">
              Catatan Suara (Opsional):
            </label>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0a120f] border border-slate-200 dark:border-[#1a2e26] p-2 md:p-3 rounded-xl">
              <button
                type="button"
                onClick={toggleGradingRecord}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${
                  isGradingRecording
                    ? "bg-red-500 text-white animate-pulse shadow-lg"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                } flex items-center justify-center transition-all shrink-0`}
              >
                {isGradingRecording ? <Square size={18} /> : <Mic size={18} />}
              </button>
              <div className="flex-1">
                {currentGradingAudioUrl ? (
                  <span className="text-xs text-emerald-600">Audio terekam</span>
                ) : (
                  <span className="text-[10px] md:text-xs text-slate-500 dark:text-gray-400 truncate">
                    {isGradingRecording ? "Merekam..." : "Ketuk Mic untuk merekam suara"}
                  </span>
                )}
              </div>
              {currentGradingAudioUrl && (
                <button
                  type="button"
                  onClick={() => updateState({ currentGradingAudioUrl: null })}
                  className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 md:gap-2 mb-4 md:mb-5">
            {["A", "B+", "B", "B-"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => submitGrade(g)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-bold text-lg hover:bg-emerald-50 hover:border-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 dark:bg-[#0a120f] dark:border-[#1a2e26] dark:text-white transition-all shadow-sm"
              >
                {g}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => submitGrade("repeat")}
            className="w-full py-2.5 md:py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs md:text-sm mb-3 md:mb-4 hover:bg-red-500 hover:text-white transition dark:bg-red-900/20 dark:border-transparent"
          >
            Minta Ulangi
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 text-slate-500 font-bold text-xs md:text-sm hover:text-slate-800 transition"
          >
            Batal
          </button>
        </div>
      )}

      {modal === "share_card" && (
        <div className="modal-overlay !flex !items-center !justify-center !p-4 z-[500]">
          <div className="w-full max-w-[380px] mx-auto flex flex-col gap-4 max-h-[95vh] overflow-y-auto overflow-x-auto hide-scrollbar pb-10 sm:pb-0 items-center">
            <div
              id="achievement-card-node"
              style={{
                width: "360px",
                minWidth: "360px",
                height: "520px",
                minHeight: "520px",
                position: "relative",
                backgroundColor: "#ffffff",
                borderRadius: "0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px 24px",
                boxSizing: "border-box",
                margin: "0 auto",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage:
                    "url('https://images.weserv.nl/?url=https://cdn.pixabay.com/photo/2019/05/04/17/36/quran-4178711_1280.jpg&w=800&output=jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.05,
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              ></div>

              <div style={{ position: "relative", zIndex: 10, width: "100%", textAlign: "center", marginBottom: "24px" }}>
                {schLogo ? (
                  <img src={schLogo} style={{ height: "50px", maxWidth: "180px", objectFit: "contain", margin: "0 auto", display: "block" }} />
                ) : (
                  <svg width="46" height="46" fill="#059669" viewBox="0 0 256 256" style={{ margin: "0 auto" }}>
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM160,128a8,8,0,0,1-4.06,6.91l-48,28A8,8,0,0,1,96,156V100a8,8,0,0,1,11.94-6.91l48,28A8,8,0,0,1,160,128Z"></path>
                  </svg>
                )}
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 800, color: "#064e3b", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {schSub || "Madrasah Tahfidz Quran"}
                </div>
              </div>

              <div style={{ position: "relative", zIndex: 10, width: "100%", textAlign: "center", flexGrow: 1 }}>
                <div style={{ fontFamily: "'Katibeh', serif", fontSize: "42px", color: "#059669", marginBottom: "8px", whiteSpace: "nowrap", lineHeight: 1 }}>بَارَكَ اللَّهُ فِيكَ</div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#64748b", margin: "0 0 6px 0", whiteSpace: "nowrap" }}>Kepada:</p>
                <h1 style={{ fontFamily: "'Merriweather', serif", fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.2, width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {siswas.find((x) => x.id === subs.find((s) => s.id === modalData)?.siswaId)?.name || "-"}
                </h1>
              </div>

              <div style={{ position: "relative", zIndex: 10, background: "#ffffff", border: "2px solid #10b981", borderRadius: "20px", padding: "20px", width: "100%", textAlign: "center", flexShrink: 0, boxSizing: "border-box", marginBottom: "24px" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px 0", whiteSpace: "nowrap" }}>Telah Menyetorkan</p>
                <h3 style={{ fontFamily: "'Merriweather', serif", fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {surahs.find((x) => x.id === subs.find((s) => s.id === modalData)?.surahId)?.title || "-"}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#64748b", margin: "0 0 16px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {segs.find((x) => x.id === subs.find((s) => s.id === modalData)?.segmentId)?.title || "-"}
                </p>

                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
                  <div style={{ textAlign: "left", maxWidth: "48%", overflow: "hidden" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>Nilai Akhir</span>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 800, color: "#059669", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {subs.find((s) => s.id === modalData)?.grade} / {getPredikat(subs.find((s) => s.id === modalData)?.grade || "")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", maxWidth: "48%", overflow: "hidden" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px", whiteSpace: "nowrap" }}>Tanggal Lulus</span>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {subs.find((s) => s.id === modalData)?.date}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  <span style={{ color: "#1e293b" }}>Tahfidz</span><span style={{ color: "#10b981" }}>Qu</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-[360px] shrink-0 mt-2">
              <div className="flex gap-2.5">
                <button
                  onClick={shareCard}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl font-bold text-xs flex justify-center items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 active:scale-95"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Share2 size={18} />} Share
                </button>
                <button
                  onClick={downloadCard}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex justify-center items-center gap-2 hover:bg-slate-50 transition-colors active:scale-95 dark:bg-[#15241e] dark:border-[#1a2e26] dark:text-gray-200 dark:hover:bg-[#111c1d] shadow-sm"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Download size={18} />} Download
                </button>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 text-slate-500 font-bold text-xs hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
