// "use client";

// import { useState, useRef, useCallback, useMemo } from "react";
// import { FaAt, FaVideo, FaUserPoliceTie, FaCopy, FaClipboardCheck, FaEye, FaEyeSlash, FaCommentDots } from "@/lib/icons";
// import { cn } from "@/lib/utils";
// import { card, toggle, iconSize } from "@/lib/config/theme";
// import { Section, PillButton } from "../ui";
// import { TeamsList } from "../features/TeamsCard";
// import { CellList } from "../features/CellCard";
// import { CONTACT_ROLES } from "@/lib/config/constants";
// import { useTruncationDetection } from "@/lib/hooks";
// import type { BailHub, BailContact, TeamsLink, SheriffCell } from "@/types";

// export type BailAccordionSection = "contacts" | "cells" | "teams" | null;

// // =============================================================================
// // BAIL CONTACTS STACK
// // =============================================================================

// interface BailContactsStackProps {
//   bailHub: BailHub;
//   bailContacts: BailContact[];
//   onCopy: (text: string, id: string) => void;
//   isCopied: (id: string) => boolean;
// }

// function BailContactsStack({
//   bailHub,
//   bailContacts,
//   onCopy,
//   isCopied,
// }: BailContactsStackProps) {
//   const [showFull, setShowFull] = useState(false);
//   const { registerRef, hasTruncation } = useTruncationDetection();

//   // Build contacts list from both bail hub direct fields and entity_contacts
//   const contactsList = useMemo(() => {
//     const result: { label: string; email: string; id: string }[] = [];

//     // Sheriff coordinator from bail_hubs table
//     if (bailHub.sheriff_coordinator_email) {
//       result.push({
//         label: "Sheriff Coordinator",
//         email: bailHub.sheriff_coordinator_email,
//         id: "sheriff-hub",
//       });
//     }

//     // Crown from entity_contacts
//     const crown = bailContacts.find(
//       (bc) => bc.role_id === CONTACT_ROLES.CROWN,
//     );
//     if (crown?.email) {
//       result.push({
//         label: "Bail Crown",
//         email: crown.email,
//         id: `crown-${crown.id}`,
//       });
//     }

//     // Federal Crown from entity_contacts
//     const fedCrown = bailContacts.find(
//       (bc) => bc.role_id === CONTACT_ROLES.FEDERAL_CROWN,
//     );
//     if (fedCrown?.email) {
//       result.push({
//         label: "Federal Crown",
//         email: fedCrown.email,
//         id: `fed-crown-${fedCrown.id}`,
//       });
//     }

//     return result;
//   }, [bailHub, bailContacts]);

//   const handleTeamsClick = () => {
//     if (bailHub.sheriff_coordinator_teams_chat) {
//       window.open(
//         `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(bailHub.sheriff_coordinator_teams_chat)}`,
//         "_blank",
//       );
//     }
//   };

//   if (contactsList.length === 0 && !bailHub.sheriff_coordinator_teams_chat) return null;

//   return (
//     <div className="space-y-2">
//       {/* Toggle button */}
//       {contactsList.length > 0 && (!showFull ? hasTruncation : true) && (
//         <div className="flex justify-end px-1">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowFull(!showFull);
//             }}
//             className={cn(toggle.base, showFull ? toggle.active : toggle.inactive)}
//           >
//             {showFull ? (
//               <FaEyeSlash className={iconSize.xs} />
//             ) : (
//               <FaEye className={iconSize.xs} />
//             )}
//             <span>{showFull ? "Truncate" : "Show full"}</span>
//           </button>
//         </div>
//       )}

//       {/* Contact rows */}
//       {contactsList.length > 0 && (
//         <div className={card.divided}>
//           {contactsList.map((contact) => {
//             const isFieldCopied = isCopied(contact.id);
//             return (
//               <div
//                 key={contact.id}
//                 onClick={() => onCopy(contact.email, contact.id)}
//                 className={cn(
//                   "flex items-stretch cursor-pointer group transition-colors",
//                   isFieldCopied ? "bg-emerald-500/10" : "hover:bg-slate-800/50",
//                 )}
//               >
//                 <div className="w-1 shrink-0 bg-semantic-amber" />
//                 <div className="flex-1 py-2 px-3 min-w-0">
//                   <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
//                     {contact.label}
//                   </div>
//                   <div
//                     ref={!showFull ? registerRef : undefined}
//                     className={cn(
//                       "text-[11px] text-foreground/80 font-mono",
//                       showFull ? "break-all whitespace-normal" : "truncate",
//                     )}
//                   >
//                     {contact.email}
//                   </div>
//                 </div>
//                 <div className="flex items-center px-2">
//                   {isFieldCopied ? (
//                     <FaClipboardCheck className={cn(iconSize.sm, "text-emerald-400")} />
//                   ) : (
//                     <FaCopy
//                       className={cn(
//                         iconSize.sm,
//                         "text-muted-foreground group-hover:text-foreground/70 transition-colors",
//                       )}
//                     />
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Teams Chat Button */}
//       {bailHub.sheriff_coordinator_teams_chat && (
//         <button
//           onClick={handleTeamsClick}
//           className={cn(
//             "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md",
//             "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700",
//             "text-white text-sm font-medium shadow-sm",
//             "transition-colors duration-150",
//           )}
//         >
//           <FaCommentDots className={iconSize.md} />
//           <span>Chat with Sheriff Coordinator</span>
//         </button>
//       )}
//     </div>
//   );
// }

