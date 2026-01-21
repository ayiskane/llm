// Correctional Centres - BC Provincial and Federal Institutions
// Last updated: January 2025

export interface CorrectionalCentre {
  id: number;
  name: string;
  shortName: string;
  location: string;
  regionId: number;
  regionName: string;
  isFederal: boolean;
  centreType: 'provincial' | 'pretrial' | 'women' | 'federal';
  securityLevel?: 'minimum' | 'medium' | 'maximum' | 'multi';
  
  // Contact
  generalPhone?: string;
  generalPhoneOption?: string;
  generalFax?: string;
  
  // Counsel Designation Notice
  cdnFax?: string;
  acceptsCdnByFax: boolean;
  
  // Visit Requests
  visitRequestPhone?: string;
  visitRequestEmail?: string;
  virtualVisitEmail?: string;
  lawyerCallbackEmail?: string;
  
  // Callback Windows (when inmates can call back)
  callback1Start?: string;
  callback1End?: string;
  callback2Start?: string;
  callback2End?: string;
  
  // Visit Hours
  visitHoursInperson?: string;
  visitHoursVirtual?: string;
  visitNotes?: string;
  
  // eDisclosure
  disclosureFormat?: string;
  acceptsUsb: boolean;
  acceptsHardDrive: boolean;
  acceptsCdDvd: boolean;
  disclosureNotes?: string;
  
  notes?: string;
  
  // Support organization (Community Integration Worker provider)
  ciwOrganization?: string;
}

// System-wide constants
export const CORRECTIONS_CONSTANTS = {
  callerID: '844-369-7776',
  registerAsLawyerPhone: '236-478-0284',
  registerAsLawyerContact: 'Cindy',
  unknownInmateLocationPhone: '250-387-1605',
  unknownInmateLocationHours: 'Mon-Fri 8AM-4PM',
  businessHours: '08:00-16:00',
  unlockHoursWeekday: '07:00-07:30',
  unlockHoursWeekend: '10:00',
  eveningLock: '21:45-22:00',
} as const;

