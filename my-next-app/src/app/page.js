"use client";

import { useState } from "react";
import { units } from "../../testunits";
import { CiBookmarkPlus } from "react-icons/ci";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [weaponTableOpen, setWeaponTableOpen] = useState(true);

  const openModal = (unit) => {
    setSelectedUnit(unit);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUnit(null);
    setWeaponTableOpen(true);
  };

  const weapons = [
    { name: "Chainsword", stats: "Ranged, 10 damage" },
    { name: "Boltgun", stats: "Melee, 35 damage" },
  ];

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
          <div className="relative w-full h-full">
            <img
              src={unit.image}
              alt={unit.name}
              className="object-cover w-full h-full"
            />
          </div>
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 right-2 flex items-center cursor-pointer group">
              <span className="absolute right-8 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-in-out text-gray-400 text-sm whitespace-nowrap">
                Add to army list
              </span>
              <CiBookmarkPlus className="text-3xl text-gray-800 hover:text-red-500 text-lg" />
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
              <table className="w-full text-sm text-center text-gray-600 border border-gray-700">
                <thead className="bg-gray-900 text-gray-100">
                  <tr>
                    <th className="px-4 py-2">M</th>
                    <th className="px-4 py-2">T</th>
                    <th className="px-4 py-2">Sv</th>
                    <th className="px-4 py-2">W</th>
                    <th className="px-4 py-2">LD</th>
                    <th className="px-4 py-2">OC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-200 text-center">
                    <td className="px-4 py-2">{unitStats.M}"</td>
                    <td className="px-4 py-2">{unitStats.T}</td>
                    <td className="px-4 py-2">{unitStats.Sv}+</td>
                    <td className="px-4 py-2">{unitStats.W}</td>
                    <td className="px-4 py-2">{unitStats.LD}</td>
                    <td className="px-4 py-2">{unitStats.OC}</td>
                  </tr>
                </tbody>
              </table>

              {/* Collapsible Weapon Table */}
              <div className="mt-4 bg-gray-900 p-4 rounded-lg shadow-lg">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setWeaponTableOpen(!weaponTableOpen)}
                >
                  <h3 className="text-xl font-semibold text-white">
                    Weapon Stats
                  </h3>
                  <span className="text-white">
                    {weaponTableOpen ? "▲" : "▼"}
                  </span>
                </div>

                {weaponTableOpen && (
                  <table className="w-full mt-4 border-collapse border border-gray-700">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        <th className="border border-gray-700 p-2">Weapon</th>
                        <th className="border border-gray-700 p-2">Stats</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weapons.map((weapon, index) => (
                        <tr key={index} className="bg-gray-700 text-white">
                          <td className="border border-gray-600 p-2">
                            {weapon.name}
                          </td>
                          <td className="border border-gray-600 p-2">
                            {weapon.stats}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}