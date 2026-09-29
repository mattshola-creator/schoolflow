-- Cover composite timetable foreign keys in their declared column order.

create index timetable_periods_school_fk_idx
  on public.timetable_periods (school_id, organization_id);
create index timetable_periods_session_fk_idx
  on public.timetable_periods (session_id, organization_id, school_id);

create index timetable_entries_school_fk_idx
  on public.timetable_entries (school_id, organization_id);
create index timetable_entries_period_fk_idx
  on public.timetable_entries (period_id, organization_id, school_id);
create index timetable_entries_assignment_fk_idx
  on public.timetable_entries (
    teaching_assignment_id,
    organization_id,
    school_id
  );
