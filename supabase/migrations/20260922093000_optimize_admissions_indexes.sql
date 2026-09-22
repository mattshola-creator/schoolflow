-- Cover M7 relationship paths used by RLS, detail views and referential checks.
create index admission_applications_session_scope_idx on public.admission_applications(academic_session_id, organization_id, school_id);
create index admission_applications_level_scope_idx on public.admission_applications(applied_class_level_id, organization_id, school_id);
create index admission_applications_enrolled_student_idx on public.admission_applications(enrolled_student_id, organization_id) where enrolled_student_id is not null;
create index admission_guardians_application_scope_idx on public.admission_guardians(application_id, organization_id, school_id);
create index admission_guardians_person_idx on public.admission_guardians(guardian_person_id);
create index admission_checklist_application_scope_idx on public.admission_checklist_items(application_id, organization_id, school_id);
create index entrance_assessments_application_scope_idx on public.entrance_assessment_attempts(application_id, organization_id, school_id);
create index admission_decisions_application_scope_idx on public.admission_decisions(application_id, organization_id, school_id);
create index admission_decisions_level_scope_idx on public.admission_decisions(recommended_class_level_id, organization_id, school_id) where recommended_class_level_id is not null;
create index admission_offers_application_scope_idx on public.admission_offers(application_id, organization_id, school_id);
create index admission_offers_session_scope_idx on public.admission_offers(academic_session_id, organization_id, school_id);
create index admission_offers_level_scope_idx on public.admission_offers(offered_class_level_id, organization_id, school_id);
create index admission_offers_arm_scope_idx on public.admission_offers(offered_class_arm_id, organization_id, school_id) where offered_class_arm_id is not null;
