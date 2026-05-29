"use client";

import React from "react";
import Link from "next/link";

// ປ່ຽນແປງ Path ຮູບພາບ ແລະ ແກ້ໄຂ ID ບໍ່ໃຫ້ຊ້ຳກັນແລ້ວ
const MEMORY_PHOTOS = [
  { id: 1, url: "/images/vv.jpg", caption: "ຜາໜາມໄຊ ວັງວຽງ 📸" },
  { id: 2, url: "/images/vv3.jpg", caption: "ແຄມນ້ຳຊອງ ວັງວຽງ 🥰" },
  { id: 3, url: "/images/lpb.jpg", caption: "ຕະຫລາດມືດ ຫຼວງພະບາງ 📸" },
  { id: 4, url: "/images/lpb2.jpg", caption: "POPOLO LPB 💖" },
  { id: 5, url: "/images/cd.JPG", caption: "Countdown 2025 🥰" },
  { id: 6, url: "/images/c.jpg", caption: "ແມວຂອງເຮົາ 💖" },
  { id: 7, url: "/images/m.jpg", caption: "She with my mom 🥰" },
];

export default function MemoriesPage() {
  return (
    <div className="min-h-screen bg-[#0a0010] text-white font-serif px-5 py-10 flex flex-col items-center">
      
      {/* ຫົວຂໍ້ໜ້າ */}
      <h1 className="text-[clamp(24px,5vw,40px)] text-[#ffb3d9] drop-shadow-[0_0_20px_#ff69b4] mb-2 text-center font-bold">
        📸 ຄວາມຊົງຈຳທີ່ແສນພິເສດ
      </h1>
      
      <p className="text-[#aaa] mb-10 text-center max-w-md">
        ທຸກໆຊ່ວງເວລາທີ່ຢູ່ກັບເຈົ້າ ຄືຊ່ວງເວລາທີ່ດີທີ່ສຸດ
      </p>

      {/* Photo Grid - ລະບົບຈັດວາງກອບຮູບພາບ */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 w-full max-w-[1000px] mb-10">
        {MEMORY_PHOTOS.map((photo) => (
          <div
            key={photo.id}
            className="bg-white/5 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-pink-500/20 transition-transform duration-300 hover:scale-103"
          >
            {/* ກອບຮູບພາບ */}
            <div className="relative w-full ">
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* ຄຳອະທິບາຍໃຕ້ຮູບ */}
            <div className="p-4 text-center text-[#ffb3d9] font-medium">
              {photo.caption}
            </div>
          </div>
        ))}
      </div>

      {/* ປຸ່ມກົດກັບຄືນໜ້າເຄ້ກ */}
      <Link href="/">
        <button className="px-7 py-3 rounded-full border-none text-16px font-bold cursor-pointer bg-gradient-to-r from-[#6c00ff] to-[#c44fff] text-white shadow-[0_4px_15px_rgba(108,0,255,0.4)] transition-all duration-200 hover:scale-105 active:scale-95">
          ⬅️ ກັບໄປໜ້າເຄ້ກ 3D
        </button>
      </Link>
    </div>
  );
}