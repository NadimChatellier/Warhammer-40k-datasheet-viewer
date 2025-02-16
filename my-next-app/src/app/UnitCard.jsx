import React from "react";

export default function UnitCard({ unit, openModal }) {
  return (
    <div
      className="rounded-lg overflow-hidden shadow-xl bg-black w-60 h-80 flex flex-col items-center justify-between m-4 transition-transform transform hover:scale-105 hover:shadow-2xl cursor-pointer"
      onClick={() => openModal(unit)}
    >
      <img src={unit.unit_img} alt={unit.name} className="object-cover w-full max-h-[90%] h-full" />
      <div className="text-center w-full py-2 px-4 bg-gray-800 text-white">
        <p className="font-bold text-lg">{unit.name}</p>
      </div>
    </div>
  );
}