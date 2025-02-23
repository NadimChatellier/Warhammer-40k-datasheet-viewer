import { useState } from "react";

export default function SearchBar({ setSearchQuery }) {
  const [query, setQuery] = useState("");

  const handleChange = (event) => {
    setQuery(event.target.value);
    setSearchQuery(event.target.value);
  };

  return (
    <div className="w-full max-w-md mb-4">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search units..."
        className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
}
