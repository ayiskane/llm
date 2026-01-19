// Bail contact data - extracted for reusability and cleaner code

export interface BailRegion {
  region: string;
  code: string;
  name: string;
  color: string;
  contactType?: 'court-specific';
  daytime?: string;
  daytimeNote?: string;
  afterHours?: string;
  afterHoursNote?: string;
  allHours?: boolean;
  rabc?: { name: string; email: string; phone: string };
  subjectLine: string;
  vrs?: string[];
  courtCount: number;
  courts?: Array<{
    court: string;
    email: string;
    note?: string;
    areas: string[];
  }>;
  areas: string[];
}

export interface SheriffContact {
  area: string;
  email: string;
}

export interface FederalArea {
  area: string;
  email: string;
  phone?: string;
  org: string;
}

export interface FederalRegion {
  region: string;
  areas: FederalArea[];
}

export interface RevoiContact {
  region: string;
  email: string;
}

export interface BailContacts {
  regional: BailRegion[];
  sheriffs: SheriffContact[];
  federal: FederalRegion[];
  revoi: RevoiContact[];
}

export const BAIL_CONTACTS: BailContacts = {
  regional: [
    {
      region: 'VR1',
      code: 'R1',
      name: 'Vancouver Island',
      color: 'cyan',
      daytime: 'Region1.VirtualBail@gov.bc.ca',
      daytimeNote: 'Regular weekday',
      afterHours: 'VictoriaCrown.Public@gov.bc.ca',
      afterHoursNote: 'Evenings, weekends, holidays (remote - no fax)',
      rabc: { name: 'Chloe Rathjen', email: 'chloe.rathjen@gov.bc.ca', phone: '250-940-8522' },
      subjectLine: 'URGENT IC Daytime Program – (Reason) – Detachment – Date',
      vrs: ['VR8 (South Island)', 'VR9 (North Island)'],
      courtCount: 12,
      areas: ['Victoria', 'Colwood', 'Western Communities', 'Duncan', 'Nanaimo', 'Campbell River', 'Courtenay', 'Port Alberni', 'Port Hardy', 'Powell River', 'Tofino', 'Gold River']
    },
    {
      region: 'VR2',
      code: 'R2',
      name: 'Vancouver Coastal',
      color: 'violet',
      contactType: 'court-specific',
      subjectLine: 'URGENT IC – Accused Name/File No. – Date',
      courtCount: 8,
      courts: [
        { court: 'Vancouver Provincial (222 Main)', email: '222MainCrownBail@gov.bc.ca', areas: ['Vancouver', 'Burnaby'] },
        { court: 'North Vancouver', email: 'NorthVanCrown@gov.bc.ca', areas: ['North Vancouver', 'West Vancouver', 'Squamish', 'Whistler', 'Pemberton'] },
        { court: 'Richmond', email: 'RichmondCrown@gov.bc.ca', areas: ['Richmond'] },
        { court: 'Sechelt', email: 'SecheltCrown@gov.bc.ca', note: 'Heard in North Van', areas: ['Sechelt', 'Gibsons', 'Sunshine Coast'] },
        { court: 'Vancouver Youth (Robson)', email: 'VancouverYouthCrown@gov.bc.ca', note: 'Own bail process', areas: ['Vancouver Youth'] },
      ],
      areas: ['Vancouver', 'Burnaby', 'North Vancouver', 'West Vancouver', 'Richmond', 'Squamish', 'Whistler', 'Pemberton', 'Sechelt', 'Gibsons']
    },
    {
      region: 'VR3',
      code: 'R3',
      name: 'Fraser',
      color: 'amber',
      contactType: 'court-specific',
      subjectLine: 'URGENT IC Daytime Program: (reason) – Detachment – Date',
      courtCount: 15,
      courts: [
        { court: 'Abbotsford', email: 'Abbotsford.VirtualBail@gov.bc.ca', areas: ['Abbotsford', 'Mission'] },
        { court: 'Chilliwack', email: 'Chilliwack.VirtualBail@gov.bc.ca', areas: ['Chilliwack', 'Hope', 'Agassiz'] },
        { court: 'New Westminster', email: 'NewWestProv.VirtualBail@gov.bc.ca', areas: ['New Westminster', 'Burnaby'] },
        { court: 'Port Coquitlam', email: 'Poco.VirtualBail@gov.bc.ca', areas: ['Port Coquitlam', 'Coquitlam', 'Port Moody', 'Maple Ridge', 'Pitt Meadows'] },
        { court: 'Surrey', email: 'Surrey.VirtualBail@gov.bc.ca', areas: ['Surrey', 'Langley', 'Delta', 'White Rock'] },
      ],
      areas: ['Surrey', 'Langley', 'Delta', 'White Rock', 'Abbotsford', 'Mission', 'Chilliwack', 'Hope', 'Agassiz', 'New Westminster', 'Port Coquitlam', 'Coquitlam', 'Port Moody', 'Maple Ridge', 'Pitt Meadows']
    },
    {
      region: 'VR4',
      code: 'R4',
      name: 'Interior',
      color: 'emerald',
      daytime: 'Region4.VirtualBail@gov.bc.ca',
      daytimeNote: 'Regular weekday',
      afterHours: 'AGBCPSReg4BailKelownaGen@gov.bc.ca',
      afterHoursNote: 'Evenings, weekends, holidays (remote - no fax)',
      rabc: { name: 'Pamela Robertson', email: 'pamela.robertson@gov.bc.ca', phone: '778-940-0050' },
      subjectLine: 'URGENT IC – (Reason) – Detachment – Date',
      vrs: ['VR3 (Kelowna area)', 'VR4 (Kamloops area)'],
      courtCount: 18,
      areas: ['Kamloops', 'Kelowna', 'Vernon', 'Penticton', 'Salmon Arm', 'Cranbrook', 'Nelson', 'Trail', 'Castlegar', 'Merritt', 'Lillooet', 'Revelstoke', 'Golden', 'Invermere', 'Fernie', 'Grand Forks', 'Princeton', 'Clearwater', 'Ashcroft', 'Chase', 'Oliver', 'Keremeos', 'Osoyoos', 'Summerland', 'Falkland', 'Armstrong', 'Lumby', 'Nakusp', 'Rossland', 'Creston']
    },
    {
      region: 'VR5',
      code: 'R5',
      name: 'North',
      color: 'red',
      daytime: 'Region5.VirtualBail@gov.bc.ca',
      daytimeNote: 'All bail matters (day/evening/weekend/holidays)',
      allHours: true,
      rabc: { name: 'Jacqueline Ettinger', email: 'Jacqueline.ettinger@gov.bc.ca', phone: '250-570-0422' },
      subjectLine: 'URGENT IC VB – (Reason) – VR1/VR2 Location – Date',
      vrs: ['VR1 (Prince George area)', 'VR2 (Peace/Northwest)'],
      courtCount: 24,
      areas: ['Prince George', 'Quesnel', 'Williams Lake', 'Vanderhoof', 'Fort St. John', 'Dawson Creek', 'Fort Nelson', 'Terrace', 'Prince Rupert', 'Smithers', 'Kitimat', 'Burns Lake', 'Mackenzie', '100 Mile House']
    }
  ],
  sheriffs: [
    { area: '222 Main Street', email: 'CSB222MainStreet.SheriffVirtualBail@gov.bc.ca' },
    { area: 'Vancouver Coastal', email: 'CSBVancouverCoastal.SheriffVirtualBail@gov.bc.ca' },
    { area: 'Fraser Region', email: 'CSBFraser.SheriffVirtualBail@gov.bc.ca' },
    { area: 'Surrey', email: 'CSBSurrey.SheriffVirtualBail@gov.bc.ca' },
  ],
  federal: [
    {
      region: 'Vancouver Coastal',
      areas: [
        { area: 'Vancouver & Burnaby', email: 'Van.detention.van@ppsc-sppc.gc.ca', phone: '604-666-2141', org: 'PPSC 222 Main' },
        { area: 'Richmond', email: 'ppscsupportstaff@mtclaw.ca', phone: '604-590-8855', org: 'MTC Law' },
        { area: 'North Shore, Squamish, Sechelt, Whistler', email: 'NorthShoreandCRC@ppsc-sppc.gc.ca', org: 'PPSC North Van' },
      ]
    },
    {
      region: 'Vancouver Island',
      areas: [
        { area: 'Victoria & Colwood', email: 'Vicinfo@joneslaw.ca', phone: '250-220-6942', org: 'Jones & Co.' },
        { area: 'Nanaimo & Duncan', email: 'Naninfo@joneslaw.ca', phone: '250-714-1113', org: 'Jones & Co.' },
        { area: 'Campbell River, Courtenay, Port Alberni, Port Hardy', email: 'Naninfo@joneslaw.ca', phone: '250-714-1113', org: 'Jones & Co.' },
      ]
    },
    {
      region: 'Fraser',
      areas: [
        { area: 'Surrey, Langley, Delta, White Rock', email: 'PPSC.SurreyInCustody-EnDetentionSurrey.SPPC@ppsc-sppc.gc.ca', phone: '236-456-0015', org: 'PPSC Surrey' },
        { area: 'Port Coquitlam & New Westminster', email: 'ppscsupportstaff@mtclaw.ca', phone: '604-590-8855', org: 'MTC Law' },
        { area: 'Chilliwack & Abbotsford', email: 'jir@jmldlaw.com', phone: '604-514-8203', org: 'JM LeDressay' },
      ]
    },
    {
      region: 'Interior',
      areas: [
        { area: 'Kamloops, Ashcroft, Chase, Clearwater, Lillooet, Merritt, Salmon Arm', email: 'ppscsupportstaff@mtclaw.ca', phone: '604-590-8855', org: 'MTC Law' },
        { area: 'Kelowna, Penticton, Vernon & area', email: 'jir@jmldlaw.com', phone: '604-514-8203', org: 'JM LeDressay' },
        { area: 'Kootenays (Cranbrook, Nelson, Trail, etc.)', email: 'PPSC.SurreyInCustody-EnDetentionSurrey.SPPC@ppsc-sppc.gc.ca', phone: '604-354-9146', org: 'PPSC Surrey' },
      ]
    }
  ],
  revoi: [
    { region: 'R2', email: 'BCPSReVOII2@gov.bc.ca' },
    { region: 'R3', email: 'BCPSReVOII3@gov.bc.ca' },
  ]
};

// Color classes for bail regions
export const BAIL_COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', gradient: 'from-violet-500 to-violet-600' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500 to-amber-600' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', gradient: 'from-red-500 to-orange-500' },
};
