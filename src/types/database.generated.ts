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
      admission_application_documents: {
        Row: {
          application_id: string;
          category_key: string;
          created_at: string;
          document_id: string | null;
          id: string;
          label: string;
          not_applicable_allowed: boolean;
          organization_id: string;
          policy_id: string | null;
          policy_version: number;
          required: boolean;
          review_comment: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["admission_document_status"];
          submitted_at: string | null;
          submitted_by: string | null;
          updated_at: string;
        };
        Insert: {
          application_id: string;
          category_key: string;
          created_at?: string;
          document_id?: string | null;
          id?: string;
          label: string;
          not_applicable_allowed?: boolean;
          organization_id: string;
          policy_id?: string | null;
          policy_version: number;
          required?: boolean;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id: string;
          status?: Database["public"]["Enums"]["admission_document_status"];
          submitted_at?: string | null;
          submitted_by?: string | null;
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          category_key?: string;
          created_at?: string;
          document_id?: string | null;
          id?: string;
          label?: string;
          not_applicable_allowed?: boolean;
          organization_id?: string;
          policy_id?: string | null;
          policy_version?: number;
          required?: boolean;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["admission_document_status"];
          submitted_at?: string | null;
          submitted_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_application_documen_application_id_organization__fkey";
            columns: ["application_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "admission_applications";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_application_documen_document_id_organization_id__fkey";
            columns: ["document_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_application_documen_policy_id_organization_id_sc_fkey";
            columns: ["policy_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "admission_document_policies";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      admission_applications: {
        Row: {
          academic_session_id: string;
          applicant_person_id: string;
          application_number: string;
          applied_class_level_id: string;
          created_at: string;
          created_by: string;
          date_of_birth: string;
          enrolled_student_id: string | null;
          gender: string | null;
          id: string;
          notes: string | null;
          organization_id: string;
          previous_class: string | null;
          school_id: string;
          source: Database["public"]["Enums"]["admission_source"];
          status: Database["public"]["Enums"]["admission_application_status"];
          submitted_at: string | null;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          academic_session_id: string;
          applicant_person_id: string;
          application_number: string;
          applied_class_level_id: string;
          created_at?: string;
          created_by?: string;
          date_of_birth: string;
          enrolled_student_id?: string | null;
          gender?: string | null;
          id?: string;
          notes?: string | null;
          organization_id: string;
          previous_class?: string | null;
          school_id: string;
          source?: Database["public"]["Enums"]["admission_source"];
          status?: Database["public"]["Enums"]["admission_application_status"];
          submitted_at?: string | null;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          academic_session_id?: string;
          applicant_person_id?: string;
          application_number?: string;
          applied_class_level_id?: string;
          created_at?: string;
          created_by?: string;
          date_of_birth?: string;
          enrolled_student_id?: string | null;
          gender?: string | null;
          id?: string;
          notes?: string | null;
          organization_id?: string;
          previous_class?: string | null;
          school_id?: string;
          source?: Database["public"]["Enums"]["admission_source"];
          status?: Database["public"]["Enums"]["admission_application_status"];
          submitted_at?: string | null;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_applications_academic_session_id_organization_id_fkey";
            columns: ["academic_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_applications_applicant_person_id_fkey";
            columns: ["applicant_person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admission_applications_applied_class_level_id_organization_fkey";
            columns: ["applied_class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_applications_enrolled_student_id_organization_id_fkey";
            columns: ["enrolled_student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "admission_applications_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      admission_checklist_items: {
        Row: {
          application_id: string;
          completed_at: string | null;
          completed_by: string | null;
          id: string;
          key: string;
          label: string;
          organization_id: string;
          required: boolean;
          school_id: string;
          status: Database["public"]["Enums"]["checklist_item_status"];
          updated_at: string;
        };
        Insert: {
          application_id: string;
          completed_at?: string | null;
          completed_by?: string | null;
          id?: string;
          key: string;
          label: string;
          organization_id: string;
          required?: boolean;
          school_id: string;
          status?: Database["public"]["Enums"]["checklist_item_status"];
          updated_at?: string;
        };
        Update: {
          application_id?: string;
          completed_at?: string | null;
          completed_by?: string | null;
          id?: string;
          key?: string;
          label?: string;
          organization_id?: string;
          required?: boolean;
          school_id?: string;
          status?: Database["public"]["Enums"]["checklist_item_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_checklist_items_application_id_organization_id_s_fkey";
            columns: ["application_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "admission_applications";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      admission_decisions: {
        Row: {
          application_id: string;
          approval_request_id: string | null;
          decided_at: string;
          decided_by: string;
          decision: Database["public"]["Enums"]["admission_decision_kind"];
          id: string;
          organization_id: string;
          rationale: string;
          recommended_class_level_id: string | null;
          school_id: string;
        };
        Insert: {
          application_id: string;
          approval_request_id?: string | null;
          decided_at?: string;
          decided_by?: string;
          decision: Database["public"]["Enums"]["admission_decision_kind"];
          id?: string;
          organization_id: string;
          rationale: string;
          recommended_class_level_id?: string | null;
          school_id: string;
        };
        Update: {
          application_id?: string;
          approval_request_id?: string | null;
          decided_at?: string;
          decided_by?: string;
          decision?: Database["public"]["Enums"]["admission_decision_kind"];
          id?: string;
          organization_id?: string;
          rationale?: string;
          recommended_class_level_id?: string | null;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_decisions_application_id_organization_id_school__fkey";
            columns: ["application_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "admission_applications";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_decisions_approval_request_id_fkey";
            columns: ["approval_request_id"];
            isOneToOne: false;
            referencedRelation: "approval_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admission_decisions_recommended_class_level_id_organizatio_fkey";
            columns: [
              "recommended_class_level_id",
              "organization_id",
              "school_id",
            ];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      admission_document_policies: {
        Row: {
          category_key: string;
          created_at: string;
          created_by: string | null;
          enabled: boolean;
          id: string;
          label: string;
          not_applicable_allowed: boolean;
          organization_id: string;
          required: boolean;
          school_id: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          category_key: string;
          created_at?: string;
          created_by?: string | null;
          enabled?: boolean;
          id?: string;
          label: string;
          not_applicable_allowed?: boolean;
          organization_id: string;
          required?: boolean;
          school_id: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          category_key?: string;
          created_at?: string;
          created_by?: string | null;
          enabled?: boolean;
          id?: string;
          label?: string;
          not_applicable_allowed?: boolean;
          organization_id?: string;
          required?: boolean;
          school_id?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "admission_document_policies_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      admission_guardians: {
        Row: {
          application_id: string;
          created_at: string;
          created_by: string;
          email: string | null;
          guardian_person_id: string;
          id: string;
          is_financially_responsible: boolean;
          is_primary_contact: boolean;
          organization_id: string;
          phone: string | null;
          relationship_type: string;
          school_id: string;
        };
        Insert: {
          application_id: string;
          created_at?: string;
          created_by?: string;
          email?: string | null;
          guardian_person_id: string;
          id?: string;
          is_financially_responsible?: boolean;
          is_primary_contact?: boolean;
          organization_id: string;
          phone?: string | null;
          relationship_type: string;
          school_id: string;
        };
        Update: {
          application_id?: string;
          created_at?: string;
          created_by?: string;
          email?: string | null;
          guardian_person_id?: string;
          id?: string;
          is_financially_responsible?: boolean;
          is_primary_contact?: boolean;
          organization_id?: string;
          phone?: string | null;
          relationship_type?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_guardians_application_id_organization_id_school__fkey";
            columns: ["application_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "admission_applications";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_guardians_guardian_person_id_fkey";
            columns: ["guardian_person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
        ];
      };
      admission_offers: {
        Row: {
          academic_session_id: string;
          application_id: string;
          created_by: string;
          expires_at: string | null;
          id: string;
          issued_at: string | null;
          offered_class_arm_id: string | null;
          offered_class_level_id: string;
          organization_id: string;
          responded_at: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["offer_status"];
          updated_at: string;
        };
        Insert: {
          academic_session_id: string;
          application_id: string;
          created_by?: string;
          expires_at?: string | null;
          id?: string;
          issued_at?: string | null;
          offered_class_arm_id?: string | null;
          offered_class_level_id: string;
          organization_id: string;
          responded_at?: string | null;
          school_id: string;
          status?: Database["public"]["Enums"]["offer_status"];
          updated_at?: string;
        };
        Update: {
          academic_session_id?: string;
          application_id?: string;
          created_by?: string;
          expires_at?: string | null;
          id?: string;
          issued_at?: string | null;
          offered_class_arm_id?: string | null;
          offered_class_level_id?: string;
          organization_id?: string;
          responded_at?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["offer_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admission_offers_academic_session_id_organization_id_schoo_fkey";
            columns: ["academic_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_offers_application_id_organization_id_school_id_fkey";
            columns: ["application_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "admission_applications";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_offers_offered_class_arm_id_organization_id_scho_fkey";
            columns: ["offered_class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "admission_offers_offered_class_level_id_organization_id_sc_fkey";
            columns: ["offered_class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
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
      assessment_components: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          id: string;
          maximum_score: number;
          name: string;
          organization_id: string;
          scheme_id: string;
          school_id: string;
          sequence: number;
          weight_percent: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          maximum_score: number;
          name: string;
          organization_id: string;
          scheme_id: string;
          school_id: string;
          sequence: number;
          weight_percent: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          maximum_score?: number;
          name?: string;
          organization_id?: string;
          scheme_id?: string;
          school_id?: string;
          sequence?: number;
          weight_percent?: number;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_components_scheme_id_organization_id_school_id_fkey";
            columns: ["scheme_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "assessment_schemes";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      assessment_schemes: {
        Row: {
          activated_at: string | null;
          class_level_id: string;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          pass_mark: number;
          period_id: string;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["assessment_scheme_status"];
          subject_id: string | null;
          total_mark: number;
          updated_at: string;
          updated_by: string;
          version: number;
        };
        Insert: {
          activated_at?: string | null;
          class_level_id: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          pass_mark: number;
          period_id: string;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["assessment_scheme_status"];
          subject_id?: string | null;
          total_mark?: number;
          updated_at?: string;
          updated_by?: string;
          version?: number;
        };
        Update: {
          activated_at?: string | null;
          class_level_id?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          pass_mark?: number;
          period_id?: string;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["assessment_scheme_status"];
          subject_id?: string | null;
          total_mark?: number;
          updated_at?: string;
          updated_by?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_schemes_class_level_id_organization_id_school_i_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "assessment_schemes_period_id_session_id_organization_id_sc_fkey";
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
            foreignKeyName: "assessment_schemes_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "assessment_schemes_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "assessment_schemes_subject_id_organization_id_school_id_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      assessment_scores: {
        Row: {
          batch_id: string;
          component_id: string;
          created_at: string;
          entered_by: string;
          id: string;
          organization_id: string;
          school_id: string;
          score: number;
          student_id: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          batch_id: string;
          component_id: string;
          created_at?: string;
          entered_by?: string;
          id?: string;
          organization_id: string;
          school_id: string;
          score: number;
          student_id: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          batch_id?: string;
          component_id?: string;
          created_at?: string;
          entered_by?: string;
          id?: string;
          organization_id?: string;
          school_id?: string;
          score?: number;
          student_id?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_scores_batch_id_organization_id_school_id_fkey";
            columns: ["batch_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "result_batches";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "assessment_scores_component_id_organization_id_school_id_fkey";
            columns: ["component_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "assessment_components";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "assessment_scores_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      attendance_settings: {
        Row: {
          closing_register_enabled: boolean;
          created_at: string;
          created_by: string;
          enabled_student_statuses: Database["public"]["Enums"]["attendance_status"][];
          lesson_plan_approval_required: boolean;
          lesson_plan_required: boolean;
          lock_after_days: number;
          morning_register_enabled: boolean;
          organization_id: string;
          school_id: string;
          student_attendance_days: number[];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          closing_register_enabled?: boolean;
          created_at?: string;
          created_by?: string;
          enabled_student_statuses?: Database["public"]["Enums"]["attendance_status"][];
          lesson_plan_approval_required?: boolean;
          lesson_plan_required?: boolean;
          lock_after_days?: number;
          morning_register_enabled?: boolean;
          organization_id: string;
          school_id: string;
          student_attendance_days?: number[];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          closing_register_enabled?: boolean;
          created_at?: string;
          created_by?: string;
          enabled_student_statuses?: Database["public"]["Enums"]["attendance_status"][];
          lesson_plan_approval_required?: boolean;
          lesson_plan_required?: boolean;
          lock_after_days?: number;
          morning_register_enabled?: boolean;
          organization_id?: string;
          school_id?: string;
          student_attendance_days?: number[];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_settings_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: true;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
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
      billing_runs: {
        Row: {
          affected_students: number;
          completed_at: string | null;
          created_at: string;
          created_by: string;
          expected_total: number;
          fee_structure_id: string;
          id: string;
          idempotency_key: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["billing_run_status"];
        };
        Insert: {
          affected_students: number;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          expected_total: number;
          fee_structure_id: string;
          id?: string;
          idempotency_key: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["billing_run_status"];
        };
        Update: {
          affected_students?: number;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          expected_total?: number;
          fee_structure_id?: string;
          id?: string;
          idempotency_key?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["billing_run_status"];
        };
        Relationships: [
          {
            foreignKeyName: "billing_runs_fee_structure_id_organization_id_school_id_fkey";
            columns: ["fee_structure_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "fee_structures";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "billing_runs_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      cash_handovers: {
        Row: {
          amount: number;
          cashier_session_id: string;
          handed_over_at: string;
          handed_over_by: string;
          handed_to: string;
          id: string;
          note: string | null;
          organization_id: string;
          school_id: string;
        };
        Insert: {
          amount: number;
          cashier_session_id: string;
          handed_over_at?: string;
          handed_over_by?: string;
          handed_to: string;
          id?: string;
          note?: string | null;
          organization_id: string;
          school_id: string;
        };
        Update: {
          amount?: number;
          cashier_session_id?: string;
          handed_over_at?: string;
          handed_over_by?: string;
          handed_to?: string;
          id?: string;
          note?: string | null;
          organization_id?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cash_handovers_cashier_session_id_organization_id_school_i_fkey";
            columns: ["cashier_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "cashier_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      cashier_sessions: {
        Row: {
          cashier_user_id: string;
          close_note: string | null;
          closed_at: string | null;
          counted_cash: number | null;
          created_at: string;
          expected_cash: number | null;
          id: string;
          opened_at: string;
          opening_cash: number;
          organization_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["cashier_session_status"];
          variance: number | null;
        };
        Insert: {
          cashier_user_id: string;
          close_note?: string | null;
          closed_at?: string | null;
          counted_cash?: number | null;
          created_at?: string;
          expected_cash?: number | null;
          id?: string;
          opened_at?: string;
          opening_cash?: number;
          organization_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id: string;
          status?: Database["public"]["Enums"]["cashier_session_status"];
          variance?: number | null;
        };
        Update: {
          cashier_user_id?: string;
          close_note?: string | null;
          closed_at?: string | null;
          counted_cash?: number | null;
          created_at?: string;
          expected_cash?: number | null;
          id?: string;
          opened_at?: string;
          opening_cash?: number;
          organization_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["cashier_session_status"];
          variance?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "cashier_sessions_school_id_organization_id_fkey";
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
      curriculum_items: {
        Row: {
          academic_period_id: string | null;
          class_arm_id: string | null;
          class_level_id: string;
          completed_on: string | null;
          created_at: string;
          created_by: string;
          id: string;
          learning_objectives: string | null;
          organization_id: string;
          planned_end: string;
          planned_start: string;
          school_id: string;
          sequence: number;
          session_id: string;
          status: Database["public"]["Enums"]["curriculum_item_status"];
          subject_id: string;
          teaching_assignment_id: string;
          title: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          academic_period_id?: string | null;
          class_arm_id?: string | null;
          class_level_id: string;
          completed_on?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          learning_objectives?: string | null;
          organization_id: string;
          planned_end: string;
          planned_start: string;
          school_id: string;
          sequence: number;
          session_id: string;
          status?: Database["public"]["Enums"]["curriculum_item_status"];
          subject_id: string;
          teaching_assignment_id: string;
          title: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          academic_period_id?: string | null;
          class_arm_id?: string | null;
          class_level_id?: string;
          completed_on?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          learning_objectives?: string | null;
          organization_id?: string;
          planned_end?: string;
          planned_start?: string;
          school_id?: string;
          sequence?: number;
          session_id?: string;
          status?: Database["public"]["Enums"]["curriculum_item_status"];
          subject_id?: string;
          teaching_assignment_id?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curriculum_items_academic_period_id_session_id_organizatio_fkey";
            columns: [
              "academic_period_id",
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
            foreignKeyName: "curriculum_items_class_arm_id_organization_id_school_id_fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "curriculum_items_class_level_id_organization_id_school_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "curriculum_items_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "curriculum_items_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "curriculum_items_subject_id_organization_id_school_id_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "curriculum_items_teaching_assignment_id_organization_id_sc_fkey";
            columns: ["teaching_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "teaching_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
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
      entrance_assessment_attempts: {
        Row: {
          application_id: string;
          assessor_notes: string | null;
          attempt_number: number;
          completed_at: string | null;
          created_at: string;
          created_by: string;
          id: string;
          maximum_score: number | null;
          organization_id: string;
          scheduled_at: string;
          school_id: string;
          score: number | null;
          status: Database["public"]["Enums"]["assessment_attempt_status"];
        };
        Insert: {
          application_id: string;
          assessor_notes?: string | null;
          attempt_number: number;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          maximum_score?: number | null;
          organization_id: string;
          scheduled_at: string;
          school_id: string;
          score?: number | null;
          status?: Database["public"]["Enums"]["assessment_attempt_status"];
        };
        Update: {
          application_id?: string;
          assessor_notes?: string | null;
          attempt_number?: number;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          maximum_score?: number | null;
          organization_id?: string;
          scheduled_at?: string;
          school_id?: string;
          score?: number | null;
          status?: Database["public"]["Enums"]["assessment_attempt_status"];
        };
        Relationships: [
          {
            foreignKeyName: "entrance_assessment_attempts_application_id_organization_i_fkey";
            columns: ["application_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "admission_applications";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      expense_categories: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["finance_record_status"];
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
        };
        Relationships: [
          {
            foreignKeyName: "expense_categories_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      expenses: {
        Row: {
          academic_period_id: string | null;
          academic_session_id: string | null;
          approved_amount: number | null;
          approved_at: string | null;
          approved_by: string | null;
          completed_at: string | null;
          created_at: string;
          currency_code: string;
          decision_note: string | null;
          description: string;
          document_id: string | null;
          expense_category_id: string;
          expense_date: string;
          id: string;
          kind: Database["public"]["Enums"]["expense_kind"];
          organization_id: string;
          paid_at: string | null;
          requested_amount: number;
          requested_by: string;
          school_id: string;
          status: Database["public"]["Enums"]["expense_status"];
        };
        Insert: {
          academic_period_id?: string | null;
          academic_session_id?: string | null;
          approved_amount?: number | null;
          approved_at?: string | null;
          approved_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          currency_code?: string;
          decision_note?: string | null;
          description: string;
          document_id?: string | null;
          expense_category_id: string;
          expense_date: string;
          id?: string;
          kind?: Database["public"]["Enums"]["expense_kind"];
          organization_id: string;
          paid_at?: string | null;
          requested_amount: number;
          requested_by?: string;
          school_id: string;
          status?: Database["public"]["Enums"]["expense_status"];
        };
        Update: {
          academic_period_id?: string | null;
          academic_session_id?: string | null;
          approved_amount?: number | null;
          approved_at?: string | null;
          approved_by?: string | null;
          completed_at?: string | null;
          created_at?: string;
          currency_code?: string;
          decision_note?: string | null;
          description?: string;
          document_id?: string | null;
          expense_category_id?: string;
          expense_date?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["expense_kind"];
          organization_id?: string;
          paid_at?: string | null;
          requested_amount?: number;
          requested_by?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["expense_status"];
        };
        Relationships: [
          {
            foreignKeyName: "expenses_academic_period_id_organization_id_school_id_fkey";
            columns: ["academic_period_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_periods";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "expenses_academic_session_id_organization_id_school_id_fkey";
            columns: ["academic_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "expenses_document_id_organization_id_school_id_fkey";
            columns: ["document_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "expenses_expense_category_id_organization_id_school_id_fkey";
            columns: ["expense_category_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "expense_categories";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "expenses_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      fee_categories: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          description: string | null;
          frequency: Database["public"]["Enums"]["fee_frequency"];
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["finance_record_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          frequency?: Database["public"]["Enums"]["fee_frequency"];
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          frequency?: Database["public"]["Enums"]["fee_frequency"];
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fee_categories_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      fee_structure_items: {
        Row: {
          amount: number;
          created_at: string;
          created_by: string;
          due_date: string | null;
          fee_category_id: string;
          fee_structure_id: string;
          id: string;
          incentive_amount: number;
          installment_sequence: number;
          organization_id: string;
          penalty_amount: number;
          school_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          created_by?: string;
          due_date?: string | null;
          fee_category_id: string;
          fee_structure_id: string;
          id?: string;
          incentive_amount?: number;
          installment_sequence?: number;
          organization_id: string;
          penalty_amount?: number;
          school_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          created_by?: string;
          due_date?: string | null;
          fee_category_id?: string;
          fee_structure_id?: string;
          id?: string;
          incentive_amount?: number;
          installment_sequence?: number;
          organization_id?: string;
          penalty_amount?: number;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fee_structure_items_fee_category_id_organization_id_school_fkey";
            columns: ["fee_category_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "fee_categories";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "fee_structure_items_fee_structure_id_organization_id_schoo_fkey";
            columns: ["fee_structure_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "fee_structures";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      fee_structures: {
        Row: {
          activated_at: string | null;
          class_level_id: string | null;
          created_at: string;
          created_by: string;
          currency_code: string;
          effective_from: string;
          effective_to: string | null;
          id: string;
          name: string;
          organization_id: string;
          period_id: string | null;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["finance_record_status"];
          student_category_id: string | null;
          updated_at: string;
          updated_by: string;
          version: number;
        };
        Insert: {
          activated_at?: string | null;
          class_level_id?: string | null;
          created_at?: string;
          created_by?: string;
          currency_code?: string;
          effective_from: string;
          effective_to?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          period_id?: string | null;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
          student_category_id?: string | null;
          updated_at?: string;
          updated_by?: string;
          version?: number;
        };
        Update: {
          activated_at?: string | null;
          class_level_id?: string | null;
          created_at?: string;
          created_by?: string;
          currency_code?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          period_id?: string | null;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
          student_category_id?: string | null;
          updated_at?: string;
          updated_by?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "fee_structures_class_level_id_organization_id_school_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "fee_structures_period_id_organization_id_school_id_fkey";
            columns: ["period_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_periods";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "fee_structures_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "fee_structures_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "fee_structures_student_category_id_organization_id_school__fkey";
            columns: ["student_category_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_categories";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      finance_settings: {
        Row: {
          allow_cross_student_allocation: boolean;
          billing_locked_through: string | null;
          created_at: string;
          created_by: string;
          currency_code: string;
          organization_id: string;
          payment_recorder_may_verify: boolean;
          receipt_next_number: number;
          receipt_prefix: string;
          require_payment_verification: boolean;
          school_id: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          allow_cross_student_allocation?: boolean;
          billing_locked_through?: string | null;
          created_at?: string;
          created_by?: string;
          currency_code?: string;
          organization_id: string;
          payment_recorder_may_verify?: boolean;
          receipt_next_number?: number;
          receipt_prefix?: string;
          require_payment_verification?: boolean;
          school_id: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          allow_cross_student_allocation?: boolean;
          billing_locked_through?: string | null;
          created_at?: string;
          created_by?: string;
          currency_code?: string;
          organization_id?: string;
          payment_recorder_may_verify?: boolean;
          receipt_next_number?: number;
          receipt_prefix?: string;
          require_payment_verification?: boolean;
          school_id?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "finance_settings_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: true;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      grade_bands: {
        Row: {
          created_at: string;
          created_by: string;
          grade: string;
          id: string;
          is_pass: boolean;
          maximum_percent: number;
          minimum_percent: number;
          organization_id: string;
          remark: string;
          scheme_id: string;
          school_id: string;
          sequence: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          grade: string;
          id?: string;
          is_pass: boolean;
          maximum_percent: number;
          minimum_percent: number;
          organization_id: string;
          remark: string;
          scheme_id: string;
          school_id: string;
          sequence: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          grade?: string;
          id?: string;
          is_pass?: boolean;
          maximum_percent?: number;
          minimum_percent?: number;
          organization_id?: string;
          remark?: string;
          scheme_id?: string;
          school_id?: string;
          sequence?: number;
        };
        Relationships: [
          {
            foreignKeyName: "grade_bands_scheme_id_organization_id_school_id_fkey";
            columns: ["scheme_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "assessment_schemes";
            referencedColumns: ["id", "organization_id", "school_id"];
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
      homework_assignments: {
        Row: {
          academic_period_id: string | null;
          assigned_on: string;
          class_arm_id: string | null;
          class_level_id: string;
          created_at: string;
          created_by: string;
          curriculum_item_id: string | null;
          due_on: string;
          id: string;
          instructions: string;
          lesson_delivery_id: string | null;
          organization_id: string;
          published_at: string | null;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["homework_status"];
          subject_id: string;
          teaching_assignment_id: string;
          title: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          academic_period_id?: string | null;
          assigned_on: string;
          class_arm_id?: string | null;
          class_level_id: string;
          created_at?: string;
          created_by?: string;
          curriculum_item_id?: string | null;
          due_on: string;
          id?: string;
          instructions: string;
          lesson_delivery_id?: string | null;
          organization_id: string;
          published_at?: string | null;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["homework_status"];
          subject_id: string;
          teaching_assignment_id: string;
          title: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          academic_period_id?: string | null;
          assigned_on?: string;
          class_arm_id?: string | null;
          class_level_id?: string;
          created_at?: string;
          created_by?: string;
          curriculum_item_id?: string | null;
          due_on?: string;
          id?: string;
          instructions?: string;
          lesson_delivery_id?: string | null;
          organization_id?: string;
          published_at?: string | null;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["homework_status"];
          subject_id?: string;
          teaching_assignment_id?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homework_assignments_academic_period_id_session_id_organiz_fkey";
            columns: [
              "academic_period_id",
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
            foreignKeyName: "homework_assignments_class_arm_id_organization_id_school_i_fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "homework_assignments_class_level_id_organization_id_school_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "homework_assignments_curriculum_item_id_organization_id_sc_fkey";
            columns: ["curriculum_item_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_items";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "homework_assignments_lesson_delivery_id_organization_id_sc_fkey";
            columns: ["lesson_delivery_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "lesson_deliveries";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "homework_assignments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "homework_assignments_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "homework_assignments_subject_id_organization_id_school_id_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "homework_assignments_teaching_assignment_id_organization_i_fkey";
            columns: ["teaching_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "teaching_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
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
      income_categories: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["finance_record_status"];
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
        };
        Relationships: [
          {
            foreignKeyName: "income_categories_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
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
      lesson_deliveries: {
        Row: {
          academic_period_id: string | null;
          class_arm_id: string | null;
          class_level_id: string;
          classwork: string | null;
          coverage_notes: string;
          created_at: string;
          curriculum_item_id: string | null;
          delivered_on: string;
          homework: string | null;
          id: string;
          lesson_plan_id: string | null;
          organization_id: string;
          recorded_by: string;
          reflection: string | null;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["lesson_delivery_status"];
          subject_id: string;
          teaching_assignment_id: string;
          topic: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          academic_period_id?: string | null;
          class_arm_id?: string | null;
          class_level_id: string;
          classwork?: string | null;
          coverage_notes: string;
          created_at?: string;
          curriculum_item_id?: string | null;
          delivered_on: string;
          homework?: string | null;
          id?: string;
          lesson_plan_id?: string | null;
          organization_id: string;
          recorded_by?: string;
          reflection?: string | null;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["lesson_delivery_status"];
          subject_id: string;
          teaching_assignment_id: string;
          topic: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          academic_period_id?: string | null;
          class_arm_id?: string | null;
          class_level_id?: string;
          classwork?: string | null;
          coverage_notes?: string;
          created_at?: string;
          curriculum_item_id?: string | null;
          delivered_on?: string;
          homework?: string | null;
          id?: string;
          lesson_plan_id?: string | null;
          organization_id?: string;
          recorded_by?: string;
          reflection?: string | null;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["lesson_delivery_status"];
          subject_id?: string;
          teaching_assignment_id?: string;
          topic?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_deliveries_academic_period_id_session_id_organizati_fkey";
            columns: [
              "academic_period_id",
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
            foreignKeyName: "lesson_deliveries_class_arm_id_organization_id_school_id_fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_deliveries_class_level_id_organization_id_school_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_deliveries_curriculum_item_id_organization_id_schoo_fkey";
            columns: ["curriculum_item_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_items";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_deliveries_lesson_plan_id_organization_id_school_id_fkey";
            columns: ["lesson_plan_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "lesson_plans";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_deliveries_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "lesson_deliveries_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_deliveries_subject_id_organization_id_school_id_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_deliveries_teaching_assignment_id_organization_id_s_fkey";
            columns: ["teaching_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "teaching_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      lesson_plans: {
        Row: {
          academic_period_id: string | null;
          class_arm_id: string | null;
          class_level_id: string;
          content_outline: string;
          created_at: string;
          created_by: string;
          curriculum_item_id: string | null;
          id: string;
          lesson_date: string;
          objectives: string;
          organization_id: string;
          review_comment: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["lesson_plan_status"];
          subject_id: string;
          submitted_at: string | null;
          teaching_assignment_id: string;
          teaching_resources: string | null;
          topic: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          academic_period_id?: string | null;
          class_arm_id?: string | null;
          class_level_id: string;
          content_outline: string;
          created_at?: string;
          created_by?: string;
          curriculum_item_id?: string | null;
          id?: string;
          lesson_date: string;
          objectives: string;
          organization_id: string;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["lesson_plan_status"];
          subject_id: string;
          submitted_at?: string | null;
          teaching_assignment_id: string;
          teaching_resources?: string | null;
          topic: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          academic_period_id?: string | null;
          class_arm_id?: string | null;
          class_level_id?: string;
          content_outline?: string;
          created_at?: string;
          created_by?: string;
          curriculum_item_id?: string | null;
          id?: string;
          lesson_date?: string;
          objectives?: string;
          organization_id?: string;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["lesson_plan_status"];
          subject_id?: string;
          submitted_at?: string | null;
          teaching_assignment_id?: string;
          teaching_resources?: string | null;
          topic?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_plans_academic_period_id_session_id_organization_id_fkey";
            columns: [
              "academic_period_id",
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
            foreignKeyName: "lesson_plans_class_arm_id_organization_id_school_id_fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_plans_class_level_id_organization_id_school_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_plans_curriculum_item_id_organization_id_school_id_fkey";
            columns: ["curriculum_item_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_items";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_plans_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "lesson_plans_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_plans_subject_id_organization_id_school_id_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "lesson_plans_teaching_assignment_id_organization_id_school_fkey";
            columns: ["teaching_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "teaching_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
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
      other_income: {
        Row: {
          amount: number;
          created_at: string;
          currency_code: string;
          id: string;
          idempotency_key: string;
          income_category_id: string;
          notes: string | null;
          organization_id: string;
          payer_name: string | null;
          received_at: string;
          recorded_by: string;
          reference: string | null;
          school_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency_code?: string;
          id?: string;
          idempotency_key: string;
          income_category_id: string;
          notes?: string | null;
          organization_id: string;
          payer_name?: string | null;
          received_at: string;
          recorded_by?: string;
          reference?: string | null;
          school_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency_code?: string;
          id?: string;
          idempotency_key?: string;
          income_category_id?: string;
          notes?: string | null;
          organization_id?: string;
          payer_name?: string | null;
          received_at?: string;
          recorded_by?: string;
          reference?: string | null;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "other_income_income_category_id_organization_id_school_id_fkey";
            columns: ["income_category_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "income_categories";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "other_income_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      payment_allocation_reversals: {
        Row: {
          amount: number;
          id: string;
          organization_id: string;
          payment_allocation_id: string;
          payment_reversal_id: string;
          reason: string;
          reversed_at: string;
          reversed_by: string;
          school_id: string;
        };
        Insert: {
          amount: number;
          id?: string;
          organization_id: string;
          payment_allocation_id: string;
          payment_reversal_id: string;
          reason: string;
          reversed_at?: string;
          reversed_by?: string;
          school_id: string;
        };
        Update: {
          amount?: number;
          id?: string;
          organization_id?: string;
          payment_allocation_id?: string;
          payment_reversal_id?: string;
          reason?: string;
          reversed_at?: string;
          reversed_by?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_allocation_reversals_payment_allocation_id_organiz_fkey";
            columns: ["payment_allocation_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "payment_allocations";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "payment_allocation_reversals_payment_reversal_id_organizat_fkey";
            columns: ["payment_reversal_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "payment_reversals";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      payment_allocations: {
        Row: {
          allocated_at: string;
          allocated_by: string;
          amount: number;
          id: string;
          organization_id: string;
          payment_id: string;
          school_id: string;
          student_charge_id: string;
        };
        Insert: {
          allocated_at?: string;
          allocated_by?: string;
          amount: number;
          id?: string;
          organization_id: string;
          payment_id: string;
          school_id: string;
          student_charge_id: string;
        };
        Update: {
          allocated_at?: string;
          allocated_by?: string;
          amount?: number;
          id?: string;
          organization_id?: string;
          payment_id?: string;
          school_id?: string;
          student_charge_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_allocations_payment_id_organization_id_school_id_fkey";
            columns: ["payment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "payment_allocations_student_charge_id_organization_id_scho_fkey";
            columns: ["student_charge_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_charge_balances";
            referencedColumns: [
              "student_charge_id",
              "organization_id",
              "school_id",
            ];
          },
          {
            foreignKeyName: "payment_allocations_student_charge_id_organization_id_scho_fkey";
            columns: ["student_charge_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_charges";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      payment_reversals: {
        Row: {
          amount: number;
          id: string;
          organization_id: string;
          payment_id: string;
          reason: string;
          reversed_at: string;
          reversed_by: string;
          school_id: string;
        };
        Insert: {
          amount: number;
          id?: string;
          organization_id: string;
          payment_id: string;
          reason: string;
          reversed_at?: string;
          reversed_by?: string;
          school_id: string;
        };
        Update: {
          amount?: number;
          id?: string;
          organization_id?: string;
          payment_id?: string;
          reason?: string;
          reversed_at?: string;
          reversed_by?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_reversals_payment_id_organization_id_school_id_fkey";
            columns: ["payment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      payments: {
        Row: {
          academic_period_id: string | null;
          academic_session_id: string | null;
          amount: number;
          cashier_session_id: string | null;
          created_at: string;
          currency_code: string;
          evidence_document_id: string | null;
          id: string;
          idempotency_key: string;
          method: Database["public"]["Enums"]["payment_method"];
          notes: string | null;
          organization_id: string;
          paid_at: string;
          payer_name: string | null;
          payer_person_id: string | null;
          received_by: string | null;
          recorded_by: string;
          reference: string | null;
          school_id: string;
          status: Database["public"]["Enums"]["payment_status"];
          student_id: string | null;
          verification_note: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          academic_period_id?: string | null;
          academic_session_id?: string | null;
          amount: number;
          cashier_session_id?: string | null;
          created_at?: string;
          currency_code: string;
          evidence_document_id?: string | null;
          id?: string;
          idempotency_key: string;
          method: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          organization_id: string;
          paid_at: string;
          payer_name?: string | null;
          payer_person_id?: string | null;
          received_by?: string | null;
          recorded_by?: string;
          reference?: string | null;
          school_id: string;
          status?: Database["public"]["Enums"]["payment_status"];
          student_id?: string | null;
          verification_note?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          academic_period_id?: string | null;
          academic_session_id?: string | null;
          amount?: number;
          cashier_session_id?: string | null;
          created_at?: string;
          currency_code?: string;
          evidence_document_id?: string | null;
          id?: string;
          idempotency_key?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          notes?: string | null;
          organization_id?: string;
          paid_at?: string;
          payer_name?: string | null;
          payer_person_id?: string | null;
          received_by?: string | null;
          recorded_by?: string;
          reference?: string | null;
          school_id?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          student_id?: string | null;
          verification_note?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_academic_period_id_organization_id_school_id_fkey";
            columns: ["academic_period_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_periods";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "payments_academic_session_id_organization_id_school_id_fkey";
            columns: ["academic_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "payments_cashier_session_id_organization_id_school_id_fkey";
            columns: ["cashier_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "cashier_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "payments_evidence_document_id_organization_id_school_id_fkey";
            columns: ["evidence_document_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "payments_payer_person_id_fkey";
            columns: ["payer_person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "payments_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
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
      receipts: {
        Row: {
          allocation_snapshot: Json;
          amount: number;
          currency_code: string;
          id: string;
          issued_at: string;
          issued_by: string;
          organization_id: string;
          payer_name_snapshot: string | null;
          payment_id: string;
          receipt_number: string;
          school_id: string;
          school_name_snapshot: string;
          student_snapshot: Json | null;
        };
        Insert: {
          allocation_snapshot: Json;
          amount: number;
          currency_code: string;
          id?: string;
          issued_at?: string;
          issued_by?: string;
          organization_id: string;
          payer_name_snapshot?: string | null;
          payment_id: string;
          receipt_number: string;
          school_id: string;
          school_name_snapshot: string;
          student_snapshot?: Json | null;
        };
        Update: {
          allocation_snapshot?: Json;
          amount?: number;
          currency_code?: string;
          id?: string;
          issued_at?: string;
          issued_by?: string;
          organization_id?: string;
          payer_name_snapshot?: string | null;
          payment_id?: string;
          receipt_number?: string;
          school_id?: string;
          school_name_snapshot?: string;
          student_snapshot?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "receipts_payment_id_organization_id_school_id_fkey";
            columns: ["payment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "receipts_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      reconciliation_payments: {
        Row: {
          created_at: string;
          organization_id: string;
          payment_id: string;
          reconciliation_id: string;
          school_id: string;
        };
        Insert: {
          created_at?: string;
          organization_id: string;
          payment_id: string;
          reconciliation_id: string;
          school_id: string;
        };
        Update: {
          created_at?: string;
          organization_id?: string;
          payment_id?: string;
          reconciliation_id?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reconciliation_payments_payment_id_organization_id_school__fkey";
            columns: ["payment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "reconciliation_payments_reconciliation_id_organization_id__fkey";
            columns: ["reconciliation_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "reconciliation_records";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      reconciliation_records: {
        Row: {
          actual_amount: number;
          created_at: string;
          created_by: string;
          expected_amount: number;
          id: string;
          method: Database["public"]["Enums"]["payment_method"];
          note: string | null;
          organization_id: string;
          reconciled_at: string | null;
          reconciled_by: string | null;
          reference: string | null;
          school_id: string;
          statement_date: string;
          status: Database["public"]["Enums"]["reconciliation_status"];
          variance: number | null;
        };
        Insert: {
          actual_amount: number;
          created_at?: string;
          created_by?: string;
          expected_amount: number;
          id?: string;
          method: Database["public"]["Enums"]["payment_method"];
          note?: string | null;
          organization_id: string;
          reconciled_at?: string | null;
          reconciled_by?: string | null;
          reference?: string | null;
          school_id: string;
          statement_date: string;
          status?: Database["public"]["Enums"]["reconciliation_status"];
          variance?: number | null;
        };
        Update: {
          actual_amount?: number;
          created_at?: string;
          created_by?: string;
          expected_amount?: number;
          id?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          note?: string | null;
          organization_id?: string;
          reconciled_at?: string | null;
          reconciled_by?: string | null;
          reference?: string | null;
          school_id?: string;
          statement_date?: string;
          status?: Database["public"]["Enums"]["reconciliation_status"];
          variance?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "reconciliation_records_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      result_batches: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          class_arm_id: string | null;
          class_level_id: string;
          correction_of_id: string | null;
          correction_reason: string | null;
          created_at: string;
          created_by: string;
          id: string;
          organization_id: string;
          period_id: string;
          published_at: string | null;
          published_by: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          scheme_id: string;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["result_batch_status"];
          subject_id: string;
          submitted_at: string | null;
          submitted_by: string | null;
          teaching_assignment_id: string | null;
          updated_at: string;
          updated_by: string;
          version: number;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          class_arm_id?: string | null;
          class_level_id: string;
          correction_of_id?: string | null;
          correction_reason?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          organization_id: string;
          period_id: string;
          published_at?: string | null;
          published_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          scheme_id: string;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["result_batch_status"];
          subject_id: string;
          submitted_at?: string | null;
          submitted_by?: string | null;
          teaching_assignment_id?: string | null;
          updated_at?: string;
          updated_by?: string;
          version?: number;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          class_arm_id?: string | null;
          class_level_id?: string;
          correction_of_id?: string | null;
          correction_reason?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          organization_id?: string;
          period_id?: string;
          published_at?: string | null;
          published_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          scheme_id?: string;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["result_batch_status"];
          subject_id?: string;
          submitted_at?: string | null;
          submitted_by?: string | null;
          teaching_assignment_id?: string | null;
          updated_at?: string;
          updated_by?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "result_batches_class_arm_id_organization_id_school_id_fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "result_batches_class_level_id_organization_id_school_id_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "result_batches_correction_of_id_fkey";
            columns: ["correction_of_id"];
            isOneToOne: false;
            referencedRelation: "result_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "result_batches_period_id_session_id_organization_id_school_fkey";
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
            foreignKeyName: "result_batches_scheme_id_organization_id_school_id_fkey";
            columns: ["scheme_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "assessment_schemes";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "result_batches_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "result_batches_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "result_batches_subject_id_organization_id_school_id_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "result_batches_teaching_assignment_id_organization_id_scho_fkey";
            columns: ["teaching_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "teaching_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      result_publications: {
        Row: {
          batch_id: string;
          id: string;
          organization_id: string;
          published_at: string;
          published_by: string;
          school_id: string;
          snapshot: Json;
          version: number;
        };
        Insert: {
          batch_id: string;
          id?: string;
          organization_id: string;
          published_at?: string;
          published_by: string;
          school_id: string;
          snapshot: Json;
          version: number;
        };
        Update: {
          batch_id?: string;
          id?: string;
          organization_id?: string;
          published_at?: string;
          published_by?: string;
          school_id?: string;
          snapshot?: Json;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "result_publications_batch_id_organization_id_school_id_fkey";
            columns: ["batch_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "result_batches";
            referencedColumns: ["id", "organization_id", "school_id"];
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
      school_calendar_exceptions: {
        Row: {
          calendar_date: string;
          created_at: string;
          created_by: string;
          id: string;
          is_teaching_day: boolean;
          label: string;
          organization_id: string;
          school_id: string;
          session_id: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          calendar_date: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_teaching_day: boolean;
          label: string;
          organization_id: string;
          school_id: string;
          session_id: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          calendar_date?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_teaching_day?: boolean;
          label?: string;
          organization_id?: string;
          school_id?: string;
          session_id?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_calendar_exceptions_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "school_calendar_exceptions_session_id_organization_id_scho_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
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
      staff_attendance_days: {
        Row: {
          attendance_date: string;
          created_at: string;
          effective_clock_in_at: string | null;
          effective_clock_out_at: string | null;
          employment_id: string;
          id: string;
          organization_id: string;
          policy_ends_at: string;
          policy_grace_minutes: number;
          policy_id: string;
          policy_starts_at: string;
          position_id: string;
          school_id: string;
          staff_assignment_id: string;
          staff_profile_id: string;
          status: Database["public"]["Enums"]["staff_attendance_day_status"];
          updated_at: string;
        };
        Insert: {
          attendance_date: string;
          created_at?: string;
          effective_clock_in_at?: string | null;
          effective_clock_out_at?: string | null;
          employment_id: string;
          id?: string;
          organization_id: string;
          policy_ends_at: string;
          policy_grace_minutes: number;
          policy_id: string;
          policy_starts_at: string;
          position_id: string;
          school_id: string;
          staff_assignment_id: string;
          staff_profile_id: string;
          status?: Database["public"]["Enums"]["staff_attendance_day_status"];
          updated_at?: string;
        };
        Update: {
          attendance_date?: string;
          created_at?: string;
          effective_clock_in_at?: string | null;
          effective_clock_out_at?: string | null;
          employment_id?: string;
          id?: string;
          organization_id?: string;
          policy_ends_at?: string;
          policy_grace_minutes?: number;
          policy_id?: string;
          policy_starts_at?: string;
          position_id?: string;
          school_id?: string;
          staff_assignment_id?: string;
          staff_profile_id?: string;
          status?: Database["public"]["Enums"]["staff_attendance_day_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_attendance_days_employment_id_staff_profile_id_organ_fkey";
            columns: ["employment_id", "staff_profile_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "employments";
            referencedColumns: ["id", "staff_profile_id", "organization_id"];
          },
          {
            foreignKeyName: "staff_attendance_days_policy_id_organization_id_school_id_fkey";
            columns: ["policy_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_attendance_policies";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_attendance_days_position_id_organization_id_school_i_fkey";
            columns: ["position_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_attendance_days_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "staff_attendance_days_staff_assignment_id_organization_id__fkey";
            columns: ["staff_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      staff_attendance_exceptions: {
        Row: {
          action_task_id: string | null;
          attendance_date: string;
          created_at: string;
          created_by: string;
          id: string;
          kind: Database["public"]["Enums"]["staff_attendance_exception_kind"];
          organization_id: string;
          resolved_at: string | null;
          school_id: string;
          staff_assignment_id: string;
          status: Database["public"]["Enums"]["staff_attendance_exception_status"];
          updated_at: string;
        };
        Insert: {
          action_task_id?: string | null;
          attendance_date: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          kind: Database["public"]["Enums"]["staff_attendance_exception_kind"];
          organization_id: string;
          resolved_at?: string | null;
          school_id: string;
          staff_assignment_id: string;
          status?: Database["public"]["Enums"]["staff_attendance_exception_status"];
          updated_at?: string;
        };
        Update: {
          action_task_id?: string | null;
          attendance_date?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["staff_attendance_exception_kind"];
          organization_id?: string;
          resolved_at?: string | null;
          school_id?: string;
          staff_assignment_id?: string;
          status?: Database["public"]["Enums"]["staff_attendance_exception_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_attendance_exceptions_action_task_id_organization_id_fkey";
            columns: ["action_task_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "action_tasks";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_attendance_exceptions_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "staff_attendance_exceptions_staff_assignment_id_organizati_fkey";
            columns: ["staff_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      staff_attendance_policies: {
        Row: {
          created_at: string;
          created_by: string;
          effective_from: string;
          effective_to: string | null;
          ends_at: string;
          grace_minutes: number;
          id: string;
          name: string;
          organization_id: string;
          position_id: string | null;
          school_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
          working_days: number[];
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          effective_from: string;
          effective_to?: string | null;
          ends_at: string;
          grace_minutes?: number;
          id?: string;
          name: string;
          organization_id: string;
          position_id?: string | null;
          school_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
          working_days?: number[];
        };
        Update: {
          created_at?: string;
          created_by?: string;
          effective_from?: string;
          effective_to?: string | null;
          ends_at?: string;
          grace_minutes?: number;
          id?: string;
          name?: string;
          organization_id?: string;
          position_id?: string | null;
          school_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
          working_days?: number[];
        };
        Relationships: [
          {
            foreignKeyName: "staff_attendance_policies_position_id_organization_id_scho_fkey";
            columns: ["position_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_attendance_policies_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      staff_clock_corrections: {
        Row: {
          attendance_day_id: string;
          clock_event_id: string;
          corrected_at: string;
          corrected_by: string;
          corrected_occurred_at: string;
          id: string;
          organization_id: string;
          previous_occurred_at: string;
          reason: string;
          school_id: string;
        };
        Insert: {
          attendance_day_id: string;
          clock_event_id: string;
          corrected_at?: string;
          corrected_by: string;
          corrected_occurred_at: string;
          id?: string;
          organization_id: string;
          previous_occurred_at: string;
          reason: string;
          school_id: string;
        };
        Update: {
          attendance_day_id?: string;
          clock_event_id?: string;
          corrected_at?: string;
          corrected_by?: string;
          corrected_occurred_at?: string;
          id?: string;
          organization_id?: string;
          previous_occurred_at?: string;
          reason?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_clock_corrections_attendance_day_id_organization_id__fkey";
            columns: ["attendance_day_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_attendance_days";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_clock_corrections_clock_event_id_organization_id_sch_fkey";
            columns: ["clock_event_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_clock_events";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      staff_clock_events: {
        Row: {
          attendance_day_id: string;
          created_at: string;
          event_type: Database["public"]["Enums"]["staff_clock_event_type"];
          id: string;
          idempotency_key: string;
          note: string | null;
          occurred_at: string;
          organization_id: string;
          recorded_by: string;
          request_fingerprint: string;
          school_id: string;
          source: Database["public"]["Enums"]["staff_clock_source"];
          staff_assignment_id: string;
        };
        Insert: {
          attendance_day_id: string;
          created_at?: string;
          event_type: Database["public"]["Enums"]["staff_clock_event_type"];
          id?: string;
          idempotency_key: string;
          note?: string | null;
          occurred_at: string;
          organization_id: string;
          recorded_by: string;
          request_fingerprint: string;
          school_id: string;
          source: Database["public"]["Enums"]["staff_clock_source"];
          staff_assignment_id: string;
        };
        Update: {
          attendance_day_id?: string;
          created_at?: string;
          event_type?: Database["public"]["Enums"]["staff_clock_event_type"];
          id?: string;
          idempotency_key?: string;
          note?: string | null;
          occurred_at?: string;
          organization_id?: string;
          recorded_by?: string;
          request_fingerprint?: string;
          school_id?: string;
          source?: Database["public"]["Enums"]["staff_clock_source"];
          staff_assignment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_clock_events_attendance_day_id_organization_id_schoo_fkey";
            columns: ["attendance_day_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_attendance_days";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_clock_events_staff_assignment_id_organization_id_sch_fkey";
            columns: ["staff_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      staff_leave_types: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          id: string;
          is_paid: boolean;
          name: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_paid?: boolean;
          name: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_paid?: boolean;
          name?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_leave_types_school_id_organization_id_fkey";
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
      staff_time_requests: {
        Row: {
          approval_request_id: string | null;
          created_at: string;
          decided_at: string | null;
          ends_at: string;
          id: string;
          kind: Database["public"]["Enums"]["staff_time_request_kind"];
          leave_type_id: string | null;
          organization_id: string;
          reason: string;
          requested_by: string;
          school_id: string;
          staff_assignment_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["staff_time_request_status"];
          updated_at: string;
        };
        Insert: {
          approval_request_id?: string | null;
          created_at?: string;
          decided_at?: string | null;
          ends_at: string;
          id?: string;
          kind: Database["public"]["Enums"]["staff_time_request_kind"];
          leave_type_id?: string | null;
          organization_id: string;
          reason: string;
          requested_by?: string;
          school_id: string;
          staff_assignment_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["staff_time_request_status"];
          updated_at?: string;
        };
        Update: {
          approval_request_id?: string | null;
          created_at?: string;
          decided_at?: string | null;
          ends_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["staff_time_request_kind"];
          leave_type_id?: string | null;
          organization_id?: string;
          reason?: string;
          requested_by?: string;
          school_id?: string;
          staff_assignment_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["staff_time_request_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_time_requests_approval_request_id_fkey";
            columns: ["approval_request_id"];
            isOneToOne: true;
            referencedRelation: "approval_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_time_requests_leave_type_id_organization_id_school_i_fkey";
            columns: ["leave_type_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_leave_types";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "staff_time_requests_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "staff_time_requests_staff_assignment_id_organization_id_sc_fkey";
            columns: ["staff_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      student_attendance_corrections: {
        Row: {
          corrected_at: string;
          corrected_by: string;
          entry_id: string;
          id: string;
          new_status: Database["public"]["Enums"]["attendance_status"];
          organization_id: string;
          previous_status: Database["public"]["Enums"]["attendance_status"];
          reason: string;
          register_id: string;
          school_id: string;
          student_id: string;
        };
        Insert: {
          corrected_at?: string;
          corrected_by: string;
          entry_id: string;
          id?: string;
          new_status: Database["public"]["Enums"]["attendance_status"];
          organization_id: string;
          previous_status: Database["public"]["Enums"]["attendance_status"];
          reason: string;
          register_id: string;
          school_id: string;
          student_id: string;
        };
        Update: {
          corrected_at?: string;
          corrected_by?: string;
          entry_id?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["attendance_status"];
          organization_id?: string;
          previous_status?: Database["public"]["Enums"]["attendance_status"];
          reason?: string;
          register_id?: string;
          school_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_attendance_correction_entry_id_organization_id_sch_fkey";
            columns: ["entry_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_attendance_entries";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_attendance_correction_register_id_organization_id__fkey";
            columns: ["register_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_attendance_registers";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_attendance_corrections_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      student_attendance_entries: {
        Row: {
          class_membership_id: string;
          enrollment_id: string;
          id: string;
          note: string | null;
          organization_id: string;
          recorded_at: string;
          recorded_by: string;
          register_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
          updated_at: string;
        };
        Insert: {
          class_membership_id: string;
          enrollment_id: string;
          id?: string;
          note?: string | null;
          organization_id: string;
          recorded_at?: string;
          recorded_by: string;
          register_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
          updated_at?: string;
        };
        Update: {
          class_membership_id?: string;
          enrollment_id?: string;
          id?: string;
          note?: string | null;
          organization_id?: string;
          recorded_at?: string;
          recorded_by?: string;
          register_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          student_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_attendance_entries_class_membership_id_organizatio_fkey";
            columns: ["class_membership_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_memberships";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_attendance_entries_enrollment_id_student_id_organi_fkey";
            columns: [
              "enrollment_id",
              "student_id",
              "organization_id",
              "school_id",
            ];
            isOneToOne: false;
            referencedRelation: "student_enrollments";
            referencedColumns: [
              "id",
              "student_id",
              "organization_id",
              "school_id",
            ];
          },
          {
            foreignKeyName: "student_attendance_entries_register_id_organization_id_sch_fkey";
            columns: ["register_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_attendance_registers";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_attendance_entries_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      student_attendance_registers: {
        Row: {
          attendance_date: string;
          class_arm_id: string | null;
          class_level_id: string;
          created_at: string;
          id: string;
          idempotency_key: string;
          locks_at: string;
          organization_id: string;
          register_type: Database["public"]["Enums"]["student_attendance_register_type"];
          request_fingerprint: string;
          school_id: string;
          session_id: string;
          submitted_at: string;
          submitted_by: string;
        };
        Insert: {
          attendance_date: string;
          class_arm_id?: string | null;
          class_level_id: string;
          created_at?: string;
          id?: string;
          idempotency_key: string;
          locks_at: string;
          organization_id: string;
          register_type: Database["public"]["Enums"]["student_attendance_register_type"];
          request_fingerprint: string;
          school_id: string;
          session_id: string;
          submitted_at?: string;
          submitted_by: string;
        };
        Update: {
          attendance_date?: string;
          class_arm_id?: string | null;
          class_level_id?: string;
          created_at?: string;
          id?: string;
          idempotency_key?: string;
          locks_at?: string;
          organization_id?: string;
          register_type?: Database["public"]["Enums"]["student_attendance_register_type"];
          request_fingerprint?: string;
          school_id?: string;
          session_id?: string;
          submitted_at?: string;
          submitted_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_attendance_registers_class_arm_id_organization_id__fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_attendance_registers_class_level_id_organization_i_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_attendance_registers_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_attendance_registers_session_id_organization_id_sc_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      student_categories: {
        Row: {
          code: string;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          status: Database["public"]["Enums"]["finance_record_status"];
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          status?: Database["public"]["Enums"]["finance_record_status"];
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_categories_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      student_category_assignments: {
        Row: {
          created_at: string;
          created_by: string;
          effective_from: string;
          effective_to: string | null;
          id: string;
          organization_id: string;
          school_id: string;
          student_category_id: string;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          effective_from: string;
          effective_to?: string | null;
          id?: string;
          organization_id: string;
          school_id: string;
          student_category_id: string;
          student_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          organization_id?: string;
          school_id?: string;
          student_category_id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_category_assignments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_category_assignments_student_category_id_organizat_fkey";
            columns: ["student_category_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_categories";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_category_assignments_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      student_charge_adjustments: {
        Row: {
          amount: number;
          approved_by: string | null;
          created_at: string;
          created_by: string;
          id: string;
          kind: Database["public"]["Enums"]["charge_adjustment_kind"];
          organization_id: string;
          reason: string;
          reverses_adjustment_id: string | null;
          school_id: string;
          student_charge_id: string;
        };
        Insert: {
          amount: number;
          approved_by?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          kind: Database["public"]["Enums"]["charge_adjustment_kind"];
          organization_id: string;
          reason: string;
          reverses_adjustment_id?: string | null;
          school_id: string;
          student_charge_id: string;
        };
        Update: {
          amount?: number;
          approved_by?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["charge_adjustment_kind"];
          organization_id?: string;
          reason?: string;
          reverses_adjustment_id?: string | null;
          school_id?: string;
          student_charge_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_charge_adjustments_reverses_adjustment_id_fkey";
            columns: ["reverses_adjustment_id"];
            isOneToOne: true;
            referencedRelation: "student_charge_adjustments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_charge_adjustments_student_charge_id_organization__fkey";
            columns: ["student_charge_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_charge_balances";
            referencedColumns: [
              "student_charge_id",
              "organization_id",
              "school_id",
            ];
          },
          {
            foreignKeyName: "student_charge_adjustments_student_charge_id_organization__fkey";
            columns: ["student_charge_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_charges";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      student_charges: {
        Row: {
          class_level_id: string | null;
          created_at: string;
          created_by: string;
          currency_code: string;
          due_date: string | null;
          enrollment_id: string;
          fee_category_code_snapshot: string;
          fee_category_id: string;
          fee_category_name_snapshot: string;
          fee_structure_id: string;
          fee_structure_item_id: string;
          fee_structure_name_snapshot: string;
          fee_structure_version_snapshot: number;
          id: string;
          invoice_id: string;
          organization_id: string;
          original_amount: number;
          period_id: string | null;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["charge_status"];
          student_category_id: string | null;
          student_id: string;
        };
        Insert: {
          class_level_id?: string | null;
          created_at?: string;
          created_by?: string;
          currency_code: string;
          due_date?: string | null;
          enrollment_id: string;
          fee_category_code_snapshot: string;
          fee_category_id: string;
          fee_category_name_snapshot: string;
          fee_structure_id: string;
          fee_structure_item_id: string;
          fee_structure_name_snapshot: string;
          fee_structure_version_snapshot: number;
          id?: string;
          invoice_id: string;
          organization_id: string;
          original_amount: number;
          period_id?: string | null;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["charge_status"];
          student_category_id?: string | null;
          student_id: string;
        };
        Update: {
          class_level_id?: string | null;
          created_at?: string;
          created_by?: string;
          currency_code?: string;
          due_date?: string | null;
          enrollment_id?: string;
          fee_category_code_snapshot?: string;
          fee_category_id?: string;
          fee_category_name_snapshot?: string;
          fee_structure_id?: string;
          fee_structure_item_id?: string;
          fee_structure_name_snapshot?: string;
          fee_structure_version_snapshot?: number;
          id?: string;
          invoice_id?: string;
          organization_id?: string;
          original_amount?: number;
          period_id?: string | null;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["charge_status"];
          student_category_id?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_charges_enrollment_id_student_id_organization_id_s_fkey";
            columns: [
              "enrollment_id",
              "student_id",
              "organization_id",
              "school_id",
            ];
            isOneToOne: false;
            referencedRelation: "student_enrollments";
            referencedColumns: [
              "id",
              "student_id",
              "organization_id",
              "school_id",
            ];
          },
          {
            foreignKeyName: "student_charges_fee_category_id_organization_id_school_id_fkey";
            columns: ["fee_category_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "fee_categories";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_charges_fee_structure_id_organization_id_school_id_fkey";
            columns: ["fee_structure_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "fee_structures";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_charges_invoice_id_organization_id_school_id_fkey";
            columns: ["invoice_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "student_invoices";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_charges_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_charges_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
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
      student_invoices: {
        Row: {
          billing_run_id: string;
          created_at: string;
          created_by: string;
          currency_code: string;
          enrollment_id: string;
          id: string;
          invoice_number: string;
          issued_at: string;
          organization_id: string;
          period_id: string | null;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["invoice_status"];
          student_id: string;
        };
        Insert: {
          billing_run_id: string;
          created_at?: string;
          created_by?: string;
          currency_code: string;
          enrollment_id: string;
          id?: string;
          invoice_number: string;
          issued_at?: string;
          organization_id: string;
          period_id?: string | null;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["invoice_status"];
          student_id: string;
        };
        Update: {
          billing_run_id?: string;
          created_at?: string;
          created_by?: string;
          currency_code?: string;
          enrollment_id?: string;
          id?: string;
          invoice_number?: string;
          issued_at?: string;
          organization_id?: string;
          period_id?: string | null;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["invoice_status"];
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_invoices_billing_run_id_organization_id_school_id_fkey";
            columns: ["billing_run_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "billing_runs";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_invoices_enrollment_id_student_id_organization_id__fkey";
            columns: [
              "enrollment_id",
              "student_id",
              "organization_id",
              "school_id",
            ];
            isOneToOne: false;
            referencedRelation: "student_enrollments";
            referencedColumns: [
              "id",
              "student_id",
              "organization_id",
              "school_id",
            ];
          },
          {
            foreignKeyName: "student_invoices_period_id_organization_id_school_id_fkey";
            columns: ["period_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_periods";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_invoices_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_invoices_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_invoices_student_id_organization_id_fkey";
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
      student_promotions: {
        Row: {
          created_at: string;
          id: string;
          idempotency_key: string;
          notes: string | null;
          organization_id: string;
          outcome: Database["public"]["Enums"]["promotion_outcome"];
          promoted_at: string;
          promoted_by: string;
          school_id: string;
          source_class_arm_id: string | null;
          source_class_level_id: string;
          source_period_id: string;
          source_session_id: string;
          student_id: string;
          target_class_arm_id: string | null;
          target_class_level_id: string | null;
          target_enrollment_id: string | null;
          target_membership_id: string | null;
          target_session_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          idempotency_key: string;
          notes?: string | null;
          organization_id: string;
          outcome: Database["public"]["Enums"]["promotion_outcome"];
          promoted_at?: string;
          promoted_by?: string;
          school_id: string;
          source_class_arm_id?: string | null;
          source_class_level_id: string;
          source_period_id: string;
          source_session_id: string;
          student_id: string;
          target_class_arm_id?: string | null;
          target_class_level_id?: string | null;
          target_enrollment_id?: string | null;
          target_membership_id?: string | null;
          target_session_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          idempotency_key?: string;
          notes?: string | null;
          organization_id?: string;
          outcome?: Database["public"]["Enums"]["promotion_outcome"];
          promoted_at?: string;
          promoted_by?: string;
          school_id?: string;
          source_class_arm_id?: string | null;
          source_class_level_id?: string;
          source_period_id?: string;
          source_session_id?: string;
          student_id?: string;
          target_class_arm_id?: string | null;
          target_class_level_id?: string | null;
          target_enrollment_id?: string | null;
          target_membership_id?: string | null;
          target_session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_promotions_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_promotions_source_class_arm_id_organization_id_sch_fkey";
            columns: ["source_class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_promotions_source_class_level_id_organization_id_s_fkey";
            columns: ["source_class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_promotions_source_period_id_source_session_id_orga_fkey";
            columns: [
              "source_period_id",
              "source_session_id",
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
            foreignKeyName: "student_promotions_source_session_id_organization_id_schoo_fkey";
            columns: ["source_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_promotions_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_promotions_target_class_arm_id_organization_id_sch_fkey";
            columns: ["target_class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_promotions_target_class_level_id_organization_id_s_fkey";
            columns: ["target_class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_promotions_target_session_id_organization_id_schoo_fkey";
            columns: ["target_session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      student_subject_results: {
        Row: {
          batch_id: string;
          computed_at: string;
          computed_by: string;
          grade: string;
          id: string;
          is_pass: boolean;
          organization_id: string;
          remark: string;
          school_id: string;
          student_id: string;
          total_score: number;
          weighted_percent: number;
        };
        Insert: {
          batch_id: string;
          computed_at?: string;
          computed_by: string;
          grade: string;
          id?: string;
          is_pass: boolean;
          organization_id: string;
          remark: string;
          school_id: string;
          student_id: string;
          total_score: number;
          weighted_percent: number;
        };
        Update: {
          batch_id?: string;
          computed_at?: string;
          computed_by?: string;
          grade?: string;
          id?: string;
          is_pass?: boolean;
          organization_id?: string;
          remark?: string;
          school_id?: string;
          student_id?: string;
          total_score?: number;
          weighted_percent?: number;
        };
        Relationships: [
          {
            foreignKeyName: "student_subject_results_batch_id_organization_id_school_id_fkey";
            columns: ["batch_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "result_batches";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "student_subject_results_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
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
      teaching_assignments: {
        Row: {
          assignment_type: Database["public"]["Enums"]["teaching_assignment_type"];
          class_arm_id: string | null;
          class_level_id: string;
          created_at: string;
          created_by: string;
          ended_on: string | null;
          id: string;
          organization_id: string;
          school_id: string;
          session_id: string;
          staff_assignment_id: string;
          started_on: string;
          status: Database["public"]["Enums"]["teaching_assignment_status"];
          subject_id: string | null;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          assignment_type: Database["public"]["Enums"]["teaching_assignment_type"];
          class_arm_id?: string | null;
          class_level_id: string;
          created_at?: string;
          created_by?: string;
          ended_on?: string | null;
          id?: string;
          organization_id: string;
          school_id: string;
          session_id: string;
          staff_assignment_id: string;
          started_on: string;
          status?: Database["public"]["Enums"]["teaching_assignment_status"];
          subject_id?: string | null;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          assignment_type?: Database["public"]["Enums"]["teaching_assignment_type"];
          class_arm_id?: string | null;
          class_level_id?: string;
          created_at?: string;
          created_by?: string;
          ended_on?: string | null;
          id?: string;
          organization_id?: string;
          school_id?: string;
          session_id?: string;
          staff_assignment_id?: string;
          started_on?: string;
          status?: Database["public"]["Enums"]["teaching_assignment_status"];
          subject_id?: string | null;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teaching_assignments_class_arm_id_organization_id_school_i_fkey";
            columns: ["class_arm_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_arms";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "teaching_assignments_class_level_id_organization_id_school_fkey";
            columns: ["class_level_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "class_levels";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "teaching_assignments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "teaching_assignments_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "teaching_assignments_staff_assignment_id_organization_id_s_fkey";
            columns: ["staff_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "staff_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "teaching_assignments_subject_id_organization_id_school_id_fkey";
            columns: ["subject_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      timetable_entries: {
        Row: {
          conflict_acknowledged: boolean;
          created_at: string;
          created_by: string;
          id: string;
          notes: string | null;
          organization_id: string;
          period_id: string;
          school_id: string;
          session_id: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          teaching_assignment_id: string;
          updated_at: string;
          updated_by: string;
        };
        Insert: {
          conflict_acknowledged?: boolean;
          created_at?: string;
          created_by?: string;
          id?: string;
          notes?: string | null;
          organization_id: string;
          period_id: string;
          school_id: string;
          session_id: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          teaching_assignment_id: string;
          updated_at?: string;
          updated_by?: string;
        };
        Update: {
          conflict_acknowledged?: boolean;
          created_at?: string;
          created_by?: string;
          id?: string;
          notes?: string | null;
          organization_id?: string;
          period_id?: string;
          school_id?: string;
          session_id?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          teaching_assignment_id?: string;
          updated_at?: string;
          updated_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timetable_entries_period_id_organization_id_school_id_fkey";
            columns: ["period_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "timetable_periods";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
          {
            foreignKeyName: "timetable_entries_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "timetable_entries_teaching_assignment_id_organization_id_s_fkey";
            columns: ["teaching_assignment_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "teaching_assignments";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
      timetable_periods: {
        Row: {
          created_at: string;
          created_by: string;
          ends_at: string;
          id: string;
          name: string;
          organization_id: string;
          school_id: string;
          session_id: string;
          sort_order: number;
          starts_at: string;
          status: Database["public"]["Enums"]["lifecycle_status"];
          updated_at: string;
          updated_by: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          ends_at: string;
          id?: string;
          name: string;
          organization_id: string;
          school_id: string;
          session_id: string;
          sort_order?: number;
          starts_at: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
          weekday: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          ends_at?: string;
          id?: string;
          name?: string;
          organization_id?: string;
          school_id?: string;
          session_id?: string;
          sort_order?: number;
          starts_at?: string;
          status?: Database["public"]["Enums"]["lifecycle_status"];
          updated_at?: string;
          updated_by?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "timetable_periods_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "timetable_periods_session_id_organization_id_school_id_fkey";
            columns: ["session_id", "organization_id", "school_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id", "organization_id", "school_id"];
          },
        ];
      };
    };
    Views: {
      finance_collection_summary: {
        Row: {
          activity_date: string | null;
          amount: number | null;
          currency_code: string | null;
          method: Database["public"]["Enums"]["payment_method"] | null;
          organization_id: string | null;
          payment_count: number | null;
          school_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      finance_expense_summary: {
        Row: {
          amount: number | null;
          currency_code: string | null;
          expense_count: number | null;
          expense_date: string | null;
          kind: Database["public"]["Enums"]["expense_kind"] | null;
          organization_id: string | null;
          school_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      student_charge_balances: {
        Row: {
          organization_id: string | null;
          outstanding_amount: number | null;
          school_id: string | null;
          student_charge_id: string | null;
          student_id: string | null;
        };
        Insert: {
          organization_id?: string | null;
          outstanding_amount?: never;
          school_id?: string | null;
          student_charge_id?: string | null;
          student_id?: string | null;
        };
        Update: {
          organization_id?: string | null;
          outstanding_amount?: never;
          school_id?: string | null;
          student_charge_id?: string | null;
          student_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_charges_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_charges_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      student_finance_balances: {
        Row: {
          organization_id: string | null;
          outstanding_amount: number | null;
          school_id: string | null;
          student_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_charges_school_id_organization_id_fkey";
            columns: ["school_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id", "organization_id"];
          },
          {
            foreignKeyName: "student_charges_student_id_organization_id_fkey";
            columns: ["student_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
    };
    Functions: {
      accept_invitation: { Args: { p_token_hash: string }; Returns: string };
      activate_assessment_scheme: {
        Args: { target_scheme_id: string };
        Returns: undefined;
      };
      activate_fee_structure: {
        Args: { target_structure_id: string };
        Returns: string;
      };
      allocate_payment: {
        Args: { target_allocations: Json; target_payment_id: string };
        Returns: string;
      };
      can_access_academic_setup: {
        Args: {
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      can_access_admissions: {
        Args: {
          feature_key?: string;
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      can_access_assessments: {
        Args: {
          feature_key: string;
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      can_access_attendance: {
        Args: {
          feature_key: string;
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: boolean;
      };
      can_access_finance: {
        Args: {
          feature_key: string;
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
      can_access_staff_attendance_assignment: {
        Args: {
          permission_key: string;
          target_attendance_date: string;
          target_organization_id: string;
          target_school_id: string;
          target_staff_assignment_id: string;
        };
        Returns: boolean;
      };
      can_access_staff_time_request_assignment: {
        Args: {
          permission_key: string;
          target_organization_id: string;
          target_school_id: string;
          target_staff_assignment_id: string;
        };
        Returns: boolean;
      };
      can_access_student_attendance_scope: {
        Args: {
          permission_key: string;
          target_attendance_date: string;
          target_class_arm_id: string;
          target_class_level_id: string;
          target_organization_id: string;
          target_school_id: string;
          target_session_id: string;
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
      can_access_teaching_management: {
        Args: {
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
      close_cashier_session: {
        Args: {
          target_counted_cash: number;
          target_note: string;
          target_session_id: string;
        };
        Returns: string;
      };
      complete_expense: {
        Args: { target_expense_id: string; target_note: string };
        Returns: string;
      };
      configure_admission_document_policy: {
        Args: {
          target_category_key: string;
          target_enabled: boolean;
          target_label: string;
          target_required: boolean;
          target_school_id: string;
        };
        Returns: string;
      };
      convert_admission_to_student: {
        Args: {
          enrollment_date: string;
          target_application_id: string;
          target_student_number: string;
        };
        Returns: string;
      };
      correct_staff_clock_event: {
        Args: {
          target_clock_event_id: string;
          target_corrected_occurred_at: string;
          target_reason: string;
        };
        Returns: string;
      };
      correct_student_attendance_entry: {
        Args: {
          target_entry_id: string;
          target_new_status: Database["public"]["Enums"]["attendance_status"];
          target_reason: string;
        };
        Returns: string;
      };
      create_admission_application: {
        Args: {
          applicant_date_of_birth: string;
          applicant_first_name: string;
          applicant_gender: string;
          applicant_last_name: string;
          application_source?: Database["public"]["Enums"]["admission_source"];
          guardian_email?: string;
          guardian_first_name?: string;
          guardian_last_name?: string;
          guardian_phone?: string;
          guardian_relationship?: string;
          previous_class_name?: string;
          target_application_number: string;
          target_level_id: string;
          target_organization_id: string;
          target_school_id: string;
          target_session_id: string;
        };
        Returns: string;
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
      create_charge_adjustment: {
        Args: {
          target_amount: number;
          target_charge_id: string;
          target_kind: Database["public"]["Enums"]["charge_adjustment_kind"];
          target_reason: string;
        };
        Returns: string;
      };
      create_fee_structure: {
        Args: {
          target_amount: number;
          target_class_level_id: string;
          target_due_date: string;
          target_effective_from: string;
          target_effective_to: string;
          target_fee_category_id: string;
          target_name: string;
          target_organization_id: string;
          target_period_id: string;
          target_school_id: string;
          target_session_id: string;
          target_student_category_id: string;
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
      decide_expense: {
        Args: {
          approve: boolean;
          target_approved_amount: number;
          target_expense_id: string;
          target_note: string;
        };
        Returns: string;
      };
      end_staff_employment: {
        Args: {
          target_employment_id: string;
          target_ended_on: string;
          target_reason: string;
        };
        Returns: undefined;
      };
      generate_billing_run: {
        Args: { target_idempotency_key: string; target_structure_id: string };
        Returns: string;
      };
      get_my_authorization: {
        Args: { target_organization_id: string; target_school_id?: string };
        Returns: Json;
      };
      get_staff_attendance_summary: {
        Args: {
          target_attendance_date: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: {
          excused_staff: number;
          incomplete_staff: number;
          open_exceptions: number;
          present_staff: number;
          scheduled_staff: number;
        }[];
      };
      get_student_attendance_roster: {
        Args: {
          target_attendance_date: string;
          target_class_arm_id: string;
          target_class_level_id: string;
          target_organization_id: string;
          target_register_type: Database["public"]["Enums"]["student_attendance_register_type"];
          target_school_id: string;
          target_session_id: string;
        };
        Returns: {
          attendance_note: string;
          attendance_status: Database["public"]["Enums"]["attendance_status"];
          entry_id: string;
          first_name: string;
          last_name: string;
          locks_at: string;
          register_id: string;
          student_id: string;
          student_number: string;
          submitted_at: string;
        }[];
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
      initialize_admission_document_requirements: {
        Args: { target_application_id: string };
        Returns: number;
      };
      is_feature_enabled: {
        Args: { feature_key: string; target_organization_id: string };
        Returns: boolean;
      };
      issue_admission_offer: {
        Args: {
          target_application_id: string;
          target_arm_id: string;
          target_expires_at: string;
          target_level_id: string;
          target_session_id: string;
        };
        Returns: string;
      };
      issue_receipt: { Args: { target_payment_id: string }; Returns: string };
      list_staff_access_candidates: {
        Args: { target_organization_id: string; target_school_id: string };
        Returns: {
          display_name: string;
          email: string;
          user_id: string;
        }[];
      };
      list_staff_attendance_positions: {
        Args: { target_organization_id: string; target_school_id: string };
        Returns: {
          position_id: string;
          position_name: string;
        }[];
      };
      list_staff_clock_assignments: {
        Args: {
          target_attendance_date: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: {
          approved_time_off_ends_at: string;
          approved_time_off_kind: Database["public"]["Enums"]["staff_time_request_kind"];
          approved_time_off_starts_at: string;
          attendance_day_id: string;
          clock_in_at: string;
          clock_out_at: string;
          day_status: Database["public"]["Enums"]["staff_attendance_day_status"];
          is_excused: boolean;
          policy_ends_at: string;
          policy_grace_minutes: number;
          policy_name: string;
          policy_starts_at: string;
          position_name: string;
          staff_assignment_id: string;
          staff_name: string;
          staff_number: string;
        }[];
      };
      list_staff_clock_correction_events: {
        Args: {
          target_attendance_date: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: {
          attendance_date: string;
          clock_event_id: string;
          effective_occurred_at: string;
          event_type: Database["public"]["Enums"]["staff_clock_event_type"];
          position_name: string;
          staff_assignment_id: string;
          staff_name: string;
          staff_number: string;
        }[];
      };
      list_staff_time_request_assignments: {
        Args: { target_organization_id: string; target_school_id: string };
        Returns: {
          staff_assignment_id: string;
          staff_name: string;
          staff_number: string;
        }[];
      };
      list_staff_time_request_policies: {
        Args: { target_organization_id: string; target_school_id: string };
        Returns: {
          policy_id: string;
          policy_key: string;
          policy_name: string;
        }[];
      };
      list_student_attendance_scopes: {
        Args: {
          target_attendance_date: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: {
          class_arm_id: string;
          class_arm_name: string;
          class_level_id: string;
          class_level_name: string;
          session_id: string;
          session_name: string;
          student_count: number;
        }[];
      };
      mark_expense_paid: {
        Args: {
          target_evidence_document_id: string;
          target_expense_id: string;
          target_note: string;
        };
        Returns: string;
      };
      open_cashier_session: {
        Args: {
          target_opening_cash: number;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: string;
      };
      preview_billing_run: {
        Args: { target_structure_id: string };
        Returns: Json;
      };
      promote_student: {
        Args: {
          idempotency_key: string;
          notes?: string;
          outcome: Database["public"]["Enums"]["promotion_outcome"];
          source_period: string;
          target_arm: string;
          target_level: string;
          target_session: string;
          target_student_id: string;
        };
        Returns: string;
      };
      reconcile_payments: {
        Args: {
          target_payment_ids: string[];
          target_reconciliation_id: string;
        };
        Returns: string;
      };
      record_admission_decision: {
        Args: {
          target_application_id: string;
          target_decision: Database["public"]["Enums"]["admission_decision_kind"];
          target_level_id: string;
          target_rationale: string;
        };
        Returns: string;
      };
      record_cash_handover: {
        Args: {
          target_amount: number;
          target_cashier_session_id: string;
          target_handed_to: string;
          target_note: string;
        };
        Returns: string;
      };
      record_entrance_assessment: {
        Args: {
          target_application_id: string;
          target_maximum_score?: number;
          target_notes?: string;
          target_scheduled_at: string;
          target_score?: number;
        };
        Returns: string;
      };
      record_payment: {
        Args: {
          target_amount: number;
          target_evidence_document_id: string;
          target_idempotency_key: string;
          target_method: Database["public"]["Enums"]["payment_method"];
          target_notes: string;
          target_organization_id: string;
          target_paid_at: string;
          target_payer_name: string;
          target_period_id: string;
          target_received_by: string;
          target_reference: string;
          target_school_id: string;
          target_session_id: string;
          target_student_id: string;
        };
        Returns: string;
      };
      record_staff_clock_event: {
        Args: {
          target_event_type: Database["public"]["Enums"]["staff_clock_event_type"];
          target_idempotency_key: string;
          target_note?: string;
          target_occurred_at: string;
          target_organization_id: string;
          target_school_id: string;
          target_staff_assignment_id: string;
        };
        Returns: string;
      };
      refresh_staff_attendance_exceptions: {
        Args: {
          target_attendance_date: string;
          target_organization_id: string;
          target_school_id: string;
        };
        Returns: number;
      };
      reopen_result_batch: {
        Args: { reason: string; target_batch_id: string };
        Returns: string;
      };
      respond_to_admission_offer: {
        Args: { accept_offer: boolean; target_application_id: string };
        Returns: Database["public"]["Enums"]["offer_status"];
      };
      reverse_payment: {
        Args: { target_payment_id: string; target_reason: string };
        Returns: string;
      };
      review_admission_document: {
        Args: {
          target_comment?: string;
          target_requirement_id: string;
          target_status: Database["public"]["Enums"]["admission_document_status"];
        };
        Returns: Database["public"]["Enums"]["admission_document_status"];
      };
      set_admission_checklist_item: {
        Args: {
          target_item_id: string;
          target_status: Database["public"]["Enums"]["checklist_item_status"];
        };
        Returns: Database["public"]["Enums"]["checklist_item_status"];
      };
      set_current_academic_period: {
        Args: { target_period_id: string };
        Returns: undefined;
      };
      set_current_academic_session: {
        Args: { target_session_id: string };
        Returns: undefined;
      };
      set_school_timezone: {
        Args: {
          target_organization_id: string;
          target_school_id: string;
          target_timezone: string;
        };
        Returns: string;
      };
      submit_admission_document: {
        Args: { target_document_id: string; target_requirement_id: string };
        Returns: Database["public"]["Enums"]["admission_document_status"];
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
      submit_expense: { Args: { target_expense_id: string }; Returns: string };
      submit_staff_time_request: {
        Args: {
          target_ends_at: string;
          target_kind: Database["public"]["Enums"]["staff_time_request_kind"];
          target_leave_type_id: string;
          target_organization_id: string;
          target_policy_id: string;
          target_reason: string;
          target_school_id: string;
          target_staff_assignment_id: string;
          target_starts_at: string;
        };
        Returns: string;
      };
      submit_staff_time_request_local: {
        Args: {
          target_ends_local: string;
          target_kind: Database["public"]["Enums"]["staff_time_request_kind"];
          target_leave_type_id: string;
          target_organization_id: string;
          target_policy_id: string;
          target_reason: string;
          target_school_id: string;
          target_staff_assignment_id: string;
          target_starts_local: string;
        };
        Returns: string;
      };
      submit_student_attendance_register: {
        Args: {
          target_attendance_date: string;
          target_class_arm_id: string;
          target_class_level_id: string;
          target_entries: Json;
          target_idempotency_key: string;
          target_organization_id: string;
          target_register_type: Database["public"]["Enums"]["student_attendance_register_type"];
          target_school_id: string;
          target_session_id: string;
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
      transition_admission_application: {
        Args: {
          target_application_id: string;
          target_status: Database["public"]["Enums"]["admission_application_status"];
        };
        Returns: Database["public"]["Enums"]["admission_application_status"];
      };
      transition_result_batch: {
        Args: {
          target_batch_id: string;
          target_status: Database["public"]["Enums"]["result_batch_status"];
        };
        Returns: undefined;
      };
      upsert_assessment_score: {
        Args: {
          target_batch_id: string;
          target_component_id: string;
          target_score: number;
          target_student_id: string;
        };
        Returns: string;
      };
      verify_payment: {
        Args: {
          approve: boolean;
          target_note: string;
          target_payment_id: string;
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
      admission_application_status:
        | "enquiry"
        | "application_started"
        | "submitted"
        | "under_review"
        | "exam_scheduled"
        | "exam_taken"
        | "under_assessment"
        | "retake"
        | "approved"
        | "rejected"
        | "admission_offered"
        | "accepted"
        | "enrollment_pending"
        | "enrolled"
        | "withdrawn"
        | "cancelled"
        | "incomplete"
        | "expired";
      admission_decision_kind: "approved" | "rejected" | "retake";
      admission_document_status:
        "required" | "submitted" | "verified" | "rejected" | "not_applicable";
      admission_source: "enquiry" | "staff" | "parent_online" | "import";
      approval_decision_kind: "approved" | "rejected" | "returned";
      approval_request_status:
        "pending" | "approved" | "rejected" | "returned" | "cancelled";
      assessment_attempt_status: "scheduled" | "completed" | "cancelled";
      assessment_scheme_status: "draft" | "active" | "archived";
      assignment_scope: "organization" | "management_group" | "school";
      attendance_status:
        "present" | "late" | "absent" | "excused" | "left_early";
      billing_run_status: "previewed" | "completed" | "failed" | "cancelled";
      cashier_session_status: "open" | "closed" | "reviewed";
      charge_adjustment_kind:
        "discount" | "scholarship" | "credit" | "debit" | "reversal";
      charge_status: "open" | "partially_paid" | "paid" | "reversed";
      checklist_item_status: "pending" | "complete" | "waived";
      class_membership_status: "active" | "ended" | "cancelled";
      curriculum_item_status:
        "planned" | "in_progress" | "completed" | "deferred" | "cancelled";
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
      expense_kind: "expense" | "cash_advance" | "petty_cash";
      expense_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "paid"
        | "completed"
        | "cancelled";
      fee_frequency: "one_time" | "term" | "session";
      finance_record_status: "draft" | "active" | "inactive" | "archived";
      homework_status: "draft" | "published" | "closed" | "cancelled";
      import_batch_status:
        "draft" | "validated" | "ready" | "committed" | "failed" | "cancelled";
      import_row_status: "valid" | "warning" | "invalid";
      invitation_status: "pending" | "accepted" | "revoked" | "expired";
      invoice_status: "open" | "partially_paid" | "paid" | "voided";
      lesson_delivery_status:
        "scheduled" | "delivered" | "partially_delivered" | "cancelled";
      lesson_plan_status:
        "draft" | "submitted" | "approved" | "rejected" | "withdrawn";
      lifecycle_status: "active" | "inactive" | "archived";
      membership_status: "invited" | "active" | "suspended" | "ended";
      notification_kind: "system" | "action_required" | "approval" | "document";
      offer_status:
        "draft" | "issued" | "accepted" | "declined" | "expired" | "withdrawn";
      payment_method: "cash" | "bank_transfer" | "pos" | "other";
      payment_status: "recorded" | "verified" | "rejected" | "reversed";
      promotion_outcome: "promoted" | "repeated" | "graduated" | "transferred";
      reconciliation_status: "draft" | "reconciled" | "exception";
      result_batch_status:
        | "draft"
        | "submitted"
        | "reviewed"
        | "approved"
        | "published"
        | "reopened";
      staff_assignment_status: "planned" | "active" | "ended" | "cancelled";
      staff_attendance_day_status:
        "present" | "late" | "left_early" | "incomplete" | "excused";
      staff_attendance_exception_kind: "missing_clock_in" | "missing_clock_out";
      staff_attendance_exception_status: "open" | "resolved";
      staff_clock_event_type: "clock_in" | "clock_out";
      staff_clock_source: "self_service" | "authorized_operator";
      staff_time_request_kind: "leave" | "permission";
      staff_time_request_status:
        "submitted" | "approved" | "rejected" | "returned" | "cancelled";
      student_attendance_register_type: "morning" | "closing";
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
      teaching_assignment_status: "planned" | "active" | "ended" | "cancelled";
      teaching_assignment_type: "class_teacher" | "subject_teacher";
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
      admission_application_status: [
        "enquiry",
        "application_started",
        "submitted",
        "under_review",
        "exam_scheduled",
        "exam_taken",
        "under_assessment",
        "retake",
        "approved",
        "rejected",
        "admission_offered",
        "accepted",
        "enrollment_pending",
        "enrolled",
        "withdrawn",
        "cancelled",
        "incomplete",
        "expired",
      ],
      admission_decision_kind: ["approved", "rejected", "retake"],
      admission_document_status: [
        "required",
        "submitted",
        "verified",
        "rejected",
        "not_applicable",
      ],
      admission_source: ["enquiry", "staff", "parent_online", "import"],
      approval_decision_kind: ["approved", "rejected", "returned"],
      approval_request_status: [
        "pending",
        "approved",
        "rejected",
        "returned",
        "cancelled",
      ],
      assessment_attempt_status: ["scheduled", "completed", "cancelled"],
      assessment_scheme_status: ["draft", "active", "archived"],
      assignment_scope: ["organization", "management_group", "school"],
      attendance_status: ["present", "late", "absent", "excused", "left_early"],
      billing_run_status: ["previewed", "completed", "failed", "cancelled"],
      cashier_session_status: ["open", "closed", "reviewed"],
      charge_adjustment_kind: [
        "discount",
        "scholarship",
        "credit",
        "debit",
        "reversal",
      ],
      charge_status: ["open", "partially_paid", "paid", "reversed"],
      checklist_item_status: ["pending", "complete", "waived"],
      class_membership_status: ["active", "ended", "cancelled"],
      curriculum_item_status: [
        "planned",
        "in_progress",
        "completed",
        "deferred",
        "cancelled",
      ],
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
      expense_kind: ["expense", "cash_advance", "petty_cash"],
      expense_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "paid",
        "completed",
        "cancelled",
      ],
      fee_frequency: ["one_time", "term", "session"],
      finance_record_status: ["draft", "active", "inactive", "archived"],
      homework_status: ["draft", "published", "closed", "cancelled"],
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
      invoice_status: ["open", "partially_paid", "paid", "voided"],
      lesson_delivery_status: [
        "scheduled",
        "delivered",
        "partially_delivered",
        "cancelled",
      ],
      lesson_plan_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "withdrawn",
      ],
      lifecycle_status: ["active", "inactive", "archived"],
      membership_status: ["invited", "active", "suspended", "ended"],
      notification_kind: ["system", "action_required", "approval", "document"],
      offer_status: [
        "draft",
        "issued",
        "accepted",
        "declined",
        "expired",
        "withdrawn",
      ],
      payment_method: ["cash", "bank_transfer", "pos", "other"],
      payment_status: ["recorded", "verified", "rejected", "reversed"],
      promotion_outcome: ["promoted", "repeated", "graduated", "transferred"],
      reconciliation_status: ["draft", "reconciled", "exception"],
      result_batch_status: [
        "draft",
        "submitted",
        "reviewed",
        "approved",
        "published",
        "reopened",
      ],
      staff_assignment_status: ["planned", "active", "ended", "cancelled"],
      staff_attendance_day_status: [
        "present",
        "late",
        "left_early",
        "incomplete",
        "excused",
      ],
      staff_attendance_exception_kind: [
        "missing_clock_in",
        "missing_clock_out",
      ],
      staff_attendance_exception_status: ["open", "resolved"],
      staff_clock_event_type: ["clock_in", "clock_out"],
      staff_clock_source: ["self_service", "authorized_operator"],
      staff_time_request_kind: ["leave", "permission"],
      staff_time_request_status: [
        "submitted",
        "approved",
        "rejected",
        "returned",
        "cancelled",
      ],
      student_attendance_register_type: ["morning", "closing"],
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
      teaching_assignment_status: ["planned", "active", "ended", "cancelled"],
      teaching_assignment_type: ["class_teacher", "subject_teacher"],
    },
  },
} as const;
