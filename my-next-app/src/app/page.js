"use client";

import { useState, useEffect } from "react";
import factions from '../../warhammer-data/40kJsonData/FactionsSummary';
import UnitCard from "./UnitCard";
import UnitModal from "./UnitModal";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState("Tyranids"); // Default faction
  const [units, setUnits] = useState([]);

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
      {/* Dropdown to select faction */}
      <select 
        value={selectedFaction} 
        onChange={(e) => setSelectedFaction(e.target.value)}
        className="p-2 bg-gray-800 text-white rounded-md"
      >
        {factions.map((faction) => (
          <option key={faction.name} value={faction.name.replace(/\s+/g, '')}>
            {faction.name}
          </option>
        ))}
      </select>

      <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 p-6">
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
