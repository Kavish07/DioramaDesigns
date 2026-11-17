-- Public-read bucket for generated diorama images. "Public" matches the
-- images themselves (not the dioramas table rows, which stay owner-only via
-- RLS) — anyone with a direct image URL can view it, but can't discover it
-- without already having a diorama row's URL.
insert into storage.buckets (id, name, public)
values ('dioramas', 'dioramas', true)
on conflict (id) do nothing;

create policy "owner_upload_dioramas" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'dioramas' and is_owner());

create policy "owner_manage_dioramas" on storage.objects
  for update using (bucket_id = 'dioramas' and is_owner());

create policy "owner_delete_dioramas" on storage.objects
  for delete using (bucket_id = 'dioramas' and is_owner());
