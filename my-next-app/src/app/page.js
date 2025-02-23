"use client";

import { useState, useEffect } from "react";
import factions from '../../warhammer-data/40kJsonData/FactionsSummary';
import UnitCard from "./UnitCard";
import UnitModal from "./UnitModal";
import { FiMenu, FiX } from "react-icons/fi";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState("Tyranids"); // Default faction
  const [units, setUnits] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch units based on the selected faction
  useEffect(() => {
    async function fetchFactionData() {
      try {
        const factionData = await import(`../../warhammer-data/40kJsonData/${selectedFaction}.json`);
        setUnits(factionData.units);
      } catch (error) {
        console.error("Error loading faction data:", error);
      }
    }
    fetchFactionData();
  }, [selectedFaction]);

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
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Sorting units by category
  const characters = units.filter(unit => unit.role === "Characters");
  const battleline = units.filter(unit => unit.role === "Battleline");
  const others = units.filter(unit => unit.role !== "Characters" && unit.role !== "Battleline");

  return (
    <>
      {/* Sidebar Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="p-3 bg-gray-800 text-white fixed top-4 left-4 rounded-md z-50"
      >
        <FiMenu size={24} />
      </button>
{/* Sidebar Overlay (closes sidebar when clicked) */}
{isSidebarOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-40"
    onClick={() => setIsSidebarOpen(false)}
  />
)}

{/* Sidebar */}
<div
  className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-50`}
  onClick={(e) => e.stopPropagation()} // Prevents clicks inside from closing it
>
  <button
    onClick={() => setIsSidebarOpen(false)}
    className="absolute top-4 right-4 text-white"
  >
    <FiX size={24} />
  </button>

  {/* Improved "Select Faction" section */}
  <div className="bg-gray-800 p-3 rounded-lg shadow-md text-center mb-4">
    <h2 className="text-2xl font-bold text-yellow-400">Select Faction</h2>
  </div>
  
  {/* Scrollable factions list */}
  <div className="overflow-y-auto max-h-[calc(100vh-100px)] scrollable-content">
    <ul>
      {factions.map((faction) => (
        <li
          key={faction.name}
          className={`p-2 cursor-pointer ${selectedFaction === faction.name.replace(/\s+/g, '') ? "bg-gray-700" : ""}`}
          onClick={() => {
            setSelectedFaction(faction.name.replace(/\s+/g, ''));
            setIsSidebarOpen(false);
          }}
        >
          {faction.name}
        </li>
      ))}
    </ul>
  </div>
</div>

      
      <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 p-6">
      <h1 className="text-4xl font-bold text-white p-4">{selectedFaction.replace(/([A-Z])/g, ' $1').trim()}</h1>
        {/* Render Characters */}
        {characters.length > 0 && (
          <div className="w-full">
            <div className="text-center w-full py-2 px-4 bg-gray-800 text-white text-4xl rounded-lg m-2">
              <p className="font-bold text-lg">Characters</p>
            </div>
            <div className="flex flex-wrap justify-center">
              {characters.map((unit, index) => (
                <UnitCard key={index} unit={unit} openModal={openModal} />
              ))}
            </div>
          </div>
        )}

        {/* Render Battleline */}
        {battleline.length > 0 && (
          <div className="w-full mt-8">
            <div className="text-center w-full py-2 px-4 bg-gray-800 text-white text-4xl rounded-lg">
              <p className="font-bold text-lg">Battleline</p>
            </div>
            <div className="flex flex-wrap justify-center">
              {battleline.map((unit, index) => (
                <UnitCard key={index} unit={unit} openModal={openModal} />
              ))}
            </div>
          </div>
        )}

        {/* Render Other Units */}
        {others.length > 0 && (
          <div className="w-full mt-8">
            <div className="text-center w-full py-2 px-4 bg-gray-800 text-white text-4xl rounded-lg">
              <p className="font-bold text-lg">Other Units</p>
            </div>
            <div className="flex flex-wrap justify-center">
              {others.map((unit, index) => (
                <UnitCard key={index} unit={unit} openModal={openModal} />
              ))}
            </div>
          </div>
        )}

        {/* Unit Modal */}
        <UnitModal 
          isOpen={isOpen} 
          selectedUnit={selectedUnit} 
          closeModal={closeModal} 
          meleeWeaponsOpen={meleeWeaponsOpen} 
          setMeleeWeaponsOpen={setMeleeWeaponsOpen} 
          rangedWeaponsOpen={rangedWeaponsOpen}
          setRangedWeaponsOpen={setRangedWeaponsOpen}
        />
      </div>
    </>
  );
}
