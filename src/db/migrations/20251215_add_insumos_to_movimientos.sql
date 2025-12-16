-- Migration: Add insumo_id to movimientos table to support Consumable Movements

-- 1. Add insumo_id column
ALTER TABLE public.movimientos 
ADD COLUMN IF NOT EXISTS insumo_id bigint REFERENCES public.insumos(id) ON DELETE RESTRICT;

-- 2. Make producto_id nullable (since a movement can now be about an insumo, not just a product)
ALTER TABLE public.movimientos 
ALTER COLUMN producto_id DROP NOT NULL;

-- 3. Add check constraint to ensure either producto_id OR insumo_id is present, but not both (optional, or allow mixed if needed, but usually one item per movement line)
-- Dropping existing constraint if any, then adding new one
ALTER TABLE public.movimientos DROP CONSTRAINT IF EXISTS check_item_presence;
ALTER TABLE public.movimientos 
ADD CONSTRAINT check_item_presence 
CHECK (
  (producto_id IS NOT NULL AND insumo_id IS NULL) OR 
  (producto_id IS NULL AND insumo_id IS NOT NULL)
);

-- 4. Fix permissions if needed (usually covered by existing policies, but good to ensure)
GRANT ALL ON public.movimientos TO authenticated;
GRANT ALL ON public.movimientos TO service_role;
