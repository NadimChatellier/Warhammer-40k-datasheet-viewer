import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5"; // Close icon
import supabase from "../lib/supabase";

const ArmyModal = ({ isArmyModalOpen, closeArmyModal, selectedUnit }) => {
  const [armyLists, setArmyLists] = useState([]);
  const [selectedArmy, setSelectedArmy] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [finalCost, setFinalCost] = useState(null);
  const [warning, setWarning] = useState("");

  // Helper function to calculate the total model count from the description
  const calculateTotalModels = (description) => {
    const numbers = description.match(/\d+/g);  // Extract all numbers from the description
    if (!numbers) return 0;
    return numbers.reduce((total, num) => total + parseInt(num), 0);  // Sum all numbers
  };

  // Get the available tiers and their model counts
  const getCostTiers = () => {
    if (!selectedUnit?.costs || selectedUnit.costs.length === 0) {
      console.log("No cost brackets found for the selected unit");
      return [];
    }

    // Map cost options to have the total model count and cost
    return selectedUnit.costs.map((option) => {
      const modelCount = calculateTotalModels(option.description);
      return {
        ...option,
        modelCount,  // Add model count as a field
      };
    });
  };

  const costTiers = getCostTiers();  // Get available cost tiers

  useEffect(() => {
    if (isArmyModalOpen) {
      console.log("Fetching army lists...");
      const fetchArmyLists = async () => {
        const { data, error } = await supabase.from("army_lists").select("*");
        if (error) {
          console.error("Error fetching army lists:", error);
        } else {
          console.log("Fetched army lists:", data);
          setArmyLists(data);
        }
      };
      fetchArmyLists();
    }
  }, [isArmyModalOpen]);

  const handleTierSelect = (tier) => {
    console.log("Selected tier:", tier);
    setSelectedTier(tier);  // Set the selected tier

    // Update the final cost based on selected tier
    setFinalCost(tier.cost);
    console.log("Updated final cost:", tier.cost);
    setWarning("");  // Clear any previous warnings
  };

  const handleArmySelect = (army) => {
    setSelectedArmy(army);
    console.log("Selected army:", army);
  };

  const handleConfirm = async () => {
    if (!selectedArmy || !selectedTier || !finalCost) {
      console.log("Cannot confirm selection, missing required data.");
      return;
    }

    const updatedList = [...selectedArmy.army.list, { unit: selectedUnit, count: selectedTier.modelCount, cost: finalCost }];
    console.log("Updating army list with:", updatedList);

    const { error } = await supabase.from("army_lists").update({ army: { ...selectedArmy.army, list: updatedList } }).eq("id", selectedArmy.id);
    if (error) {
      console.error("Error updating army list:", error);
    } else {
      console.log("Army list updated successfully.");
      closeArmyModal();
    }
  };

  if (!isArmyModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-[400px] relative">
        <button onClick={closeArmyModal} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <IoClose size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">Select an Army List</h2>

        {armyLists.length === 0 ? (
          <p className="text-gray-400">No army lists found.</p>
        ) : (
          <ul className="space-y-2">
            {armyLists.map((army) => (
              <li key={army.id} className={`p-3 bg-gray-800 rounded-lg cursor-pointer ${selectedArmy?.id === army.id ? "bg-gray-700" : "hover:bg-gray-700"}`} onClick={() => handleArmySelect(army)}>
                <h3 className="font-semibold">{army.army.name}</h3>
                <p className="text-sm text-gray-400">{army.army.description}</p>
              </li>
            ))}
          </ul>
        )}

        {selectedArmy && (
          <div className="mt-4">
            <h3 className="font-semibold">Select Price Tier</h3>
            <ul className="space-y-2 mt-2">
              {costTiers.map((tier) => (
                <li
                  key={tier.line}
                  onClick={() => handleTierSelect(tier)}
                  className={`p-3 bg-gray-800 rounded-lg cursor-pointer ${selectedTier?.line === tier.line ? "bg-gray-700" : "hover:bg-gray-700"}`}
                >
                  <div className="flex justify-between">
                    <span>{tier.description}</span>
                    <span>{tier.cost} points</span>
                  </div>
                </li>
              ))}
            </ul>

            {selectedTier && (
              <div className="mt-4">
                <p className="text-sm">You have selected the tier with {selectedTier.modelCount} units.</p>
                <button onClick={handleConfirm} className="w-full bg-red-600 hover:bg-red-700 mt-4 p-2 rounded-lg text-white font-bold">Confirm Selection</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArmyModal;
