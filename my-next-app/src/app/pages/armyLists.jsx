"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import { Loader, AlertTriangle, List, ChevronDown, ChevronUp } from "lucide-react";
import factions from "../warhammer-data/40kJsonData/FactionsSummary";
import UnitModal from "@/app/UnitModal";
 
export default function ArmyLists() {
    const [armyLists, setArmyLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedList, setExpandedList] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const openModal = (unit) => {
      setSelectedUnit(unit);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setSelectedUnit(null);
      setIsModalOpen(false);
    };
  
    useEffect(() => {
      const fetchArmyLists = async () => {
        const { data, error } = await supabase.from("army_lists").select("*");
  
        if (error) {
          console.error("Error fetching army lists:", error);
          setError("Failed to load army lists.");
        } else {
          setArmyLists(data);
        }
  
        setLoading(false);
      };
  
      fetchArmyLists();
    }, []);
  
    return (
        <>

<div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <List size={28} className="mr-2" /> Army Lists
        </h1>
  
        {loading && (
          <div className="flex items-center space-x-2 text-blue-400">
            <Loader className="animate-spin" size={24} />
            <span>Loading...</span>
          </div>
        )}
  
        {error && (
          <div className="text-red-500 flex items-center space-x-2">
            <AlertTriangle size={24} />
            <span>{error}</span>
          </div>
        )}
  
        {!loading && !error && armyLists.length === 0 && (
          <p className="text-gray-400">No army lists found.</p>
        )}
  
        <div className="w-full max-w-[75%]">
          {armyLists.map((list) => (
            <div
              key={list.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 shadow-md transition-all"
            >
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
                onClick={() => setExpandedList(expandedList === list.id ? null : list.id)}
              >
                <div>
                  <h2 className="text-xl font-semibold">{list.army.name}</h2>
                  <p className="text-gray-400">Points: {list.army.points}</p>
                </div>
                {expandedList === list.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
  
              {expandedList === list.id && (
                <div className="mt-4 space-y-3">
                  {list.army.list.map((unit, index) => (
                    <UnitCard key={index} unit={unit} factionId={unit.faction_id} openModal={openModal} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
  
        {/* Unit Modal */}
    
      </div>
      {isModalOpen && <UnitModal isOpen={isModalOpen} selectedUnit={selectedUnit} closeModal={closeModal} />}
        </>
     
    );
  }
  

  function UnitCard({ unit, factionId, openModal }) {
    const handleClick = async () => {
      try {
        const faction = factions.find((f) => f.id === factionId);
  
        if (!faction) {
          console.error("Faction not found for ID:", factionId);
          return;
        }
  
        const factionFileName = faction.name.replace(/\s+/g, "");
        const factionData = await import(`../warhammer-data/40kJsonData/${factionFileName}.json`);
        const foundUnit = factionData.units.find((u) => u.id === unit.id);
  
        if (!foundUnit) {
          console.error("Unit not found:", unit.id);
          return;
        }
  
        openModal(foundUnit); // ✅ Open modal with found unit data
      } catch (error) {
        console.error("Error loading file:", error);
      }
    };
  
    return (
      <div
        className="rounded-lg overflow-hidden shadow-md bg-gray-700 
                   w-[90%] mx-auto flex items-center justify-between p-4 
                   transition-transform transform hover:scale-105
                   hover:shadow-lg cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-4">
          {unit.unit_img && <img src={unit.unit_img} alt={unit.name} className="w-16 h-16 object-cover rounded-full mr-4" />}
          <p className="text-white font-bold text-lg">{unit.name}</p>
        </div>
  
        <div className="flex items-center gap-6 text-white text-md">
          <div className="flex flex-col items-center">
            <p className="text-gray-400 text-sm">Cost</p>
            <p className="font-semibold">{unit.cost} pts</p>
          </div>
          <div className="h-6 w-[1px] bg-gray-500"></div>
          <div className="flex flex-col items-center">
            <p className="text-gray-400 text-sm">Count</p>
            <p className="font-semibold">{unit.count}</p>
          </div>
        </div>
      </div>
    );
  }
  