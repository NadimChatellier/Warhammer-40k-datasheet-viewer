"use client";

import { useState, useEffect } from "react";
import factions from '../../warhammer-data/40kJsonData/FactionsSummary';
import UnitCard from "./UnitCard";
import { CiBookmarkPlus } from "react-icons/ci";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState("Necrons"); // Default faction
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

{isOpen && selectedUnit && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-1000" onClick={closeModal}>
    <div
      className="p-6 rounded-lg w-full md:w-[70%] xl:w-[60%] cursor-auto overflow-hidden flex flex-col relative max-h-[90vh] sm:max-h-[95vh]"
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundImage: "url('http://wallpapercave.com/wp/6weLGjt.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header for the modal */}
      <div className="absolute top-2 right-2 flex items-center cursor-pointer group">
        <span className="absolute right-10 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-in-out text-gray-400 text-sm whitespace-nowrap">
          Add to army list
        </span>
        <CiBookmarkPlus className="text-4xl text-gray-800 hover:text-red-500" />
      </div>

      {/* Top part of the modal (image and basic info) */}
<div className="flex flex-col md:flex-row gap-4 h-[15%]"> {/* Reduced height */}
  <div className="w-full md:w-1/3 h-[200px] bg-black rounded-lg overflow-hidden shadow-xl"> {/* Set a fixed height for the image container */}
    <img src={selectedUnit.unit_img} alt={selectedUnit.name} className="object-cover w-full h-full" /> {/* Image size adjusted */}
  </div>

  <div className="flex flex-col justify-between w-full md:w-2/3 p-2"> {/* Reduced padding */}
    {/* Unit Name and Info */}
    <div className="text-center">
      <h3 className="font-extrabold text-white uppercase tracking-wide drop-shadow-lg text-sm">{selectedUnit.name}</h3> {/* Reduced font size */}
      <div className="mt-1 text-xs text-gray-400 italic">{selectedUnit.faction}</div> {/* Reduced font size */}
      
      {/* Profile Data */}
      {selectedUnit.profiles.map((profile, profileIndex) => (
        <table key={profileIndex} className="w-[90%] place-self-center text-xs text-center text-gray-600 border border-gray-700 mt-2"> {/* Reduced font size */}
          <thead className="bg-gray-900 text-gray-100">
            <tr>
              <th className="px-2 py-1">M</th> {/* Reduced padding */}
              <th className="px-2 py-1">T</th> {/* Reduced padding */}
              <th className="px-2 py-1">Sv</th> {/* Reduced padding */}
              <th className="px-2 py-1">W</th> {/* Reduced padding */}
              <th className="px-2 py-1">Ld</th> {/* Reduced padding */}
              <th className="px-2 py-1">OC</th> {/* Reduced padding */}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-200">
              <td className="px-2 py-1">{profile.movement}</td> {/* Reduced padding */}
              <td className="px-2 py-1">{profile.toughness}</td> {/* Reduced padding */}
              <td className="px-2 py-1">{profile.save}</td> {/* Reduced padding */}
              <td className="px-2 py-1">{profile.wounds}</td> {/* Reduced padding */}
              <td className="px-2 py-1">{profile.leadership}</td> {/* Reduced padding */}
              <td className="px-2 py-1">{profile.objective_control}</td> {/* Reduced padding */}
            </tr>
          </tbody>
        </table>
      ))}
        <div className="bg-gray-900 text-gray-100 text-left p-2 m-2 rounded-lg">
           {/* Faction Abilities */}
  {selectedUnit.abilities.faction && selectedUnit.abilities.faction.length > 0 && (
    <div className="mt-2">
      <strong className="text-white">Faction Abilities: </strong>
      <div className="inline-flex flex-wrap gap-2 text-gray-400">
        {selectedUnit.abilities.faction.map((ability, index) => (
          <span
            key={index}
            className="cursor-pointer hover:text-yellow-400"
          >
            {ability.name} {ability.parameter}
            {index < selectedUnit.abilities.faction.length - 1 && ","}
          </span>
        ))}
      </div>
    </div>
  )}

  {/* Core Abilities */}
  {selectedUnit.abilities.core && selectedUnit.abilities.core.length > 0 && (
    <div className="mt-2">
      <strong className="text-white">Core Abilities: </strong>
      <div className="inline-flex flex-wrap gap-2 text-gray-400">
        {selectedUnit.abilities.core.map((ability, index) => (
          <span
            key={index}
            className="cursor-pointer hover:text-yellow-400"
          >
            {ability.name} {ability.parameter}
            {index < selectedUnit.abilities.core.length - 1 && ","}
          </span>
        ))}
      </div>
    </div>
  )}
        </div>
     
    </div>
  </div>
</div>
  
    


      {/* Bottom part of the modal (rest of the content) */}
      <div className="flex-1 p-4 scrollable-content max-h-full sm:max-h-[70vh] md:max-h-full overflow-y-auto">
        

        {/* Melee & Ranged Weapons */}
        {[{ title: 'Melee Weapons', weapons: selectedUnit.melee_weapons?.length > 0 ? selectedUnit.melee_weapons : null, state: meleeWeaponsOpen, setState: setMeleeWeaponsOpen },
          { title: 'Ranged Weapons', weapons: selectedUnit.ranged_weapons?.length > 0 ? selectedUnit.ranged_weapons : null, state: rangedWeaponsOpen, setState: setRangedWeaponsOpen }
        ].map((section, index) => (
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
                        <th className="px-4 py-2">Range</th>
                        <th className="px-4 py-2">A</th>
                        <th className="px-4 py-2">{section.title === "Ranged Weapons" ? "BS" : "WS"}</th>
                        <th className="px-4 py-2">S</th>
                        <th className="px-4 py-2">AP</th>
                        <th className="px-4 py-2">D</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-200">
                        <td className="px-4 py-2">{weapon.range}</td>
                        <td className="px-4 py-2">{weapon.A}</td>
                        <td className="px-4 py-2">{weapon.BS_WS}</td>
                        <td className="px-4 py-2">{weapon.S}</td>
                        <td className="px-4 py-2">{weapon.AP}</td>
                        <td className="px-4 py-2">{weapon.D}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )
        ))}


        {/* Datasheet Abilities Section */}
{selectedUnit?.abilities?.datasheet && selectedUnit.abilities.datasheet.length > 0 && (
  <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-xl">
    <h3 className="font-semibold text-white text-xl mb-4">Datasheet Abilities</h3>
    <div className="space-y-4">
      {selectedUnit.abilities.datasheet.map((ability, index) => (
        <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-300">
          <div className="flex justify-between items-start">
            <strong className="text-white text-lg">{ability.name}</strong>
            {/* You can add icons here for additional visual appeal if needed */}
          </div>
          <hr className="my-2 border-gray-600" />
          <div className="mt-2 text-gray-300 text-sm">
            <p>{ability.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{selectedUnit?.abilities?.datasheet && selectedUnit.abilities.primarch.length > 0 && (
  <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-xl">
    <h3 className="font-semibold text-white text-xl mb-4">Special abilities: </h3>
    <div className="space-y-4">
      {selectedUnit.abilities.primarch.map((ability, index) => (
        <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-300">
          <div className="flex justify-between items-start">
            <strong className="text-white text-lg">{ability.name}</strong>
            {/* You can add icons here for additional visual appeal if needed */}
          </div>
          <hr className="my-2 border-gray-600" />
          <div className="mt-2 text-gray-300 text-sm">
            <p>{ability.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}





<div className="bg-gray-900 rounded-xl text-gray-300 p-4 mt-2">
  {selectedUnit.loadout
    .split(". ")
    .filter((sentence) => sentence.trim() !== "") // Ensure no empty sentences
    .map((sentence, sentenceIndex) => {
      const parts = sentence.split(":");
      return (
        <p key={sentenceIndex} className="mb-1">
          <strong>{parts[0]}:</strong>{" "}
          {parts[1]
            ?.trim()
            .split(/[,;]/) // Split by both `,` and `;`
            .map((item, index, array) => {
              const trimmedItem = item.trim().replace(/\.$/, ""); // Remove trailing period only from the word
              return (
                <span key={index}>
                  <span className="cursor-pointer hover:text-yellow-400 transition-colors">
                    {trimmedItem}
                  </span>
                  {index < array.length - 1 ? ", " : "."} {/* Keep punctuation outside hover */}
                </span>
              );
            })}
        </p>
      );
    })}
</div>




      </div>
    </div>
  </div>
)}


      </div>
    </>
  );
}
