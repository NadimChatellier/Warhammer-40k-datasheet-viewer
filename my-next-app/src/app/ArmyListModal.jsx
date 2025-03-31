import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import factions from "../../warhammer-data/40kJsonData/FactionsSummary"; // Import faction data

export default function ArmyListModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [armyName, setArmyName] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [points, setPoints] = useState("");
  const [selectedFaction, setSelectedFaction] = useState(""); // Selected faction
  const [selectedDetachment, setSelectedDetachment] = useState(""); // Selected detachment
  const [detachmentOptions, setDetachmentOptions] = useState([]); // Detachments list
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetachments = async () => {
      if (selectedFaction) {
        try {
          const formattedFaction = selectedFaction.replace(/\s+/g, '');
          const factionData = await import(`../../warhammer-data/40kJsonData/${formattedFaction}.json`);
          
          console.log("Fetched Faction Data:", factionData); // Debugging
  
          // Access `default` to get actual JSON content
          setDetachmentOptions(factionData.default?.detachments || []);
          setSelectedDetachment(""); // Reset when faction changes
        } catch (error) {
          console.error("Error loading faction data:", error);
          setDetachmentOptions([]);
        }
      } else {
        setDetachmentOptions([]);
      }
    };
  
    fetchDetachments();
  }, [selectedFaction]);
  
  

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error.message);
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedFaction) {
      // Fetch detachments based on faction
      const factionData = factions.find((f) => f.name === selectedFaction);
      if (factionData) {
        setDetachmentOptions(factionData.detachments || []);
        setSelectedDetachment(""); // Reset detachment when faction changes
      }
    } else {
      setDetachmentOptions([]);
    }
  }, [selectedFaction]);

  if (!isOpen) return null;
  if (!user) return <p className="text-white">Please sign in to create an army list.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    const { error: dbError } = await supabase.from("army_lists").insert([
      {
        user_id: user.id,
        army: {
          name: armyName,
          points,
          faction: selectedFaction,
          detachment: selectedDetachment,
          list: [],
        },
        Image: imageUrl,
      },
    ]);

    if (dbError) {
      setError("Failed to create army list.");
    } else {
      setArmyName("");
      setImageUrl("");
      setPoints("");
      setSelectedFaction("");
      setSelectedDetachment("");
      onClose();
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Create Army List</h2>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Army Name</label>
            <input
              type="text"
              value={armyName}
              onChange={(e) => setArmyName(e.target.value)}
              required
              className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-lg"
            />
          </div>

        

          <div>
            <label className="block text-sm font-medium">Faction</label>
            <select
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              required
              className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-lg"
            >
              <option value="">Select Faction</option>
              {factions.map((faction) => (
                <option key={faction.id} value={faction.name}>
                  {faction.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFaction && (
            <div>
              <label className="block text-sm font-medium">Detachment</label>
              <select
                value={selectedDetachment}
                onChange={(e) => setSelectedDetachment(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-lg"
              >
                <option value="">Select Detachment</option>
                {detachmentOptions.map((detachment, index) => (
                  <option key={index} value={detachment.name}>
                    {detachment.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Points</label>
            <div className="flex space-x-2 mb-2">
              {[500, 1000, 1500, 2000].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPoints(value)}
                  className={`px-4 py-2 rounded-lg ${points == value ? "bg-blue-600" : "bg-gray-600"} hover:bg-blue-700`}
                >
                  {value}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              placeholder="Enter custom points"
              className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste your image URL here"
              className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-lg"
            />
          </div>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Army Preview"
              className="rounded-lg overflow-hidden shadow-xl bg-black w-[100%] h-[70%] items-center"
            />
          )}

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="bg-gray-600 py-2 px-4 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save Army List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
