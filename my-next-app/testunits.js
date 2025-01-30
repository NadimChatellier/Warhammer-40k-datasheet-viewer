const units = [
    // ✅ Space Marines
    {
      name: "Space Marine",
      image: "https://i.pinimg.com/originals/ba/ac/be/baacbe870fae82bd51a2ce06f9fcffca.jpg",
      stats: { M: 6, T: 4, Sv: 3, W: 2, LD: 7, OC: 1 },
      weapons: [
        { name: "Bolt Pistol", type: "Pistol", range: "12\"", strength: 4, AP: 0, damage: 1 },
        { name: "Chainsword", type: "Melee", range: "Melee", strength: 4, AP: 0, damage: 1 },
      ],
      specialRules: [
        "And They Shall Know No Fear: Ignores morale penalties.",
        "Bolter Discipline: Rapid fire weapons can be fired as assault weapons.",
      ],
    },
    {
      name: "Captain in Gravis Armor",
      image: "https://i.ebayimg.com/images/g/GhUAAOSwCjZmkaNL/s-l1600.webp",
      stats: { M: 5, T: 5, Sv: 3, W: 6, LD: 9, OC: 2 },
      weapons: [
        { name: "Boltstorm Gauntlet", type: "Pistol", range: "12\"", strength: 5, AP: -1, damage: 2 },
        { name: "Power Sword", type: "Melee", range: "Melee", strength: 5, AP: -3, damage: 2 },
      ],
      specialRules: [
        "Iron Halo: Has a 4+ invulnerable save.",
        "Master of Strategy: Can issue one additional command per battle round.",
      ],
    },
  
    // ✅ Chaos
    {
      name: "Chaos Space Marine",
      image: "https://www.warhammer.com/app/resources/catalog/product/threeSixty/99120102098_ChaosSpaceMarine1360/01.jpg",
      stats: { M: 7, T: 5, Sv: 4, W: 3, LD: 8, OC: 2 },
      weapons: [
        { name: "Plasma Pistol", type: "Pistol", range: "12\"", strength: 7, AP: -3, damage: "1" },
        { name: "Power Sword", type: "Melee", range: "Melee", strength: 4, AP: -3, damage: "2" },
      ],
      specialRules: [
        "Mark of Chaos: Gains a random benefit from the Chaos Gods.",
        "Veterans of the Long War: Re-rolls hit rolls of 1 in the fight phase.",
      ],
    },
    {
      name: "Abaddon the Despoiler",
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120102101_CSMAbbaddon02.jpg",
      stats: { M: 6, T: 6, Sv: 2, W: 8, LD: 10, OC: 4 },
      weapons: [
        { name: "Drach'nyen", type: "Melee", range: "Melee", strength: 9, AP: -4, damage: "D3+3" },
        { name: "Talon of Horus", type: "Ranged", range: "24\"", strength: 5, AP: -1, damage: "2" },
      ],
      specialRules: [
        "Dark Destiny: Cannot lose more than 3 wounds per phase.",
        "Warmaster: Friendly Chaos units within 6” get +1 attack.",
      ],
    },
  
    // ✅ Orks
    {
      name: "Ork Boy",
      image: "https://www.warhammer.com/app/resources/catalog/product/threeSixty/99120103081_CombatPatrolOrksOTT9360/01-01.jpg",
      stats: { M: 6, T: 4, Sv: 6, W: 1, LD: 6, OC: 1 },
      weapons: [
        { name: "Slugga", type: "Pistol", range: "12\"", strength: 4, AP: 0, damage: 1 },
        { name: "Choppa", type: "Melee", range: "Melee", strength: 4, AP: 0, damage: 1 },
      ],
      specialRules: [
        "Mob Rule: Gains +1 to hit rolls if 10+ models in unit.",
        "Waaagh!: Gains +1 strength and attack in a Waaagh! turn.",
      ],
    },
  
    // ✅ Necrons
    {
      name: "Necron Warrior",
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120110052_NecronWarriorsLead.jpg",
      stats: { M: 5, T: 4, Sv: 4, W: 1, LD: 8, OC: 1 },
      weapons: [
        { name: "Gauss Flayer", type: "Rapid Fire", range: "24\"", strength: 4, AP: -1, damage: 1 },
      ],
      specialRules: [
        "Reanimation Protocols: At the start of each turn, roll a D6 for each model slain last turn. On a 5+, it revives.",
      ],
    },
    {
      name: "Overlord",
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99070110006_OverlordTachyonArrow1.jpg",
      stats: { M: 5, T: 5, Sv: 3, W: 5, LD: 9, OC: 2 },
      weapons: [
        { name: "Staff of Light", type: "Ranged & Melee", range: "18\"", strength: 5, AP: -2, damage: 2 },
      ],
      specialRules: [
        "My Will Be Done: A friendly unit within 6” gets +1 to hit.",
      ],
    },
  
    // ✅ Tyranids
    {
      name: "Termagant",
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120106066_Termagaunts2.jpg",
      stats: { M: 6, T: 3, Sv: 5, W: 1, LD: 7, OC: 1 },
      weapons: [
        { name: "Fleshborer", type: "Assault", range: "12\"", strength: 4, AP: 0, damage: 1 },
      ],
      specialRules: [
        "Synapse: Ignores negative morale effects within 12” of a Hive Mind unit.",
      ],
    },
    {
      name: "Hive Tyrant",
      image: "https://www.warhammer.com/app/resources/catalog/product/920x950/99120106060_HiveTyrantLead.jpg",
      stats: { M: 9, T: 7, Sv: 2, W: 12, LD: 10, OC: 5 },
      weapons: [
        { name: "Monstrous Scything Talons", type: "Melee", range: "Melee", strength: 8, AP: -3, damage: "D6" },
      ],
      specialRules: [
        "Synapse: Extends the morale immunity to units within 12”",
        "Shadow in the Warp: Enemy Psykers suffer -1 to cast.",
      ],
    },
  ];

module.exports = {units}