export interface HistoryModel {
  id_user: number;
  id_movie: number;
  duration: number;
  watched_at: string;      
  last_position: number;   
  is_completed: boolean;
  is_hidden: boolean;
}