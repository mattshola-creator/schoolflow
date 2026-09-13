export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      academic_locks: {
        Row: {
          id: string;
          locked_at: string;
          locked_by: string;
          organization_id: string;
          period_id: string | null;
          reason: string;
          school_id: string;
          scope: Database["public"]["Enums"]["academic_lock_scope"];
          session_id: string | null;
          unlock_reason: string | null;
          unlocked_at: string | null;
          unlocked_by: string | null;
        };
        Insert: {
          id?: string;
          locked_at?: string;
          locked_by?: string;
          organization_id: string;
          period_id?: string | null;
          reason: string;
          school_id: string;
          scope: Database["public"]["Enums"]["academic_lock_scope"];
          session_id?: string | null;
          unlock_reason?: string | null;
          unlocked_at?: string | null;
          unlocked_by?: string | null;
        };
        Update: {
          id?: string;
          locked_at?: string;
          locked_by?: string;
          organization_id?: string;
          period_id?: string | null;
          reason?: string;
          school_id?: string;
          scope?: Database["public"]["Enums"]["academic_lock_scope"];
          session_id?: string | null;
          unlock_reason?: string | null;
          unlocked_at?: string | null;
          unlocked_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "academic_locks_period_id_session_id_organization_id_school_fkey";
            columns: [
              "period_id",
              "session_id",
              "organization_id",
              "school_id",
            ];
            isOneToOne: false;
            referencedRelation: "academic_periods";
            referencedColumns: [
              "id",
              "session_id",
              "organization_id",
              "school_id",
            ];
          },
          {
            foreignKeyName: "academic_locks_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "academic_locks_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      academic_periods: {
        Row: {
          created_at: string;
          created_by: string;
          end_date: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          sequence: number;
          session_id: string;
          start_date: string;
          status: Database["public"]["Enums"]["academic_period_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          end_date: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          sequence: number;
          session_id: string;
          start_date: string;
          status?: Database["public"]["Enums"]["academic_period_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          end_date?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          sequence?: number;
          session_id?: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["academic_period_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academic_periods_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      academic_sections: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          sort_order: number;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academic_sections_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      academic_sessions: {
        Row: {
          created_at: string;
          created_by: string;
          end_date: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          start_date: string;
          status: Database["public"]["Enums"]["academic_session_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          end_date: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          start_date: string;
          status?: Database["public"]["Enums"]["academic_session_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          end_date?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["academic_session_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academic_sessions_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      class_arms: {
        Row: {
          class_level_id: string;
          code: string | null;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          sort_order: number;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          class_level_id: string;
          code?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          class_level_id?: string;
          code?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_arms_class_level_id_organization_id_school_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "class_arms_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      class_levels: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          section_id: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          section_id?: string | null;
          sort_order: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          section_id?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_levels_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "class_levels_section_id_organization_id_school_id_fkey";
            columns: ["section_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sections";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          organization_id: string;
          role_id: string;
          school_id: string | null;
          status: Database["public"]["Enums"]["invitation_status"];
          token_hash: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invited_by: string;
          organization_id: string;
          role_id: string;
          school_id?: string | null;
          status?: Database["public"]["Enums"]["invitation_status"];
          token_hash: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          organization_id?: string;
          role_id?: string;
          school_id?: string | null;
          status?: Database["public"]["Enums"]["invitation_status"];
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_role_id_organization_id_fkey";
            columns: ["role_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "invitations_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      locations: {
        Row: {
          address_line: string | null;
          city: string | null;
          country_code: string;
          created_at: string;
          id: string;
          name: string;
          organization_id: string;
          state: string | null;
          status: Database["public"]["Enums"]["lifecycle_status"];
          timezone: string;
          updated_at: string;
        };
        Insert: {
          address_line?: string | null;
          city?: string | null;
          country_code?: string;
          created_at?: string;
          id?: string;
          name: string;
          organization_id: string;
          state?: string | null;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          address_line?: string | null;
          city?: string | null;
          country_code?: string;
          created_at?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          state?: string | null;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      management_group_schools: {
        Row: {
          created_at: string;
          management_group_id: string;
          organization_id: string;
          school_id: string;
        };
        Insert: {
          created_at?: string;
          management_group_id: string;
          organization_id: string;
          school_id: string;
        };
        Update: {
          created_at?: string;
          management_group_id?: string;
          organization_id?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "management_group_schools_management_group_id_fkey";
            columns: ["management_group_id"];
            isOneToOne: false;
            referencedRelation: "management_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "management_group_schools_management_group_id_organization__fkey";
            columns: ["management_group_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "management_groups";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "management_group_schools_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "management_group_schools_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "management_group_schools_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      management_groups: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          organization_id: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          organization_id: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "management_groups_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_feature_flags: {
        Row: {
          enabled: boolean;
          feature_id: string;
          organization_id: string;
          reason: string | null;
          updated_at: string;
        };
        Insert: {
          enabled: boolean;
          feature_id: string;
          organization_id: string;
          reason?: string | null;
          updated_at?: string;
        };
        Update: {
          enabled?: boolean;
          feature_id?: string;
          organization_id?: string;
          reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_feature_flags_feature_id_fkey";
            columns: ["feature_id"];
            isOneToOne: false;
            referencedRelation: "product_features";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_feature_flags_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_memberships: {
        Row: {
          all_schools: boolean;
          created_at: string;
          effective_from: string;
          effective_to: string | null;
          id: string;
          organization_id: string;
          status: Database["public"]["Enums"]["membership_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          all_schools?: boolean;
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          organization_id: string;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          all_schools?: boolean;
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          organization_id?: string;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_plans: {
        Row: {
          created_at: string;
          ends_at: string | null;
          id: string;
          organization_id: string;
          plan_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          organization_id: string;
          plan_id: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          organization_id?: string;
          plan_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_plans_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_plans_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          slug: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          slug: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      people: {
        Row: {
          created_at: string;
          first_name: string;
          id: string;
          last_name: string;
          preferred_name: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          first_name: string;
          id?: string;
          last_name: string;
          preferred_name?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          preferred_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          key: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          key: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          key?: string;
        };
        Relationships: [];
      };
      plan_module_entitlements: {
        Row: {
          created_at: string;
          enabled: boolean;
          module_id: string;
          plan_id: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          module_id: string;
          plan_id: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          module_id?: string;
          plan_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_module_entitlements_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "product_modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_module_entitlements_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          key: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          is_active?: boolean;
          key: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          key?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_features: {
        Row: {
          created_at: string;
          default_enabled: boolean;
          description: string;
          id: string;
          is_active: boolean;
          key: string;
          module_id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_enabled?: boolean;
          description: string;
          id?: string;
          is_active?: boolean;
          key: string;
          module_id: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_enabled?: boolean;
          description?: string;
          id?: string;
          is_active?: boolean;
          key?: string;
          module_id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_features_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "product_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      product_modules: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          key: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          is_active?: boolean;
          key: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          key?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          person_id: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          person_id: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          person_id?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: true;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
        ];
      };
      role_assignments: {
        Row: {
          created_at: string;
          effective_from: string;
          effective_to: string | null;
          id: string;
          management_group_id: string | null;
          organization_id: string;
          role_id: string;
          school_id: string | null;
          scope: Database["public"]["Enums"]["assignment_scope"];
          status: Database["public"]["Enums"]["membership_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          management_group_id?: string | null;
          organization_id: string;
          role_id: string;
          school_id?: string | null;
          scope: Database["public"]["Enums"]["assignment_scope"];
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          management_group_id?: string | null;
          organization_id?: string;
          role_id?: string;
          school_id?: string | null;
          scope?: Database["public"]["Enums"]["assignment_scope"];
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_assignments_management_group_id_fkey";
            columns: ["management_group_id"];
            isOneToOne: false;
            referencedRelation: "management_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_assignments_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_assignments_role_id_organization_id_fkey";
            columns: ["role_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "role_assignments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          created_at: string;
          organization_id: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          organization_id: string;
          permission_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string;
          organization_id?: string;
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_organization_id_fkey";
            columns: ["role_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_system: boolean;
          key: string;
          name: string;
          organization_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          key: string;
          name: string;
          organization_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          key?: string;
          name?: string;
          organization_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      school_academic_settings: {
        Row: {
          created_at: string;
          created_by: string;
          organization_id: string;
          period_label: string;
          school_id: string;
          updated_at: string;
          updated_by: string;
          week_starts_on: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          organization_id: string;
          period_label?: string;
          school_id: string;
          updated_at?: string;
          updated_by?: string;
          week_starts_on?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          organization_id?: string;
          period_label?: string;
          school_id?: string;
          updated_at?: string;
          updated_by?: string;
          week_starts_on?: number;
        };
        Relationships: [
          {
            foreignKeyName: "school_academic_settings_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: true;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      school_memberships: {
        Row: {
          created_at: string;
          effective_from: string;
          effective_to: string | null;
          id: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["membership_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["membership_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "school_memberships_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      schools: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          location_id: string;
          name: string;
          organization_id: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          location_id: string;
          name: string;
          organization_id: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          location_id?: string;
          name?: string;
          organization_id?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schools_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "schools_location_id_organization_id_fkey";
            columns: ["location_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "schools_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      subject_level_applicability: {
        Row: {
          class_level_id: string;
          classification: Database["public"]["Enums"]["subject_classification"];
          created_at: string;
          created_by: string;
          organization_id: string;
          school_id: string;
          sort_order: number;
          subject_id: string;
        };
        Insert: {
          class_level_id: string;
          classification?: Database["public"]["Enums"]["subject_classification"];
          created_at?: string;
          created_by?: string;
          organization_id: string;
          school_id: string;
          sort_order?: number;
          subject_id: string;
        };
        Update: {
          class_level_id?: string;
          classification?: Database["public"]["Enums"]["subject_classification"];
          created_at?: string;
          created_by?: string;
          organization_id?: string;
          school_id?: string;
          sort_order?: number;
          subject_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subject_level_applicability_class_level_id_organization_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "subject_level_applicability_subject_id_organization_id_sch_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      subjects: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          sort_order: number;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: { Args: { p_token_hash: string }; Returns: string };
      can_access_academic_setup: {
        Args: {
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      create_organization_with_school: {
        Args: {
          p_location_name: string;
          p_organization_name: string;
          p_organization_slug: string;
          p_school_code: string;
          p_school_name: string;
        };
        Returns: string;
      };
      create_school_subject: {
        Args: {
          subject_classification?: Database["public"]["Enums"]["subject_classification"];
          subject_code?: string;
          subject_name: string;
          subject_sort_order?: number;
          target_level_id?: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: string;
      };
      get_my_authorization: {
        Args: { target_organization_id: string; target_school_id?: string };
        Returns: Json;
      };
      has_module_entitlement: {
        Args: { module_key: string; target_organization_id: string };
        Returns: boolean;
      };
      has_org_membership: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      has_permission: {
        Args: {
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      has_school_membership: {
        Args: { target_organization_id: string; target_school_id: string };
        Returns: boolean;
      };
      is_feature_enabled: {
        Args: { feature_key: string; target_organization_id: string };
        Returns: boolean;
      };
      set_current_academic_period: {
        Args: { target_period_id: string };
        Returns: undefined;
      };
      set_current_academic_session: {
        Args: { target_session_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      academic_lock_scope: "school_setup" | "session" | "period";
      academic_period_status: "planned" | "current" | "closed" | "archived";
      academic_session_status: "planned" | "current" | "closed" | "archived";
      assignment_scope: "organization" | "management_group" | "school";
      invitation_status: "pending" | "accepted" | "revoked" | "expired";
      lifecycle_status: "active" | "inactive" | "archived";
      membership_status: "invited" | "active" | "suspended" | "ended";
      subject_classification: "core" | "elective";
      subscription_status: "trialing" | "active" | "suspended" | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      academic_lock_scope: ["school_setup", "session", "period"],
      academic_period_status: ["planned", "current", "closed", "archived"],
      academic_session_status: ["planned", "current", "closed", "archived"],
      assignment_scope: ["organization", "management_group", "school"],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      lifecycle_status: ["active", "inactive", "archived"],
      membership_status: ["invited", "active", "suspended", "ended"],
      subject_classification: ["core", "elective"],
      subscription_status: ["trialing", "active", "suspended", "expired"],
    },
  },
} as const;
