export interface Player {
  id: number;
  name: string;
  efootball_id: string;
  whatsapp: string;
  team_name: string;
  seed: number | null;
  payment_status: 'pending' | 'verified' | 'rejected';
  utr_number: string;
  payment_screenshot?: string;
  group_assigned: 'A' | 'B' | 'C' | 'D' | null;
  goals_scored?: number;
  registered_at: string;
  status: string;
}

export interface PlayerRegisterInput {
  name: string;
  efootball_id: string;
  whatsapp: string;
  team_name?: string;
  utr_number: string;
}

export interface TournamentMeta {
  id: number;
  title: string;
  status: 'registration' | 'in_progress' | 'completed';
  admin_pin: string;
  max_players: number;
  match_time_mins: number;
  event_date: string;
  event_time: string;
  entry_fee: number;
  upi_id: string;
  upi_name: string;
}

export interface TournamentStatusResponse {
  title: string;
  status: string;
  registered_count: number;
  verified_count: number;
  max_players: number;
  match_time_mins: number;
  event_date: string;
  event_time: string;
  entry_fee: number;
  upi_id: string;
  upi_name: string;
}

export interface MatchPlayer {
  id: number;
  name: string;
  efootball_id: string;
  team_name: string;
  whatsapp: string;
}

export interface Match {
  id: number;
  group_key: 'A' | 'B' | 'C' | 'D' | 'FINALS';
  round_name: string;
  round_index: number;
  match_number: number;
  player1_id: number | null;
  player2_id: number | null;
  player1_score: number | null;
  player2_score: number | null;
  player1_pk: number | null;
  player2_pk: number | null;
  is_extra_time: number;
  winner_id: number | null;
  loser_id: number | null;
  next_match_id: number | null;
  next_match_slot: number | null;
  loser_next_match_id: number | null; // For 3rd place match
  loser_next_slot: number | null;
  status: 'scheduled' | 'completed' | 'bye';
}

export interface MatchResponse {
  id: number;
  group_key: string;
  round_name: string;
  round_index: number;
  match_number: number;
  player1: MatchPlayer | null;
  player2: MatchPlayer | null;
  player1_score: number | null;
  player2_score: number | null;
  player1_pk: number | null;
  player2_pk: number | null;
  is_extra_time: boolean;
  winner_id: number | null;
  loser_id: number | null;
  next_match_id: number | null;
  next_match_slot: number | null;
  status: string;
}

export interface GroupBracket {
  group_key: string;
  group_name: string;
  winner: MatchPlayer | null;
  matches: MatchResponse[];
}

export interface FinalPodium {
  first: MatchPlayer | null;
  second: MatchPlayer | null;
  third: MatchPlayer | null;
}

export interface GroupTournamentResponse {
  tournament_status: string;
  groups: Record<string, GroupBracket>;
  finals: {
    semi_finals: MatchResponse[];
    third_place: MatchResponse | null;
    grand_final: MatchResponse | null;
    podium: FinalPodium;
  };
}

export interface ScoreUpdateInput {
  player1_score: number;
  player2_score: number;
  player1_pk?: number | null;
  player2_pk?: number | null;
  is_extra_time?: boolean;
  winner_id?: number | null;
}
