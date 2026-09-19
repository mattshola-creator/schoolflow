-- M5 regression fix: staff profile visibility also needs the linked Person.
-- `staff_profiles` is organization scoped, while `can_view_staff` validates
-- the caller's entitled school assignment before disclosing the shared identity.
create policy people_select_staff on public.people
for select to authenticated
using (
  exists (
    select 1
    from public.staff_profiles staff
    where staff.person_id = people.id
      and public.can_view_staff(staff.id)
  )
);

comment on policy people_select_staff on public.people is
  'Allows an authorized staff viewer to read the Person linked to a visible staff profile.';
