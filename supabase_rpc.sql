-- Función RPC para decrementar stock de forma segura
create or replace function decrement_stock(p_id bigint, cant int)
returns void as $$
begin
  update public.productos
  set stock = stock - cant
  where id = p_id;
end;
$$ language plpgsql;
