"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, Loader2 } from "lucide-react";
import { useFarm } from "@/lib/FarmContext";

interface VoiceFarmerAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceFarmerAssistant({ isOpen, onClose }: VoiceFarmerAssistantProps) {
  const { activeFarm } = useFarm();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setIsListening(false);
          submitQuery(text);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setResponse(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Failed to start speech recognition", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const submitQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setResponse(null);
    stopSpeaking();

    try {
      const res = await fetch("http://localhost:8000/api/v1/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          farm_id: activeFarm?.id || 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to consult agricultural intelligence");
      const data = await res.json();
      setResponse(data.answer);
      speakText(data.answer);
    } catch (err: any) {
      const fallback = "I could not retrieve live farm telemetry. Please check your network connection.";
      setResponse(fallback);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "What is my crop condition?",
    "How much rain is expected?",
    "What is my predicted yield?",
    "What recommendation do you have?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Voice-First Farmer Mode</h3>
              <p className="text-[11px] text-emerald-200/80">
                {activeFarm ? activeFarm.name : "Active Plot"} • Audio & Hands-Free
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              stopListening();
              onClose();
            }}
            className="p-1 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* Big Audio Mic Button */}
          <div className="relative">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !isSupported}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isListening
                  ? "bg-rose-500 text-white ring-8 ring-rose-100 scale-105 animate-pulse"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105"
              } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
              title={isListening ? "Listening... Click to stop" : "Click to speak"}
            >
              {isListening ? <Mic className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
            </button>
            {isListening && (
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Listening
              </span>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium">
              {isListening
                ? "Listening to your question... Speak clearly"
                : isSupported
                ? "Tap the microphone to speak, or choose a quick question below"
                : "Microphone not supported on this browser. Type below."}
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="grid grid-cols-2 gap-2 w-full text-left">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(p);
                  submitQuery(p);
                }}
                disabled={isLoading}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-medium transition-all text-left truncate"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>

          {/* Transcript / Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuery(transcript);
            }}
            className="w-full flex items-center gap-2"
          >
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type your agricultural question..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-800 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !transcript.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          {/* Audio Response Output Card */}
          {(response || isLoading) && (
            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  AgriQuantum Grounded Response
                </span>
                {response && (
                  <button
                    onClick={isSpeaking ? stopSpeaking : () => speakText(response)}
                    className="p-1 text-slate-500 hover:text-emerald-700 transition-colors"
                    title={isSpeaking ? "Stop audio" : "Listen again"}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>Evaluating field telemetry & quantum yield parameters...</span>
                </div>
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {response}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
