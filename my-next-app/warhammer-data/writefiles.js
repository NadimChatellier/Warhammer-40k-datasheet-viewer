const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cheerio = require('cheerio'); // Used for cleaning up HTML tags
const readline = require('readline');

// Paths for CSV files and output folder
const factionsCsv = path.join(__dirname, 'warhammer-csvs', 'Factions.csv');
const datasheetsCsv = path.join(__dirname, 'warhammer-csvs', 'Datasheets.csv');
const datasheetsModelsCsv = path.join(__dirname, 'warhammer-csvs', 'Datasheets_models.csv');
const outputDir = path.join(__dirname, '40kJsonData');
const abilitiesFilePath = path.join(__dirname, 'warhammer-csvs', 'Datasheets_abilities.csv');
const datasheetsLeadersCsv = path.join(__dirname, 'warhammer-csvs', 'Datasheets_leader.csv');  // Correct path for leaders CSV

// Function to clean up HTML tags
const cleanText = (text) => {
  const $ = cheerio.load(text || '');
  return $.text().trim();
};

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Output directory created');
}

// Global objects to hold data
const factionDataMap = {};
const unitDataMap = {}; // Maps datasheet_id -> unit template data

/**
 * Load existing faction JSON files (if any) from outputDir.
 * Returns an object mapping faction ID to its unit image lookup (mapping unit id -> unit_img).
 */
function loadExistingUnitImages() {
  const existingImages = {}; // { factionId: { unitId: unit_img } }
  const files = fs.readdirSync(outputDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      try {
        const filePath = path.join(outputDir, file);
        const factionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (factionData && factionData.id && Array.isArray(factionData.units)) {
          existingImages[factionData.id] = {};
          factionData.units.forEach(unit => {
            if (unit.id && unit.unit_img && unit.unit_img.trim().length > 0) {
              existingImages[factionData.id][unit.id] = unit.unit_img;
            }
          });
        }
      } catch (err) {
        console.error(`Error loading ${file}:`, err);
      }
    }
  });
  return existingImages;
}

/**
 * Step 1: Read Factions.csv and initialize faction JSON structures
 */
function readFactions() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(factionsCsv)
      .pipe(csv({ separator: '|' }))
      .on('data', (row) => {
        const trimmedRow = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key.trim(), value ? value.trim().replace(/\r/g, '') : ''])
        );
        const id = trimmedRow.id;
        const name = trimmedRow.name;
        if (!id || !name) {
          console.log(`⚠️ Skipping row without valid id or name:`, trimmedRow);
          return;
        }
        // Initialize each faction with an empty units array.
        factionDataMap[id] = { id, name, units: [] };
      })
      .on('end', () => {
        console.log('🎉 Faction JSON files initialized.');
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ Error reading Factions CSV:', err);
        reject(err);
      });
  });
}

/**
 * Step 2: Read Datasheets.csv and prepare unit mapping,
 * preserving existing unit_img if present in the output JSON.
 */
