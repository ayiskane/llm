// scripts/update-circuit-court-addresses.ts
// Run with: npx tsx scripts/update-circuit-court-addresses.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Circuit court addresses gathered from BC Government and Provincial Court websites
const circuitCourtAddresses: Record<string, string> = {
  "100 Mile House": "170 Cedar Avenue South, 100 Mile House, BC V0K 2E0",
  "Anahim Lake": "Courthouse, Chilcotin Highway 20, Anahim Lake, BC V0L 1C0",
  "Atlin": "170 2nd Street, Atlin, BC V0W 1A0",
  "Bella Bella": "214 Wabalisla Street, Bella Bella, BC V0T 1Z0",
  "Bella Coola": "The Moose Hall, MacKenzie Street, Bella Coola, BC V0T 1C0",
  "Castlegar": "555 Columbia Avenue, Castlegar, BC V1N 1G8",
  "Chetwynd": "5021 49th Avenue, Chetwynd, BC V0C 1J0",
  "Clearwater": "363 Murtle Crescent, Clearwater, BC V0E 1N0",
  "Creston": "224 10th Avenue North, Creston, BC V0B 1G0",
  "Dease Lake": "1 Commercial Drive, Dease Lake, BC V0C 1L0",
  "Fernie": "401 4th Avenue, Fernie, BC V0B 1M0",
  "Fort St. James": "2537 Stones Bay Road, Fort St. James, BC V0J 1P0",
  "Fraser Lake": "Village of Fraser Lake Curling Rink, Fraser Lake, BC V0J 1S0",
  "Ganges": "343 Lower Ganges Road, Ganges, BC V8K 2V3",
  "Gold River": "499 Muchalat Drive, Gold River, BC V0P 1G0",
  "Good Hope Lake": "Community Center, Good Hope Lake, BC V0C 2Z0",
  "Grand Forks": "555 Central Avenue, Grand Forks, BC V0H 1H0",
  "Hazelton": "2210 West Highway 62, Hazelton, BC V0J 1Y0",
  "Houston": "3367 12th Street, Houston, BC V0J 1Z0",
  "Hudson's Hope": "9904 Dudley Drive, Hudson's Hope, BC V0C 1V0",
  "Invermere": "645 7th Avenue, Invermere, BC V0A 1K0",
  "Kitimat": "603 Mountainview Square, Kitimat, BC V8C 2N1",
  "Klemtu": "The Bingo Hall, Klemtu, BC",
  "Kwadacha": "General Delivery, Fort Ware, BC V0J 3B0",
  "Lillooet": "615 Main Street, Lillooet, BC V0K 1V0",
  "Lower Post": "Lower Post Band Office, Lower Post, BC V0C 1W0",
  "Masset": "1666 Orr Street, Masset, BC V0T 1M0",
  "McBride": "100 Robson Centre, McBride, BC V0E 2Z0",
  "Merritt": "3420 Voght Street, Merritt, BC V1K 1C7",
  "Nakusp": "415 Broadway, Nakusp, BC V0G 1R0",
  "New Aiyansh": "5216 Morven Street, New Aiyansh, BC V0J 1A0",
  "Pemberton": "1366 Aster Street, Pemberton, BC V0N 2L0",
  "Princeton": "151 Vermillion Avenue, Princeton, BC V0X 1W0",
  "Daajing Giids": "216 Oceanview Drive, Queen Charlotte, BC V0T 1S0",
  "Queen Charlotte": "216 Oceanview Drive, Queen Charlotte, BC V0T 1S0",
  "Revelstoke": "1123 2nd Street West, Revelstoke, BC V0E 2S0",
  "Sidney": "9884 3rd Street, Sidney, BC V8L 1W3",
  "Sparwood": "132 Spruce Avenue, Sparwood, BC V0B 1M0",
  "Stewart": "703 Brightwell, Stewart, BC V0T 1W0",
  "Tahsis": "Tahsis, BC",
  "Tofino": "331 Main Street, Tofino, BC",
  "Tsay Keh Dene": "General Delivery, Tsay Keh Dene, BC V0J 3N0",
  "Tumbler Ridge": "340 Front Street, Tumbler Ridge, BC V0C 2W0",
  "Ucluelet": "Room 100, 500 Matterson Drive, Ucluelet, BC V0R 3A0",
  "Vanderhoof": "2440 Bute Avenue, Vanderhoof, BC V0J 3A0",
  // Additional common name variations
  "Ahousaht": null, // Remote First Nations community, no fixed address
  "Alexis Creek": null, // No address found
  "Ashcroft": null, // No address found
  "Chase": null, // No address found
};

async function updateCircuitCourtAddresses() {
  console.log('Fetching circuit courts from database...');
  
  // Get all circuit courts
  const { data: courts, error: fetchError } = await supabase
    .from('courts')
    .select('id, name, address, is_circuit')
    .eq('is_circuit', true)
    .order('name');

  if (fetchError) {
    console.error('Error fetching courts:', fetchError);
    return;
  }

  console.log(`Found ${courts?.length || 0} circuit courts\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const court of courts || []) {
    // Try to find address by court name
    let address = circuitCourtAddresses[court.name];
    
    // Try partial match if exact match not found
    if (!address) {
      const nameKey = Object.keys(circuitCourtAddresses).find(key => 
        court.name.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(court.name.toLowerCase())
      );
      if (nameKey) {
        address = circuitCourtAddresses[nameKey];
      }
    }

    if (address === null) {
      // Explicitly marked as no address available
      console.log(`⏭️  ${court.name}: No address available (remote/temporary location)`);
      skipped++;
      continue;
    }

    if (!address) {
      console.log(`❓ ${court.name}: No address found in our data`);
      notFound++;
      continue;
    }

    if (court.address === address) {
      console.log(`✓  ${court.name}: Already has correct address`);
      skipped++;
      continue;
    }

    // Update the address
    const { error: updateError } = await supabase
      .from('courts')
      .update({ address })
      .eq('id', court.id);

    if (updateError) {
      console.error(`❌ ${court.name}: Failed to update - ${updateError.message}`);
    } else {
      console.log(`✅ ${court.name}: Updated address to "${address}"`);
      updated++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Not found: ${notFound}`);
}

updateCircuitCourtAddresses().catch(console.error);
