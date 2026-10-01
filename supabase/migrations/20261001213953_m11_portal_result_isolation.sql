-- Portal consumers receive only their learner's result from an immutable M10
-- publication. The batch metadata remains immutable; classmates are removed.
create or replace function public.portal_dashboard(target_student uuid,target_school uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; begin
 if not public.portal_can_access_student(target_student,target_school,'communication.portal_insights') then raise exception 'Portal resource unavailable' using errcode='42501'; end if;
 select jsonb_build_object(
  'student',jsonb_build_object('id',sp.id,'studentNumber',sp.student_number,'firstName',p.first_name,'lastName',p.last_name),
  'publishedResults',coalesce((
   select jsonb_agg(
    jsonb_build_object(
     'publicationId',rp.id,
     'publishedAt',rp.published_at,
     'snapshot',jsonb_build_object(
      'batch',rp.snapshot->'batch',
      'results',(
       select coalesce(jsonb_agg(item),'[]'::jsonb)
       from jsonb_array_elements(coalesce(rp.snapshot->'results','[]'::jsonb)) item
       where item->>'student_id'=target_student::text
      )
     )
    ) order by rp.published_at desc
   )
   from public.result_publications rp
   where rp.school_id=target_school
    and exists(
     select 1 from jsonb_array_elements(coalesce(rp.snapshot->'results','[]'::jsonb)) item
     where item->>'student_id'=target_student::text
    )
  ),'[]'::jsonb),
  'attendance',coalesce((select jsonb_build_object('total',count(*),'present',count(*) filter(where ae.status='present'),'absent',count(*) filter(where ae.status='absent'),'late',count(*) filter(where ae.status='late')) from public.student_attendance_entries ae where ae.school_id=target_school and ae.student_id=target_student),'{}'::jsonb),
  'finance',coalesce((select jsonb_build_object('invoices',count(distinct i.id),'billed',coalesce(sum(c.original_amount),0),'paid',coalesce((select sum(pa.amount) from public.payment_allocations pa join public.student_charges pc on pc.id=pa.student_charge_id where pc.student_id=target_student and pc.school_id=target_school),0)) from public.student_invoices i left join public.student_charges c on c.invoice_id=i.id where i.student_id=target_student and i.school_id=target_school),'{}'::jsonb)
 ) into result from public.student_profiles sp join public.people p on p.id=sp.person_id where sp.id=target_student;
 return result;
end $$;
revoke all on function public.portal_dashboard(uuid,uuid) from public,anon;
grant execute on function public.portal_dashboard(uuid,uuid) to authenticated;