function readDatasheets() {
  // First, load existing unit images from current JSON files
  const existingUnitImages = loadExistingUnitImages();

  return new Promise((resolve, reject) => {
    fs.createReadStream(datasheetsCsv)
      .pipe(csv({ separator: '|' }))
      .on('data', (row) => {
        const trimmedRow = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key.trim(), value ? value.trim() : ''])
        );

        const datasheetId = trimmedRow.id;
        const factionId = trimmedRow.faction_id;
        const name = trimmedRow.name;
        const role = trimmedRow.role;
        const loadout = cleanText(trimmedRow.loadout);
        const transport = cleanText(trimmedRow.transport || "");
        const damaged_w = cleanText(trimmedRow.damaged_w || "");

        // Remove any trailing URL in `damaged_description`
        let damaged_description = cleanText(trimmedRow.damaged_description || "");
        damaged_description = damaged_description.replace(/\|https?:\/\/\S+$/, ""); 

        if (!datasheetId || !factionId || !name) {
          console.log(`⚠️ Skipping row with missing data:`, trimmedRow);
          return;
        }

        // Store base unit details for later use.
        unitDataMap[datasheetId] = { 
          datasheetId, 
          factionId, 
          name, 
          loadout, 
          role, 
          transport, 
          damaged_w, 
          damaged_description 
        };

        if (factionDataMap[factionId]) {
          // Check if unit already exists in our factionDataMap.
          const existingUnitIndex = factionDataMap[factionId].units.findIndex(u => u.id === datasheetId);
          let preservedImg = "";

          // If we have an image for this unit from existing data, use it.
          if (existingUnitImages[factionId] && existingUnitImages[factionId][datasheetId]) {
            preservedImg = existingUnitImages[factionId][datasheetId];
          }

          if (existingUnitIndex !== -1) {
            // Merge the new data while preserving the existing image.
            const existingUnit = factionDataMap[factionId].units[existingUnitIndex];
            factionDataMap[factionId].units[existingUnitIndex] = {
              ...existingUnit,
              name,
              faction_id: factionId,
              loadout,
              transport,
              damaged_w,
              damaged_description,
              unit_img: preservedImg || existingUnit.unit_img || "",
              profiles: existingUnit.profiles,
              ranged_weapons: existingUnit.ranged_weapons,
              melee_weapons: existingUnit.melee_weapons
            };
          } else {
            // Create a new unit object. Use the preserved image if available.
            const newUnit = {
              id: datasheetId,
              name,
              faction_id: factionId,
              unit_img: preservedImg, // Will be empty string if no image exists.
              loadout,
              role,
              transport,
              damaged_w,
              damaged_description,
              profiles: [],
              ranged_weapons: [],
              melee_weapons: []
            };
            factionDataMap[factionId].units.push(newUnit);
          }
        }
      })
      .on('end', () => {
        console.log('🎉 Units mapped to factions with transport and damage fields cleaned.');
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ Error reading Datasheets CSV:', err);
        reject(err);
      });
  });
}

// Function to add 'leads' to the leader units
function addLeadsToLeaders() {
  return new Promise((resolve, reject) => {
    let buffer = "";
    
    // Read the Datasheets_leaders.csv to get leader-attachment relationships
    fs.createReadStream(datasheetsLeadersCsv, { encoding: 'utf8' })
      .on("data", (chunk) => { buffer += chunk; })
      .on("end", () => {
        const rows = buffer.split("\r\n").filter(row => row.trim() !== "");
        
        rows.forEach((line) => {
          const [leaderId, attachedId] = line.split("|").map(id => id.trim());
          if (!leaderId || !attachedId) return;

          // Find the leader unit using the existing findUnitById function
          const leaderUnitData = findUnitById(leaderId);
          if (!leaderUnitData) {
            console.log(`⚠️ Leader unit ${leaderId} not found.`);
            return;
          }

          // Find the attached unit using the existing findUnitById function
          const attachedUnitData = findUnitById(attachedId);
          if (!attachedUnitData) {
            console.log(`⚠️ Attached unit ${attachedId} not found.`);
            return;
          }

          const { unit: leaderUnit } = leaderUnitData;

          // Ensure the leader unit has a 'leads' array
          if (!leaderUnit.leads) {
            leaderUnit.leads = [];
          }

          // Add the attached unit's ID and name to the leader's 'leads' array
          leaderUnit.leads.push({ id: attachedId, name: attachedUnitData.unit.name, unit_img: attachedUnitData.unit.unit_img });

          console.log(`🔗 Leader ${leaderUnit.name} (ID: ${leaderId}) can lead ${attachedUnitData.unit.name} (ID: ${attachedId})`);
        });

        console.log("🎉 Leader units updated with leads array.");
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ Error reading Datasheets_leaders CSV:", err);
        reject(err);
      });
  });
}
/**
 * Step 3: Parse Datasheets_models.csv and count unit profiles
 */
