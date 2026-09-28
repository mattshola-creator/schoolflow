-- Check constraints execute in the caller context. These immutable helpers
-- expose only a boolean over caller-supplied arrays and remain outside the
-- exposed public API schema.
grant execute on function private.has_unique_attendance_statuses(public.attendance_status[])
  to authenticated;
grant execute on function private.has_unique_weekdays(smallint[])
  to authenticated;
