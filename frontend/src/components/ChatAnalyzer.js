import React, { useState } from "react";
import axios from "axios";
import { parseWhatsAppChat } from "../utils/whatsappParser";

export default function StressAnalyzerDashboard() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("whatsapp");

  // --- Core logic preserved ---
  async function handleFileUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setActiveTab(type);

    try {
      let text = "";
      if (type === "whatsapp") {
        const content = await file.text();
        const messages = parseWhatsAppChat(content);
        text = messages.map((m) => m.message).join(" ");
      } else {
  if (type === "speech") {
    const formData = new FormData();
    formData.append("file", file);
    const speechRes = await axios.post("http://127.0.0.1:5000/speech-to-text", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    text = speechRes.data.text || "";
  } else {
    text = await file.text();
  }
}


      if (!text.trim()) {
        alert("No valid messages or text found in file.");
        setLoading(false);
        return;
      }

      const res = await axios.post("http://127.0.0.1:5000/analyze", { text });
      setResult(res.data);
    } catch (err) {
      console.error("Error analyzing chat:", err.response?.data || err.message);
      alert("Error analyzing chat: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  }

  const getStressColor = (category) => {
    switch (category) {
      case "High":
        return "bg-red-500";
      case "Moderate":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getGradientColor = (score) => {
    if (score >= 70) return "#ef4444"; // red
    if (score >= 40) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 md:p-8">
      <div className="w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg
              className="w-10 h-10 text-cyan-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MindWatch AI
            </h1>
          </div>
          <p className="text-cyan-200 text-lg font-light">
            Multi-Platform Stress & Mental Wellness Detection
          </p>
        </div>

        {/* Dashboard Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-cyan-500/20 shadow-2xl mb-8 min-h-[500px]">
          <div className="flex items-center gap-3 mb-8">
            <svg
              className="w-7 h-7 text-cyan-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white">Analysis Dashboard</h2>
          </div>

          {/* Awaiting upload */}
          {!result && !loading && (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-6 animate-pulse">
                <svg
                  className="w-12 h-12 text-purple-300 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-2xl text-gray-300 font-medium">Awaiting Data Upload</p>
              <p className="text-cyan-400 mt-2">
                Select a platform below to begin analysis
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-24">
              <div className="relative inline-block">
                <div className="w-24 h-24 border-8 border-purple-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-2xl text-white font-bold mt-8">Processing Data...</p>
              <p className="text-cyan-300 mt-2">AI analysis in progress</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <div className="relative w-80 h-80">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="160"
                      cy="160"
                      r="140"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="20"
                      fill="none"
                    />
                    <circle
                      cx="160"
                      cy="160"
                      r="140"
                      stroke={getGradientColor(result.stress_score)}
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 140}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 140 * (1 - result.stress_score )
                      }`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: "drop-shadow(0 0 10px currentColor)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-extrabold text-white mb-2">
                      {result.stress_score}
                    </span>
                    <span className="text-cyan-300 text-lg font-medium tracking-wide">
                      STRESS INDEX
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-sm uppercase tracking-wide">
                      Risk Level
                    </span>
                    <span
                      className={`px-6 py-2 rounded-full text-white font-bold text-lg ${getStressColor(
                        result.category
                      )} shadow-lg`}
                    >
                      {result.category}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStressColor(
                        result.category
                      )} transition-all duration-1000`}
                      style={{ width: `${result.stress_score *100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
                  <h3 className="text-white font-bold text-lg mb-2">AI Recommendation</h3>
                  <p className="text-cyan-100 leading-relaxed">{result.suggestion}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Platform Upload Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {[
    {
      name: "WhatsApp",
      type: "whatsapp",
      icon: "💬",
      bg: "bg-[#1f2937] border-emerald-500/40",
      btn: "from-emerald-500 to-green-400",
      borderGlow: "hover:shadow-emerald-400/40",
    },
    {
      name: "Twitter",
      type: "twitter",
      icon: "🐦",
      bg: "bg-[#1e2a4a] border-sky-500/40",
      btn: "from-sky-500 to-blue-400",
      borderGlow: "hover:shadow-sky-400/40",
    },
    {
      name: "Speech",
      type: "speech",
      icon: "🎤",
      bg: "bg-[#2b1b3f] border-fuchsia-500/40",
      btn: "from-pink-500 to-fuchsia-400",
      borderGlow: "hover:shadow-fuchsia-400/40",
    },
  ].map((p) => (
    <div
      key={p.type}
      className={`group relative ${p.bg} backdrop-blur-lg rounded-2xl p-6 border shadow-xl transition-all duration-500 hover:-translate-y-2 ${p.borderGlow}`}
    >
      <div className="relative">
        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
          {p.icon} {p.name}
        </h3>
        <p className="text-gray-300 mb-4 text-sm">
          {p.type === "whatsapp" &&
            "Analyze stress levels from your chat conversations and messaging patterns."}
          {p.type === "twitter" &&
            "Evaluate mental wellness from your social media posts and engagement."}
          {p.type === "speech" &&
            "Detect stress indicators through voice patterns and speech analysis."}
        </p>

        <label className="block">
          <div
            className={`cursor-pointer bg-gradient-to-r ${p.btn} text-white px-6 py-3 rounded-xl font-bold text-center shadow-md transition-all duration-300 hover:scale-105`}
          >
            📤 Upload {p.type === "whatsapp" ? "Chat" : p.type === "twitter" ? "Tweets" : "Audio"}
          </div>
          <input
            type="file"
            accept={p.type === "speech" ? ".wav,.mp3,.m4a" : ".txt,.csv"}
            onChange={(e) => handleFileUpload(e, p.type)}
            className="hidden"
          />
        </label>

        {activeTab === p.type && loading && (
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-white/30 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
        <div className="text-center mt-10 text-cyan-300 text-sm">
          <p>🔒 Secure & Private • Data processed locally • Zero storage</p>
        </div>
      </div>
    </div>
  );
}
