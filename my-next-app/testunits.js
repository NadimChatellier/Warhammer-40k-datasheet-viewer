const units = [
    // ✅ Space Marines
    {
      name: "Space Marine",
      faction: "Adeptus Astartes",
      keywords: ["Infantry", "Battleline", "Imperium", "Space Marine"],
      image: "https://i.pinimg.com/originals/ba/ac/be/baacbe870fae82bd51a2ce06f9fcffca.jpg",
      stats: { M: 6, T: 4, Sv: 3, W: 2, LD: 6, OC: 2 },
      meleeWeapons: [
        { name: "Astartes Chainsword", type: "Melee", attacks: 3, skill: 3, strength: 4, AP: -1, damage: 1 },
      ],
      rangedWeapons: [
        { name: "Boltgun", type: "Rapid Fire 1", range: "24\"", skill: 3, strength: 4, AP: 0, damage: 1 },
      ],
      abilities: {
        core: ["Deep Strike"],
        faction: ["Oath of Moment"],
        unit: [
          {name: "And They Shall Know No Fear",
            rule: "Ignores modifiers to Battle-shock and Leadership tests."},
        ],
      },
    },
    {
        name: "Roboute Guilliman",
        faction: "Adeptus Astartes",
        keywords: ["Character", "Monster", "Primarch", "Roboute Guilliman", "Imperium", "Ultramarines"],
        INVULNERABLE_SAVE: "4+",
        image: "https://www.adeptusars.com/wp-content/uploads/2023/07/Roboute-Guilliman.jpg", // replace with actual image path
        stats: { M: "8\"", T: 9, Sv: "2+", W: 10, LD: "5+", OC: 4},
        meleeWeapons: [
          { name: "Emperor’s Sword", type: "Melee", attacks: 14, skill: "2", strength: 8, AP: -3, damage: 2, coreRules: ["Devastating Wounds"] },
          { name: "Hand of Dominion", type: "Melee", attacks: 7, skill: "2", strength: 14, AP: -4, damage: 4, coreRules: ["Lethal Hits"] },
        ],
        rangedWeapons: [
          { name: "Hand of Dominion", type: "Rapid Fire 2", attacks: 4, range: "30\"", skill: "2+", strength: 6, AP: -2, damage: 2 },
        ],
        abilities: {
          core: ["Master of Battle", "Supreme Strategist"],
          faction: ["Oath of Moment"],
          unit: [
            { name: "Ultramarines Bodyguard", rule: "While this model is within 3\" of friendly ADEPTUS ASTARTES INFANTRY units, this model has the Lone Operative ability." },
            { name: "Armour of Fate", rule: "The first time this model is destroyed, on a 3+, it returns to the battlefield with 6 wounds remaining." },
          ],
          dynamicAbilities: [{
            "Author of the Codex": {
                description: "At the Start of your Command phase, seltect two Author of the Codex abilities. These are active until the start of your next Command phase.",
                options: [
                  { name: "Re-roll Battle-shock", rule: "You can re-roll Battle-shock and Leadership tests taken for friendly ADEPTUS ASTARTES units within 6\"." },
                  { name: "Add 1 to Objective Control", rule: "Add 1 to the Objective Control characteristic of models in friendly ADEPTUS ASTARTES units within 6\"." },
                  { name: "Increase Leadership", rule: "Add 1 to Leadership tests taken by friendly ADEPTUS ASTARTES units within 6\"." },
                ],
                selectedAbilities: [], // This will store the active abilities chosen for the turn
              },
          }
        ],
        },
        unitComposition: [
          { name: "Roboute Guilliman – EPIC HERO", description: "This model is equipped with: Hand of Dominion; Emperor’s Sword." }
        ],
        keywordsList: ["MONSTER", "CHARACTER", "EPIC HERO", "IMPERIUM", "PRIMARCH", "ROBOUTE GUILLIMAN"],
        factionKeywords: ["ADEPTUS ASTARTES", "ULTRAMARINES"],
      },
  
    {
      name: "Captain in Gravis Armor",
      faction: "Adeptus Astartes",
      keywords: ["Character", "Infantry", "Imperium", "Gravis", "Captain"],
      image: "https://i.ebayimg.com/images/g/GhUAAOSwCjZmkaNL/s-l1600.webp",
      stats: { M: 5, T: 6, Sv: 2, W: 6, LD: 5, OC: 2 },
      meleeWeapons: [
        { name: "Power Sword", type: "Melee", attacks: 4, skill: 2, strength: 5, AP: -3, damage: 2 },
      ],
      rangedWeapons: [
        { name: "Boltstorm Gauntlet", type: "Pistol", range: "12\"", skill: 2, strength: 5, AP: -1, damage: 1, rules: [{name :"test", rule:"this is a test blah blah blah"}]},
      ],
      abilities: {
        core: ["Leader"],
        faction: ["Oath of Moment"],
        unit: [
          {name: "Iron Halo",
            rule: "Has a 4+ invulnerable save."},
          {name:"Rites of Battle",
            rule: "While leading a unit, re-roll Battle-shock tests."},
        ],
      },
    },
  
    // ✅ Chaos
    {
      name: "Chaos Space Marine",
      faction: "Heretic Astartes",
      keywords: ["Infantry", "Legiones Hereticus", "Chaos", "Space Marine"],
      image: "https://www.warhammer.com/app/resources/catalog/product/threeSixty/99120102098_ChaosSpaceMarine1360/01.jpg",
      stats: { M: 6, T: 4, Sv: 3, W: 2, LD: 6, OC: 2 },
      meleeWeapons: [
        { name: "Accursed Chainsword", type: "Melee", attacks: 3, skill: 3, strength: 4, AP: -1, damage: 1 },
      ],
      rangedWeapons: [
        { name: "Boltgun", type: "Rapid Fire 1", range: "24\"", skill: 3, strength: 4, AP: 0, damage: 1 },
      ],
      abilities: {
        core: ["Deep Strike"],
        faction: ["Dark Pact"],
        unit: [
          {name:"Veterans of the Long War",
            rule: "When targeting an Imperium unit, re-roll 1 wound roll."},
        ],
      },
    },
  
    {
      name: "Abaddon the Despoiler",
      faction: "Heretic Astartes",
      keywords: ["Character", "Monster", "Chaos", "Warmaster", "Terminator"],
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120102101_CSMAbbaddon02.jpg",
      stats: { M: 6, T: 10, Sv: 2, W: 9, LD: 4, OC: 5 },
      meleeWeapons: [
        { name: "Drach'nyen", type: "Melee", attacks: 6, skill: 2, strength: 10, AP: -4, damage: "D3+3" },
      ],
      rangedWeapons: [
        { name: "Talon of Horus", type: "Rapid Fire 2", range: "24\"", skill: 2, strength: 5, AP: -1, damage: 2 },
      ],
      abilities: {
        core: ["Leader", "Deep Strike"],
        faction: ["Dark Pact"],
        unit: [
          {name: "Dark Destiny",
            rule: "Cannot lose more than 3 wounds per phase."},
          {name:"Warmaster",
            rule: "Friendly Chaos units within 6” get +1 attack."},
        ],
      },
    },
  
    // ✅ Orks
    {
      name: "Ork Boy",
      faction: "Orks",
      keywords: ["Infantry", "Ork", "Boyz"],
      image: "https://www.warhammer.com/app/resources/catalog/product/threeSixty/99120103081_CombatPatrolOrksOTT9360/01-01.jpg",
      stats: { M: 6, T: 5, Sv: 6, W: 1, LD: 7, OC: 1 },
      meleeWeapons: [
        { name: "Choppa", type: "Melee", attacks: 2, skill: 3, strength: 5, AP: 0, damage: 1 },
      ],
      rangedWeapons: [
        { name: "Slugga", type: "Pistol", range: "12\"", skill: 4, strength: 4, AP: 0, damage: 1 },
      ],
      abilities: {
        core: ["Deep Strike"],
        faction: ["Waaagh!"],
        unit: [
          {name:"Mob Rule", 
            rule: "If this unit has 10+ models, it gets +1 to hit rolls."},
        ],
      },
    },
  
    // ✅ Necrons
    {
      name: "Necron Warrior",
      faction: "Necrons",
      keywords: ["Infantry", "Necron", "Warrior"],
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120110052_NecronWarriorsLead.jpg",
      stats: { M: 5, T: 4, Sv: 4, W: 1, LD: 6, OC: 1 },
      rangedWeapons: [
        { name: "Gauss Flayer", type: "Rapid Fire 1", range: "24\"", skill: 3, strength: 4, AP: -1, damage: 1 },
      ],
      abilities: {
        core: ["Reanimation Protocols"],
        faction: ["Command Protocols"],
        unit: [
          {name: "Reanimation Protocols",
            rule: "Roll a D6 for each slain model at the start of your turn. On a 5+, revive."},
        ],
      },
    },
  
    // ✅ Tyranids
    {
      name: "Hive Tyrant",
      faction: "Tyranids",
      keywords: ["Monster", "Synapse", "Hive Tyrant"],
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120106060_HiveTyrantLead.jpg",
      stats: { M: 9, T: 9, Sv: 2, W: 12, LD: 5, OC: 5 },
      meleeWeapons: [
        { name: "Monstrous Scything Talons", type: "Melee", attacks: 5, skill: 2, strength: 9, AP: -3, damage: "D6", rules: [{name :"test", rule:"this is a test blah blah blah"}]}
      ],
      abilities: {
        core: ["Synapse", "Shadow in the Warp"],
        faction: ["Synaptic Imperative"],
        unit: [
          {name: "Shadow in the Warp",
           rule: "Enemy Psykers suffer -1 to cast."},
        ],
      },
    },

    {
        name: "Deathleaper",
        faction: "Tyranids",
        keywords: ["INFANTRY", "CHARACTER", "EPIC HERO", "GREAT DEVOURER", "VANGUARD INVADER", "DEATHLEAPER"],
        INVULNERABLE_SAVE: "4+",
        image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120106067_Deathleaper1.jpg", // replace with actual image path
        stats: {
          M: "8\"",
          T: 6,
          Sv: "3+",
          W: 7,
          LD: "7+",
          OC: 1
        },
        meleeWeapons: [
          { 
            name: "Lictor claws and talons", 
            type: "Melee", 
            attacks: 6, 
            skill: "2+", 
            strength: 7, 
            AP: -2, 
            damage: 2, 
            coreRules: ["Precision"] 
          }
        ],
        rangedWeapons: [],
        abilities: {
          core: ["Fights First", "Infiltrators", "Lone Operative", "Stealth"],
          faction: ["Synapse"],
          unit: [
            { 
              name: "Feeder Tendrils", 
              rule: "Each time this model destroys an enemy CHARACTER model, you gain 1CP." 
            },
            { 
              name: "Fear of the Unseen (Aura)", 
              rule: "While an enemy unit is within 6\" of this model, worsen the Leadership characteristic of models in that unit by 1. In addition, in the Battle-shock step of your opponent’s Command phase, if such an enemy unit is below its Starting Strength, it must take a Battle-shock test." 
            }
          ],
        },
        unitComposition: [
          { 
            name: "Deathleaper – EPIC HERO", 
            description: "This model is equipped with: Lictor claws and talons." 
          }
        ],
        keywordsList: ["INFANTRY", "CHARACTER", "EPIC HERO", "GREAT DEVOURER", "VANGUARD INVADER", "DEATHLEAPER"],
        factionKeywords: ["TYRANIDS"],
      },  
      
      {
        name: "Norn Emissary",
        faction: "Tyranids",
        keywords: ["MONSTER", "PSYKER", "GREAT DEVOURER", "SYNAPSE", "NORN EMISSARY"],
        INVULNERABLE_SAVE: "4+",
        image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120106064_NornEmissary1.jpg", // replace with actual image path
        stats: {
          M: "10\"",
          T: 11,
          Sv: "2+",
          W: 16,
          LD: "7+",
          OC: 5
        },
        meleeWeapons: [
          { 
            name: "Monstrous scything talons", 
            type: "Melee", 
            attacks: 6, 
            skill: "2+", 
            strength: 9, 
            AP: -2, 
            damage: 3, 
            coreRules: [] 
          },
          { 
            name: "Monstrous rending claws", 
            type: "Melee", 
            attacks: 4, 
            skill: "2+", 
            strength: 7, 
            AP: -2, 
            damage: 2, 
            coreRules: ["Extra Attacks"] 
          }
        ],
        rangedWeapons: [
          { 
            name: "Psychic Tendril – neuroparasite", 
            range: "18\"", 
            attacks: 2, 
            skill: "2+", 
            strength: 8, 
            AP: -2, 
            damage: "D3", 
            coreRules: ["Precision", "Psychic"]
          },
          { 
            name: "Psychic Tendril – neuroblast", 
            range: "18\"", 
            attacks: "2D6", 
            skill: "2+", 
            strength: 6, 
            AP: -2, 
            damage: 1, 
            coreRules: ["Blast", "Psychic"]
          },
          { 
            name: "Psychic Tendril – neurolance", 
            range: "18\"", 
            attacks: 2, 
            skill: "2+", 
            strength: 12, 
            AP: -3, 
            damage: "D6", 
            coreRules: ["Melta 2", "Psychic"]
          }
        ],
        abilities: {
          core: ["Deadly Demise D6"],
          faction: ["Shadow in the Warp", "Synapse"],
          unit: [
            { 
              name: "Singular Purpose", 
              rule: "At the start of the first battle round, select one of the following: Select one enemy unit. Until the end of the battle, each time this model makes an attack that targets that unit, you can re-roll the Hit roll and you can re-roll the Wound roll. Or select one objective marker. Until the end of the battle, while this model is within range of that objective marker, it has the Feel No Pain 5+ ability and an Objective Control characteristic of 15." 
            },
            { 
              name: "Unnatural Resilience", 
              rule: "This model has the Feel No Pain 4+ ability against mortal wounds." 
            }
          ],
          dynamicAbilities: [],
        },
        unitComposition: [
          { 
            name: "Norn Emissary", 
            description: "This model is equipped with: Psychic Tendril; monstrous scything talons; monstrous rending claws." 
          }
        ],
        keywordsList: ["MONSTER", "PSYKER", "GREAT DEVOURER", "SYNAPSE", "NORN EMISSARY"],
        factionKeywords: ["TYRANIDS"],
        damaged: {
          description: "While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
        },
      }
      

    
  ];
  
  module.exports = { units };
  