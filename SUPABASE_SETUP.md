# Configuración de Supabase

Este proyecto utiliza Supabase como base de datos. Sigue estos pasos para configurarlo:

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa los datos:
   - **Name**: Autolavado Gochi
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Selecciona la más cercana
5. Espera a que el proyecto se cree (~2 minutos)

## 2. Obtener Credenciales

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia las siguientes credenciales:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave `anon public`)

## 3. Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

> ⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

## 4. Ejecutar el Schema SQL

1. En Supabase, ve a **SQL Editor**
2. Click en "New query"
3. Copia todo el contenido del archivo `supabase-schema.sql`
4. Pégalo en el editor
5. Click en "Run" o presiona `Ctrl+Enter`
6. Verifica que todas las tablas se crearon correctamente en **Table Editor**

## 5. Verificar Instalación

Las siguientes tablas deben estar creadas:

- ✅ `products` - Productos del inventario
- ✅ `movements` - Movimientos de entrada/salida
- ✅ `customers` - Clientes
- ✅ `sales` - Ventas registradas

## 6. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación ahora usará Supabase en lugar de localStorage.

## Migración de Datos Locales (Opcional)

Si ya tienes datos en localStorage y quieres migrarlos:

1. Ve a **Settings** en la aplicación
2. Click en "Migrar datos a Supabase"
3. Confirma la migración
4. Los datos se copiarán automáticamente

## Funciones SQL Disponibles

### `update_product_stock(product_id, quantity, operation)`

Actualiza el stock de un producto.

```sql
SELECT update_product_stock(1, 10, 'add');  -- Agregar 10 unidades
SELECT update_product_stock(1, 5, 'subtract');  -- Restar 5 unidades
```

### `register_sale(sale_id, customer_id, customer_name, total, payment_method, items)`

Registra una venta completa con movimientos automáticos.

```sql
SELECT register_sale(
  '#123456',
  1,
  'Juan Pérez',
  25.50,
  'Efectivo',
  '[{"type":"product","itemId":1,"name":"Cera Premium","quantity":2}]'::jsonb
);
```

## Solución de Problemas

### Error: "Missing Supabase environment variables"

- Verifica que el archivo `.env` existe
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo

### Error: "relation does not exist"

- Ejecuta el schema SQL en Supabase
- Verifica que todas las tablas se crearon

### Error de conexión

- Verifica que la URL y la clave son correctas
- Verifica que el proyecto de Supabase está activo

## Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
