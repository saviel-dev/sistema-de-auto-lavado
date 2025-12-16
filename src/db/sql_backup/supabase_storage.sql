-- 1. Crear Bucket de Storage para Clientes
insert into storage.buckets (id, name, public)
values ('clientes', 'clientes', true)
on conflict (id) do nothing;

-- 2. Políticas de Seguridad para Storage (Permitir todo por ahora para facilitar desarrollo)
create policy "Acceso público a clientes"
on storage.objects for select
using ( bucket_id = 'clientes' );

create policy "Subida pública a clientes"
on storage.objects for insert
with check ( bucket_id = 'clientes' );

create policy "Modificación pública a clientes"
on storage.objects for update
using ( bucket_id = 'clientes' );

create policy "Eliminación pública a clientes"
on storage.objects for delete
using ( bucket_id = 'clientes' );

-- 3. Modificar tabla clientes para soportar múltiples imágenes
-- Se agrega la columna 'imagenes' como un array de texto
alter table public.clientes 
add column if not exists imagenes text[] default '{}';

-- Opción: Migrar datos existentes si fuera necesario (no aplica aquí porque es nuevo)
-- update public.clientes set imagenes = array[imagen_url] where imagen_url is not null;
