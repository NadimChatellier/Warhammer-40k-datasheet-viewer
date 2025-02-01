"use client";

import { useState, useEffect } from "react";
import { units } from "../../testunits";
import UnitCard from "./UnitCard";
import { CiBookmarkPlus } from "react-icons/ci";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [meleeWeaponsOpen, setMeleeWeaponsOpen] = useState(false);
  const [rangedWeaponsOpen, setRangedWeaponsOpen] = useState(false);

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
    if (isOpen) {
      // Disable background scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = "auto";
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
    
    <div className="flex flex-wrap justify-center w-full min-h-screen bg-gray-900 p-6">

      {units.map((unit, index) => (
        
        <><UnitCard key={index} unit={unit} openModal={openModal} /></>
      ))}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={closeModal}>
          <div
            className=" p-6 rounded-lg h-[90%] w-full max-w-4xl cursor-auto overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: "url('http://wallpapercave.com/wp/6weLGjt.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute top-2 right-2 flex items-center cursor-pointer group">
              <span className="absolute right-10 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-in-out text-gray-400 text-sm whitespace-nowrap">
                Add to army list
              </span>
              <CiBookmarkPlus className="text-4xl text-gray-800 hover:text-red-500" />
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
              <div className="w-full md:w-[30%]">
                <div className="h-4/6 w-3/8 bg-black flex justify-center items-center overflow-hidden rounded-lg shadow-2xl">
                  <img src={selectedUnit.image} alt={selectedUnit.name} className="object-cover w-full h-full" />
                </div>

                {/* Unit Name Section */}
                <div className="mt-4 px-4 py-2 bg-gray-500 rounded-lg shadow-lg text-center">
                  <h3 className="font-extrabold text-white uppercase tracking-wide drop-shadow-lg">{selectedUnit.name}</h3>
                  <div className="mt-2 text-sm text-gray-400 italic">{selectedUnit.faction}</div>
                </div>
                <button className="mt-2 bg-green-200 rounded-lg p-1">100 points</button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto max-h-full" style={{ scrollBehavior: 'smooth' }}>
                <table className="w-[90%] place-self-center text-sm text-center text-gray-600 border border-gray-700">
                  <thead className="bg-gray-900 text-gray-100">
                    <tr>
                      {['M', 'T', 'Sv', 'W', 'LD', 'OC'].map((stat) => (
                        <th key={stat} className="px-4 py-2">{stat}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-200">
                      {Object.values(selectedUnit.stats).map((value, i) => (
                        <td key={i} className="px-4 py-2">{value}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                {[{ title: 'Melee Weapons', weapons: selectedUnit.meleeWeapons, state: meleeWeaponsOpen, setState: setMeleeWeaponsOpen },
                  { title: 'Ranged Weapons', weapons: selectedUnit.rangedWeapons, state: rangedWeaponsOpen, setState: setRangedWeaponsOpen }].map((section, index) => (
                    section.weapons && (
                      <div key={index} className="mt-2 bg-gray-900 p-3 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => section.setState(!section.state)}>
                          <h3 className="font-semibold text-white">{section.title}</h3>
                          <span className="text-white">{section.state ? '▲' : '▼'}</span>
                        </div>
                        {section.state && section.weapons.map((weapon, wIndex) => (
                          <div key={wIndex} className="mt-2">
                            <h2 className="text-white italic inline">{weapon.name}: </h2>
{weapon.coreRules && weapon.coreRules.map((rule, rIdx) => (
  <span key={rIdx} className="text-gray-400  cursor-pointer hover:text-yellow-100 italic ml-2">{rule}</span>
))}
                            <table className="w-full text-sm text-center text-gray-600 border border-gray-700">
                              <thead className="bg-gray-900 text-gray-100">
                                <tr>
                                  {['Range', 'A', 'BS', 'S', 'AP', 'D'].map((col) => (
                                    <th key={col} className="px-4 py-2">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="bg-gray-200">
                                  {[section.title === 'Melee Weapons' ? 'Melee' : weapon.range, weapon.attacks, `${weapon.skill}+`, weapon.strength, weapon.AP, weapon.damage].map((val, idx) => (
                                    <td key={idx} className="px-4 py-2">{val}</td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                            {weapon.rules && (
                              <ul className="mt-2 text-gray-200 text-sm bg-gray-700 p-2 rounded">
                                {weapon.rules.map((rule, rIdx) => (
                                  <li key={rIdx} className="mt-2 bg-gray-700 p-2 rounded">
                                    <h1 className="font-semibold border-b border-gray-600 pb-1 mb-1">{rule.name}</h1>
                                    <p>{rule.rule}</p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  ))}
{selectedUnit.abilities.dynamicAbilities &&
  selectedUnit.abilities.dynamicAbilities.length > 0 && (
    selectedUnit.abilities.dynamicAbilities.map((ability, idx) => {
      const abilityKey = Object.keys(ability)[0]; // Get the key (e.g., "authorOfTheCodex")
      const abilityData = ability[abilityKey]; // Get the ability data

      return (
        <div key={idx} className="mt-2 text-gray-200 text-sm bg-gray-700 p-4 rounded">
          <h4 className="font-semibold border-b border-gray-600 pb-1 mb-1">
            {abilityKey.replace(/([A-Z])/g, ' $1').trim()}
          </h4>
          <p className="italic">{abilityData.description}</p>
          <ul className="mt-2">
            {abilityData.options.map((option, optIdx) => (
              <li key={optIdx} className="mt-1 bg-gray-800 p-2 rounded hover:bg-gray-600 transition duration-200">
                <strong>{option.name}:</strong> {option.rule}
              </li>
            ))}
          </ul>
        </div>
      );
    })
  )
}

















                {selectedUnit.abilities.unit.map((ability, idx) => (
                  <div key={idx} className="mt-2 text-gray-200 text-sm bg-gray-700 p-4 rounded">
                    <h4 className="font-semibold border-b border-gray-600 pb-1 mb-1">{ability.name}</h4>
                    <p>{ability.rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full bg-gray-500 p-2 rounded-lg shadow-lg text-center mt-4">
              <p className="text-sm"><strong>Keywords:</strong> {selectedUnit.keywords.join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