// Provincial Correctional Centres
export const PROVINCIAL_CENTRES: CorrectionalCentre[] = [
  {
    id: 1,
    name: 'Vancouver Island Regional Correctional Centre',
    shortName: 'VIRCC',
    location: 'Victoria',
    regionId: 1,
    regionName: 'Island',
    isFederal: false,
    centreType: 'provincial',
    generalPhone: '250-953-4400',
    generalPhoneOption: 'option 8',
    generalFax: '250-953-4464',
    cdnFax: '250-953-4417',
    acceptsCdnByFax: true,
    visitRequestPhone: '250-953-4433',
    callback1Start: '10:00',
    callback1End: '10:35',
    callback2Start: '17:30',
    callback2End: '18:05',
    visitHoursInperson: '06:50-21:30',
    visitHoursVirtual: 'Limited',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended.',
  },
  {
    id: 2,
    name: 'Nanaimo Correctional Centre',
    shortName: 'NCC',
    location: 'Nanaimo',
    regionId: 1,
    regionName: 'Island',
    isFederal: false,
    centreType: 'provincial',
    generalPhone: '250-756-3300',
    generalPhoneOption: 'ext. 3309',
    generalFax: '250-729-7724',
    cdnFax: '250-756-3340',
    acceptsCdnByFax: true,
    visitRequestPhone: '250-729-7721',
    callback1Start: '10:35',
    callback1End: '11:30',
    callback2Start: '17:30',
    callback2End: '18:05',
    visitHoursInperson: '08:00-20:00',
    visitNotes: 'Visits only on weekends. Call 10am-12pm (Tue, Wed, Thu) to book.',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended.',
  },
  {
    id: 3,
    name: 'Okanagan Correctional Centre',
    shortName: 'OCC',
    location: 'Oliver',
    regionId: 4,
    regionName: 'Interior',
    isFederal: false,
    centreType: 'provincial',
    generalPhone: '236-216-2000',
    generalPhoneOption: 'option 3',
    generalFax: '250-485-0875',
    cdnFax: '250-485-0725',
    acceptsCdnByFax: true,
    visitRequestPhone: '236-216-2000',
    callback1Start: '11:40',
    callback1End: '13:40',
    callback2Start: '16:45',
    callback2End: '17:35',
    visitHoursInperson: '09:00-20:00',
    visitNotes: 'Visit request: ext. 4',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended.',
  },
  {
    id: 4,
    name: 'Kamloops Regional Correctional Centre',
    shortName: 'KRCC',
    location: 'Kamloops',
    regionId: 4,
    regionName: 'Interior',
    isFederal: false,
    centreType: 'provincial',
    generalPhone: '250-571-2200',
    generalPhoneOption: 'option 5',
    generalFax: '250-571-2205',
    cdnFax: '250-571-2222',
    acceptsCdnByFax: true,
    visitRequestPhone: '250-571-2207',
    callback1Start: '11:45',
    callback1End: '13:30',
    callback2Start: '18:00',
    callback2End: '18:30',
    visitHoursInperson: '12:30-21:00',
    visitHoursVirtual: '12:30-21:00',
    visitNotes: 'Virtual visits: Call 12:30-1:30pm or 6:45-7:45pm to book.',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended.',
  },
  {
    id: 5,
    name: 'Prince George Regional Correctional Centre',
    shortName: 'PGRCC',
    location: 'Prince George',
    regionId: 5,
    regionName: 'Northern',
    isFederal: false,
    centreType: 'provincial',
    generalPhone: '250-960-3001',
    generalFax: '250-960-3021',
    cdnFax: '250-960-3044',
    acceptsCdnByFax: true,
    visitRequestPhone: '250-564-0465',
    virtualVisitEmail: 'pgrcc.virtualvisits@gov.bc.ca',
    callback1Start: '13:00',
    callback1End: '14:30',
    visitHoursInperson: '09:30-19:00',
    visitHoursVirtual: '09:30-19:00',
    visitNotes: 'If general fax is down, use CDN line. Records for VB: 250-960-3009',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended.',
  },
  {
    id: 6,
    name: 'Surrey Pretrial Services Centre',
    shortName: 'SPSC',
    location: 'Surrey',
    ciwOrganization: 'Pacific Women\'s Society',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: false,
    centreType: 'pretrial',
    generalPhone: '604-599-4110',
    generalPhoneOption: 'option 4',
    generalFax: '604-572-2101',
    cdnFax: '604-572-2182',
    acceptsCdnByFax: true,
    visitRequestPhone: '604-572-2165',
    visitRequestEmail: 'SPSC.Visits@gov.bc.ca',
    virtualVisitEmail: 'SPSC.Visits@gov.bc.ca',
    lawyerCallbackEmail: 'legalaccessspsc@gov.bc.ca',
    callback1Start: '12:00',
    callback1End: '13:00',
    callback2Start: '17:30',
    callback2End: '18:00',
    visitHoursInperson: '13:00-19:00',
    visitHoursVirtual: '08:45-11:15, 13:15-18:30',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended. CD drives being phased out.',
  },
  {
    id: 7,
    name: 'North Fraser Pretrial Centre',
    shortName: 'NFPC',
    location: 'Port Coquitlam',
    ciwOrganization: 'Connective Society',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: false,
    centreType: 'pretrial',
    generalPhone: '604-468-3500',
    generalPhoneOption: 'press 0',
    generalFax: '604-468-3556',
    cdnFax: '604-468-3495',
    acceptsCdnByFax: true,
    visitRequestPhone: '604-468-3566',
    callback1Start: '11:20',
    callback1End: '13:30',
    callback2Start: '17:30',
    callback2End: '18:10',
    visitHoursInperson: '08:30-20:20',
    visitHoursVirtual: '12:20-13:30',
    visitNotes: 'Limited virtual availability',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended. CD drives being phased out.',
  },
  {
    id: 8,
    name: 'Fraser Regional Correctional Centre',
    shortName: 'FRCC',
    location: 'Maple Ridge',
    ciwOrganization: 'Connective Society',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: false,
    centreType: 'provincial',
    generalPhone: '604-462-9313',
    generalPhoneOption: 'option 8',
    generalFax: '604-462-5186',
    cdnFax: '604-462-5187',
    acceptsCdnByFax: true,
    visitRequestPhone: '604-462-8865',
    virtualVisitEmail: 'FRCC.virtualvisits@gov.bc.ca',
    callback1Start: '11:30',
    callback1End: '13:30',
    callback2Start: '17:00',
    callback2End: '18:30',
    visitHoursInperson: 'Mon-Fri 13:00-15:00, 16:00-18:00',
    visitHoursVirtual: 'Limited',
    visitNotes: 'Call 1-2pm (Mon-Fri) for visit requests.',
    disclosureFormat: 'Padlock Hard Drive',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Padlock encrypted hard drives required. CD drives being phased out.',
  },
  {
    id: 9,
    name: 'Alouette Correctional Centre for Women',
    shortName: 'ACCW',
    location: 'Maple Ridge',
    ciwOrganization: 'Elizabeth Fry Society',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: false,
    centreType: 'women',
    generalPhone: '604-476-2660',
    generalPhoneOption: 'option 3',
    generalFax: '604-476-2981',
    cdnFax: '604-476-2677',
    acceptsCdnByFax: true,
    visitRequestPhone: '604-476-2688',
    visitRequestEmail: 'ACCWAdmin@gov.bc.ca',
    callback1Start: '12:00',
    callback1End: '13:00',
    callback2Start: '18:30',
    callback2End: '19:00',
    visitHoursInperson: '09:45-19:00 (varies daily)',
    visitHoursVirtual: 'Weekdays 09:45-11:45',
    visitNotes: 'Press 0 for reception, option 3 for message.',
    disclosureFormat: 'Hard drive',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Hard drives required. CD drives being phased out.',
  },
  {
    id: 10,
    name: 'Xàws Schó:lha Correctional Centre',
    shortName: 'FMCC',
    location: 'Chilliwack',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: false,
    centreType: 'provincial',
    generalPhone: '604-824-5350',
    generalFax: '604-824-5369',
    cdnFax: '604-824-5369',
    acceptsCdnByFax: true,
    visitRequestPhone: '604-824-5373',
    visitHoursInperson: 'Mon-Fri 07:00-17:00',
    visitHoursVirtual: 'Mon-Fri 07:00-17:00',
    acceptsUsb: false,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB not permitted. Password-protected hard drives recommended.',
    notes: 'Previously known as Ford Mountain Correctional Centre (FORD)',
  },
];

