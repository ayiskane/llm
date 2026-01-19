// Data Import Script for BC Legal Reference Database
// Run with: node import_data.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load configuration from environment or config file
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load normalized data
const data = JSON.parse(fs.readFileSync('normalized_data.json', 'utf8'));

async function importTable(tableName, records) {
    console.log(`Importing ${records.length} records to ${tableName}...`);
    
    // Remove the id field since Supabase will auto-generate
    const cleanRecords = records.map(r => {
        const { id, raw_data, _sheet, ...rest } = r;
        return rest;
    });
    
    if (cleanRecords.length === 0) {
        console.log(`  Skipping ${tableName} - no records`);
        return;
    }
    
    // Insert in batches of 100
    for (let i = 0; i < cleanRecords.length; i += 100) {
        const batch = cleanRecords.slice(i, i + 100);
        const { data: result, error } = await supabase
            .from(tableName)
            .insert(batch);
            
        if (error) {
            console.error(`  Error inserting into ${tableName}:`, error.message);
        } else {
            console.log(`  Inserted batch ${i/100 + 1}`);
        }
    }
}

async function main() {
    console.log('Starting data import...\n');
    
    // Import each table
    await importTable('courts', data.courts);
    await importTable('police_cells', data.police_cells);
    await importTable('correctional_facilities', data.correctional_facilities);
    await importTable('bail_contacts', data.bail_contacts);
    await importTable('bail_coordinators', data.bail_coordinators);
    await importTable('crown_contacts', data.crown_contacts);
    await importTable('labc_navigators', data.labc_navigators);
    await importTable('forensic_clinics', data.forensic_clinics);
    await importTable('indigenous_justice_centres', data.indigenous_justice_centres);
    await importTable('programs', data.programs);
    await importTable('access_codes', data.access_codes);
    await importTable('circuit_courts', data.circuit_courts);
    
    // MS Teams links need special handling due to volume
    if (data.ms_teams_links && data.ms_teams_links.length > 0) {
        await importTable('ms_teams_links', data.ms_teams_links);
    }
    
    console.log('\nImport complete!');
}

main().catch(console.error);
