-- Migración para agregar campo de categoría a la tabla insumos
-- Ejecutar este script en Supabase SQL Editor

-- Agregar columna categoria a la tabla insumos
ALTER TABLE insumos 
ADD COLUMN IF NOT EXISTS categoria TEXT;

-- Agregar comentario a la columna para documentación
COMMENT ON COLUMN insumos.categoria IS 'Categoría del insumo (ej: Limpieza, Mantenimiento, etc.)';
