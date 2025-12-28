-- Migration: Fix product deletion cascade
-- Date: 2025-12-25
-- Description: Change movimientos.producto_id foreign key to CASCADE on delete
-- This allows products to be deleted even when they have associated movements

-- Drop the existing foreign key constraint
ALTER TABLE public.movimientos
DROP CONSTRAINT IF EXISTS movimientos_producto_id_fkey;

-- Re-add the foreign key constraint with CASCADE delete
ALTER TABLE public.movimientos
ADD CONSTRAINT movimientos_producto_id_fkey
FOREIGN KEY (producto_id)
REFERENCES public.productos(id)
ON DELETE CASCADE;

-- Verify the constraint was created
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'movimientos'
    AND kcu.column_name = 'producto_id';
