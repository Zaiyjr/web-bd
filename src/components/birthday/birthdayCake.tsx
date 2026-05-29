"use client";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { useBirthday3D } from "./useBirthday3D";

export default function BirthdayCake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heartsContainerRef = useRef<HTMLDivElement>(null);

  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState(false);

  const triggerMessage = (text: string) => {
    setMsg(text);
    setShowMsg(true);
  };

  const { blowCandles, launchFireworks, sendHeart } = useBirthday3D({
    canvasRef,
    containerRef,
    heartsContainerRef,
    triggerMessage,
  });

  useEffect(() => {
    if (showMsg) {
      const t = setTimeout(() => setShowMsg(false), 3500);
      return () => clearTimeout(t);
    }
  }, [showMsg]);

  useEffect(() => {
    const t1 = setTimeout(() => launchFireworks(), 800);
    const t2 = setTimeout(
      () => triggerMessage("🎂 ກົດ Cake ຫຼື ປຸ່ມ ເພື່ອໂຕ້ຕອບ! 💕"),
      2500
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#0a0010] font-serif"
    >
      {/* ຍັງເກັບ Keyframes ໄວ້ບ່ອນນີ້ເພື່ອຄວາມສະດວກ ໂດຍບໍ່ຕ້ອງໄປແກ້ config ຂອງ tailwind */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translateY(-220px) scale(0.5) rotate(30deg); }
        }
        @keyframes pulse {
          0%, 100% { text-shadow: 0 0 30px #ff69b4, 0 0 60px #ff1493; }
          50%       { text-shadow: 0 0 55px #ff69b4, 0 0 110px #ff1493, 0 0 160px #ff69b4; }
        }
      `,
        }}
      />

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full block" />
      
      {/* Floating Hearts Container */}
      <div ref={heartsContainerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden" />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center justify-center p-4">
        <div 
          className="text-center text-white mb-6 flex flex-col gap-1 select-none"
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          <h1 className="text-[clamp(28px,5vw,50px)] font-extrabold tracking-wide text-white">
            🎂 Happy Birthday 🎂
          </h1>
          <h2 className="text-[clamp(18px,3.5vw,28px)] font-medium text-pink-300 tracking-wider">
            My Baby
          </h2>
          <h1 className="text-[clamp(36px,7vw,65px)] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-100 to-pink-400 drop-shadow-[0_0_35px_rgba(255,20,147,0.8)]">
            Meilee
          </h1>
        </div>
        <p className="text-[clamp(15px,3vw,24px)] text-[#ffb3d9] text-center mb-8 drop-shadow-[0_0_20px_#ff69b4]">
          ຮັກເຈົ້າຫຼາຍໆ 💕
        </p>

        {/* Button Area */}
        <div className="flex flex-wrap gap-3.5 justify-center pointer-events-auto max-w-md md:max-w-xl">
          <button
            onClick={blowCandles}
            className="px-6 py-3.2 rounded-full border-none text-[15px] font-bold cursor-pointer bg-gradient-to-r from-[#ff69b4] to-[#ff1493] text-white shadow-[0_4px_22px_#ff149360] transition-transform duration-150 hover:scale-108 active:scale-97"
          >
            🕯️ ເປົ່າທຽນ
          </button>
          <button
            onClick={launchFireworks}
            className="px-6 py-3.2 rounded-full border-none text-[15px] font-bold cursor-pointer bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-[#1a0500] shadow-[0_4px_22px_#ffd70060] transition-transform duration-150 hover:scale-108 active:scale-97"
          >
            🎆 ດອກໄຟ
          </button>
          <button
            onClick={sendHeart}
            className="px-6 py-3.2 rounded-full border-none text-[15px] font-bold cursor-pointer bg-gradient-to-r from-[#c44fff] to-[#6c00ff] text-white shadow-[0_4px_22px_#b44fff60] transition-transform duration-150 hover:scale-108 active:scale-97"
          >
            💖 ສົ່ງຄວາມຮັກ
          </button>

          <Link href="/memories">
            <button className="px-6 py-3.2 rounded-full border-none text-[15px] font-bold cursor-pointer bg-gradient-to-r from-[#00b4db] to-[#0083b0] text-white shadow-[0_4px_22px_rgba(0,180,219,0.4)] transition-transform duration-150 hover:scale-108 active:scale-97">
              📸 ເບິ່ງຄວາມຊົງຈຳ
            </button>
          </Link>
        </div>
      </div>

      {/* Message Box */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-[clamp(14px,2.5vw,19px)] text-[#ffddee] text-center bg-[rgba(80,0,40,0.72)] px-7 py-3.5 rounded-[22px] border border-[#ff69b466] backdrop-blur-md pointer-events-none min-w-[260px] max-w-[90vw] transition-opacity duration-500 ${
          showMsg ? "opacity-100" : "opacity-0"
        }`}
      >
        {msg}
      </div>

     
    </div>
  );
}