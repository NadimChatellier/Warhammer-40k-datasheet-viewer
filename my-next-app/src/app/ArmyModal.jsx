import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5"; // Close icon
import supabase from "../lib/supabase";

const ArmyModal = ({ isArmyModalOpen, closeArmyModal, selectedUnit }) => {
  const [armyLists, setArmyLists] = useState([]);
  const [selectedArmy, setSelectedArmy] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [finalCost, setFinalCost] = useState(null);
  const [warning, setWarning] = useState("");
  const [pointsLeft, setPointsLeft] = useState(0); // Tracks remaining points

  useEffect(() => {
    if (isArmyModalOpen) {
      const fetchArmyLists = async () => {
        const { data, error } = await supabase.from("army_lists").select("*");
        if (!error) {
          setArmyLists(data);
        } else {
          console.error("Error fetching army lists:", error);
        }
      };
      fetchArmyLists();
    }
  }, [isArmyModalOpen]);

  // Helper function to sum up points used in an army list
  const calculateUsedPoints = (army) => {
    return army.army.list?.reduce((sum, unit) => sum + unit.cost, 0) || 0;
  };

  const handleArmySelect = (army) => {
    if (selectedArmy?.id === army.id) {
      setSelectedArmy(null); // Deselect army if already selected
      setPointsLeft(0);
    } else {
      setSelectedArmy(army);
      setPointsLeft(army.army.points - calculateUsedPoints(army)); // Set available points
    }
  };

  const handleTierSelect = (tier) => {
    if (selectedTier?.line === tier.line) {
      setSelectedTier(null); // Deselect if already selected
      setFinalCost(null);
    } else {
      setSelectedTier(tier);
      setFinalCost(tier.cost);

      // Warn if adding the unit exceeds the points limit
      const newPointsLeft = selectedArmy.army.points - (calculateUsedPoints(selectedArmy) + tier.cost);
      setPointsLeft(newPointsLeft);
      setWarning(newPointsLeft < 0 ? "⚠️ Not enough points! Remove some units." : "");
    }
  };

  const handleConfirm = async () => {
    if (!selectedArmy || !selectedTier || !selectedUnit || pointsLeft < 0) {
      setWarning("Fix selection issues before confirming.");
      return;
    }
    console.log(selectedUnit)
    const newUnit = {
      id: selectedUnit.id,
      name: selectedUnit.name,
      faction_id: selectedUnit.faction_id,
      count: selectedTier.description,
      unit_img: selectedUnit.unit_img,
      cost: finalCost,
    };

    const updatedList = [...selectedArmy.army.list, newUnit];

    const { error } = await supabase
      .from("army_lists")
      .update({ army: { ...selectedArmy.army, list: updatedList } })
      .eq("id", selectedArmy.id);

    if (!error) {
      closeArmyModal();
    } else {
      setWarning("Failed to update army list. Try again.");
    }
  };

  if (!isArmyModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-2xl w-[420px] shadow-lg relative">
        <button onClick={closeArmyModal} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <IoClose size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Select an Army List</h2>

        {armyLists.length === 0 ? (
          <p className="text-gray-400 text-center">No army lists found.</p>
        ) : (
          <div className="space-y-2">
            {armyLists.map((army) => (
              <div
                key={army.id}
                onClick={() => handleArmySelect(army)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedArmy?.id === army.id ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <h3 className="font-semibold text-lg">{army.army.name}</h3>
                <p className="text-sm text-gray-300">{army.army.description}</p>
                <p className="text-sm text-gray-400">Points Available: {army.army.points - calculateUsedPoints(army)}</p>
              </div>
            ))}
          </div>
        )}

        {selectedArmy && (
          <div className="mt-5">
            <h3 className="font-semibold text-lg">Select a Unit Tier</h3>
            <div className="mt-3 space-y-2">
              {selectedUnit?.costs.map((tier) => (
                <div
                  key={tier.line}
                  onClick={() => handleTierSelect(tier)}
                  className={`p-4 rounded-lg flex justify-between items-center cursor-pointer transition-all ${
                    selectedTier?.line === tier.line ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <span>{tier.description}</span>
                  <span className="text-sm">{tier.cost} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTier && (
          <div className="mt-5">
            <p className="text-sm">
              <span className="font-semibold">Selected Tier:</span> {selectedTier.description}
            </p>
            <p className={`text-lg font-bold mt-2 ${pointsLeft < 0 ? "text-red-500" : "text-green-400"}`}>
              Points Left: {pointsLeft}
            </p>
            {warning && <p className="text-red-400 text-sm mt-2">{warning}</p>}
            <button
              onClick={handleConfirm}
              disabled={pointsLeft < 0}
              className={`w-full mt-4 p-3 rounded-lg font-bold text-white transition-all ${
                pointsLeft < 0 ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Confirm Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArmyModal;
