"use client";

import { useState, useEffect } from "react";
import units from '../../warhammer-data/40kJsonData/Tyranids.json';

import UnitCard from "./UnitCard";
import { CiBookmarkPlus } from "react-icons/ci";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);

  const openModal = (unit) => {
    setSelectedUnit(unit);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedUnit(null);
    setMeleeWeaponsOpen(false);
    setRangedWeaponsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex flex-wrap justify-center w-full min-h-screen bg-gray-900 p-6">
        {units.units.map((unit, index) => (
          <UnitCard key={index} unit={unit} openModal={openModal} />
        ))}

{isOpen && selectedUnit && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={closeModal}>
    <div
      className="p-6 rounded-lg w-[90%] md:w-[80%] cursor-auto overflow-hidden flex flex-col relative max-h-[90%] sm:max-h-[95%]"
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundImage: "url('http://wallpapercave.com/wp/6weLGjt.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="absolute top-2 right-2 flex items-center cursor-pointer group">
        <span className="absolute right-10 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-in-out text-gray-400 text-sm whitespace-nowrap">
          Add to army list
        </span>
        <CiBookmarkPlus className="text-4xl text-gray-800 hover:text-red-500" />
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        <div className="w-full md:w-[30%]">
          <div className="h-4/6 w-3/8 bg-black flex justify-center items-center overflow-hidden rounded-lg shadow-2xl">
            <img src={selectedUnit.unit_img} alt={selectedUnit.name} className="object-cover w-full h-full" />
          </div>

          {/* Unit Name Section */}
          <div className="mt-4 px-4 py-2 bg-gray-500 rounded-lg shadow-lg text-center">
            <h3 className="font-extrabold text-white uppercase tracking-wide drop-shadow-lg">{selectedUnit.name}</h3>
            <div className="mt-2 text-sm text-gray-400 italic">{selectedUnit.faction}</div>
          </div>
          <button className="mt-2 bg-green-200 rounded-lg p-1">100 points</button>
        </div>

        {/* Content Section with Scroll for Mobile */}
        <div className="flex-1 p-4 overflow-y-auto max-h-full sm:max-h-[70vh] md:max-h-full" style={{ scrollBehavior: 'smooth' }}>
          {selectedUnit.profiles.map((profile, profileIndex) => (
            <table key={profileIndex} className="w-[90%] place-self-center text-sm text-center text-gray-600 border border-gray-700 mt-4">
              <thead className="bg-gray-900 text-gray-100">
                <tr>
                  <th className="px-4 py-2">M</th>
                  <th className="px-4 py-2">T</th>
                  <th className="px-4 py-2">Sv</th>
                  <th className="px-4 py-2">W</th>
                  <th className="px-4 py-2">Ld</th>
                  <th className="px-4 py-2">OC</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-200">
                  <td className="px-4 py-2">{profile.movement}</td>
                  <td className="px-4 py-2">{profile.toughness}</td>
                  <td className="px-4 py-2">{profile.save}</td>
                  <td className="px-4 py-2">{profile.wounds}</td>
                  <td className="px-4 py-2">{profile.leadership}</td>
                  <td className="px-4 py-2">{profile.objective_control}</td>
                </tr>
              </tbody>
            </table>
          ))}

          {[{ title: 'Melee Weapons', weapons: selectedUnit.melee_weapons, state: meleeWeaponsOpen, setState: setMeleeWeaponsOpen },
            { title: 'Ranged Weapons', weapons: selectedUnit.ranged_weapons, state: rangedWeaponsOpen, setState: setRangedWeaponsOpen }].map((section, index) => (
            section.weapons && (
              <div key={index} className="mt-2 bg-gray-900 p-3 rounded-lg shadow-lg">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => section.setState(!section.state)}>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                  <span className="text-white">{section.state ? '▲' : '▼'}</span>
                </div>
                {section.state && section.weapons.map((weapon, wIndex) => (
                  <div key={wIndex} className="mt-2">
                    <h2 className="text-white italic inline">{weapon.name}: </h2>
                    {weapon.special_rules && weapon.special_rules.map((rule, rIdx) => (
                      <span key={rIdx} className="text-gray-400 cursor-pointer hover:text-yellow-100 italic ml-2">{rule}</span>
                    ))}
                    <table className="w-full text-sm text-center text-gray-600 border border-gray-700 mt-2">
                      <thead className="bg-gray-900 text-gray-100">
                        <tr>
                          {['Range', 'A', 'BS_WS', 'S', 'AP', 'D'].map((col) => (
                            <th key={col} className="px-4 py-2">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-200">
                          {[weapon.range, weapon.A, weapon.BS_WS, weapon.S, weapon.AP, weapon.D].map((val, idx) => (
                            <td key={idx} className="px-4 py-2">{val}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </>
  );
}
