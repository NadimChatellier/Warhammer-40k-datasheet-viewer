export default function Taskbar() {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter units based on search term
    const filteredUnits = units.filter((unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    return (
      <div className="relative h-screen bg-gray-100">
        {/* Taskbar */}
        <div className="fixed top-0 left-0 w-full bg-gray-900 text-white p-4 flex items-center justify-between shadow-md z-50">
          <h1 className="text-lg font-bold">Unit Search</h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search units..."
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
  
        {/* Units List */}
        <div className="mt-20 p-4">
          {filteredUnits.length > 0 ? (
            <ul className="bg-white rounded-lg shadow-md p-4">
              {filteredUnits.map((unit) => (
                <li
                  key={unit.name}
                  className="p-2 border-b last:border-none hover:bg-gray-200 cursor-pointer"
                >
                  {unit.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No matching units found.</p>
          )}
        </div>
      </div>
    );
  }