"use client";

import { useState, useEffect } from "react";
import factions from '../../warhammer-data/40kJsonData/FactionsSummary';
import UnitCard from "./UnitCard";
import { CiBookmarkPlus } from "react-icons/ci";
import UnitModal from "./UnitModal";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState("Necrons"); // Default faction
  const [units, setUnits] = useState([]);
  const temp = 
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

      <div className="flex flex-wrap justify-center w-full min-h-screen bg-gray-900 p-6">
        {units.map((unit, index) => (
          <UnitCard key={index} unit={unit} openModal={openModal} />
        ))}


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









