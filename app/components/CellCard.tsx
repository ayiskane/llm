'use client';

import { Telephone } from 'react-bootstrap-icons';
import { 
  textClasses, 
  cardClasses, 
  iconClasses,
  inlineStyles,
  cn 
} from '@/lib/theme';
import type { ShellCell } from '@/types';

// ============================================================================
// CONSTANTS
// ============================================================================

const COURT_ABBREVS: Record<string, string> = {
  'Abbotsford Law Courts': 'Abbotsford',
  'Chilliwack Law Courts': 'Chilliwack',
  'Kelowna Law Courts': 'Kelowna',
  'Kamloops Law Courts': 'Kamloops',
  'Nanaimo Law Courts': 'Nanaimo',
  'New Westminster Law Courts': 'New West',
  'North Vancouver Law Courts': 'North Van',
  'Port Coquitlam Law Courts': 'PoCo',
  'Prince George Law Courts': 'Prince George',
  'Robson Square Provincial Court': 'Robson Sq',
  'Surrey Provincial Court': 'Surrey',
  'Vancouver Law Courts': 'Vancouver',
  'Victoria Law Courts': 'Victoria',
  'Vernon Law Courts': 'Vernon',
  'Cranbrook Law Courts': 'Cranbrook',
  'Penticton Law Courts': 'Penticton',
  'Courtenay Law Courts': 'Courtenay',
  'Duncan Law Courts': 'Duncan',
  'Salmon Arm Law Courts': 'Salmon Arm',
  'Nelson Law Courts': 'Nelson',
  'Terrace Law Courts': 'Terrace',
  'Prince Rupert Law Courts': 'Prince Rupert',
  'Williams Lake Law Courts': 'Williams Lake',
  'Fort St John Law Courts': 'Fort St John',
  'Dawson Creek Law Courts': 'Dawson Creek',
  'Quesnel Law Courts': 'Quesnel',
  'Campbell River Law Courts': 'Campbell River',
  'Powell River Law Courts': 'Powell River',
  'Maple Ridge Law Courts': 'Maple Ridge',
  'Richmond Law Courts': 'Richmond',
  'Burnaby Law Courts': 'Burnaby',
  'Coquitlam Law Courts': 'Coquitlam',
  'Langley Law Courts': 'Langley',
  'White Rock Law Courts': 'White Rock',
  // Without "Law Courts" suffix
  'Abbotsford': 'Abbotsford',
  'Chilliwack': 'Chilliwack',
  'Kelowna': 'Kelowna',
  'Kamloops': 'Kamloops',
  'Nanaimo': 'Nanaimo',
  'New Westminster': 'New West',
  'North Vancouver': 'North Van',
  'Port Coquitlam': 'PoCo',
  'Prince George': 'Prince George',
  'Robson Square': 'Robson Sq',
  'Surrey': 'Surrey',
  'Vancouver': 'Vancouver',
  'Victoria': 'Victoria',
  'Vernon': 'Vernon',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCourtAbbrev(courtName: string): string {
  if (COURT_ABBREVS[courtName]) {
    return COURT_ABBREVS[courtName];
  }
  
  const cityMatch = courtName.match(/^([A-Za-z\s]+?)(?:\s+(?:Law Courts?|Provincial Court|Court))?$/i);
  if (cityMatch) {
    const city = cityMatch[1].trim();
    if (COURT_ABBREVS[city]) {
      return COURT_ABBREVS[city];
    }
    return city;
  }
  
  return courtName;
}

function formatCellName(cell: ShellCell): string {
  const name = cell.name || '';
  
  // Handle courthouse cells
  if (cell.cell_type === 'CH' || cell.cell_type === 'courthouse' || name.toLowerCase().includes('courthouse')) {
    if (cell.court_name) {
      const abbrev = getCourtAbbrev(cell.court_name);
      return `${abbrev} CH Cells`;
    }
    
    let location = name
      .replace(/\s*(Courthouse|CH|Law Courts?|Provincial|Court|Cells?)\s*/gi, '')
      .trim();
    
    if (location) {
      const abbrev = getCourtAbbrev(location);
      return `${abbrev} CH Cells`;
    }
    
    return 'Courthouse Cells';
  }
  
  // Handle RCMP/PD cells
  const detachmentMatch = name.match(/^(.+?)\s*(RCMP|Police|PD|Detachment|Cells?)/i);
  if (detachmentMatch) {
    const location = detachmentMatch[1].trim();
    const type = name.toLowerCase().includes('rcmp') ? 'RCMP' : 'PD';
    return `${location} ${type} Cells`;
  }
  
  return name;
}

// ============================================================================
// CELL ROW COMPONENT
// ============================================================================

interface CellRowProps {
  cell: ShellCell;
}

function CellRow({ cell }: CellRowProps) {
  const displayName = formatCellName(cell);
  
  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber.replace(/\D/g, '')}`, '_self');
  };

  return (
    <div className={cardClasses.row}>
      <div className={cn(textClasses.secondary, 'text-sm mb-1.5')}>{displayName}</div>
      {cell.phones && cell.phones.length > 0 && (
        <div className="flex items-center gap-3">
          {cell.phones.map((phone, idx) => (
            <button
              key={idx}
              onClick={() => handleCall(phone)}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Telephone className={iconClasses.xs} />
              <span className="text-xs">{phone}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================

function CellsSectionHeader() {
  return (
    <h4 
      className={textClasses.sectionHeader}
      style={inlineStyles.roleLabelNormal}
    >
      Sheriff Cells
    </h4>
  );
}

// ============================================================================
// CELLS LIST COMPONENT (Full list for detail view)
// ============================================================================

interface CellsListProps {
  cells: ShellCell[];
  maxDisplay?: number;
}

export function CellsList({ cells, maxDisplay = 10 }: CellsListProps) {
  // Separate courthouse cells and RCMP/PD cells
  const chCells = cells.filter(c => c.cell_type === 'CH' || c.cell_type === 'courthouse');
  const policeCells = cells.filter(c => c.cell_type !== 'CH' && c.cell_type !== 'courthouse');
  
  // Sort police cells by name
  policeCells.sort((a, b) => a.name.localeCompare(b.name));
  
  // Combine: police first, then courthouse
  const sortedCells = [...policeCells, ...chCells].slice(0, maxDisplay);
  
  if (sortedCells.length === 0) return null;

  return (
    <div className="space-y-2">
      <CellsSectionHeader />
      <div className={cardClasses.containerPadded}>
        {sortedCells.map((cell) => (
          <CellRow key={cell.id} cell={cell} />
        ))}
      </div>
      {cells.length > maxDisplay && (
        <div className="text-xs text-slate-500 text-center py-1">
          +{cells.length - maxDisplay} more
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CELLS PREVIEW COMPONENT (Compact preview for search results)
// ============================================================================

interface CellsPreviewProps {
  cells: ShellCell[];
}

export function CellsPreview({ cells }: CellsPreviewProps) {
  // Get one of each type: police first, then courthouse
  const policeCell = cells.find(c => c.cell_type !== 'CH' && c.cell_type !== 'courthouse');
  const chCell = cells.find(c => c.cell_type === 'CH' || c.cell_type === 'courthouse');
  
  const displayCells = [policeCell, chCell].filter((c): c is ShellCell => c !== undefined);
  
  if (displayCells.length === 0) return null;

  return (
    <div className="space-y-2">
      <CellsSectionHeader />
      <div className={cardClasses.containerPadded}>
        {displayCells.map((cell) => (
          <CellRow key={cell.id} cell={cell} />
        ))}
        {cells.length > 2 && (
          <div className="text-xs text-slate-500 text-center py-2 border-t border-slate-700/30">
            +{cells.length - 2} more cells
          </div>
        )}
      </div>
    </div>
  );
}
