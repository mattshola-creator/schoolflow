-- M3 structures are historical reference data. Product users deactivate/archive;
-- they do not physically delete records through the Data API.
revoke delete on public.school_academic_settings, public.academic_sessions,
  public.academic_periods, public.academic_sections, public.class_levels,
  public.class_arms, public.subjects, public.subject_level_applicability
from authenticated;
