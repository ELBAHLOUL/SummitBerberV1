/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Home, 
  PlusCircle, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  Compass, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Search, 
  Trash2, 
  FileText, 
  Image, 
  Upload, 
  MapPin, 
  Smartphone, 
  Code2, 
  RefreshCw, 
  Wifi, 
  Battery, 
  AlertTriangle,
  X,
  FileDown
} from "lucide-react";
import { TrailReport, ImageItem } from "./types";
import { parseGpxText, generateSampleGpx } from "./utils/gpxParser";
import { generateReportWebPdf } from "./utils/pdfGenerator";
import AndroidCodeExplorer from "./components/AndroidCodeExplorer";

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulator" | "code">("simulator");
  const [reports, setReports] = useState<TrailReport[]>([]);
  
  // Mobile App State
  const [mobileScreen, setMobileScreen] = useState<"home" | "create" | "history" | "settings">("home");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Create Screen State
  const [formTitle, setFormTitle] = useState("");
  const [formPark, setFormPark] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDistance, setFormDistance] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formElevation, setFormElevation] = useState("");
  const [formGpxFileName, setFormGpxFileName] = useState<string | null>(null);
  const [formGpxData, setFormGpxData] = useState<any | null>(null);
  const [formImages, setFormImages] = useState<ImageItem[]>([]);
  const [formIsDraft, setFormIsDraft] = useState(true);

  // History Screen State
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"All" | "Drafts" | "Completed">("All");

  // AdMob Simulation State
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialCallback, setInterstitialCallback] = useState<(() => void) | null>(null);

  // Initial Seed & Data Fetching
  useEffect(() => {
    const saved = localStorage.getItem("summitberber_reports");
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      // Seed some dummy items for great demonstration
      const initialReports: TrailReport[] = [
        {
          id: 1,
          title: "Mount Toubkal High Summit Check",
          park: "Toubkal National Park",
          description: "Conducted assessment of the southern route. Heavy scree above the refuge. Refuges are fully operational. Wind speeds were high but clear skies overall. Snow patches remaining near the summit pass, crampons optional but recommended early morning.",
          distance: 14.2,
          duration: "06:45",
          elevationGain: 1250,
          gpxFileName: "toubkal_summit.gpx",
          gpxData: {
            points: [],
            elevationProfile: [3200, 3280, 3350, 3420, 3500, 3620, 3750, 3890, 4010, 4167, 4010, 3800, 3600, 3400, 3200]
          },
          images: [
            { id: "img-toubkal-1", dataUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80", caption: "High rocky pass leading to the summit peak." }
          ],
          timestamp: Date.now() - 3600000 * 24, // 1 day ago
          isDraft: false
        },
        {
          id: 2,
          title: "Aït Bouguemez Ridge Survey",
          park: "M'Goun Geopark",
          description: "Checking route stability along the northern approach. Trail is clear, small mudslides near the riverbed, but ridge paths are stable.",
          distance: 18.5,
          duration: "08:15",
          elevationGain: 980,
          gpxFileName: "mgoun_ridge.gpx",
          gpxData: null,
          images: [],
          timestamp: Date.now() - 3600000 * 48, // 2 days ago
          isDraft: true
        }
      ];
      localStorage.setItem("summitberber_reports", JSON.stringify(initialReports));
      setReports(initialReports);
    }
  }, []);

  // Save current report to LocalStorage
  const saveReport = (draft: boolean) => {
    const isNew = editingId === null;
    const reportId = isNew ? Date.now() : editingId!;
    
    const newReport: TrailReport = {
      id: reportId,
      title: formTitle || "Unnamed Trail",
      park: formPark || "General Mountain Area",
      description: formDescription,
      distance: parseFloat(formDistance) || 0,
      duration: formDuration || "00:00",
      elevationGain: parseInt(formElevation) || 0,
      gpxFileName: formGpxFileName,
      gpxData: formGpxData,
      images: formImages,
      timestamp: Date.now(),
      isDraft: draft
    };

    let updatedList: TrailReport[] = [];
    if (isNew) {
      updatedList = [newReport, ...reports];
    } else {
      updatedList = reports.map(r => r.id === editingId ? newReport : r);
    }

    localStorage.setItem("summitberber_reports", JSON.stringify(updatedList));
    setReports(updatedList);

    // Trigger AdMob Interstitial Ad simulation before navigating away!
    triggerInterstitial(() => {
      // Clear forms
      resetForm();
      setMobileScreen("history");
    });
  };

  const handleFinalizeAndPdf = () => {
    const tempReport: TrailReport = {
      id: editingId || Date.now(),
      title: formTitle || "Unnamed Trail",
      park: formPark || "General Mountain Area",
      description: formDescription,
      distance: parseFloat(formDistance) || 0,
      duration: formDuration || "00:00",
      elevationGain: parseInt(formElevation) || 0,
      gpxFileName: formGpxFileName,
      gpxData: formGpxData,
      images: formImages,
      timestamp: Date.now(),
      isDraft: false
    };

    // Export PDF locally
    generateReportWebPdf(tempReport);

    // Save as Completed
    saveReport(false);
  };

  const triggerInterstitial = (onCloseCallback: () => void) => {
    setInterstitialCallback(() => onCloseCallback);
    setShowInterstitial(true);
  };

  const handleCloseInterstitial = () => {
    setShowInterstitial(false);
    if (interstitialCallback) {
      interstitialCallback();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormPark("");
    setFormDescription("");
    setFormDistance("");
    setFormDuration("");
    setFormElevation("");
    setFormGpxFileName(null);
    setFormGpxData(null);
    setFormImages([]);
    setFormIsDraft(true);
  };

  const handleEditReport = (report: TrailReport) => {
    setEditingId(report.id);
    setFormTitle(report.title);
    setFormPark(report.park);
    setFormDescription(report.description);
    setFormDistance(report.distance.toString());
    setFormDuration(report.duration);
    setFormElevation(report.elevationGain.toString());
    setFormGpxFileName(report.gpxFileName);
    setFormGpxData(report.gpxData);
    setFormImages(report.images);
    setFormIsDraft(report.isDraft);
    
    setMobileScreen("create");
  };

  const handleDeleteReport = (id: number) => {
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem("summitberber_reports", JSON.stringify(filtered));
    setReports(filtered);
    if (mobileScreen === "create" && editingId === id) {
      resetForm();
      setMobileScreen("history");
    }
  };

  // GPX Preset Loader
  const loadGpxPreset = (type: "toubkal" | "mgoun" | "gorge") => {
    const result = generateSampleGpx(type);
    const parsed = parseGpxText(result.content);
    
    setFormGpxFileName(result.filename);
    setFormGpxData({
      points: parsed.points,
      elevationProfile: parsed.elevationProfile
    });
    setFormDistance(parsed.distance.toString());
    setFormElevation(parsed.elevationGain.toString());
    
    // Set matching details for immersive feeling
    if (type === "toubkal") {
      setFormTitle("Mount Toubkal Summit Assessment");
      setFormPark("Toubkal National Park");
      setFormDuration("06:30");
    } else if (type === "mgoun") {
      setFormTitle("M'Goun Crest Hike & Safety Survey");
      setFormPark("Central High Atlas Range");
      setFormDuration("08:15");
    } else if (type === "gorge") {
      setFormTitle("Todra Gorge Climbing Route Audit");
      setFormPark("Todra Canyon Provincial Reserve");
      setFormDuration("04:00");
    }
  };

  // Image upload simulator
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newItem: ImageItem = {
          id: `img-${Date.now()}`,
          dataUrl: reader.result as string,
          caption: ""
        };
        setFormImages([...formImages, newItem]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateImageCaption = (imageId: string, caption: string) => {
    setFormImages(formImages.map(img => img.id === imageId ? { ...img, caption } : img));
  };

  const handleRemoveImage = (imageId: string) => {
    setFormImages(formImages.filter(img => img.id !== imageId));
  };

  const clearCache = () => {
    localStorage.removeItem("summitberber_reports");
    setReports([]);
    resetForm();
    alert("Database cache cleared! Reseeded templates.");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F7FBF0] text-[#1B1C17] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Professional Header Bar */}
      <header className="bg-white border-b border-[#E1E4D5] px-6 py-4 flex flex-col md:flex-row items-center justify-between shadow-sm shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#F1F3E8] rounded-xl text-[#2E7D32] border border-[#E1E4D5]">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#1B1C17] uppercase">SummitBerber</span>
              <span className="bg-[#EBF3E7] text-[#2E7D32] border border-[#D0E2C8] text-[10px] px-2 py-0.5 rounded-full font-bold">V1</span>
            </div>
            <p className="text-xs text-[#5D624E] font-medium">Professional Alpine Safety & Metric Compiler Workspace</p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex bg-[#F1F3E8] p-1.5 rounded-xl border border-[#E1E4D5]">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === "simulator"
                ? "bg-[#2E7D32] text-white shadow"
                : "text-[#5D624E] hover:text-[#1B1C17]"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === "code"
                ? "bg-[#2E7D32] text-white shadow"
                : "text-[#5D624E] hover:text-[#1B1C17]"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Native Android Code</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#F7FBF0] p-4 lg:p-6 gap-6 overflow-y-auto">
        
        {/* Active Tab Logic */}
        {activeTab === "code" ? (
          <div className="w-full">
            <AndroidCodeExplorer />
          </div>
        ) : (
          <>
            {/* Left Workspace Panel: Guidelines & GPX Preset Loader */}
            <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 select-text">
              
              {/* Alpine Guidelines Card */}
              <section className="bg-white border border-[#E1E4D5] rounded-[28px] p-5 shadow-sm">
                <h2 className="text-sm font-bold uppercase text-[#5D624E] tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                  Guide Scope of Work
                </h2>
                <p className="text-xs text-[#5D624E] leading-relaxed mb-4">
                  In mountaineering and alpine leading, documenting route hazards and track logistics is mandatory. Use this offline environment to capture field audits.
                </p>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-[#F1F3E8] p-3 rounded-xl border border-[#E1E4D5]">
                    <span className="text-[10px] text-[#5D624E] font-bold uppercase">Database</span>
                    <p className="text-xs text-[#1B1C17] font-semibold mt-0.5">SQLite (Room)</p>
                  </div>
                  <div className="bg-[#F1F3E8] p-3 rounded-xl border border-[#E1E4D5]">
                    <span className="text-[10px] text-[#5D624E] font-bold uppercase">Engine</span>
                    <p className="text-xs text-[#1B1C17] font-semibold mt-0.5">PdfDocument</p>
                  </div>
                </div>
              </section>

              {/* Interactive GPX Route Presets (For Sandbox Testing) */}
              <section className="bg-white border border-[#E1E4D5] rounded-[28px] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold uppercase text-[#5D624E] tracking-wider">
                    Sandbox GPX Generator
                  </h2>
                  <span className="text-[10px] bg-[#EBF3E7] text-[#2E7D32] border border-[#D0E2C8] px-1.5 py-0.5 rounded font-mono font-bold">Local</span>
                </div>
                <p className="text-xs text-[#5D624E] leading-relaxed mb-4">
                  Simulate field coordinate inputs. Clicking a preset generates trail metrics and elevations automatically.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      loadGpxPreset("toubkal");
                      setMobileScreen("create");
                    }}
                    className="w-full bg-[#F1F3E8] hover:bg-[#EBF3E7] border border-[#E1E4D5] hover:border-[#D0E2C8] p-3 rounded-xl transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1B1C17] group-hover:text-[#2E7D32] transition-colors">Mount Toubkal Summit</p>
                      <p className="text-[10px] text-[#5D624E] font-mono mt-0.5">Elevation: 4,167m | Range: High Atlas</p>
                    </div>
                    <span className="text-[10px] text-[#2E7D32] bg-white border border-[#E1E4D5] px-2 py-0.5 rounded-full font-bold">14.2 km</span>
                  </button>

                  <button
                    onClick={() => {
                      loadGpxPreset("mgoun");
                      setMobileScreen("create");
                    }}
                    className="w-full bg-[#F1F3E8] hover:bg-[#EBF3E7] border border-[#E1E4D5] hover:border-[#D0E2C8] p-3 rounded-xl transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1B1C17] group-hover:text-[#2E7D32] transition-colors">M'Goun Ridge Traversing</p>
                      <p className="text-[10px] text-[#5D624E] font-mono mt-0.5">Elevation: 4,068m | Ridge Climb</p>
                    </div>
                    <span className="text-[10px] text-[#2E7D32] bg-white border border-[#E1E4D5] px-2 py-0.5 rounded-full font-bold">18.5 km</span>
                  </button>

                  <button
                    onClick={() => {
                      loadGpxPreset("gorge");
                      setMobileScreen("create");
                    }}
                    className="w-full bg-[#F1F3E8] hover:bg-[#EBF3E7] border border-[#E1E4D5] hover:border-[#D0E2C8] p-3 rounded-xl transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1B1C17] group-hover:text-[#2E7D32] transition-colors">Todra Gorge Safety Circuit</p>
                      <p className="text-[10px] text-[#5D624E] font-mono mt-0.5">Elevation: 1,950m | Canyon Check</p>
                    </div>
                    <span className="text-[10px] text-[#2E7D32] bg-white border border-[#E1E4D5] px-2 py-0.5 rounded-full font-bold">8.0 km</span>
                  </button>
                </div>
              </section>

              {/* File Workspace Sync Details */}
              <section className="bg-[#E1E4D5]/30 border border-[#E1E4D5] rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                <div className="text-xs text-[#5D624E]">
                  <span className="font-semibold text-[#1B1C17] block mb-0.5">Offline-First Execution</span>
                  All changes made inside the phone simulator are persisted locally to the browser's Sandbox workspace. Exporting the project files maintains complete alignment.
                </div>
              </section>

            </div>

            {/* Right Panel: Simulated Material 3 Android Device Container */}
            <div className="flex-1 flex items-center justify-center">
              
              {/* Realistic Android Phone Chassis Frame */}
              <div className="relative w-[375px] h-[750px] bg-stone-950 rounded-[48px] p-3 shadow-[0_0_80px_rgba(0,0,0,0.8)] border-[6px] border-stone-800 flex flex-col overflow-hidden select-none">
                
                {/* Simulated Top Speaker & Punch Hole Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-950 rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-12 h-1 bg-stone-800 rounded-full mb-1"></div>
                  <div className="absolute right-6 top-1 w-2.5 h-2.5 bg-zinc-900 border border-zinc-800 rounded-full"></div>
                </div>

                {/* Simulated Left Chassis Volume Buttons */}
                <div className="absolute left-[-6px] top-32 w-[6px] h-12 bg-stone-800 rounded-l-md"></div>
                <div className="absolute left-[-6px] top-48 w-[6px] h-12 bg-stone-800 rounded-l-md"></div>

                {/* Simulated Right Chassis Power Button */}
                <div className="absolute right-[-6px] top-40 w-[6px] h-16 bg-stone-800 rounded-r-md"></div>

                {/* Simulated Bottom Navigation Bar Indicator Notch */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-stone-400/60 rounded-full z-50"></div>

                {/* Inner Device Screen */}
                <div className="flex-1 bg-[#F7FBF0] rounded-[36px] overflow-hidden flex flex-col relative pt-5 pb-3">
                  
                  {/* Android Top Status Bar */}
                  <div className="bg-[#2E7D32] px-5 py-1 text-white text-[10px] font-mono font-semibold flex items-center justify-between select-none">
                    <span>10:30 AM</span>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      <span>LTE</span>
                      <Battery className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>

                  {/* SCREEN CONTAINER WITH SCROLLING AND PERSISTENCE */}
                  <div className="flex-1 overflow-y-auto pb-14">
                    
                    {/* HOME SCREEN */}
                    {mobileScreen === "home" && (
                      <div className="p-4">
                        <p className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider mb-0.5">Guide Dashboard</p>
                        <h1 className="text-2xl font-black text-[#1B1C17] tracking-tight">Hello, Guide!</h1>
                        <p className="text-[11px] text-[#5D624E] leading-relaxed mt-1">
                          Standardise trail safety logs and compile official A4 PDFs offline.
                        </p>

                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-white p-3 rounded-2xl border border-[#E1E4D5] shadow-sm">
                            <span className="text-[9px] text-[#5D624E] font-extrabold uppercase tracking-wide">Total Reports</span>
                            <p className="text-xl font-bold text-[#1B1C17] mt-1">{reports.length}</p>
                          </div>
                          <div className="bg-white p-3 rounded-2xl border border-[#E1E4D5] shadow-sm">
                            <span className="text-[9px] text-[#5D624E] font-extrabold uppercase tracking-wide">Completed</span>
                            <p className="text-xl font-bold text-[#1B1C17] mt-1">{reports.filter(r => !r.isDraft).length}</p>
                          </div>
                        </div>

                        {/* BIG HERO CTA BUTTON */}
                        <button
                          onClick={() => {
                            resetForm();
                            setMobileScreen("create");
                          }}
                          className="w-full bg-[#2E7D32] hover:bg-[#256329] active:bg-[#1e5221] text-white p-4 rounded-2xl mt-5 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <PlusCircle className="w-5 h-5" />
                          <span className="font-bold text-sm tracking-wide">Start New Report</span>
                        </button>

                        {/* Recent Activities Section */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between pb-2 border-b border-[#E1E4D5]">
                            <span className="text-xs font-bold text-[#1B1C17] uppercase tracking-wider">Recent Activities</span>
                            <button
                              onClick={() => setMobileScreen("history")}
                              className="text-[11px] font-semibold text-[#2E7D32] hover:underline cursor-pointer"
                            >
                              View All
                            </button>
                          </div>

                          <div className="mt-3 space-y-2.5">
                            {reports.length === 0 ? (
                              <p className="text-[#5D624E] text-xs text-center py-6">No reports captured yet.</p>
                            ) : (
                              reports.slice(0, 2).map(r => (
                                <div
                                  key={r.id}
                                  onClick={() => handleEditReport(r)}
                                  className="bg-white p-3 rounded-xl border border-[#E1E4D5] hover:border-[#2E7D32]/40 transition-all flex items-center justify-between cursor-pointer shadow-sm"
                                >
                                  <div className="min-w-0 flex-1 pr-3">
                                    <h3 className="text-xs font-bold text-[#1B1C17] truncate">{r.title}</h3>
                                    <p className="text-[10px] text-[#5D624E] truncate mt-0.5">{r.park}</p>
                                  </div>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                    r.isDraft 
                                      ? "bg-amber-50 text-amber-800 border border-amber-100" 
                                      : "bg-emerald-50 text-[#2E7D32] border border-emerald-100"
                                  }`}>
                                    {r.isDraft ? "Draft" : "Finalized"}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CREATE/EDIT SCREEN */}
                    {mobileScreen === "create" && (
                      <div className="p-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D5] mb-4">
                          <h1 className="text-base font-bold text-[#2E7D32]">
                            {editingId === null ? "New Assessment" : "Edit Assessment"}
                          </h1>
                          <button
                            onClick={() => {
                              resetForm();
                              setMobileScreen("home");
                            }}
                            className="p-1 hover:bg-[#E1E4D5] rounded-full cursor-pointer text-[#5D624E]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* General Info Section */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#5D624E] uppercase tracking-wider">Trail Title</label>
                            <input
                              type="text"
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="e.g. Mount Toubkal High Summit Check"
                              className="w-full bg-white border border-[#E1E4D5] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-[#1B1C17] placeholder-[#5D624E]/50 shadow-inner"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#5D624E] uppercase tracking-wider">Park / Region</label>
                            <input
                              type="text"
                              value={formPark}
                              onChange={(e) => setFormPark(e.target.value)}
                              placeholder="e.g. Toubkal National Park"
                              className="w-full bg-white border border-[#E1E4D5] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-[#1B1C17] placeholder-[#5D624E]/50 shadow-inner"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#5D624E] uppercase tracking-wider">Description & Safety Notes</label>
                            <textarea
                              value={formDescription}
                              onChange={(e) => setFormDescription(e.target.value)}
                              placeholder="Describe route blockages, scree, pass conditions..."
                              rows={3}
                              className="w-full bg-white border border-[#E1E4D5] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-[#1B1C17] placeholder-[#5D624E]/50 shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Numerical Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <div>
                            <label className="text-[9px] font-bold text-[#5D624E] uppercase">Dist (km)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={formDistance}
                              onChange={(e) => setFormDistance(e.target.value)}
                              placeholder="0.0"
                              className="w-full bg-white border border-[#E1E4D5] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-[#1B1C17] shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-[#5D624E] uppercase">Time (H:M)</label>
                            <input
                              type="text"
                              value={formDuration}
                              onChange={(e) => setFormDuration(e.target.value)}
                              placeholder="00:00"
                              className="w-full bg-white border border-[#E1E4D5] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-[#1B1C17] shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-[#5D624E] uppercase">Gain (m)</label>
                            <input
                              type="number"
                              value={formElevation}
                              onChange={(e) => setFormElevation(e.target.value)}
                              placeholder="0"
                              className="w-full bg-white border border-[#E1E4D5] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-[#1B1C17] shadow-inner"
                            />
                          </div>
                        </div>

                        {/* GPX Track File Attachment Visualizer */}
                        <div className="mt-4">
                          <label className="text-[10px] font-bold text-[#5D624E] uppercase block mb-1">Track GPX Alignment</label>
                          <div className="bg-white border border-[#E1E4D5] rounded-xl p-3 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#2E7D32]" />
                              <div>
                                <p className="text-xs font-bold text-[#1B1C17] truncate max-w-[160px]">
                                  {formGpxFileName || "No GPX file attached"}
                                </p>
                                <p className="text-[9px] text-[#5D624E]">
                                  {formGpxFileName ? "Metrics synched successfully" : "Select presets from left bar"}
                                </p>
                              </div>
                            </div>
                            {formGpxFileName && (
                              <button
                                onClick={() => {
                                  setFormGpxFileName(null);
                                  setFormGpxData(null);
                                }}
                                className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Render beautiful SVG elevation profile chart if active */}
                          {formGpxData?.elevationProfile && (
                            <div className="bg-[#F1F3E8] border border-[#E1E4D5] rounded-xl p-3 mt-2.5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-extrabold text-[#2E7D32] uppercase">Elevation Profile (m)</span>
                                <span className="text-[9px] text-[#5D624E] font-semibold">{Math.max(...formGpxData.elevationProfile)}m Max</span>
                              </div>
                              <svg className="w-full h-14" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path
                                  d={`M 0 20 ${formGpxData.elevationProfile.map((ele: number, idx: number) => {
                                    const min = Math.min(...formGpxData.elevationProfile);
                                    const max = Math.max(...formGpxData.elevationProfile);
                                    const normalized = ele === min && ele === max ? 10 : 2 + 16 * (1 - (ele - min) / (max - min));
                                    return `L ${(idx / (formGpxData.elevationProfile.length - 1)) * 100} ${normalized}`;
                                  }).join(" ")} L 100 20 Z`}
                                  fill="rgba(46, 125, 50, 0.15)"
                                  stroke="#2E7D32"
                                  strokeWidth="1"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Image Captions Selection Grid */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-bold text-[#5D624E] uppercase">Field Photo Documentation</label>
                            <label className="text-[10px] font-bold text-[#2E7D32] hover:text-[#256329] flex items-center gap-1 cursor-pointer transition-colors">
                              <Upload className="w-3 h-3" />
                              <span>Add Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {formImages.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-[#E1E4D5] rounded-xl p-6 text-center text-xs text-[#5D624E]">
                              Upload images to document trail blockages or viewfinders.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {formImages.map((img) => (
                                <div key={img.id} className="bg-white border border-[#E1E4D5] rounded-xl p-1.5 relative group shadow-sm">
                                  <button
                                    onClick={() => handleRemoveImage(img.id)}
                                    className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black/80 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <img
                                    src={img.dataUrl}
                                    alt="Trail Upload"
                                    className="w-full h-20 object-cover rounded-lg"
                                  />
                                  <input
                                    type="text"
                                    value={img.caption}
                                    onChange={(e) => handleUpdateImageCaption(img.id, e.target.value)}
                                    placeholder="Type caption..."
                                    className="w-full mt-1.5 px-2 py-1 text-[10px] bg-[#F1F3E8] border border-[#E1E4D5] rounded-lg focus:outline-none text-[#1B1C17]"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons footer inside form */}
                        <div className="grid grid-cols-2 gap-3 mt-6">
                          <button
                            onClick={() => saveReport(true)}
                            className="bg-[#E1E4D5] hover:bg-[#ccd1bb] text-[#1B1C17] p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
                          >
                            Save Draft
                          </button>
                          <button
                            onClick={handleFinalizeAndPdf}
                            className="bg-[#2E7D32] hover:bg-[#256428] active:bg-[#1E5220] text-white p-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Finalize & PDF</span>
                          </button>
                        </div>

                        {editingId !== null && (
                          <button
                            onClick={() => handleDeleteReport(editingId)}
                            className="w-full mt-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Assessment</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* HISTORY SCREEN */}
                    {mobileScreen === "history" && (
                      <div className="p-4">
                        <h1 className="text-lg font-bold text-[#2E7D32]">Assessment History</h1>
                        
                        {/* Search Outlined input */}
                        <div className="relative mt-2">
                          <Search className="w-3.5 h-3.5 text-[#5D624E] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            placeholder="Search trail logs..."
                            className="w-full bg-white border border-[#E1E4D5] rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-[#1B1C17] placeholder-[#5D624E]/50 shadow-inner"
                          />
                        </div>

                        {/* Category Chips filter bar */}
                        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
                          {(["All", "Drafts", "Completed"] as const).map(tab => (
                            <button
                              key={tab}
                              onClick={() => setHistoryFilter(tab)}
                              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all border shrink-0 cursor-pointer ${
                                historyFilter === tab
                                  ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm"
                                  : "bg-white text-[#5D624E] border-[#E1E4D5] hover:bg-[#F1F3E8]"
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* List output */}
                        <div className="mt-4 space-y-2.5">
                          {reports.filter(r => {
                            const matchSearch = r.title.toLowerCase().includes(historySearch.toLowerCase()) || r.park.toLowerCase().includes(historySearch.toLowerCase());
                            const matchFilter = historyFilter === "All" || (historyFilter === "Drafts" && r.isDraft) || (historyFilter === "Completed" && !r.isDraft);
                            return matchSearch && matchFilter;
                          }).length === 0 ? (
                            <p className="text-[#5D624E] text-xs text-center py-10">No records match criteria.</p>
                          ) : (
                            reports
                              .filter(r => {
                                const matchSearch = r.title.toLowerCase().includes(historySearch.toLowerCase()) || r.park.toLowerCase().includes(historySearch.toLowerCase());
                                const matchFilter = historyFilter === "All" || (historyFilter === "Drafts" && r.isDraft) || (historyFilter === "Completed" && !r.isDraft);
                                return matchSearch && matchFilter;
                              })
                              .map(r => (
                                <div
                                  key={r.id}
                                  onClick={() => handleEditReport(r)}
                                  className="bg-white border border-[#E1E4D5] rounded-2xl p-4 hover:border-[#2E7D32]/50 transition-all cursor-pointer relative group shadow-sm"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1 pr-3">
                                      <h3 className="text-xs font-bold text-[#1B1C17] truncate">{r.title}</h3>
                                      <p className="text-[10px] text-[#5D624E] mt-0.5">{r.park}</p>
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                      r.isDraft 
                                        ? "bg-amber-50 text-amber-800 border border-amber-100" 
                                        : "bg-emerald-50 text-[#2E7D32] border border-emerald-100"
                                    }`}>
                                      {r.isDraft ? "Draft" : "Finalized"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F1F3E8]">
                                    <div>
                                      <span className="text-[8px] text-[#5D624E] font-bold uppercase block">Distance</span>
                                      <span className="text-xs font-bold text-[#1B1C17]">{r.distance} km</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-[#5D624E] font-bold uppercase block">Duration</span>
                                      <span className="text-xs font-bold text-[#1B1C17]">{r.duration}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-[#5D624E] font-bold uppercase block">Elevation</span>
                                      <span className="text-xs font-bold text-[#1B1C17]">{r.elevationGain} m</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* SETTINGS SCREEN */}
                    {mobileScreen === "settings" && (
                      <div className="p-4">
                        <h1 className="text-lg font-bold text-[#2E7D32]">Settings</h1>

                        <div className="mt-4 space-y-3">
                          
                          {/* About SummitBerber */}
                          <div className="bg-white rounded-xl p-3 border border-[#E1E4D5] shadow-sm">
                            <h3 className="text-xs font-bold text-[#2E7D32]">About SummitBerber V1</h3>
                            <p className="text-[10px] text-[#5D624E] mt-1 leading-relaxed">
                              SummitBerber V1 is a premium mountain productivity suite designed exclusively for mountain leaders to register trail damage, manage elevations, and compile offline safety reports.
                            </p>
                          </div>

                          {/* Export settings */}
                          <div className="bg-white rounded-xl p-3 border border-[#E1E4D5] shadow-sm">
                            <h3 className="text-xs font-bold text-[#1B1C17]">Storage Workspace</h3>
                            <p className="text-[10px] text-[#5D624E] mt-0.5 leading-relaxed">
                              Scoped Storage protocol operates locally inside private directory paths.
                            </p>
                          </div>

                          {/* Reset database */}
                          <button
                            onClick={clearCache}
                            className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 p-3 rounded-xl text-left text-xs font-bold transition-all block cursor-pointer shadow-sm"
                          >
                            Clear Local Cache
                            <span className="text-[9px] text-red-500/80 font-normal block mt-0.5">Cleans temporary PDF caches and thumbnail directories.</span>
                          </button>

                          <div className="text-center py-6">
                            <p className="text-[10px] text-[#5D624E] font-bold">SummitBerber Mobile Client</p>
                            <p className="text-[9px] text-[#5D624E] mt-0.5 font-semibold">Version 1.0 (Build 1) - Play Store Ready</p>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>

                  {/* ADMOB PERSISTENT BANNER AD PLACEMENT (Only on Home, History, and Settings) */}
                  {mobileScreen !== "create" && (
                    <div className="absolute bottom-14 left-0 w-full bg-[#F1F3E8] border-t border-[#E1E4D5] py-1 flex flex-col items-center justify-center z-40 select-none">
                      <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#5D624E] bg-white border border-[#E1E4D5] rounded px-1.5 uppercase leading-none scale-90 mb-0.5">
                        AdMob Test Ad
                      </div>
                      <div className="text-[9px] font-mono text-[#5D624E] font-bold text-center leading-none">
                        Banner: ca-app-pub-3940256099942544/6300978111
                      </div>
                    </div>
                  )}

                  {/* MATERIAL 3 DESIGN STANDARD NAVIGATION BOTTOM BAR */}
                  <div className="absolute bottom-0 left-0 w-full bg-[#F1F3E8] border-t border-[#E1E4D5] h-14 flex items-center justify-around z-50">
                    <button
                      onClick={() => setMobileScreen("home")}
                      className={`flex flex-col items-center gap-0.5 text-[#5D624E] hover:text-[#2E7D32] transition-colors cursor-pointer ${mobileScreen === "home" ? "text-[#2E7D32]" : ""}`}
                    >
                      <Home className="w-4.5 h-4.5" />
                      <span className="text-[8.5px] font-bold">Home</span>
                    </button>

                    <button
                      onClick={() => {
                        resetForm();
                        setMobileScreen("create");
                      }}
                      className={`flex flex-col items-center gap-0.5 text-[#5D624E] hover:text-[#2E7D32] transition-colors cursor-pointer ${mobileScreen === "create" ? "text-[#2E7D32]" : ""}`}
                    >
                      <PlusCircle className="w-4.5 h-4.5" />
                      <span className="text-[8.5px] font-bold">New Report</span>
                    </button>

                    <button
                      onClick={() => setMobileScreen("history")}
                      className={`flex flex-col items-center gap-0.5 text-[#5D624E] hover:text-[#2E7D32] transition-colors cursor-pointer ${mobileScreen === "history" ? "text-[#2E7D32]" : ""}`}
                    >
                      <HistoryIcon className="w-4.5 h-4.5" />
                      <span className="text-[8.5px] font-bold">History</span>
                    </button>

                    <button
                      onClick={() => setMobileScreen("settings")}
                      className={`flex flex-col items-center gap-0.5 text-[#5D624E] hover:text-[#2E7D32] transition-colors cursor-pointer ${mobileScreen === "settings" ? "text-[#2E7D32]" : ""}`}
                    >
                      <SettingsIcon className="w-4.5 h-4.5" />
                      <span className="text-[8.5px] font-bold">Settings</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </>
        )}

      </main>

      {/* SIMULATED ADMOB TEST INTERSTITIAL AD POPUP */}
      {showInterstitial && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 select-none animate-fade-in">
          <div className="bg-white rounded-[28px] w-full max-w-[340px] overflow-hidden shadow-2xl flex flex-col text-[#1B1C17] border border-[#E1E4D5]">
            
            {/* Header banner */}
            <div className="bg-[#2E7D32] p-4 flex items-center justify-between">
              <span className="text-[10px] bg-[#F1F3E8] text-[#2E7D32] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">AdMob Test Ad</span>
              <button
                onClick={handleCloseInterstitial}
                className="text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#F1F3E8] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E1E4D5]">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-[#1B1C17]">Google AdMob Interstitial Ad</h3>
              <p className="text-[11px] text-[#5D624E] font-mono mt-1.5">
                Unit ID: ca-app-pub-3940256099942544/1033173712
              </p>
              
              <div className="bg-[#F1F3E8] p-4 rounded-2xl border border-[#E1E4D5] mt-5 text-left space-y-2">
                <p className="text-xs text-[#1B1C17] font-medium">
                  This is a simulated <span className="font-bold text-[#2E7D32]">full-screen interstitial ad</span> loading after a natural user save/finalize action.
                </p>
                <p className="text-[10px] text-[#5D624E] leading-normal">
                  In production, the Android SDK pre-loads this asset in a separate thread so there is zero rendering delay on tap.
                </p>
              </div>
            </div>

            {/* Action footer */}
            <div className="p-4 bg-[#F1F3E8] border-t border-[#E1E4D5] flex justify-end">
              <button
                onClick={handleCloseInterstitial}
                className="bg-[#2E7D32] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:bg-[#256329] active:bg-[#1e5221] transition-all cursor-pointer"
              >
                Close Ad & Continue
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Bottom Status Notice */}
      <footer className="bg-[#F1F3E8] border-t border-[#E1E4D5] px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5D624E] font-medium shrink-0 gap-2">
        <p>SummitBerber V1 Mountain Productivity Workspace.</p>
        <p>A4 Report PDF compilation engine fully integrated. Native files persist 1:1.</p>
      </footer>
    </div>
  );
}
