import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CiBookmarkPlus } from "react-icons/ci";

export default function UnitModal({ isOpen, selectedUnit, closeModal }) {
  const [isImageFull, setIsImageFull] = useState(false);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);


  if (!isOpen || !selectedUnit) return null;

  return (
    <div>
        {isOpen && selectedUnit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
          onClick={() => {closeModal()
                setIsImageFull(false)
          }}
        >
          <motion.div
        className="p-4 rounded-lg w-full md:w-[75%] lg:w-[65%] xl:w-[60%] h-[90vh] max-h-[90vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: "url('http://wallpapercave.com/wp/6weLGjt.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* Fullscreen Image View */}
<AnimatePresence>
  {isImageFull && (
    <motion.div
      className="absolute inset-0 bg-white flex justify-center items-center z-[1100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setIsImageFull(false)}
    >
      <motion.img
        src={selectedUnit.unit_img}
        alt={selectedUnit.name}
        className="h-full w-auto object-cover cursor-pointer" // Change here for full height
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </motion.div>
  )}
</AnimatePresence>

            {/* Header for the modal */}
            <div className="absolute top-2 right-2 flex items-center cursor-pointer group z-[1000]">
              <span className="absolute right-10 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-in-out text-gray-400 text-sm whitespace-nowrap">
                Add to army list
              </span>
              <CiBookmarkPlus className="text-4xl text-gray-100 hover:text-red-500" />
            </div>
      
            <div className="relative z-10 flex flex-col md:flex-row gap-4 h-[40vh] md:h-[28vh] p-4 bg-gray-900 rounded-lg">
        {/* Profile Image */}
        <div onClick={() => setIsImageFull(true)} className="w-full h-1/2 md:w-1/3 md:h-full bg-black rounded-lg overflow-hidden shadow-xl flex justify-center mb-4 md:mb-0">
        <img
          src={selectedUnit.unit_img}
          alt={selectedUnit.name}
          className="object-cover w-full h-full"
        />
      </div>
      
      
        {/* Profile Information */}
        <div className="flex flex-col w-full md:w-2/3 text-white">
          <h3
            className="font-extrabold uppercase tracking-wide drop-shadow-lg overflow-hidden text-ellipsis"
            style={{
              fontSize: 'clamp(1.2rem, 6vw, 2rem)', // Make the name's font size more dynamic
              lineHeight: '1.1', // Adjust line height for better space management
            }}
          >
            {selectedUnit.name}
          </h3>
          <div
            className="text-sm text-gray-400 italic overflow-hidden text-ellipsis"
            style={{
              fontSize: 'clamp(0.8rem, 4vw, 1.2rem)', // Responsive font size for faction
              lineHeight: '1.2', // Adjust line height for consistency
            }}
          >
            {selectedUnit.faction}
          </div>
      
      
          {/* Profiles Table (Responsive for Mobile) */}
          {selectedUnit.profiles.map((profile, profileIndex) => (
            <>
            <p className="text-sm">{selectedUnit.profiles.length > 1 ? profile.name : ""}</p>
            <table
              key={profileIndex}
              className="w-full text-xs sm:text-sm text-center text-gray-600 border border-gray-700 mt-2"
            >
              <thead className="bg-gray-800 text-gray-100">
                <tr>
                  <th className="px-2 py-1">M</th>
                  <th className="px-2 py-1">T</th>
                  <th className="px-2 py-1">Sv</th>
                  <th className="px-2 py-1">W</th>
                  <th className="px-2 py-1">Ld</th>
                  <th className="px-2 py-1">OC</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-200">
                  <td className="px-2 py-1">{profile.movement}</td>
                  <td className="px-2 py-1">{profile.toughness}</td>
                  <td className="px-2 py-1">{profile.save}</td>
                  <td className="px-2 py-1">{profile.wounds}</td>
                  <td className="px-2 py-1">{profile.leadership}</td>
                  <td className="px-2 py-1">{profile.objective_control}</td>
                </tr>
              </tbody>
            </table>
            </>
            
          ))}
        </div>
      </div>
      
      
      
      
            {/* Bottom part of the modal (rest of the content) */}
            <div className="flex-1 p-4 max-h-full overflow-hidden flex flex-col">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 scrollable-content">
              <div className="bg-gray-900 rounded-xl text-gray-300 p-4 mt-2">
        {/* Abilities & Composition */}
        
        {selectedUnit.abilities.faction && selectedUnit.abilities.faction.length > 0 && (
  <div className="mt-2">
    <strong
      className="text-white"
      style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}
    >
      {"Faction Abilities: "}
    </strong>
    <div className="inline-flex flex-wrap gap-2 text-gray-400">
      {selectedUnit.abilities.faction.map((ability, index) => (
        <div key={index} className="relative group">
          <span
            className="cursor-pointer hover:text-yellow-400 relative"
            style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}
          >
            {ability.name} {ability.parameter}
            {index < selectedUnit.abilities.faction.length - 1 && ","}
          </span>

          {/* Tooltip (Appears on Hover) */}
          <div className="absolute left-full top-0 ml-2 hidden group-hover:block w-64 max-w-xs p-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
            {ability.description}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      
{selectedUnit.abilities.faction && selectedUnit.abilities.core.length > 0 && (
  <div className="mt-2">
    <strong
      className="text-white"
      style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}
    >
      {"Faction Abilities: "}
    </strong>
    <div className="inline-flex flex-wrap gap-2 text-gray-400">
      {selectedUnit.abilities.core.map((ability, index) => (
        <div key={index} className="relative group">
          <span
            className="cursor-pointer hover:text-yellow-400 relative"
            style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}
          >
            {ability.name} {ability.parameter}
            {index < selectedUnit.abilities.faction.length - 1 && ","}
          </span>

          {/* Tooltip (Appears on Hover) */}
          <div className="absolute left-full top-[-6] ml-2 hidden group-hover:block w-64 max-w-xs p-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
            {ability.description}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      
        {/* Unit Costs */}
        {selectedUnit.costs && selectedUnit.costs.length > 0 && (
          <div className="mt-2">
            <strong
              className="text-white"
              style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}
            >
              {"Unit Costs: "}
            </strong>
            <ul className="list-disc pl-6 text-gray-400">
              {selectedUnit.costs.map((cost, index) => (
                <li
                  key={index}
                  className="text-gray-400"
                  style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}
                >
                  {cost.description} - {cost.cost} points
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
                {/* Melee & Ranged Weapons */}
                {[{ title: 'Melee Weapons', weapons: selectedUnit.melee_weapons?.length > 0 ? selectedUnit.melee_weapons : null, state: meleeWeaponsOpen, setState: setMeleeWeaponsOpen },
                  { title: 'Ranged Weapons', weapons: selectedUnit.ranged_weapons?.length > 0 ? selectedUnit.ranged_weapons : null, state: rangedWeaponsOpen, setState: setRangedWeaponsOpen }
                ].map((section, index) => (
                  section.weapons && (
                    <div key={index} className="mt-2 bg-gray-900 p-3 rounded-lg shadow-lg">
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => section.setState(!section.state)}>
                        <h3
                          className="font-semibold text-white"
                          style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}
                        >
                          {section.title}
                        </h3>
                        <span className="text-white">{section.state ? '▲' : '▼'}</span>
                      </div>
                      {section.state && section.weapons.map((weapon, wIndex) => (
                        <div key={wIndex} className="mt-2">
                          <h2 className="text-white italic inline" style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
                            {weapon.name}:{" "}
                          </h2>
                          {weapon.special_rules && weapon.special_rules.map((rule, rIdx) => (
                            <span
                              key={rIdx}
                              className="text-gray-400 cursor-pointer hover:text-yellow-100 italic ml-2"
                              style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}
                            >
                              {rule}
                            </span>
                          ))}
                          <table className="w-full text-sm text-center text-gray-600 border border-gray-700 mt-2">
          <thead className="bg-gray-900 text-gray-100">
            <tr>
              <th className="px-2 sm:px-4 py-1 sm:py-2">Range</th>
              <th className="px-2 sm:px-4 py-1 sm:py-2">A</th>
              <th className="px-2 sm:px-4 py-1 sm:py-2">{section.title === "Ranged Weapons" ? "BS" : "WS"}</th>
              <th className="px-2 sm:px-4 py-1 sm:py-2">S</th>
              <th className="px-2 sm:px-4 py-1 sm:py-2">AP</th>
              <th className="px-2 sm:px-4 py-1 sm:py-2">D</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-200">
            <td className="px-2 sm:px-4 py-1 sm:py-2">
        {weapon.range !== "Melee" ? `${weapon.range}"` : weapon.range}
      </td>
              <td className="px-2 sm:px-4 py-1 sm:py-2">{weapon.A}</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2">{weapon.BS_WS}+</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2">{weapon.S}</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2">{weapon.AP}</td>
              <td className="px-2 sm:px-4 py-1 sm:py-2">{weapon.D}</td>
            </tr>
          </tbody>
        </table>
                        </div>
                      ))}
                    </div>
                  )
                ))}
      
                {/* Abilities & Wargear */}
                {selectedUnit?.abilities?.datasheet?.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-xl">
                    <h3 className="font-semibold text-white text-xl mb-4" style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
                      Datasheet Abilities
                    </h3>
                    <div className="space-y-4">
                      {selectedUnit.abilities.datasheet.map((ability, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-300">
                          <strong className="text-white text-lg" style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
                            {ability.name}
                          </strong>
                          <hr className="my-2 border-gray-600" />
                          <p className="mt-2 text-gray-300 text-sm" style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}>
                            {ability.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Abilities & Wargear */}
                {selectedUnit?.abilities?.primarch?.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-xl">
                    <h3 className="font-semibold text-white text-xl mb-4" style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
                      Special Abilities
                    </h3>
                    <div className="space-y-4">
                      {selectedUnit.abilities.primarch.map((ability, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-300">
                          <strong className="text-white text-lg" style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
                            {ability.name}
                          </strong>
                          <hr className="my-2 border-gray-600" />
                          <p className="mt-2 text-gray-300 text-sm" style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}>
                            {ability.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
      
                {/* Wargear */}
                {selectedUnit?.abilities?.wargear?.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-xl">
                    <h3 className="font-semibold text-white text-xl mb-4" style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
                      Wargear
                    </h3>
                    <div className="space-y-4">
                      {selectedUnit.abilities.wargear.map((ability, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-300">
                          <strong className="text-white text-lg" style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
                            {ability.name}
                          </strong>
                          <hr className="my-2 border-gray-600" />
                          <p className="mt-2 text-gray-300 text-sm" style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}>
                            {ability.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
      
                {/* Loadout */}
                <div className="bg-gray-900 rounded-xl text-gray-300 p-4 mt-2">
                  {selectedUnit.loadout
                    .split(". ")
                    .filter((sentence) => sentence.trim() !== "")
                    .map((sentence, sentenceIndex) => {
                      const parts = sentence.split(":");
                      return (
                        <p key={sentenceIndex} className="mb-1">
                          <strong
                            style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}
                          >
                            {parts[0]}:
                          </strong>{" "}
                          {parts[1]
                            ?.trim()
                            .split(/[,;]/)
                            .map((item, index, array) => {
                              const trimmedItem = item.trim().replace(/\.$/, "");
                              return (
                                <span key={index}>
                                  <span className="cursor-pointer hover:text-yellow-400 transition-colors">
                                    {trimmedItem}
                                  </span>
                                  {index < array.length - 1 ? ", " : "."}
                                </span>
                              );
                            })}
                        </p>
                      );
                    })}
                </div>
      
                 {/* Unit Composition */}
                 <div className="bg-gray-900 rounded-xl text-gray-300 p-4 mt-2">
                 {selectedUnit.compositions && selectedUnit.compositions.length > 0 && (
                  <div className="mt-2">
                    <strong
                      className="text-white"
                      style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}
                    >
                      Unit composition(s):
                    </strong>
                    <div className="inline-flex flex-wrap gap-2 text-gray-400">
                      {selectedUnit.compositions.map((comp, index) => (
                        <span
                          key={index}
                          className="cursor-pointer hover:text-yellow-400"
                          style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)' }}
                        >
                          {comp.description}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                 </div>
                 
              </div>
            </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}