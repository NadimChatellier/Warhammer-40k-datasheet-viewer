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

// Store faction and unit data
const factionDataMap = {};
const unitDataMap = {}; // Maps datasheet_id -> unit template data
const unitProfiles = []; // Array to store all unit profiles

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
 * Step 2: Read Datasheets.csv and prepare unit mapping
 */
function readDatasheets() {
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

        // Store base unit details
        unitDataMap[datasheetId] = {
          datasheetId,
          factionId,
          name,
          loadout
        };

        // Add unit to faction
        if (factionDataMap[factionId]) {
          factionDataMap[factionId].units.push({
            id: datasheetId,
            name,
            faction_id: factionId,
            unit_img: "",
            loadout,
            profiles: [],
            ranged_weapons: [],
            melee_weapons: []
          });
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
      .on("data", (chunk) => {
        buffer += chunk; // Accumulate data in buffer
      })
      .on("end", () => {
        const rows = buffer.split("\r\n").filter(row => row.trim() !== "");

        rows.forEach((line) => {
          const fields = line.split("|");

          if (fields.length < 3) return; // Ignore malformed rows

          const datasheetId = fields[0].trim();
          if (!datasheetId) return; // Skip if datasheet ID is missing

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
              movement: movement,
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




async function parseUnitWeapons() {
  const wargearFilePath = path.join(__dirname, 'warhammer-csvs', 'Datasheets_wargear.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(wargearFilePath)
      .pipe(csv({
        separator: '|',
        headers: ['datasheet_id', 'line', 'line_in_wargear', 'dice', 'name', 'description', 'range', 'type', 'A', 'BS_WS', 'S', 'AP', 'D']
      }))
      .on('data', (row) => {
        row.description = cleanText(row.description);  // Remove HTML tags
      
        const datasheetId = row.datasheet_id;
        if (!datasheetId || !unitDataMap[datasheetId]) {
          console.log(`⚠️ Skipping wargear with unknown datasheet_id:`, row);
          return;
        }
      
        // Split description into parts
        const parts = row.description.split('|');
        
        // Special rules are everything before the range value
        const specialRules = [];
        while (parts.length > 0 && isNaN(parts[0]) && parts[0] !== 'Melee') {
          // Split special rules by commas and add them to the specialRules array
          specialRules.push(...parts.shift().split(',').map(rule => rule.trim()));
        }
      
        const wargearItem = {
          name: row.name,
          special_rules: specialRules,  // Store special rules as separate strings
          range: parts.shift() || '',
          type: parts.shift() || '',
          A: parts.shift() || '',
          BS_WS: parts.shift() || '',
          S: parts.shift() || '',
          AP: parts.shift() || '',
          D: parts.shift() || ''
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
 * Step 4: Write final JSON files
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
 * Run all steps in sequence
 */
async function processWarhammerData() {
  try {
    await readFactions();
    await readDatasheets();
    await parseUnitProfiles();
    await parseUnitWeapons(); // Now processing weapons
    await writeFactionFiles();
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}


// Start the process
processWarhammerData();
