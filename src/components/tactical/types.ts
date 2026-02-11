
export interface Player {
  id: string;
  name: string;
  identification: string;
  category: string;
  position?: string;
  image?: string; // If available in future
  photo_url?: string; // Photo URL from database
  status: 'available' | 'assigned' | 'injured' | 'suspended';
}

export interface Position {
  id: string;
  label: string; // e.g. 'GK', 'CB', 'ST'
  role: string;  // 'keeper', 'defense', 'midfield', 'forward'
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
}

export interface Lineup {
  id: string;
  name: string; // e.g. '4-3-3', '4-4-2'
  description: string;
  positions: Position[];
}

export interface CallUp {
  id?: string;
  category: string;
  lineupId: string;
  assignments: Record<string, string>; // positionId -> playerId
  createdAt?: string;
  opponent?: string;
  date?: string;
  time?: string;
  location?: string;
}

export interface DragItem {
  id: string;
  type: 'player';
  player: Player;
}
