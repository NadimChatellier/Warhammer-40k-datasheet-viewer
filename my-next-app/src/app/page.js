"use client";

import { useState, useEffect } from "react";
import factions from "../../warhammer-data/40kJsonData/FactionsSummary";
import UnitCard from "./UnitCard";
import UnitModal from "./UnitModal";
import SearchBar from "./Searchbar";
import { FiMenu, FiX, FiChevronLeft, FiChevronRight  } from "react-icons/fi";



export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState("Tyranids"); // Default faction
  const [units, setUnits] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [areStrategemsOpen, setAreStrategemsOpen] = useState(false)
  const [stratagems, setStratagems] = useState([]);
  const [detachmentFilter, setDetachmentFilter] = useState(null);
  const [detachments, setDetachments] = useState([]);
  const [filteredStratagems, setFilteredStratagems] = useState([]);
  const [subFactions, setSubFactions] = useState([]);
  const [selectedSubfaction, setSelectedSubfaction] = useState(null);
  const [showExclusives, setShowExclusives] = useState(false); // State for the checkbox  
  const [abilities, setAbilities] = useState([]);


  useEffect(() => {
    async function fetchStratagemsData() {
      try {
        const factionData = await import(
          `../../warhammer-data/40kJsonData/${selectedFaction}.json`
        );
  
        function getUniqueSubfactions(units) {
          const keywordCount = {};
        
          // Count occurrences of each keyword (subfaction)
          units.forEach((unit) => {
            const unitKeywords = unit.keywords?.faction || []; // Use faction as keywords
            unitKeywords.forEach((keyword) => {
              keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
            });
          });
        
          // Find the most common keyword (subfaction) that exists in all units
          const totalUnits = units.length;
          const subfactionsToExclude = [];
        
          // Mark the keywords that appear in all units
          for (const [keyword, count] of Object.entries(keywordCount)) {
            if (count === totalUnits) {
              subfactionsToExclude.push(keyword); // This subfaction appears in every unit
            }
          }
        
          // Create a list of all unique keywords, excluding the ones that appear in all units
          const uniqueSubfactions = Object.keys(keywordCount).filter(
            (keyword) => !subfactionsToExclude.includes(keyword)
          );
        
          return uniqueSubfactions;
        }
        
  
        const faction = factionData;
  
        const stratagemsList = [];
        const abilitiesList = [];
        const detachmentsList = [];
  
        faction.detachments?.forEach((detachment) => {
          if (detachment.stratagems && Array.isArray(detachment.stratagems)) {
            stratagemsList.push(...detachment.stratagems);
          }
          if (detachment.abilities && Array.isArray(detachment.abilities)) {
            abilitiesList.push(...detachment.abilities);
          }
          detachmentsList.push(detachment.name);
        });
  
        // Set the units
        setUnits(faction.units || []);
  
        // Get unique subfactions and set them in state
        setSubFactions(getUniqueSubfactions(faction.units || []));
        setAbilities(abilitiesList);
        setStratagems(stratagemsList);
        setDetachments(detachmentsList);
      } catch (error) {
        console.error("Error loading stratagem data:", error);
      }
    }
  
    fetchStratagemsData();
  }, [selectedFaction]);
  
  useEffect(() => {
    if (detachmentFilter) {
      // Check if `stratagem.type` contains the selected detachment name
      const filteredStratagems = stratagems.filter((stratagem) =>
        stratagem.type?.toLowerCase().includes(detachmentFilter?.toLowerCase())
      );
      setFilteredStratagems(filteredStratagems); // ✅ Store filtered results in state
    } else {
      // If no filter is selected, show all stratagems
      setFilteredStratagems(stratagems);
    }
  }, [detachmentFilter, stratagems]); // Runs when `detachmentFilter` or `stratagems` change
  
  useEffect(() => {
    if (areStrategemsOpen) {
      document.body.style.overflow = "hidden"; // Disable background scrolling
    } else {
      document.body.style.overflow = "auto"; // Re-enable scrolling when closed
    }
  
    return () => {
      document.body.style.overflow = "auto"; // Cleanup when unmounting
    };
  }, [areStrategemsOpen]);
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

  const toggleExclusives = () => {
    setShowExclusives(!showExclusives);
  };


