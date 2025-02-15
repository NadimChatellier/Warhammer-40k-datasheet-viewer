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
        const loadout = cleanText(trimmedRow.loadout);
        if (!datasheetId || !factionId || !name) {
          console.log(`⚠️ Skipping row with missing data:`, trimmedRow);
          return;
        }
        // Store base unit details for later use.
        unitDataMap[datasheetId] = { datasheetId, factionId, name, loadout };

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
              profiles: [],
              ranged_weapons: [],
              melee_weapons: []
            };
            factionDataMap[factionId].units.push(newUnit);
          }
        }
      })
      .on('end', () => {
        console.log('🎉 Units mapped to factions.');
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ Error reading Datasheets CSV:', err);
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
          console.log(`⚠️ Skipping wargear with unknown datasheet_id:`, row);
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


// Function to clean the description and handle concatenated ability entries
function cleanDescription(text) {
  if (!text) return { text: 'No description available', range: undefined };

  // Clean HTML tags
  text = text.replace(/<\/?[^>]+(>|$)/g, ""); // Remove all HTML tags

  // Clean up newlines and extra spaces
  text = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Check if description contains a range (e.g., "12")
  const rangeMatch = text.match(/\d+"?/);  // Match any number followed by an optional double quote
  return {
    text,  // Return cleaned description
    range: rangeMatch ? rangeMatch[0] : undefined // Extract range if present
  };
}


// Function to parse the abilities
function parseAbilityData(row) {
  let abilities = [];
  
  // Clean the description
  let cleanedDescription = cleanText(row.description);

  if (row.parameter) {
    // Split the parameter string by '|', '\n', and process each part separately
    const paramParts = row.parameter.split('\n').map(p => p.trim()).filter(Boolean);
    
    // For each part of the parameter, process it as a new ability
    paramParts.forEach((param, index) => {
      const paramData = param.split('|').map(p => p.trim());
      
      // If this part is an ability with a description (like "Vicious Insight"), we want to treat it properly
      let abilityName = paramData[4] || 'Unknown';
      let abilityDescription = paramData[5] ? cleanText(paramData[5]) : 'No description available';
      
      // Create a new row for this part
      abilities.push({
        datasheet_id: row.datasheet_id ? row.datasheet_id.trim() : undefined,
        line: row.line ? row.line.trim() : undefined,
        ability_id: row.ability_id ? row.ability_id.trim() : undefined,
        name: abilityName,
        description: abilityDescription,
        type: row.type ? row.type.trim().toLowerCase() : 'core',
        parameter: paramData.join(' | ')
      });
    });
  } else {
    // If no parameters, just process the row normally
    abilities.push({
      datasheet_id: row.datasheet_id ? row.datasheet_id.trim() : undefined,
      line: row.line ? row.line.trim() : undefined,
      ability_id: row.ability_id ? row.ability_id.trim() : undefined,
      name: row.name || 'Unknown',
      description: cleanedDescription || 'No description available',
      type: row.type ? row.type.trim().toLowerCase() : 'core',
      parameter: undefined
    });
  }

  return abilities;
}


// Function to parse all abilities and categorize them by type
async function parseUnitAbilities() {
  return new Promise((resolve, reject) => {
    // Initialize an object to store all abilities by type
    const abilitiesByType = {
      core: [],
      faction: [],
      datasheet: [],
      wargear: [],
      special: []
    };

    fs.createReadStream(abilitiesFilePath)
      .pipe(csv({
        separator: '|',
        headers: ['datasheet_id', 'line', 'ability_id', 'model', 'name', 'description', 'type', 'parameter']
      }))
      .on('data', (row) => {
        // Ensure datasheet_id exists and corresponds to a valid unit in unitDataMap
        const datasheetId = row.datasheet_id?.trim();
        if (!datasheetId || !unitDataMap[datasheetId]) {
          console.warn(`⚠️ Skipping ability with unknown datasheet_id:`, row);
          return;
        }

        // Parse the ability data
        const ability = parseAbilityData(row);

        // Assign the ability to the correct category based on its type
        let abilityType = row.type ? row.type.trim().toLowerCase() : 'datasheet';

        // Validate the ability type, and skip it if it's unknown
        if (!['core', 'faction', 'datasheet', 'wargear', 'special'].includes(abilityType)) {
          console.warn(`⚠️ Skipping unknown ability type:`, row);
          return;
        }

        // Store the ability in the global abilitiesByType object
        abilitiesByType[abilityType].push(ability);

        // Find the unit corresponding to the datasheetId
        const unit = factionDataMap[unitDataMap[datasheetId].factionId]?.units.find(u => u.id === datasheetId);
        if (unit) {
          // Ensure the abilities object exists for the unit
          if (!unit.abilities) {
            unit.abilities = { core: [], faction: [], datasheet: [], wargear: [], special: [] };
          }

          // Push the ability to the corresponding type array for the unit
          unit.abilities[abilityType].push(ability);
        } else {
          console.warn(`⚠️ Could not find unit with datasheetId ${datasheetId}`);
        }
      })
      .on('end', () => {
        console.log('✅ All abilities successfully parsed and categorized by type.');
        resolve(abilitiesByType); // Resolve with the entire object containing all categorized abilities
      })
      .on('error', (err) => {
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
    await writeFactionFiles();
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}


// Start the process
processWarhammerData();