// // =============================================================================
// // BAIL MODE NAV
// // =============================================================================

// interface BailModeNavProps {
//   bailHub: BailHub;
//   bailContacts: BailContact[];
//   bailTeams: TeamsLink[];
//   cells: SheriffCell[];
//   expandedSection: BailAccordionSection;
//   onNavigateToSection: (section: BailAccordionSection) => void;
// }

// export function BailModeNav({
//   bailHub,
//   bailContacts,
//   bailTeams,
//   cells,
//   expandedSection,
//   onNavigateToSection,
// }: BailModeNavProps) {
//   // Count contacts (including sheriff coordinator from bail hub)
//   const contactsCount = bailContacts.length + (bailHub.sheriff_coordinator_email ? 1 : 0);
//   const hasContacts = contactsCount > 0 || bailHub.sheriff_coordinator_teams_chat;

//   const navButtons = useMemo(
//     () => [
//       {
//         key: "contacts",
//         label: "Contacts",
//         icon: <FaAt className="w-4 h-4" />,
//         count: contactsCount,
//         show: hasContacts,
//       },
//       {
//         key: "cells",
//         label: "Cells",
//         icon: <FaUserPoliceTie className="w-4 h-4" />,
//         count: cells.length,
//         show: cells.length > 0,
//       },
//       {
//         key: "teams",
//         label: "Teams",
//         icon: <FaVideo className="w-4 h-4" />,
//         count: bailTeams.length,
//         show: bailTeams.length > 0,
//       },
//     ],
//     [contactsCount, hasContacts, cells.length, bailTeams.length],
//   );

//   return (
//     <div className="flex gap-1.5 px-3 py-2 border-t border-semantic-amber/30">
//       {navButtons
//         .filter((btn) => btn.show)
//         .map((btn) => (
//           <PillButton
//             className="flex-1 justify-center"
//             key={btn.key}
//             isActive={expandedSection === btn.key}
//             onClick={() => onNavigateToSection(btn.key as BailAccordionSection)}
//           >
//             {btn.icon}
//             <span>{btn.label}</span>
//             {btn.count !== undefined && (
//               <span
//                 className={
//                   expandedSection === btn.key
//                     ? "text-foreground/70"
//                     : "text-muted-foreground"
//                 }
//               >
//                 {btn.count}
//               </span>
//             )}
//           </PillButton>
//         ))}
//     </div>
//   );
// }

// // =============================================================================
// // BAIL MODE CONTENT
// // =============================================================================

// interface BailModeContentProps {
//   bailHub: BailHub;
//   bailContacts: BailContact[];
//   bailTeams: TeamsLink[];
//   cells: SheriffCell[];
//   expandedSection: BailAccordionSection;
//   onExpandedSectionChange: (section: BailAccordionSection) => void;
//   onCopy: (text: string, id: string) => void;
//   isCopied: (id: string) => boolean;
// }

// export function BailModeContent({
//   bailHub,
//   bailContacts,
//   bailTeams,
//   cells,
//   expandedSection,
//   onExpandedSectionChange,
//   onCopy,
//   isCopied,
// }: BailModeContentProps) {
//   const contactsRef = useRef<HTMLDivElement>(null);
//   const cellsRef = useRef<HTMLDivElement>(null);
//   const teamsRef = useRef<HTMLDivElement>(null);

//   // Count contacts (including sheriff coordinator from bail hub)
//   const contactsCount = bailContacts.length + (bailHub.sheriff_coordinator_email ? 1 : 0);
//   const hasContacts = contactsCount > 0 || bailHub.sheriff_coordinator_teams_chat;

//   const toggleSection = useCallback(
//     (section: BailAccordionSection) => {
//       onExpandedSectionChange(expandedSection === section ? null : section);
//     },
//     [expandedSection, onExpandedSectionChange],
//   );

//   return (
//     <div className="p-3 space-y-2.5 pb-20">
//       {/* Contacts section */}
//       {hasContacts && (
//         <Section
//           ref={contactsRef}
//           color="amber"
//           title="Bail Contacts"
//           count={contactsCount}
//           isExpanded={expandedSection === "contacts"}
//           onToggle={() => toggleSection("contacts")}
//         >
//           <div className="p-3">
//             <BailContactsStack
//               bailHub={bailHub}
//               bailContacts={bailContacts}
//               onCopy={onCopy}
//               isCopied={isCopied}
//             />
//           </div>
//         </Section>
//       )}

//       {/* Cells section */}
//       {cells.length > 0 && (
//         <Section
//           ref={cellsRef}
//           color="amber"
//           title="Sheriff Cells"
//           count={cells.length}
//           isExpanded={expandedSection === "cells"}
//           onToggle={() => toggleSection("cells")}
//         >
//           <div className="p-3">
//             <CellList cells={cells} />
//           </div>
//         </Section>
//       )}

//       {/* Teams section */}
//       {bailTeams.length > 0 && (
//         <Section
//           ref={teamsRef}
//           color="indigo"
//           title="MS Teams Links"
//           count={bailTeams.length}
//           isExpanded={expandedSection === "teams"}
//           onToggle={() => toggleSection("teams")}
//         >
//           <div className="p-3">
//             <TeamsList
//               links={bailTeams}
//               filterVBTriage={false}
//               onCopy={onCopy}
//               isCopied={isCopied}
//             />
//           </div>
//         </Section>
//       )}
//     </div>
//   );
// }