// Federal Institutions
export const FEDERAL_INSTITUTIONS: CorrectionalCentre[] = [
  {
    id: 11,
    name: 'Fraser Valley Institution',
    shortName: 'FVI',
    location: 'Abbotsford',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'multi',
    generalPhone: '604-851-6000',
    generalFax: '604-851-6039',
    acceptsCdnByFax: false,
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'Contact institution for specific disclosure requirements.',
    notes: 'Federal women\'s institution',
  },
  {
    id: 12,
    name: 'Kent Institution',
    shortName: 'KENT',
    location: 'Agassiz',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'maximum',
    generalPhone: '604-796-2121',
    generalFax: '604-796-4500',
    acceptsCdnByFax: true,
    visitRequestPhone: '604-796-9131',
    visitNotes: 'Call 1:45-2:45pm for visit requests',
    disclosureFormat: 'USB',
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'USB permitted for eDisclosure.',
  },
  {
    id: 13,
    name: 'Matsqui Institution',
    shortName: 'MATSQUI',
    location: 'Abbotsford',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'medium',
    generalPhone: '604-859-4841',
    generalFax: '604-850-8228',
    acceptsCdnByFax: false,
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'Contact institution for specific disclosure requirements.',
  },
  {
    id: 14,
    name: 'Mission Institution (Medium)',
    shortName: 'MISSION-MED',
    location: 'Mission',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'medium',
    generalPhone: '604-826-1231',
    generalFax: '604-820-5801',
    acceptsCdnByFax: false,
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'Contact institution for specific disclosure requirements.',
  },
  {
    id: 15,
    name: 'Mission Institution (Minimum)',
    shortName: 'MISSION-MIN',
    location: 'Mission',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'minimum',
    generalPhone: '604-820-5720',
    generalFax: '604-820-5730',
    acceptsCdnByFax: false,
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'Contact institution for specific disclosure requirements.',
  },
  {
    id: 16,
    name: 'Mountain Institution',
    shortName: 'MOUNTAIN',
    location: 'Agassiz',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'medium',
    generalPhone: '604-796-2231',
    generalFax: '604-796-1450',
    acceptsCdnByFax: false,
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'Contact institution for specific disclosure requirements.',
  },
  {
    id: 17,
    name: 'Pacific Institution',
    shortName: 'PACIFIC',
    location: 'Abbotsford',
    regionId: 3,
    regionName: 'Fraser',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'maximum',
    generalPhone: '604-870-7700',
    generalFax: '604-870-7746',
    acceptsCdnByFax: false,
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'Contact institution for specific disclosure requirements.',
    notes: 'Multi-level: Maximum and Medium security',
  },
  {
    id: 18,
    name: 'William Head Institution',
    shortName: 'WILLIAM-HEAD',
    location: 'Victoria',
    regionId: 1,
    regionName: 'Island',
    isFederal: true,
    centreType: 'federal',
    securityLevel: 'minimum',
    generalPhone: '250-391-7000',
    generalFax: '250-391-7005',
    acceptsCdnByFax: false,
    acceptsUsb: true,
    acceptsHardDrive: true,
    acceptsCdDvd: true,
    disclosureNotes: 'Contact institution for specific disclosure requirements.',
    notes: 'Located in Metchosin area',
  },
];

