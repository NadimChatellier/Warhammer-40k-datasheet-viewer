import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export default function ArmyListModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [armyName, setArmyName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Store the image URL directly
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error.message);
      setUser(user);
    };
    fetchUser();
  }, []);

  if (!isOpen) return null;
  if (!user) return <p className="text-white">Please sign in to create an army list.</p>;

  // Save Army List
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    const { error: dbError } = await supabase.from("army_lists").insert([{
      user_id: user.id,
      army: { name: armyName, description },
      Image: imageUrl, // Store the image URL from user input
    }]);

    if (dbError) {
      setError("Failed to create army list.");
    } else {
      setArmyName("");
      setDescription("");
      setImageUrl(""); // Clear image URL input after submission
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
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
    className="rounded-lg overflow-hidden shadow-xl bg-black 
              w-[100%] h-[70%] 
            items-center"
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