const filteredUnits = units.filter((unit) => {
  const factionKeywords = unit.keywords?.faction || [];
  
  // If exclusives are enabled, only include units with the selected subfaction and more than one faction keyword
  const hasSubfaction = showExclusives
    ? factionKeywords.includes(selectedSubfaction) && factionKeywords.length > 1
    : selectedSubfaction
    ? factionKeywords.includes(selectedSubfaction) || factionKeywords.length === 1
    : true;

  // Search filter (ignores case)
  const matchesSearch = unit.keywords?.other?.some((keyword) =>
    keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return hasSubfaction && (matchesSearch || searchQuery === "");
});

  


  // 3. Handle detachment filtering
  const handleDetachmentFilter = (detachment) => {
    console.log('Selected detachment:', detachment); // Check if detachment is being set correctly
    setDetachmentFilter(detachment);
  };

const characters = filteredUnits.filter((unit) => unit.role === "Characters");
const battleline = filteredUnits.filter((unit) => unit.role === "Battleline");
const others = filteredUnits.filter(
  (unit) => unit.role !== "Characters" && unit.role !== "Battleline"
);


  // Function to format faction names properly
  const formatFactionName = (name) =>
    name.replace(/([A-Z][a-z])/g, " $1").trim();

  return (
 

      <>
      {/* Sidebar Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="p-3 bg-gray-800 text-white fixed top-4 left-4 rounded-md z-50"
      >
        <FiMenu size={24} />
      </button>

      <button
        onClick={() => setAreStrategemsOpen(true)}
        className="p-3 bg-[#07f26e] text-white fixed bottom-4 left-4 rounded-md z-50"
      >
        Stratagems
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
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 shadow-lg`}
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside from closing it
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 text-white"
        >
          <FiX size={24} />
        </button>

       

        {/* Improved "Select Faction" section */}
        <div className="bg-gray-800 p-3 rounded-lg shadow-md text-center mb-4 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-yellow-400">Select Faction</h2>
        </div>

        {/* Scrollable factions list */}
        <div className="overflow-y-auto max-h-[calc(100vh-100px)] scrollable-content">
          <ul>
            {factions.map((faction) => (
              <li
                key={faction.name}
                className={`p-2 cursor-pointer ${
                  selectedFaction === faction.name.replace(/\s+/g, "")
                    ? "bg-gray-700"
                    : ""
                }`}
                onClick={() => {
                  setSelectedFaction(faction.name.replace(/\s+/g, ""));
                  setSearchQuery("");
                  setSelectedSubfaction(null);
                  setIsSidebarOpen(false);
                }}
              >
                {formatFactionName(faction.name)}
              </li>
            ))}
          </ul>
        </div>
      </div>


      {areStrategemsOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    onClick={() => setAreStrategemsOpen(false)}
  >
    {/* Modal Container */}
    <div
      className="bg-gray-900 text-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="flex justify-between items-center bg-gray-800 p-6">
        <h2 className="text-3xl font-bold text-yellow-400">Stratagems</h2>
        <button onClick={() => setAreStrategemsOpen(false)} className="text-white">
          <FiX size={32} />
        </button>
      </div>

      {/* Detachment Filter Buttons */}
      <div className="flex space-x-4 p-4 overflow-x-auto">
        <button
          className={`w-36 px-4 py-2 rounded-lg text-base text-center ${
            detachmentFilter === null ? "bg-yellow-400 text-black" : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => handleDetachmentFilter(null)}
        >
          All Detachments
        </button>
        {detachments.map((detachment, index) => (
          <button
            key={index}
            className={`w-36 px-4 py-2 rounded-lg text-base text-center ${
              detachment === detachmentFilter
                ? "bg-yellow-400 text-black"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => handleDetachmentFilter(detachment)}
          >
            {detachment}
          </button>
        ))}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollable-content">
        {filteredStratagems.length > 0 ? (
          filteredStratagems.map((stratagem, index) => (
            <div
              key={index}
              className="p-6 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300"
            >
              {/* Stratagem Title */}
              <h3 className="text-2xl font-bold text-yellow-400">{stratagem.name}</h3>

              {/* Stratagem Meta Info */}
              <p className="text-lg text-gray-400">{stratagem.cpCost} – {stratagem.type}</p>

              {/* Stratagem Parsed Info */}
              <div className="mt-3 text-base space-y-2">
                <p><strong className="text-yellow-400">When:</strong> {stratagem.when}</p>
                <p><strong className="text-yellow-400">Target:</strong> {stratagem.target}</p>
                <p><strong className="text-yellow-400">Effect:</strong> {stratagem.effect}</p>
              </div>

              {/* Full Description (For Debugging) */}
              <details className="mt-3 bg-gray-700 p-3 rounded-lg">
                <summary className="cursor-pointer text-yellow-300 font-bold">
                  Full Description (Debug)
                </summary>
                <p className="text-gray-300 text-sm break-words">{stratagem.fullDescription}</p>
              </details>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-lg">No stratagems available.</p>
        )}
      </div>
    </div>
  </div>
)}


      {/* Main Content */}
      <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 p-6">
        <h1 className="text-4xl font-bold text-white p-4">
          {formatFactionName(selectedFaction)}
        </h1>
       

      
           {/* Search Bar Component */}
           <SearchBar setSearchQuery={setSearchQuery} />
      {/* SubFaction Section */}
      {subFactions.length > 0 && (
  <div className="w-full bg-gray-800 p-6 rounded-lg shadow-md mb-6">
  
    <div className="flex flex-wrap justify-center gap-4">
      {subFactions.map((subfaction, index) => (
        <button
          key={index}
          className={`px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 
            bg-gray-700 text-white border border-gray-600 hover:bg-yellow-500 hover:text-black 
            ${
              selectedSubfaction === subfaction
                ? "bg-yellow-400 text-black border-yellow-500"
                : ""
            }`}
          onClick={() =>{
            setSelectedSubfaction(selectedSubfaction === subfaction ? null : subfaction)
          }
            
          }
        >
          {subfaction}
        </button>
      ))}
    </div>

    {selectedSubfaction && (
      <div className="flex items-center justify-center mt-4 space-x-3">
        <input
          type="checkbox"
          checked={showExclusives}
          onChange={toggleExclusives}
          className="w-6 h-6 text-yellow-400 border-gray-600 rounded-md focus:ring-0"
        />
        <label className="text-white text-lg font-medium">
          Exclusives
        </label>
      </div>
    )}
  </div>
)}





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
