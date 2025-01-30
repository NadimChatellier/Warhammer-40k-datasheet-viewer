"use client";

import { useState } from "react";
import { units } from "../../testunits";
import { CiBookmarkPlus } from "react-icons/ci";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const openModal = (unit) => {
    setSelectedUnit(unit);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUnit(null);
  };

  const unitImage =
    "https://www.warhammer.com/app/resources/catalog/product/920x950/99120102152_AngronDaemonPrimarch1.jpg";

  // Example unit stats
  const unitStats = {
    M: 6,
    T: 4,
    Sv: 3,
    W: 2,
    LD: 7,
    OC: 1,
  };

  return (
    <div className="flex flex-wrap justify-center w-full min-h-screen bg-gray-900 p-6">
      {units.map((unit, index) => (
        <div
          key={index}
          className="rounded-lg overflow-hidden shadow-xl bg-black w-60 h-80 flex flex-col items-center justify-between m-4 transition-transform transform hover:scale-105 hover:shadow-2xl cursor-pointer"
          onClick={() => openModal(unit)}
        >
          {/* Image Section */}
          <div className="relative w-full h-full">
            <img
              src={unit.image}
              alt={unit.name}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Name Section */}
          <div className="text-center w-full py-2 px-4 bg-gray-800 text-white">
            <p className="font-bold text-lg">{unit.name}</p>
          </div>
        </div>
      ))}

{isOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    onClick={closeModal}
  >
    <div
      className="bg-white p-4 rounded-lg h-5/6 w-full max-w-4xl cursor-auto overflow-hidden flex relative"
      onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside modal
    >
      {/* Wishlist Button - Positioned in the Top Right */}
<div className="absolute top-2 right-2 flex items-center cursor-pointer group">
  {/* Text appears to the left on hover */}
  <span className="absolute right-8 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-in-out text-gray-400 text-sm whitespace-nowrap">
    Add to army list
  </span>
  
  {/* Bookmark Icon */}
  <CiBookmarkPlus className=" text-3xl text-gray-800 hover:text-red-500 text-lg"/>
</div>


      {/* Left Side: Image */}
      <div className="h-4/6 w-2/6 bg-black flex justify-center items-center overflow-hidden rounded-lg shadow-2xl">
        <img
          src={selectedUnit.image}
          alt="Selected Image"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right Side: Unit Details */}
      <div className="flex-1 p-4 ml-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedUnit.name}</h3>

        {/* Unit Stats Table */}
        <table className="min-w-full text-sm text-left text-gray-600 table-fixed">
        <thead className="bg-gray-900 text-gray-100">
  <tr>
    {[
      { key: "M", desc: "Movement (in inches)" },
      { key: "T", desc: "Toughness" },
      { key: "Sv", desc: "Save (Armor Save)" },
      { key: "W", desc: "Wounds" },
      { key: "LD", desc: "Leadership" },
      { key: "OC", desc: "Objective Control" },
    ].map((stat) => (
      <th key={stat.key} className="px-6 py-3 font-medium text-center relative group">
        {/* Tooltip */}
        <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out whitespace-nowrap">
          {stat.desc}
        </span>
        {stat.key}
      </th>
    ))}
  </tr>
</thead>

          <tbody>
            <tr className="bg-gray-200">
              <td className="px-6 py-4 text-center">{unitStats.M}"</td>
              <td className="px-6 py-4 text-center">{unitStats.T}</td>
              <td className="px-6 py-4 text-center">{unitStats.Sv}+</td>
              <td className="px-6 py-4 text-center">{unitStats.W}</td>
              <td className="px-6 py-4 text-center">{unitStats.LD}</td>
              <td className="px-6 py-4 text-center">{unitStats.OC}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
