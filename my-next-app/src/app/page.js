"use client";

import { useState, useEffect } from "react";
import factions from "../../warhammer-data/40kJsonData/FactionsSummary";
import UnitCard from "./UnitCard";
import UnitModal from "./UnitModal";
import SearchBar from "./Searchbar";
import { FiMenu, FiX, FiChevronLeft, FiChevronRight  } from "react-icons/fi";
import Taskbar from "./Taskbar";
import { useUser, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import supabase from "../../src/lib/supabase";
import ArmyListModal from "./ArmyListModal";


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
  const [selectedTab, setSelectedTab] = useState("Abilities");
  const [filteredAbilities, setFilteredAbilities] = useState([]);
  const [enhancements, setEnhancements] = useState([]);
  const [selectedEnhancement, setSelectedEnhancement] = useState(null);
  const [filteredEnhancements, setFilteredEnhancements] = useState([]);
  const [isArmyListModalOpen, setIsArmyListModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    async function fetchFactionData() {
      const loggedUser = await supabase.auth.getUser() // THIS IS THE USER OBJECT
      setUser(loggedUser)
      console.log(user)
      try {
        const factionData = await import(
          `../../warhammer-data/40kJsonData/${selectedFaction}.json`
        );

        
  
        function getUniqueSubfactions(units) {
          const keywordCount = {};
  
          // Count occurrences of each keyword (subfaction)
          units.forEach((unit) => {
            const unitKeywords = unit.keywords?.faction || [];
            unitKeywords.forEach((keyword) => {
              keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
            });
          });
  
          // Find subfactions that appear in every unit
          const totalUnits = units.length;
          const subfactionsToExclude = Object.keys(keywordCount).filter(
            (keyword) => keywordCount[keyword] === totalUnits
          );
  
          // Return unique subfactions excluding the common ones
          return Object.keys(keywordCount).filter((keyword) => !subfactionsToExclude.includes(keyword));
        }
  
        const faction = factionData;
  
        const stratagemsList = [];
        const abilitiesList = [];
        const enhancementsList = [];
        const detachmentsList = [];
  
        faction.detachments?.forEach((detachment) => {
          if (detachment.stratagems && Array.isArray(detachment.stratagems)) {
            stratagemsList.push(...detachment.stratagems);
          }
          if (detachment.abilities && Array.isArray(detachment.abilities)) {
            abilitiesList.push(...detachment.abilities);
          }
          if (detachment.enhancements && Array.isArray(detachment.enhancements)) {
            enhancementsList.push(...detachment.enhancements);
          }
          detachmentsList.push(detachment.name);
        });
  
        // Set state variables
        setUnits(faction.units || []);
        setSubFactions(getUniqueSubfactions(faction.units || []));
        setAbilities(abilitiesList);
        setStratagems(stratagemsList);
        setEnhancements(enhancementsList);
        setDetachments(detachmentsList);
      } catch (error) {
        console.error("Error loading faction data:", error);
      }
    }
  
    fetchFactionData();
  }, [selectedFaction]);
  
  
  useEffect(() => {
    if (detachmentFilter) {
      // Filter stratagems by detachment type (or modify this to match by name or ID)
      const filteredStratagems = stratagems.filter((stratagem) => {
        const isMatch = stratagem.type?.toLowerCase().includes(detachmentFilter?.toLowerCase()) ||
                        stratagem.name?.toLowerCase().includes(detachmentFilter?.toLowerCase()); // Matching name or type
        if (isMatch) {
          console.log(`Stratagem: ${stratagem.name} is part of detachment type: ${stratagem.type}`);
        }
        return isMatch;
      });
  
      // Filter abilities by detachment-related keyword or name
      const filteredAbilities = abilities.filter((ability) => {
        const isMatch =
          ability.detachment?.toLowerCase().includes(detachmentFilter?.toLowerCase()) ||
          ability.rawDescription?.toLowerCase().includes(detachmentFilter?.toLowerCase()) ||
          ability.legend?.toLowerCase().includes(detachmentFilter?.toLowerCase()); // Match description or name
        if (isMatch) {
          console.log(`Ability: ${ability.name} is related to detachment filter: ${detachmentFilter}`);
        }
        return isMatch;
      });

      // Filter abilities by detachment-related keyword or name
      const filteredEnhancements = enhancements.filter((enhancement) => {
        const isMatch =
          enhancement.detachment?.toLowerCase().includes(detachmentFilter?.toLowerCase()) ||
          enhancement.rawDescription?.toLowerCase().includes(detachmentFilter?.toLowerCase()) ||
          enhancement.legend?.toLowerCase().includes(detachmentFilter?.toLowerCase()); // Match description or name
        if (isMatch) {
          console.log(`Ability: ${enhancement.name} is related to detachment filter: ${detachmentFilter}`);
        }
        return isMatch;
      });
  
      // Log filtered data to confirm
      console.log("Filtered Stratagems:", filteredStratagems);
      console.log("Filtered Abilities:", filteredAbilities);
  
      // Set the filtered results
      setFilteredEnhancements(filteredEnhancements);
      setFilteredStratagems(filteredStratagems);
      setFilteredAbilities(filteredAbilities);
    } else {
      // If no detachment filter is selected, show all
      setFilteredStratagems(stratagems);
      setFilteredAbilities(abilities);
      setFilteredEnhancements(enhancements);
    }
  }, [detachmentFilter, stratagems, abilities]); // Runs when dependencies change
  

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

  //test
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setAreStrategemsOpen(false)}>
          <div className="bg-gray-900 text-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center bg-gray-800 p-6">
              <h2 className="text-3xl font-bold text-yellow-400">{selectedFaction} detachments</h2>
              <button onClick={() => setAreStrategemsOpen(false)} className="text-white"><FiX size={32} /></button>
            </div>
            
            <div className="flex space-x-4 p-4 overflow-x-auto">
  {detachments.map((detachment, index) => (
    <button
      key={index}
      className={`w-36 px-4 py-2 rounded-lg text-center transition-all ${
        detachment === detachmentFilter
          ? "bg-yellow-400 text-black" // Selected state
          : "bg-gray-800 hover:bg-gray-700" // Default state
      }`}
      onClick={() => setDetachmentFilter(detachmentFilter === detachment ? null : detachment)} // Toggle logic
    >
      {detachment}
    </button>
  ))}
