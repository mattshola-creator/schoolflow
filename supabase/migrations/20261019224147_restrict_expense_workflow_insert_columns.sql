-- Draft creation must not bypass authorized expense approval/payment RPCs.
revoke insert on public.expenses from authenticated;
grant insert(organization_id,school_id,expense_category_id,academic_session_id,academic_period_id,kind,description,requested_amount,expense_date)
 on public.expenses to authenticated;
