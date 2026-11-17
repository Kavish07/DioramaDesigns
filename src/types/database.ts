// Hand-written to match supabase/migrations/20261117041632_initial_schema.sql.
// Regenerate from the real schema once linked:
//   supabase gen types typescript --local > src/types/database.ts

export type Category = "lego" | "gundam" | "cars";
export type DioramaSource = "generated" | "own_photo";
export type DioramaImage = { angle: string; url: string };

export type Database = {
  public: {
    Tables: {
      scales: {
        Row: {
          id: string;
          category: Category;
          name: string;
          sort_order: number;
        };
        Insert: Partial<Database["public"]["Tables"]["scales"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["scales"]["Row"]>;
      };
      themes: {
        Row: { id: string; name: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["themes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["themes"]["Row"]>;
      };
      tags: {
        Row: { id: string; name: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
      };
      dioramas: {
        Row: {
          id: string;
          title: string;
          category: Category;
          scale_id: string | null;
          theme_id: string | null;
          pov: string | null;
          realism: string | null;
          era: string | null;
          tags: string[];
          prompt: string | null;
          negative_prompt: string | null;
          model: string | null;
          seed: number | null;
          images: DioramaImage[];
          model_3d_url: string | null;
          source: DioramaSource;
          is_favourite: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["dioramas"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["dioramas"]["Row"]>;
      };
      boards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["boards"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["boards"]["Row"]>;
      };
      board_dioramas: {
        Row: { board_id: string; diorama_id: string; position: number };
        Insert: Partial<Database["public"]["Tables"]["board_dioramas"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["board_dioramas"]["Row"]>;
      };
    };
  };
};
