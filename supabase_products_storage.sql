-- 1. Crear Bucket de Storage para Productos
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- 2. Políticas de Seguridad para Storage (Productos)
create policy "Acceso público a productos"
on storage.objects for select
using ( bucket_id = 'productos' );

create policy "Subida pública a productos"
on storage.objects for insert
with check ( bucket_id = 'productos' );

create policy "Modificación pública a productos"
on storage.objects for update
using ( bucket_id = 'productos' );

create policy "Eliminación pública a productos"
on storage.objects for delete
using ( bucket_id = 'productos' );
