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
      action_tasks: {
        Row: {
          completed_at: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          due_at: string | null;
          id: string;
          organization_id: string;
          owner_user_id: string | null;
          priority: Database["public"]["Enums"]["action_task_priority"];
          school_id: string;
          source_id: string | null;
          source_type: string | null;
          status: Database["public"]["Enums"]["action_task_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          organization_id: string;
          owner_user_id?: string | null;
          priority?: Database["public"]["Enums"]["action_task_priority"];
          school_id: string;
          source_id?: string | null;
          source_type?: string | null;
          status?: Database["public"]["Enums"]["action_task_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          organization_id?: string;
          owner_user_id?: string | null;
          priority?: Database["public"]["Enums"]["action_task_priority"];
          school_id?: string;
          source_id?: string | null;
          source_type?: string | null;
          status?: Database["public"]["Enums"]["action_task_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "action_tasks_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      approval_decisions: {
        Row: {
          comment: string | null;
          decided_at: string;
          decided_by: string;
          decision: Database["public"]["Enums"]["approval_decision_kind"];
          id: string;
          organization_id: string;
          request_id: string;
          school_id: string;
          step: number;
        };
        Insert: {
          comment?: string | null;
          decided_at?: string;
          decided_by?: string;
          decision: Database["public"]["Enums"]["approval_decision_kind"];
          id?: string;
          organization_id: string;
          request_id: string;
          school_id: string;
          step: number;
        };
        Update: {
          comment?: string | null;
          decided_at?: string;
          decided_by?: string;
          decision?: Database["public"]["Enums"]["approval_decision_kind"];
          id?: string;
          organization_id?: string;
          request_id?: string;
          school_id?: string;
          step?: number;
        };
        Relationships: [
          {
            foreignKeyName: "approval_decisions_request_id_organization_id_school_id_fkey";
            columns: ["request_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "approval_requests";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      approval_policies: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          is_active: boolean;
          key: string;
          name: string;
          organization_id: string;
          school_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          key: string;
          name: string;
          organization_id: string;
          school_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          key?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "approval_policies_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      approval_policy_steps: {
        Row: {
          approver_role_id: string;
          created_at: string;
          id: string;
          organization_id: string;
          policy_id: string;
          school_id: string;
          sequence: number;
        };
        Insert: {
          approver_role_id: string;
          created_at?: string;
          id?: string;
          organization_id: string;
          policy_id: string;
          school_id: string;
          sequence: number;
        };
        Update: {
          approver_role_id?: string;
          created_at?: string;
          id?: string;
          organization_id?: string;
          policy_id?: string;
          school_id?: string;
          sequence?: number;
        };
        Relationships: [
          {
            foreignKeyName: "approval_policy_steps_approver_role_id_organization_id_fkey";
            columns: ["approver_role_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "approval_policy_steps_policy_id_organization_id_school_id_fkey";
            columns: ["policy_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "approval_policies";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      approval_requests: {
        Row: {
          created_at: string;
          current_step: number;
          decided_at: string | null;
          id: string;
          organization_id: string;
          policy_id: string;
          requested_by: string;
          school_id: string;
          status: Database["public"]["Enums"]["approval_request_status"];
          subject_id: string;
          subject_type: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_step?: number;
          decided_at?: string | null;
          id?: string;
          organization_id: string;
          policy_id: string;
          requested_by?: string;
          school_id: string;
          status?: Database["public"]["Enums"]["approval_request_status"];
          subject_id: string;
          subject_type: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_step?: number;
          decided_at?: string | null;
          id?: string;
          organization_id?: string;
          policy_id?: string;
          requested_by?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["approval_request_status"];
          subject_id?: string;
          subject_type?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "approval_requests_policy_id_organization_id_school_id_fkey";
            columns: ["policy_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "approval_policies";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      audit_events: {
        Row: {
          action: string;
          actor_user_id: string | null;
          entity_id: string | null;
          entity_type: string;
          id: number;
          metadata: Json;
          occurred_at: string;
          organization_id: string;
          request_id: string | null;
          school_id: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          entity_id?: string | null;
          entity_type: string;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          organization_id: string;
          request_id?: string | null;
          school_id?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: never;
          metadata?: Json;
          occurred_at?: string;
          organization_id?: string;
          request_id?: string | null;
          school_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_events_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
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
      class_memberships: {
        Row: {
          academic_session_id: string;
          class_arm_id: string | null;
          class_level_id: string;
          created_at: string;
          created_by: string;
          ended_on: string | null;
          enrollment_id: string;
          id: string;
          organization_id: string;
          school_id: string;
          started_on: string;
          status: Database["public"]["Enums"]["class_membership_status"];
          student_id: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          academic_session_id: string;
          class_arm_id?: string | null;
          class_level_id: string;
          created_at?: string;
          created_by?: string;
          ended_on?: string | null;
          enrollment_id: string;
          id?: string;
          organization_id: string;
          school_id: string;
          started_on: string;
          status?: Database["public"]["Enums"]["class_membership_status"];
          student_id: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          academic_session_id?: string;
          class_arm_id?: string | null;
          class_level_id?: string;
          created_at?: string;
          created_by?: string;
          ended_on?: string | null;
          enrollment_id?: string;
          id?: string;
          organization_id?: string;
          school_id?: string;
          started_on?: string;
          status?: Database["public"]["Enums"]["class_membership_status"];
          student_id?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_memberships_academic_session_id_organization_id_scho_fkey";
            columns: ["academic_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "class_memberships_class_arm_id_organization_id_school_id_fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "class_memberships_class_level_id_organization_id_school_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "class_memberships_enrollment_identity_session_fkey";
            columns: [
              "enrollment_id",
              "student_id",
              "academic_session_id",
              "organization_id",
              "school_id",
            ];
            isOneToOne: false;
            referencedRelation: "student_enrollments";
            referencedColumns: [
              "id",
              "student_id",
              "academic_session_id",
              "organization_id",
              "school_id",
            ];
          },
        ];
      };
      departments: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
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
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "departments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      documents: {
        Row: {
          created_at: string;
          created_by: string;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          mime_type: string;
          object_path: string;
          organization_id: string;
          original_filename: string;
          school_id: string;
          size_bytes: number;
          status: Database["public"]["Enums"]["document_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          mime_type: string;
          object_path: string;
          organization_id: string;
          original_filename: string;
          school_id: string;
          size_bytes: number;
          status?: Database["public"]["Enums"]["document_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          mime_type?: string;
          object_path?: string;
          organization_id?: string;
          original_filename?: string;
          school_id?: string;
          size_bytes?: number;
          status?: Database["public"]["Enums"]["document_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      employments: {
        Row: {
          created_at: string;
          created_by: string;
          employment_type: Database["public"]["Enums"]["employment_type"];
          ended_on: string | null;
          exit_reason: string | null;
          id: string;
          organization_id: string;
          staff_profile_id: string;
          started_on: string;
          status: Database["public"]["Enums"]["employment_status"];
          updated_at: string;
          updated_by: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          employment_type: Database["public"]["Enums"]["employment_type"];
          ended_on?: string | null;
          exit_reason?: string | null;
          id?: string;
          organization_id: string;
          staff_profile_id: string;
          started_on: string;
          status?: Database["public"]["Enums"]["employment_status"];
          updated_at?: string;
          updated_by?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          employment_type?: Database["public"]["Enums"]["employment_type"];
          ended_on?: string | null;
          exit_reason?: string | null;
          id?: string;
          organization_id?: string;
          staff_profile_id?: string;
          started_on?: string;
          status?: Database["public"]["Enums"]["employment_status"];
          updated_at?: string;
          updated_by?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employments_staff_profile_id_organization_id_fkey";
            columns: ["staff_profile_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "staff_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      guardian_relationships: {
        Row: {
          created_at: string;
          created_by: string;
          effective_from: string;
          effective_to: string | null;
          guardian_person_id: string;
          has_portal_access: boolean;
          id: string;
          is_financially_responsible: boolean;
          is_primary_contact: boolean;
          organization_id: string;
          relationship_type: string;
          student_id: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          effective_from?: string;
          effective_to?: string | null;
          guardian_person_id: string;
          has_portal_access?: boolean;
          id?: string;
          is_financially_responsible?: boolean;
          is_primary_contact?: boolean;
          organization_id: string;
          relationship_type: string;
          student_id: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          effective_from?: string;
          effective_to?: string | null;
          guardian_person_id?: string;
          has_portal_access?: boolean;
          id?: string;
          is_financially_responsible?: boolean;
          is_primary_contact?: boolean;
          organization_id?: string;
          relationship_type?: string;
          student_id?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guardian_relationships_guardian_person_id_fkey";
            columns: ["guardian_person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guardian_relationships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guardian_relationships_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      import_batches: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          invalid_rows: number;
          kind: string;
          organization_id: string;
          school_id: string;
          source_name: string;
          status: Database["public"]["Enums"]["import_batch_status"];
          total_rows: number;
          updated_at: string;
          valid_rows: number;
          warning_rows: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          id?: string;
          invalid_rows?: number;
          kind: string;
          organization_id: string;
          school_id: string;
          source_name: string;
          status?: Database["public"]["Enums"]["import_batch_status"];
          total_rows?: number;
          updated_at?: string;
          valid_rows?: number;
          warning_rows?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          invalid_rows?: number;
          kind?: string;
          organization_id?: string;
          school_id?: string;
          source_name?: string;
          status?: Database["public"]["Enums"]["import_batch_status"];
          total_rows?: number;
          updated_at?: string;
          valid_rows?: number;
          warning_rows?: number;
        };
        Relationships: [
          {
            foreignKeyName: "import_batches_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      import_rows: {
        Row: {
          batch_id: string;
          created_at: string;
          id: string;
          normalized_data: Json;
          organization_id: string;
          raw_data: Json;
          row_number: number;
          school_id: string;
          status: Database["public"]["Enums"]["import_row_status"];
          validation_messages: Json;
        };
        Insert: {
          batch_id: string;
          created_at?: string;
          id?: string;
          normalized_data: Json;
          organization_id: string;
          raw_data: Json;
          row_number: number;
          school_id: string;
          status: Database["public"]["Enums"]["import_row_status"];
          validation_messages?: Json;
        };
        Update: {
          batch_id?: string;
          created_at?: string;
          id?: string;
          normalized_data?: Json;
          organization_id?: string;
          raw_data?: Json;
          row_number?: number;
          school_id?: string;
          status?: Database["public"]["Enums"]["import_row_status"];
          validation_messages?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "import_rows_batch_id_organization_id_school_id_fkey";
            columns: ["batch_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "import_batches";
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
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          href: string | null;
          id: string;
          kind: Database["public"]["Enums"]["notification_kind"];
          organization_id: string;
          read_at: string | null;
          recipient_user_id: string;
          school_id: string | null;
          title: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          href?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["notification_kind"];
          organization_id: string;
          read_at?: string | null;
          recipient_user_id: string;
          school_id?: string | null;
          title: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          href?: string | null;
          id?: string;
          kind?: Database["public"]["Enums"]["notification_kind"];
          organization_id?: string;
          read_at?: string | null;
          recipient_user_id?: string;
          school_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
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
      positions: {
        Row: {
          code: string | null;
          created_at: string;
          created_by: string;
          department_id: string | null;
          id: string;
          is_teaching: boolean;
          name: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          department_id?: string | null;
          id?: string;
          is_teaching?: boolean;
          name: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          created_by?: string;
          department_id?: string | null;
          id?: string;
          is_teaching?: boolean;
          name?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "positions_department_id_organization_id_school_id_fkey";
            columns: ["department_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "positions_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
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
      staff_assignments: {
        Row: {
          created_at: string;
          created_by: string;
          department_id: string | null;
          employment_id: string;
          ended_on: string | null;
          id: string;
          is_primary: boolean;
          organization_id: string;
          position_id: string;
          reports_to_assignment_id: string | null;
          role_assignment_id: string | null;
          school_id: string;
          staff_profile_id: string;
          started_on: string;
          status: Database["public"]["Enums"]["staff_assignment_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          department_id?: string | null;
          employment_id: string;
          ended_on?: string | null;
          id?: string;
          is_primary?: boolean;
          organization_id: string;
          position_id: string;
          reports_to_assignment_id?: string | null;
          role_assignment_id?: string | null;
          school_id: string;
          staff_profile_id: string;
          started_on: string;
          status?: Database["public"]["Enums"]["staff_assignment_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          department_id?: string | null;
          employment_id?: string;
          ended_on?: string | null;
          id?: string;
          is_primary?: boolean;
          organization_id?: string;
          position_id?: string;
          reports_to_assignment_id?: string | null;
          role_assignment_id?: string | null;
          school_id?: string;
          staff_profile_id?: string;
          started_on?: string;
          status?: Database["public"]["Enums"]["staff_assignment_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_assignments_department_id_organization_id_school_id_fkey";
            columns: ["department_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_assignments_employment_id_staff_profile_id_organizat_fkey";
            columns: ["employment_id", "staff_profile_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "employments";
            referencedColumns: ["id", "staff_profile_id", "organization_id"];
          },
          {
            foreignKeyName: "staff_assignments_position_id_organization_id_school_id_fkey";
            columns: ["position_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_assignments_reports_to_assignment_id_fkey";
            columns: ["reports_to_assignment_id"];
            isOneToOne: false;
            referencedRelation: "staff_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_assignments_role_assignment_id_fkey";
            columns: ["role_assignment_id"];
            isOneToOne: false;
            referencedRelation: "role_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_assignments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      staff_profiles: {
        Row: {
          created_at: string;
          created_by: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          id: string;
          organization_id: string;
          person_id: string;
          phone: string | null;
          qualifications: string[];
          staff_number: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
          work_email: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          id?: string;
          organization_id: string;
          person_id: string;
          phone?: string | null;
          qualifications?: string[];
          staff_number: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
          work_email?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          id?: string;
          organization_id?: string;
          person_id?: string;
          phone?: string | null;
          qualifications?: string[];
          staff_number?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
          work_email?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_profiles_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
        ];
      };
      student_enrollments: {
        Row: {
          academic_session_id: string;
          created_at: string;
          created_by: string;
          ended_on: string | null;
          enrolled_on: string;
          exit_reason: string | null;
          id: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["enrollment_status"];
          student_id: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          academic_session_id: string;
          created_at?: string;
          created_by?: string;
          ended_on?: string | null;
          enrolled_on: string;
          exit_reason?: string | null;
          id?: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          student_id: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          academic_session_id?: string;
          created_at?: string;
          created_by?: string;
          ended_on?: string | null;
          enrolled_on?: string;
          exit_reason?: string | null;
          id?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["enrollment_status"];
          student_id?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_enrollments_academic_session_id_organization_id_sc_fkey";
            columns: ["academic_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_enrollments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_enrollments_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      student_profiles: {
        Row: {
          created_at: string;
          created_by: string;
          date_of_birth: string | null;
          gender: string | null;
          id: string;
          organization_id: string;
          person_id: string;
          status: Database["public"]["Enums"]["student_lifecycle_status"];
          student_number: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          date_of_birth?: string | null;
          gender?: string | null;
          id?: string;
          organization_id: string;
          person_id: string;
          status?: Database["public"]["Enums"]["student_lifecycle_status"];
          student_number: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          date_of_birth?: string | null;
          gender?: string | null;
          id?: string;
          organization_id?: string;
          person_id?: string;
          status?: Database["public"]["Enums"]["student_lifecycle_status"];
          student_number?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_profiles_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "people";
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
      can_access_shared: {
        Args: {
          feature_key?: string;
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      can_access_staff: {
        Args: {
          feature_key?: string;
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      can_access_students: {
        Args: {
          feature_key?: string;
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      can_view_staff: {
        Args: { target_staff_profile_id: string };
        Returns: boolean;
      };
      can_view_student: {
        Args: { target_student_id: string };
        Returns: boolean;
      };
      create_approval_policy: {
        Args: {
          first_approver_role_id: string;
          policy_description: string;
          policy_key: string;
          policy_name: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: string;
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
      create_staff_record: {
        Args: {
          linked_role_id?: string;
          linked_user_id?: string;
          staff_first_name: string;
          staff_last_name: string;
          target_department_id: string;
          target_employment_type: Database["public"]["Enums"]["employment_type"];
          target_organization_id: string;
          target_phone?: string;
          target_position_id: string;
          target_school_id: string;
          target_staff_number: string;
          target_started_on: string;
          target_work_email?: string;
        };
        Returns: string;
      };
      create_student_import_preview: {
        Args: {
          preview_rows: Json;
          source_name: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: string;
      };
      create_student_record: {
        Args: {
          enrollment_date: string;
          guardian_financial?: boolean;
          guardian_first_name?: string;
          guardian_last_name?: string;
          guardian_primary?: boolean;
          guardian_relationship?: string;
          student_first_name: string;
          student_last_name: string;
          target_arm_id: string;
          target_date_of_birth: string;
          target_gender: string;
          target_level_id: string;
          target_organization_id: string;
          target_school_id: string;
          target_session_id: string;
          target_student_number: string;
        };
        Returns: string;
      };
      decide_approval_request: {
        Args: {
          target_comment?: string;
          target_decision: Database["public"]["Enums"]["approval_decision_kind"];
          target_request_id: string;
        };
        Returns: Database["public"]["Enums"]["approval_request_status"];
      };
      end_staff_employment: {
        Args: {
          target_employment_id: string;
          target_ended_on: string;
          target_reason: string;
        };
        Returns: undefined;
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
      list_staff_access_candidates: {
        Args: { target_organization_id: string; target_school_id: string };
        Returns: {
          display_name: string;
          email: string;
          user_id: string;
        }[];
      };
      set_current_academic_period: {
        Args: { target_period_id: string };
        Returns: undefined;
      };
      set_current_academic_session: {
        Args: { target_session_id: string };
        Returns: undefined;
      };
      submit_approval_request: {
        Args: {
          target_organization_id: string;
          target_policy_id: string;
          target_school_id: string;
          target_subject_id: string;
          target_subject_type: string;
          target_title: string;
        };
        Returns: string;
      };
      transfer_staff_assignment: {
        Args: {
          target_assignment_id: string;
          target_department_id: string;
          target_position_id: string;
          target_school_id: string;
          target_started_on: string;
        };
        Returns: string;
      };
    };
    Enums: {
      academic_lock_scope: "school_setup" | "session" | "period";
      academic_period_status: "planned" | "current" | "closed" | "archived";
      academic_session_status: "planned" | "current" | "closed" | "archived";
      action_task_priority: "low" | "normal" | "high" | "urgent";
      action_task_status: "open" | "in_progress" | "completed" | "cancelled";
      approval_decision_kind: "approved" | "rejected" | "returned";
      approval_request_status:
        "pending" | "approved" | "rejected" | "returned" | "cancelled";
      assignment_scope: "organization" | "management_group" | "school";
      class_membership_status: "active" | "ended" | "cancelled";
      document_status:
        "pending_upload" | "available" | "archived" | "quarantined";
      employment_status:
        "onboarding" | "active" | "suspended" | "on_leave" | "ended";
      employment_type:
        | "permanent"
        | "probationary"
        | "contract"
        | "temporary"
        | "part_time"
        | "volunteer";
      enrollment_status:
        | "pending"
        | "active"
        | "completed"
        | "transferred"
        | "withdrawn"
        | "expelled"
        | "cancelled";
      import_batch_status:
        "draft" | "validated" | "ready" | "committed" | "failed" | "cancelled";
      import_row_status: "valid" | "warning" | "invalid";
      invitation_status: "pending" | "accepted" | "revoked" | "expired";
      lifecycle_status: "active" | "inactive" | "archived";
      membership_status: "invited" | "active" | "suspended" | "ended";
      notification_kind: "system" | "action_required" | "approval" | "document";
      staff_assignment_status: "planned" | "active" | "ended" | "cancelled";
      student_lifecycle_status:
        | "pending_enrollment"
        | "active"
        | "suspended"
        | "graduated"
        | "transferred"
        | "withdrawn"
        | "expelled"
        | "archived";
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
      action_task_priority: ["low", "normal", "high", "urgent"],
      action_task_status: ["open", "in_progress", "completed", "cancelled"],
      approval_decision_kind: ["approved", "rejected", "returned"],
      approval_request_status: [
        "pending",
        "approved",
        "rejected",
        "returned",
        "cancelled",
      ],
      assignment_scope: ["organization", "management_group", "school"],
      class_membership_status: ["active", "ended", "cancelled"],
      document_status: [
        "pending_upload",
        "available",
        "archived",
        "quarantined",
      ],
      employment_status: [
        "onboarding",
        "active",
        "suspended",
        "on_leave",
        "ended",
      ],
      employment_type: [
        "permanent",
        "probationary",
        "contract",
        "temporary",
        "part_time",
        "volunteer",
      ],
      enrollment_status: [
        "pending",
        "active",
        "completed",
        "transferred",
        "withdrawn",
        "expelled",
        "cancelled",
      ],
      import_batch_status: [
        "draft",
        "validated",
        "ready",
        "committed",
        "failed",
        "cancelled",
      ],
      import_row_status: ["valid", "warning", "invalid"],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      lifecycle_status: ["active", "inactive", "archived"],
      membership_status: ["invited", "active", "suspended", "ended"],
      notification_kind: ["system", "action_required", "approval", "document"],
      staff_assignment_status: ["planned", "active", "ended", "cancelled"],
      student_lifecycle_status: [
        "pending_enrollment",
        "active",
        "suspended",
        "graduated",
        "transferred",
        "withdrawn",
        "expelled",
        "archived",
      ],
      subject_classification: ["core", "elective"],
      subscription_status: ["trialing", "active", "suspended", "expired"],
    },
  },
} as const;