function parseUnitProfiles() {
  return new Promise((resolve, reject) => {
    let totalProfiles = 0;
    let buffer = "";
    fs.createReadStream(datasheetsModelsCsv, { encoding: 'utf8' })
      .on("data", (chunk) => { buffer += chunk; })
      .on("end", () => {
        const rows = buffer.split("\r\n").filter(row => row.trim() !== "");
        rows.forEach((line) => {
          const fields = line.split("|");
          if (fields.length < 3) return;
          const datasheetId = fields[0].trim();
          if (!datasheetId) return;
          const factionId = unitDataMap[datasheetId]?.factionId;
          const baseUnit = unitDataMap[datasheetId];
          if (!baseUnit || !factionId || !factionDataMap[factionId]) {
            console.log(`⚠️ Skipping profile with unknown unit or faction:`, line);
            return;
          }
          const profileNames = fields[2].split("\n");
          profileNames.forEach((profileName) => {
            const movement = fields[3].split("|")[0];
            const profile = {
              name: profileName.trim(),
              movement,
              toughness: fields[4],
              save: fields[5],
              invulnerable_save: fields[6] || '',
              invulnerable_description: fields[7] || "",
              wounds: fields[8],
              leadership: fields[9],
              objective_control: fields[10],
              base_size: fields[11],
              base_size_description: fields[12] || ""
            };
            let unit = factionDataMap[factionId].units.find(u => u.id === datasheetId);
            if (!unit) {
              console.log(`❌ Unit with datasheetId ${datasheetId} not found in faction ${factionId}`);
              unit = {
                id: datasheetId,
                name: baseUnit.name,
                unit_img: "N/a",
                faction_id: factionId,
                loadout: baseUnit.loadout,
                profiles: []
              };
              console.log(`Creating new unit for faction ${factionId}:`, unit);
              factionDataMap[factionId].units.push(unit);
            }
            unit.profiles.push(profile);
            totalProfiles++;
          });
        });
        console.log(`🎉 Total unit profiles parsed: ${totalProfiles}`);
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ Error reading Datasheets Models CSV:", err);
        reject(err);
      });
  });
}

/**
 * Step 4: Parse Datasheets_wargear.csv and sort weapons into ranged and melee arrays.
 */