// Combined list
export const ALL_CORRECTIONAL_CENTRES: CorrectionalCentre[] = [
  ...PROVINCIAL_CENTRES,
  ...FEDERAL_INSTITUTIONS,
];

// Helper functions
export function getCentreByShortName(shortName: string): CorrectionalCentre | undefined {
  return ALL_CORRECTIONAL_CENTRES.find(
    c => c.shortName.toLowerCase() === shortName.toLowerCase()
  );
}

export function getCentresByLocation(location: string): CorrectionalCentre[] {
  return ALL_CORRECTIONAL_CENTRES.filter(
    c => c.location.toLowerCase().includes(location.toLowerCase())
  );
}

export function searchCentres(query: string): CorrectionalCentre[] {
  const q = query.toLowerCase();
  return ALL_CORRECTIONAL_CENTRES.filter(
    c => c.name.toLowerCase().includes(q) ||
         c.shortName.toLowerCase().includes(q) ||
         c.location.toLowerCase().includes(q)
  );
}

export function getCentresByRegion(regionId: number): CorrectionalCentre[] {
  return ALL_CORRECTIONAL_CENTRES.filter(c => c.regionId === regionId);
}

export function getProvincialCentresByRegion(regionId: number): CorrectionalCentre[] {
  return PROVINCIAL_CENTRES.filter(c => c.regionId === regionId);
}

// Centre type labels
export const CENTRE_TYPE_LABELS: Record<string, string> = {
  provincial: 'Provincial',
  pretrial: 'Pretrial',
  women: "Women's",
  federal: 'Federal (CSC)',
};

// Security level labels
export const SECURITY_LEVEL_LABELS: Record<string, string> = {
  minimum: 'Minimum',
  medium: 'Medium',
  maximum: 'Maximum',
  multi: 'Multi-Level',
};