</div>


            <div className="flex border-b border-gray-600">
              {["Abilities", "Stratagems", "Enhancements"].map((tab) => (
                <button key={tab} onClick={() => setSelectedTab(tab)} className={`flex-1 py-3 text-center text-lg font-bold transition-all ${selectedTab === tab ? "bg-yellow-400 text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}>{tab}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollable-content">
  {/* Abilities Section */}
  {selectedTab === "Abilities" && (filteredAbilities.length > 0 ? filteredAbilities : abilities).length > 0 ? (
    (filteredAbilities.length > 0 ? filteredAbilities : abilities).map((ability, index) => (
      <div key={index} className="p-6 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300">
        <h3 className="text-2xl font-bold text-yellow-400">
          {ability.name}
          <span className="text-sm text-gray-400 ml-2">({ability.detachment})</span>
        </h3>
        <p className="text-gray-400 mt-2">{ability.formattedDescription}</p>
      </div>
    ))
  ) : selectedTab === "Stratagems" && filteredStratagems.length > 0 ? (
    /* Stratagems Section */
    filteredStratagems.map((stratagem, index) => (
      <div key={index} className="p-6 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300">
        <h3 className="text-2xl font-bold text-yellow-400">{stratagem.name}</h3>
        <p className="text-lg text-gray-400">
          <strong className="text-2xl font-bold text-yellow-400">{stratagem.cpCost}CP</strong> – {stratagem.type}
        </p>
        <div className="mt-3 text-base space-y-2">
          <p><strong className="text-yellow-400">When:</strong> {stratagem.when}</p>
          <p><strong className="text-yellow-400">Target:</strong> {stratagem.target}</p>
          <p><strong className="text-yellow-400">Effect:</strong> {stratagem.effect}</p>
        </div>
      </div>
    ))
  ) : selectedTab === "Enhancements" && (filteredEnhancements.length > 0 ? filteredEnhancements : enhancements).length > 0 ? (
    /* Enhancements Section */
    (filteredEnhancements?.length > 0 ? filteredEnhancements : enhancements).map((enhancement, index) => (
      <div key={index} className="p-6 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300">
        <h3 className="text-2xl font-bold text-green-400">
          {enhancement.name}
          <span className="text-sm text-gray-400 ml-2">({enhancement.detachment})</span>
        </h3>
        <p className="text-lg text-gray-400">
          <strong>Cost:</strong> {enhancement.cost} points
        </p>
        <p className="text-gray-400 mt-2">{enhancement.formattedDescription}</p>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-400 text-lg">No data available.</p>
  )}
</div>


          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 p-6">
      <Taskbar/>
        <h1 className="text-4xl font-bold text-white p-4">
          {formatFactionName(selectedFaction)}
        </h1>
        
        <div className="text-center p-6">
        {user && (
        <button
          onClick={() => setIsArmyListModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
        >
          Create Army List
        </button>
      )}

      <ArmyListModal
        isOpen={isArmyListModalOpen}
        selectedFaction={selectedFaction}
        onClose={() => setIsArmyListModalOpen(false)}
      />
    </div>

      
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