async function parseUnitWeapons() {
  const wargearFilePath = path.join(__dirname, 'warhammer-csvs', 'Datasheets_wargear.csv');
  return new Promise((resolve, reject) => {
    fs.createReadStream(wargearFilePath)
      .pipe(csv({
        separator: '|',
        headers: ['datasheet_id', 'line', 'line_in_wargear', 'dice', 'name', 'description', 'range', 'type', 'A', 'BS_WS', 'S', 'AP', 'D']
      }))
      .on('data', (row) => {
        
        row.description = cleanText(row.description); // Remove HTML tags
        const datasheetId = row.datasheet_id;
        if (!datasheetId || !unitDataMap[datasheetId]) {
          // console.log(`⚠️ Skipping wargear with unknown datasheet_id:`, row);
          return;
        }

        // Split description into parts and extract special rules.
        const parts = row.description.split('|');
        
        const specialRules = [];
        while (parts.length > 0 && isNaN(parts[0]) && parts[0] !== 'Melee') {
          specialRules.push(...parts.shift().split(',').map(rule => rule.trim()));
        }
        // may cause issues, to investigate further
        const wargearItem = {
          name: row.name,
          special_rules: specialRules,
          range: parts.shift() || row.range,
          type: parts.shift() || row.type,
          A: parts.shift() || row.A,
          BS_WS: parts.shift() || row.BS_WS,
          S: parts.shift() || row.S,
          AP: parts.shift() || row.AP,
          D: parts.shift() || row.D
        };
        const isRanged = wargearItem.type !== 'Melee';
        const unit = factionDataMap[unitDataMap[datasheetId].factionId]?.units.find(u => u.id === datasheetId);
        if (!unit) {
          console.log(`❌ Could not find unit for datasheetId ${datasheetId}`);
          return;
        }
        if (isRanged) {
          unit.ranged_weapons.push(wargearItem);
        } else {
          unit.melee_weapons.push(wargearItem);
        }
      })
      .on('end', () => {
        console.log('🎉 Weapons sorted and assigned to units.');
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Step 5: Write final JSON files
 */
function writeFactionFiles() {
  return new Promise((resolve, reject) => {
    try {
      for (const [factionId, factionData] of Object.entries(factionDataMap)) {
        const sanitizedFactionName = factionData.name.replace(/\s+/g, '');
        const factionFilePath = path.join(outputDir, `${sanitizedFactionName}.json`);
        console.log(`Writing updated file for faction ${sanitizedFactionName}...`);
        fs.writeFileSync(factionFilePath, JSON.stringify(factionData, null, 2));
        console.log(`✅ Updated ${sanitizedFactionName}.json`);
      }
      console.log('🎉 All factions updated successfully!');
      resolve();
    } catch (err) {
      console.error('❌ Error writing faction JSON files:', err);
      reject(err);
    }
  });
}
/**
 * Writes a JSON file with only faction IDs and names.
 */
function writeFactionSummary() {
  return new Promise((resolve, reject) => {
    try {
      const factionSummary = Object.values(factionDataMap).map(faction => ({
        id: faction.id,
        name: faction.name
      }));

      const filePath = path.join(outputDir, 'FactionsSummary.json');
      fs.writeFileSync(filePath, JSON.stringify(factionSummary, null, 2));

      console.log('✅ Faction summary written successfully.');
      resolve();
    } catch (err) {
      console.error('❌ Error writing faction summary:', err);
      reject(err);
    }
  });
}

// Helper function to remove the ability name from the description
function removeAbilityName(abilityName, description) {
  // Remove ability name from the start of the description if it matches
  const abilityNameRegex = new RegExp(`^${abilityName}`, 'i');
  return description.replace(abilityNameRegex, '').trim(); // Removes name from the beginning of the description
}


function parseUnitAbilities() {
  return new Promise((resolve, reject) => {
    let buffer = "";

    // Path to the Abilities.csv file (the one with ability names and descriptions)
    const abilitiesCsvPath = path.join(__dirname, 'warhammer-csvs', 'Abilities.csv'); // Ensure the path is correct
    const abilitiesMap = {};  // Map to hold abilities by their ID for fast lookup

    // First, read the abilities CSV to populate abilitiesMap
    fs.createReadStream(abilitiesCsvPath, { encoding: "utf8" })
      .on("data", (chunk) => {
        buffer += chunk;
      })
      .on("end", () => {
        const rows = buffer.split("\r\n").filter((row) => row.trim() !== "");

        // Parse the abilities CSV and store abilities in abilitiesMap
        rows.forEach((line) => {
          const fields = line.split("|").map((f) => f.trim());

          if (fields.length < 5) {
            console.log("⚠️ Skipping malformed ability row:", line);
            return;
          }

          const [abilityId, abilityName, abilityLegend, factionId, abilityDescription] = fields;

          // Add ability to map by ability_id
          abilitiesMap[abilityId] = {
            name: abilityName,
            description: abilityDescription,  // This is the actual rule (not a general description)
          };
        });

        // Now parse the unit abilities file (the one you already have in parseUnitAbilities)
        let unitBuffer = "";
        fs.createReadStream(abilitiesFilePath, { encoding: "utf8" })
          .on("data", (chunk) => {
            unitBuffer += chunk;
          })
          .on("end", () => {
            const unitRows = unitBuffer.split("\r\n").filter((row) => row.trim() !== "");

            unitRows.forEach((line) => {
              const fields = line.split("|").map((f) => f.trim());

              if (fields.length < 7) {
                console.log(`⚠️ Skipping malformed ability row:`, line);
                return;
              }

              const datasheetId = fields[0];
              if (!datasheetId) return;

              const baseUnit = unitDataMap[datasheetId];
              if (!baseUnit) {
                console.log(`⚠️ Skipping ability with unknown datasheetId: ${datasheetId}`);
                return;
              }

              const factionId = baseUnit.factionId;
              if (!factionId || !factionDataMap[factionId]) {
                console.log(`⚠️ Skipping ability due to unknown faction:`, line);
                return;
              }

              let abilityType = fields[6].toLowerCase().trim();

              // Normalize Russian ability types
              if (abilityType.includes("special")) {
                abilityType = "special";
              } else if (abilityType.includes("fortification")) {
                abilityType = "fortification";
              }

              // Ensure proper handling of wargear profile
              if (abilityType === "wargear profile") {
                abilityType = "wargear";
              }

              // Add new ability type: primarch
              if (abilityType === "primarch") {
                abilityType = "primarch";
              }

              // Only allow known ability types
              const validAbilityTypes = ["core", "faction", "datasheet", "wargear", "special", "fortification", "primarch"];
              if (!validAbilityTypes.includes(abilityType)) {
                console.log(`⚠️ Skipping unknown ability type: ${abilityType}`);
                return;
              }

              const ability = {
                datasheet_id: datasheetId,
                line: fields[1],
                ability_id: fields[2],
                name: fields[4] || "Unknown",
                description: fields[5] ? cleanText(fields[5]) : "No description available",
                type: abilityType,
                parameter: fields[7] || "",
              };

              // Fetch the actual rule (description) for core and faction abilities
              if (abilityType === "core" || abilityType === "faction") {
                const abilityDetails = abilitiesMap[ability.ability_id];
                if (abilityDetails) {
                  // Set the actual rule description
                  ability.name = abilityDetails.name;
                  ability.description = cleanText(abilityDetails.description).replace(/\|/g, "") // Clean HTML from the description
                  ability.description = removeAbilityName(ability.name, ability.description); // Remove name from description
                } else {
                  console.log(`⚠️ No matching ability found for ability ID: ${ability.ability_id}`);
                }
              }

              // Find or create the unit in the faction
              let unit = factionDataMap[factionId].units.find((u) => u.id === datasheetId);
              if (!unit) {
                console.log(`❌ Unit with datasheetId ${datasheetId} not found in faction ${factionId}, creating new unit...`);
                unit = {
                  id: datasheetId,
                  name: baseUnit.name,
                  unit_img: "N/a",
                  faction_id: factionId,
                  loadout: baseUnit.loadout,
                  abilities: { core: [], faction: [], datasheet: [], wargear: [], special: [], fortification: [], primarch: [] }
                };
                factionDataMap[factionId].units.push(unit);
              }

              // Ensure abilities object exists before pushing
              if (!unit.abilities) {
                unit.abilities = { core: [], faction: [], datasheet: [], wargear: [], special: [], fortification: [], primarch: [] };
              }

              // ✅ Check if ability already exists to avoid duplicates
              const isDuplicate = unit.abilities[abilityType].some(
                (existingAbility) =>
                  existingAbility.name === ability.name &&
                  existingAbility.description === ability.description &&
                  existingAbility.line === ability.line
              );

              if (isDuplicate) {
                return;
              }

              // ✅ Add the ability if it is not a duplicate
              unit.abilities[abilityType].push(ability);
            });

            console.log(`✅ All abilities successfully parsed (duplicates avoided).`);
            resolve();
          })
          .on("error", (err) => {
            console.error("❌ Error reading unit abilities CSV:", err);
            reject(err);
          });
      })
      .on("error", (err) => {
        console.error("❌ Error reading abilities CSV:", err);
        reject(err);
      });
  });
}







// Function to find a unit by ID within factionDataMap
function findUnitById(targetId) {
  for (const factionKey of Object.keys(factionDataMap)) {
      const faction = factionDataMap[factionKey];

      if (!faction.units) continue; // Skip if no units exist

      const unit = faction.units.find(u => u.id === targetId);
      if (unit) {
          console.log(`✅ Found unit ${targetId} in faction: ${factionKey}`);
          return { unit, factionKey }; // Return unit & its faction key
      }
  }

  console.log(`❌ Unit with ID ${targetId} not found in any faction.`);
  return null;
}

async function parseUnitCosts() {
  const unitCostFilePath = path.join(__dirname, 'warhammer-csvs', 'Datasheets_models_cost.csv');
  console.log(`Unit Cost File Path: ${unitCostFilePath}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(unitCostFilePath)
      .pipe(csv({ separator: '|', headers: ['datasheet_id', 'line', 'description', 'cost'] }))
      .on('data', (row) => {
        const { datasheet_id, cost } = row;
        console.log(`🔍 Searching for datasheet_id: ${datasheet_id}`);

        // Clean up the cost and description
        const cleanedCost = parseInt(cost.trim(), 10); // Ensure cost is an integer
        const cleanedDescription = cleanText(row.description);

        // Look through all the factions to find the unit
        let unitFound = false;

        for (const factionKey of Object.keys(factionDataMap)) {
          const faction = factionDataMap[factionKey];

          if (!faction.units) continue; // Skip if no units in this faction

          // Find the unit in this faction's units list
          const unit = faction.units.find(u => u.id === datasheet_id);
          if (unit) {
            unitFound = true;

            // Ensure cost array exists in the unit object
            if (!unit.costs) {
              unit.costs = [];
            }

            // Add the new cost to the unit's costs
            unit.costs.push({
              line: row.line, // the line info
              description: cleanedDescription, // the cleaned description
              cost: cleanedCost // the cleaned cost
            });

            console.log(`✅ Added cost to unit ${datasheet_id} in faction ${factionKey}`);
            break; // No need to continue looping after finding the unit
          }
        }

        if (!unitFound) {
          console.log(`⚠️ Skipping: No faction contains unit_id: ${datasheet_id}`);
        }
      })
      .on('end', () => {
        console.log('🎉 Unit costs successfully parsed and assigned.');
        resolve();
      })
      .on('error', (err) => {
        console.log(`❌ Error reading unit cost file: ${err.message}`);
        reject(err);
      });
  });
}


async function parseUnitKeywords() {
  const keywordFilePath = path.join(__dirname, 'warhammer-csvs', 'Datasheets_keywords.csv');
  console.log(`Keyword File Path: ${keywordFilePath}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(keywordFilePath)
      .pipe(csv({ separator: '|', headers: ['datasheet_id', 'keyword', 'model', 'is_faction_keyword'] }))
      .on('data', (row) => {
        const { datasheet_id, keyword, is_faction_keyword } = row;
        console.log(`🔍 Searching for datasheet_id: ${datasheet_id}`);

        // Find the unit in factionDataMap
        const result = findUnitById(datasheet_id);
        if (!result) {
          console.log(`⚠️ Skipping: No faction contains unit_id: ${datasheet_id}`);
          return;
        }

        const { unit, factionKey } = result;

        // Ensure keywords object exists in the unit
        if (!unit.keywords) {
          unit.keywords = { faction: [], other: [] };
        }

        // Add the keyword to the correct array
        if (is_faction_keyword.toLowerCase() === 'true') {
          if (!unit.keywords.faction.includes(keyword)) {
            unit.keywords.faction.push(keyword);
          }
        } else {
          if (!unit.keywords.other.includes(keyword)) {
            unit.keywords.other.push(keyword);
          }
        }

        console.log(`✅ Added keyword "${keyword}" to unit ${datasheet_id} in faction ${factionKey}`);
      })
      .on('end', () => {
        console.log('🎉 Unit keywords successfully parsed and assigned.');
        resolve();
      })
      .on('error', (err) => {
        console.log(`❌ Error reading keyword file: ${err.message}`);
        reject(err);
      });
  });
}

async function parseUnitOptions() {
  const optionsFilePath = path.join(__dirname, 'warhammer-csvs', 'Datasheets_options.csv');
  console.log(`Options File Path: ${optionsFilePath}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(optionsFilePath)
      .pipe(csv({ separator: '|', headers: ['datasheet_id', 'line', 'button', 'description'] }))
      .on('data', (row) => {
        const { datasheet_id, line, description } = row;
        console.log(`🔍 Searching for datasheet_id: ${datasheet_id}`);

        // Find the unit in factionDataMap
        const result = findUnitById(datasheet_id);
        if (!result) {
          console.log(`⚠️ Skipping: No faction contains unit_id: ${datasheet_id}`);
          return;
        }

        const { unit, factionKey } = result;

        // Ensure the options array exists
        if (!unit.options) {
          unit.options = [];
        }

        // Clean up and push the new option
        const cleanedDescription = cleanText(description);
        unit.options.push({
          line: parseInt(line, 10), // Ensure line is a number
          description: cleanedDescription,
        });

        console.log(`✅ Added option to unit ${datasheet_id} in faction ${factionKey}`);
      })
      .on('end', () => {
        console.log('🎉 Unit options successfully parsed and assigned.');
        resolve();
      })
      .on('error', (err) => {
        console.log(`❌ Error reading options file: ${err.message}`);
        reject(err);
      });
  });
}


// Function to parse unit compositions and update factionDataMap
async function parseUnitCompositions() {
  const unitCompositionFilePath = path.join(__dirname, 'warhammer-csvs', 'Datasheets_unit_composition.csv');

  console.log(`📂 Reading Unit Compositions from: ${unitCompositionFilePath}`);

  return new Promise((resolve, reject) => {
      fs.createReadStream(unitCompositionFilePath)
          .pipe(csv({ separator: '|', headers: ['unit_id', 'composition_index', 'composition_name', 'extra'] }))
          .on('data', (row) => {
              const { unit_id: unitId, composition_index: compositionIndex, composition_name, extra } = row;

              console.log(`🔍 Searching for unit_id: ${unitId}`);

              const foundUnitData = findUnitById(unitId);

              if (!foundUnitData) {
                  console.log(`⚠️ Skipping: No faction contains unit_id: ${unitId}`);
                  return;
              }

              const { unit } = foundUnitData;

              // Ensure unit has a compositions array
              if (!unit.compositions) {
                  unit.compositions = [];
              }

              // Clean up composition name and rename it to description
              const description = cleanText(composition_name);

              // Check if composition already exists
              if (unit.compositions.some(comp => comp.description === description)) {
                  console.log(`⚠️ Description "${description}" already exists for unit ${unitId}. Skipping.`);
                  return;
              }

              // Add new composition to factionDataMap
              unit.compositions.push({ compositionIndex, description, extra });

              console.log(`✅ Added description "${description}" to unit ${unitId}`);
          })
          .on('end', () => {
              console.log('🎉 All unit compositions successfully added to factionDataMap.');
              resolve();
          })
          .on('error', (err) => {
              console.log(`❌ Error reading unit composition file: ${err.message}`);
              reject(err);
          });
  });
}





// Running the functions in sequence
parseUnitAbilities()
  .then(() => {
    console.log("✅ All abilities parsed and enriched successfully!");
  })
  .catch((err) => {
    console.error("❌ Error during abilities processing:", err);
  });



  
  // Function to find a faction by ID within factionDataMap
function findFactionById(factionId) {
  for (const factionKey of Object.keys(factionDataMap)) {
    const faction = factionDataMap[factionKey];

    // Check if the faction matches the given factionId
    if (faction.id === factionId) {
      console.log(`✅ Found faction ${factionId} in factionDataMap: ${factionKey}`);
      return { faction, factionKey }; // Return faction and its factionKey
    }
  }

  console.log(`❌ Faction with ID ${factionId} not found in factionDataMap.`);
  return null;
}



function splitStratagemDescription(description) {
  console.log(description); // Log full text for debugging

  const whenMatch = description.match(/WHEN:\s*([^]*?)\s*TARGET:/i);
  const targetMatch = description.match(/TARGET:\s*([^]*?)\s*EFFECT:/i);
  const effectMatch = description.match(/EFFECT:\s*(.*)/i);

  return {
    fullDescription: description.trim(), // Full unprocessed text
    when: whenMatch ? whenMatch[1].trim() : "Unknown",
    target: targetMatch ? targetMatch[1].trim() : "Unknown",
    effect: effectMatch ? effectMatch[1].trim() : "Unknown",
  };
}



// Function to parse and assign stratagems to the correct faction and detachment
async function parseStratagems() {
  return new Promise((resolve, reject) => {
    let buffer = "";

    // Define file path for stratagems CSV
    const stratagemsFilePath = path.join(__dirname, 'warhammer-csvs', 'Stratagems.csv');
    console.log(`📂 Reading Stratagems from: ${stratagemsFilePath}`);

    // Read entire CSV file into a buffer
    fs.createReadStream(stratagemsFilePath, { encoding: "utf8" })
      .on("data", (chunk) => {
        buffer += chunk;
      })
      .on("end", () => {
        const rows = buffer.split("\r\n").filter((row) => row.trim() !== "");

        // Process each row from CSV
        rows.forEach((line) => {
          const fields = line.split("|").map((f) => f.trim());

          if (fields.length < 10) {
            console.log("⚠️ Skipping malformed stratagem row:", line);
            return;
          }

          const [faction_id, id, name, type, cp_cost, legend, turn, phase, detachment, description] = fields;

          console.log(`🔍 Processing stratagem "${name}" for faction_id: ${faction_id}, detachment: ${detachment}`);

          // Find the faction by faction_id
          const foundFactionData = findFactionById(faction_id);
          if (!foundFactionData) {
            console.log(`⚠️ Skipping: No faction found with faction_id: ${faction_id}`);
            return;
          }

          const { faction, factionKey } = foundFactionData;

          // Ensure faction has a stratagems key
          if (!faction.stratagems) {
            faction.stratagems = [];
          }

          // Ensure the detachments key exists in the faction
          if (!faction.detachments) {
            faction.detachments = [];
          }

          // Find or create the detachment
          let detachmentObj = faction.detachments.find(det => det.name === detachment);
          if (!detachmentObj) {
            detachmentObj = { name: detachment, stratagems: [] };
            faction.detachments.push(detachmentObj);
          }

          // Ensure the stratagems key exists in the detachment
          if (!detachmentObj.stratagems) {
            detachmentObj.stratagems = [];
          }

          // Prevent duplicate stratagems
          const isDuplicate = detachmentObj.stratagems.some(existingStrat =>
            existingStrat.id === id && existingStrat.name === name
          );
          if (isDuplicate) {
            console.log(`⚠️ Duplicate stratagem "${name}" found in detachment "${detachment}", skipping...`);
            return;
          }

          // **New:** Split description into structured parts
          const structuredDescription = splitStratagemDescription(cleanText(description));

          // Add stratagem to detachment
          const stratagemData = {
            id,
            name,
            type,
            cpCost: parseInt(cp_cost, 10), // Ensure CP cost is a number
            legend,
            turn,
            phase,
            ...structuredDescription // Spread structured description parts
          };

          detachmentObj.stratagems.push(stratagemData);
          faction.stratagems.push(stratagemData); // Also store in faction-level stratagems for global access

          console.log(`✅ Added stratagem "${name}" to detachment "${detachment}" for faction "${factionKey}"`);
        });

        console.log('🎉 All stratagems successfully parsed and assigned.');
        resolve();
      })
      .on("error", (err) => {
        console.error(`❌ Error reading stratagems file: ${err.message}`);
        reject(err);
      });
  });
}


function splitAbilityDescription(description) {
  return {
    rawDescription: description,
    formattedDescription: description.replace(/<[^>]*>/g, ""), // Remove HTML tags
  };
}


async function parseDetachmentAbilities() {
  return new Promise((resolve, reject) => {
    let buffer = "";

    // Define file path for detachment abilities CSV
    const abilitiesFilePath = path.join(__dirname, "warhammer-csvs", "Detachment_abilities.csv");
    console.log(`📂 Reading Detachment Abilities from: ${abilitiesFilePath}`);

    // Read entire CSV file into a buffer
    fs.createReadStream(abilitiesFilePath, { encoding: "utf8" })
      .on("data", (chunk) => {
        buffer += chunk;
      })
      .on("end", () => {
        const rows = buffer.split("\r\n").filter((row) => row.trim() !== "");

        // Process each row from CSV
        rows.forEach((line) => {
          const fields = line.split("|").map((f) => f.trim());

          if (fields.length < 6) {
            console.log("⚠️ Skipping malformed ability row:", line);
            return;
          }

          const [id, faction_id, name, legend, description, detachment] = fields;

          console.log(`🔍 Processing ability "${name}" for faction_id: ${faction_id}, detachment: ${detachment}`);

          // Find the faction by faction_id
          const foundFactionData = findFactionById(faction_id);
          if (!foundFactionData) {
            console.log(`⚠️ Skipping: No faction found with faction_id: ${faction_id}`);
            return;
          }

          const { faction, factionKey } = foundFactionData;

          // Ensure faction has detachment abilities key
          if (!faction.detachmentAbilities) {
            faction.detachmentAbilities = [];
          }

          // Ensure the detachments key exists in the faction
          if (!faction.detachments) {
            faction.detachments = [];
          }

          // Find or create the detachment
          let detachmentObj = faction.detachments.find((det) => det.name === detachment);
          if (!detachmentObj) {
            detachmentObj = { name: detachment, abilities: [] };
            faction.detachments.push(detachmentObj);
          }

          // Ensure the abilities key exists in the detachment
          if (!detachmentObj.abilities) {
            detachmentObj.abilities = [];
          }

          // Prevent duplicate abilities
          const isDuplicate = detachmentObj.abilities.some((existingAbility) => existingAbility.id === id);
          if (isDuplicate) {
            console.log(`⚠️ Duplicate ability "${name}" found in detachment "${detachment}", skipping...`);
            return;
          }

          // **New:** Clean and structure the description
          const structuredDescription = splitAbilityDescription(cleanText(description));

          // Add detachment name and structured description to the ability
          const abilityData = {
            id,
            name,
            legend,
            detachment, // Add the detachment name here
            ...structuredDescription, // Spread structured description parts
          };

          detachmentObj.abilities.push(abilityData);
          faction.detachmentAbilities.push(abilityData); // Also store in faction-level abilities for global access

          console.log(`✅ Added ability "${name}" to detachment "${detachment}" for faction "${factionKey}"`);
        });

        console.log("🎉 All detachment abilities successfully parsed and assigned.");
        resolve();
      })
      .on("error", (err) => {
        console.error(`❌ Error reading detachment abilities file: ${err.message}`);
        reject(err);
      });
  });
}



/**
 * Run all steps in sequence
 */
async function processWarhammerData() {
  try {
    await readFactions();
    await writeFactionSummary();
    await readDatasheets();
    await parseUnitProfiles();
    await parseUnitWeapons();
    await parseUnitAbilities(); // <-- Add this step
    await parseUnitCompositions();
    await parseUnitCosts();
    await parseUnitKeywords()
    await addLeadsToLeaders();
    await parseUnitOptions();
    await parseStratagems();
    await parseDetachmentAbilities();
    await writeFactionFiles();
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}


// Start the process
processWarhammerData();
