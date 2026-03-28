"use client";

import { useAppStore } from "@/lib/store";
import {
  Search,
  Database,
  Image as ImageIcon,
  Type,
  GraduationCap,
  Upload,
  Plus,
  User,
  IdCard,
  MessageCircle,
  Edit2,
  Trash2,
  Users,
  UserCircle,
} from "lucide-react";

export default function MasterView() {
  const {
    adminLvl,
    loggedInUstadzId,
    ustadz,
    halaqohs,
    siswas,
    hierSel,
    search,
    searchSiswa,
    schLogo,
    schSub,
    updateState,
    dbSave,
    dbDelete,
    showConfirm,
    showAlert,
  } = useAppStore();

  const isSuper = adminLvl === 1;

  // Enforce logged-in ustadz if adminLvl === 2
  if (adminLvl === 2 && !hierSel.u) {
    updateState({ hierSel: { ...hierSel, u: loggedInUstadzId } });
  }

  const sQ = search.toLowerCase();
  const sQSiswa = (searchSiswa || "").toLowerCase();

  let ul = adminLvl === 2 ? ustadz.filter((x) => x.id == loggedInUstadzId) : ustadz;
  if (sQ) {
    ul = ul.filter((u) => u.name.toLowerCase().includes(sQ) || u.username.toLowerCase().includes(sQ));
  }

  let hl = sQ
    ? halaqohs.filter((h) => h.name.toLowerCase().includes(sQ))
    : hierSel.u
    ? halaqohs.filter((h) => h.ustadzId == hierSel.u)
    : [];

  let sl = sQ || sQSiswa
    ? siswas.filter(
        (s) =>
          s.name.toLowerCase().includes(sQ || sQSiswa) ||
          s.kelas.toLowerCase().includes(sQ || sQSiswa)
      )
    : hierSel.h
    ? siswas.filter((s) => s.halaqohId == hierSel.h)
    : [];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 102400) {
        showAlert("Ukuran file terlalu besar! (Maks 100KB)");
        e.target.value = "";
        return;
      }
      const r = new FileReader();
      r.onload = (ev) => {
        try {
          const result = ev.target?.result as string;
          updateState({ schLogo: result });
          localStorage.setItem("tahfidzqu_logo", result);
          dbSave("settings", "app", { logo: result, subtitle: schSub });
        } catch (err) {
          showAlert("Gagal menyimpan logo.");
        }
      };
      r.readAsDataURL(f);
    }
  };

  const removeLogo = () => {
    updateState({ schLogo: "" });
    try {
      localStorage.removeItem("tahfidzqu_logo");
    } catch (e) {}
    dbSave("settings", "app", { logo: "", subtitle: schSub });
  };

  const saveSchoolSubtitle = () => {
    try {
      localStorage.setItem("tahfidzqu_subtitle", schSub);
    } catch (e) {}
    dbSave("settings", "app", { logo: schLogo, subtitle: schSub });
    showAlert("Nama Sekolah berhasil disimpan.");
  };

  const confirmDelete = (type: string, id: number) => {
    showConfirm("Yakin ingin menghapus data ini secara permanen dari Cloud?", () => {
      if (type === "ustadz") {
        updateState({
          ustadz: ustadz.filter((x) => x.id !== id),
          hierSel: hierSel.u == id ? { ...hierSel, u: null, h: null } : hierSel,
        });
        dbDelete("ustadz", id);
      }
      if (type === "halaqoh") {
        updateState({
          halaqohs: halaqohs.filter((x) => x.id !== id),
          hierSel: hierSel.h == id ? { ...hierSel, h: null } : hierSel,
        });
        dbDelete("halaqohs", id);
      }
      if (type === "siswa") {
        updateState({ siswas: siswas.filter((x) => x.id !== id) });
        dbDelete("siswas", id);
      }
    });
  };

  return (
    <div id="main-scroll" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 min-h-0">
      <div className="max-w-7xl mx-auto w-full">
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
            <input
              type="text"
              placeholder="Cari Ustadz / Halaqoh / Santri..."
              value={search}
              onChange={(e) => updateState({ search: e.target.value })}
              className="input-std !w-full !rounded-full !pl-12 py-3.5 shadow-sm"
            />
          </div>
        </div>

        <div className="mb-6 lg:mb-8 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-purple-600 dark:text-purple-500 mb-1 md:mb-2 flex items-center gap-2">
              <Database className="w-8 h-8 md:w-10 md:h-10" /> Data Master
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400">
              Atur hierarki aplikasi dan kelola pengguna.
            </p>
          </div>
        </div>

        {isSuper && (
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6 mb-8 shrink-0">
            <div className="card-std !h-auto !p-4 flex flex-row items-center gap-4 w-full md:w-auto shadow-sm">
              {schLogo ? (
                <img
                  src={schLogo}
                  alt="Logo"
                  className="h-12 w-12 rounded-xl object-contain bg-white dark:bg-[#0a120f] p-1 shadow-sm"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ImageIcon size={24} />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-bold text-emerald-600 mb-1.5 uppercase tracking-widest">
                  Logo Sekolah
                </p>
                <input
                  type="file"
                  id="aup"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById("aup")?.click()}
                    className="flex-1 md:flex-none text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl dark:bg-[#15241e] dark:border-[#1a2e26] dark:text-gray-300 transition shadow-sm truncate"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2.5 rounded-xl dark:bg-red-900/20 transition truncate"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            <div className="card-std !h-auto !p-4 flex flex-row items-center gap-4 flex-1 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <Type size={24} />
              </div>
              <div className="flex-1 w-full overflow-hidden">
                <p className="text-[10px] font-bold text-blue-600 mb-1.5 uppercase tracking-widest">
                  Nama Sekolah
                </p>
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={schSub}
                    onChange={(e) => updateState({ schSub: e.target.value })}
                    className="input-std !bg-slate-50 dark:!bg-[#0a120f] !border-transparent !py-2.5 !px-4 !rounded-xl text-sm font-medium flex-1 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={saveSchoolSubtitle}
                    className="btn-std !w-auto !py-2.5 !px-6 !text-xs !rounded-xl uppercase tracking-widest shadow-md shrink-0"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1 pb-10">
          {/* COLUMN 1: USTADZ */}
          <div className="bg-white dark:bg-[#15241e] border border-slate-200 dark:border-[#1a2e26] rounded-[2rem] flex flex-col h-[500px] lg:h-[700px] shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#1a2e26] flex justify-between items-center bg-slate-50 dark:bg-[#0a120f] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white leading-tight">
                    Ustadz/ah
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">{ul.length} Data</p>
                </div>
              </div>
              {isSuper && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateState({ modal: "import_ustadz" })}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition shadow-sm active:scale-95 text-lg dark:bg-[#15241e] dark:hover:bg-purple-900/30"
                    title="Import Spreadsheet"
                  >
                    <Upload size={18} />
                  </button>
                  <button
                    onClick={() => updateState({ modal: "ustadz", modalData: null })}
                    className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition shadow-md shadow-purple-500/30 active:scale-95"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {!ul.length ? (
                <div className="text-xs text-slate-500 italic p-6 text-center border border-dashed border-slate-200 dark:border-[#1a2e26] rounded-2xl">
                  {sQ ? "Tidak ditemukan." : "Belum ada data."}
                </div>
              ) : (
                ul.map((u) => {
                  const isAct = hierSel.u === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() =>
                        updateState({
                          hierSel: { ...hierSel, u: u.id, h: null },
                          search: "",
                          searchSiswa: "",
                        })
                      }
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isAct
                          ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/30 scale-[1.02]"
                          : "bg-white hover:bg-slate-50 dark:bg-[#0a120f] border-slate-100 dark:border-[#1a2e26] hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isAct ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 dark:bg-[#15241e]"
                          }`}
                        >
                          <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm font-bold block truncate transition-colors ${
                              isAct ? "text-white" : "text-slate-800 dark:text-white"
                            }`}
                          >
                            {u.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono mt-0.5 flex items-center gap-1.5 transition-colors ${
                              isAct ? "text-purple-100" : "text-slate-400"
                            }`}
                          >
                            <IdCard size={14} /> {u.username}
                            {u.phone && (
                              <>
                                {" "}
                                &bull; <MessageCircle size={14} className="text-emerald-400" /> {u.phone}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      {isSuper && (
                        <div
                          className={`flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isAct ? "opacity-100" : ""
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateState({ modal: "ustadz", modalData: u.id });
                            }}
                            className={`p-2 rounded-xl transition-colors ${
                              isAct ? "text-white hover:bg-white/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-[#15241e]"
                            } hover:text-blue-500`}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete("ustadz", u.id);
                            }}
                            className={`p-2 rounded-xl transition-colors ${
                              isAct ? "text-white hover:bg-white/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-[#15241e]"
                            } hover:text-red-500`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: HALAQOH */}
          <div className="bg-white dark:bg-[#15241e] border border-slate-200 dark:border-[#1a2e26] rounded-[2rem] flex flex-col h-[500px] lg:h-[700px] shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#1a2e26] flex justify-between items-center bg-slate-50 dark:bg-[#0a120f] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white leading-tight">
                    Halaqoh
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">{hl.length} Data</p>
                </div>
              </div>
              {adminLvl > 0 && hierSel.u && !sQ && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateState({ modal: "import_halaqoh" })}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition shadow-sm active:scale-95 text-lg dark:bg-[#15241e] dark:hover:bg-blue-900/30"
                    title="Import CSV"
                  >
                    <Upload size={18} />
                  </button>
                  <button
                    onClick={() => updateState({ modal: "halaqoh", modalData: null })}
                    className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition shadow-md shadow-blue-500/30 active:scale-95"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {!hierSel.u && !sQ ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <GraduationCap className="w-12 h-12 mb-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                    Pilih Ustadz/ah<br />terlebih dahulu
                  </p>
                </div>
              ) : !hl.length ? (
                <div className="text-xs text-slate-500 italic p-6 text-center border border-dashed border-slate-200 dark:border-[#1a2e26] rounded-2xl">
                  {sQ ? "Tidak ditemukan." : "Belum ada data."}
                </div>
              ) : (
                hl.map((h) => {
                  const isAct = hierSel.h === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() =>
                        updateState({
                          hierSel: { ...hierSel, h: h.id },
                          search: "",
                          searchSiswa: "",
                        })
                      }
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isAct
                          ? "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/30 scale-[1.02]"
                          : "bg-white hover:bg-slate-50 dark:bg-[#0a120f] border-slate-100 dark:border-[#1a2e26] hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isAct ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 dark:bg-[#15241e]"
                          }`}
                        >
                          <Users size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm font-bold block truncate transition-colors ${
                              isAct ? "text-white" : "text-slate-800 dark:text-white"
                            }`}
                          >
                            {h.name}
                          </span>
                        </div>
                      </div>
                      {adminLvl > 0 && (
                        <div
                          className={`flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isAct ? "opacity-100" : ""
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateState({ modal: "halaqoh", modalData: h.id });
                            }}
                            className={`p-2 rounded-xl transition-colors ${
                              isAct ? "text-white hover:bg-white/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-[#15241e]"
                            } hover:text-purple-500`}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete("halaqoh", h.id);
                            }}
                            className={`p-2 rounded-xl transition-colors ${
                              isAct ? "text-white hover:bg-white/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-[#15241e]"
                            } hover:text-red-500`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 3: SANTRI */}
          <div className="bg-white dark:bg-[#15241e] border border-slate-200 dark:border-[#1a2e26] rounded-[2rem] flex flex-col h-[500px] lg:h-[700px] shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#1a2e26] flex flex-col gap-4 bg-slate-50 dark:bg-[#0a120f] shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight">
                      Santri
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{sl.length} Data</p>
                  </div>
                </div>
                {adminLvl > 0 && hierSel.h && !sQ && !sQSiswa && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => updateState({ modal: "import_siswa" })}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition shadow-sm active:scale-95 text-lg dark:bg-[#15241e] dark:hover:bg-emerald-900/30"
                      title="Import CSV"
                    >
                      <Upload size={18} />
                    </button>
                    <button
                      onClick={() => updateState({ modal: "siswa", modalData: null })}
                      className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition shadow-md shadow-emerald-500/30 active:scale-95"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama atau kelas..."
                  value={searchSiswa}
                  onChange={(e) => updateState({ searchSiswa: e.target.value })}
                  className="w-full bg-white dark:bg-[#15241e] border border-slate-200 dark:border-[#1a2e26] rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-colors shadow-sm text-slate-700 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {!hierSel.h && !sQ && !sQSiswa ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <Users className="w-12 h-12 mb-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                    Pilih Halaqoh<br />terlebih dahulu
                  </p>
                </div>
              ) : !sl.length ? (
                <div className="text-xs text-slate-500 italic p-6 text-center border border-dashed border-slate-200 dark:border-[#1a2e26] rounded-2xl">
                  {sQ || sQSiswa ? "Tidak ditemukan." : "Belum ada data."}
                </div>
              ) : (
                sl.map((es) => (
                  <div
                    key={es.id}
                    className="group flex items-center justify-between p-3.5 rounded-2xl border bg-white dark:bg-[#0a120f] border-slate-100 dark:border-[#1a2e26] hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-[#15241e] dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <User size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold block truncate text-slate-800 dark:text-white">
                          {es.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                          Kelas {es.kelas}
                        </span>
                      </div>
                    </div>
                    {adminLvl > 0 && (
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => updateState({ modal: "siswa", modalData: es.id })}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-[#15241e] transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete("siswa", es.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-[#15241e] transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
