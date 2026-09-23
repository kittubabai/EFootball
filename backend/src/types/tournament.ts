export interface Player {
  id: number;
  name: string;
  efootball_id: string;
  whatsapp: string;
  team_name: string;
  seed: number | null;
  registered_at: string;
  status: string;
}

export interface PlayerRegisterInput {
  name: string;
  efootball_id: string;
  whatsapp: string;
  team_name?: string;
}

export interface TournamentMeta {
  id: number;
  title: string;
  status: 'registration' | 'in_progress' | 'completed';
  admin_pin: string;
  max_players: number;
  match_time_mins: number;
}

export interface TournamentStatusResponse {
  title: string;
  status: string;
  registered_count: number;
  max_players: number;
  match_time_mins: number;
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
  round_name: string;
  round_index: number;
  match_number: number;
  player1_id: number | null;
  player2_id: number | null;
  player1_score: number | null;
  player2_score: number | null;
  player1_pk: number | null;
  player2_pk: number | null;
  is_extra_time: number; // 0 or 1 in sqlite
  winner_id: number | null;
  next_match_id: number | null;
  next_match_slot: number | null;
  status: 'scheduled' | 'completed' | 'bye';
}

export interface MatchResponse {
  id: number;
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
  next_match_id: number | null;
  next_match_slot: number | null;
  status: string;
}

export interface RoundResponse {
  round_index: number;
  round_name: string;
  matches: MatchResponse[];
}

export interface BracketResponse {
  tournament_status: string;
  rounds: RoundResponse[];
}

export interface ScoreUpdateInput {
  player1_score: number;
  player2_score: number;
  player1_pk?: number | null;
  player2_pk?: number | null;
  is_extra_time?: boolean;
  winner_id?: number | null;
}
