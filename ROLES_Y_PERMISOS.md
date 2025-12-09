# Sistema de Usuarios y Roles - Autolavado Gochi

## Descripción General

El sistema implementa un control de acceso basado en roles (RBAC) con dos tipos de usuarios:

### 👑 Administrador (admin)

**Acceso completo al sistema**

### 👷 Trabajador (worker)

**Acceso limitado a operaciones diarias**

---

## Permisos por Rol

### Administrador

**Gestión de Usuarios** ✅

- Crear nuevos usuarios (admin o worker)
- Ver todos los usuarios
- Editar información de usuarios
- Activar/desactivar usuarios
- Eliminar usuarios

**Productos** ✅

- Crear productos
- Ver productos
- Editar productos
- Eliminar productos
- Gestionar categorías

**Movimientos de Inventario** ✅

- Registrar entradas
- Registrar salidas
- Ver historial completo
- Editar movimientos
- Eliminar movimientos

**Ventas** ✅

- Procesar ventas
- Ver historial de ventas
- Editar ventas
- Eliminar ventas
- Generar reportes

**Servicios** ✅

- Crear servicios
- Ver servicios
- Editar servicios
- Eliminar servicios
- Activar/desactivar servicios

**Pedidos/Citas** ✅

- Crear pedidos
- Ver pedidos
- Editar pedidos
- Eliminar pedidos
- Cambiar estados

**Clientes** ✅

- Crear clientes
- Ver clientes
- Editar clientes
- Eliminar clientes

**Configuración del Sistema** ✅

- Modificar parámetros generales
- Configurar tasas e impuestos
- Gestionar catálogos
- Ver audit log (registro de auditoría)
- Configurar permisos

---

### Trabajador

**Productos** ✅ (Limitado)

- ✅ Crear productos
- ✅ Ver productos
- ❌ Editar productos
- ❌ Eliminar productos

**Movimientos de Inventario** ✅ (Solo Entradas)

- ✅ Registrar entradas
- ✅ Ver historial
- ❌ Editar movimientos
- ❌ Eliminar movimientos

**Ventas** ✅

- ✅ Procesar ventas
- ✅ Ver historial de ventas
- ❌ Editar ventas
- ❌ Eliminar ventas

**Servicios** ✅ (Limitado)

- ✅ Crear servicios
- ✅ Ver servicios
- ❌ Editar servicios
- ❌ Eliminar servicios

**Pedidos/Citas** ✅

- ✅ Crear pedidos
- ✅ Ver pedidos
- ✅ Editar pedidos (actualizar estado)
- ❌ Eliminar pedidos

**Clientes** ✅

- ✅ Crear clientes
- ✅ Ver clientes
- ✅ Editar clientes
- ❌ Eliminar clientes

**Configuración del Sistema** ❌

- ❌ No puede acceder a configuración
- ❌ No puede ver audit log
- ❌ No puede gestionar usuarios
- ✅ Puede ver configuraciones públicas (solo lectura)

---

## Estructura de la Base de Datos

### Tabla: `users`

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'worker')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);
```

**Campos**:

- `id`: Identificador único del usuario
- `auth_user_id`: Referencia al usuario de Supabase Auth
- `email`: Correo electrónico (único)
- `full_name`: Nombre completo del usuario
- `role`: Rol del usuario (`admin` o `worker`)
- `is_active`: Indica si el usuario está activo
- `last_login`: Última vez que inició sesión

---

## Funciones de Seguridad

### `get_user_role()`

Obtiene el rol del usuario actual.

```sql
SELECT get_user_role();
-- Retorna: 'admin' o 'worker'
```

### `is_admin()`

Verifica si el usuario actual es administrador.

```sql
SELECT is_admin();
-- Retorna: true o false
```

### `is_worker()`

Verifica si el usuario actual es trabajador.

```sql
SELECT is_worker();
-- Retorna: true o false
```

---

## Row Level Security (RLS)

Todas las tablas tienen políticas de seguridad que se aplican automáticamente:

### Ejemplo: Tabla `products`

```sql
-- Todos pueden ver productos
CREATE POLICY "Everyone can view products" ON products
  FOR SELECT USING (true);

-- Workers y admins pueden crear productos
CREATE POLICY "Workers and admins can create products" ON products
  FOR INSERT WITH CHECK (is_admin() OR is_worker());

-- Solo admins pueden actualizar productos
CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (is_admin());

-- Solo admins pueden eliminar productos
CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (is_admin());
```

---

## Configuración Inicial

### 1. Crear el Primer Administrador

Después de que un usuario se registre con Supabase Auth:

```sql
-- Obtener el UUID del usuario de auth.users
SELECT id, email FROM auth.users;

-- Crear el usuario administrador
INSERT INTO users (auth_user_id, email, full_name, role)
VALUES (
  'uuid-del-usuario-aqui',
  'admin@autolavadogochi.com',
  'Administrador Principal',
  'admin'
);
```

### 2. Crear Trabajadores

Los administradores pueden crear trabajadores desde la interfaz, o manualmente:

```sql
INSERT INTO users (auth_user_id, email, full_name, role)
VALUES (
  'uuid-del-trabajador',
  'trabajador@autolavadogochi.com',
  'Juan Pérez',
  'worker'
);
```

---

## Auditoría

### Tabla: `audit_log`

Registra todas las acciones importantes del sistema:

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id BIGINT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Solo los administradores pueden ver el audit log.**

---

## Configuración del Sistema

### Tabla: `system_settings`

Almacena configuraciones del sistema:

```sql
CREATE TABLE system_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by BIGINT REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Configuraciones públicas** (`is_public = true`):

- Los workers pueden **leer** pero no modificar
- Ejemplo: nombre del negocio, moneda

**Configuraciones privadas** (`is_public = false`):

- Solo admins pueden leer y modificar
- Ejemplo: tasas de impuesto, umbrales de stock

---

## Implementación en la Aplicación

### Verificar Rol del Usuario

```typescript
import { supabase } from "@/lib/supabaseClient";

// Obtener usuario actual
const {
  data: { user },
} = await supabase.auth.getUser();

// Obtener información del usuario con rol
const { data: userData } = await supabase
  .from("users")
  .select("*")
  .eq("auth_user_id", user.id)
  .single();

console.log(userData.role); // 'admin' o 'worker'
```

### Proteger Rutas en React

```typescript
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Uso
<Route
  path="/settings"
  element={
    <AdminRoute>
      <Settings />
    </AdminRoute>
  }
/>;
```

### Ocultar Elementos de UI

```typescript
const { user } = useAuth();

return (
  <div>
    {/* Visible para todos */}
    <Button onClick={handleSale}>Procesar Venta</Button>

    {/* Solo visible para admins */}
    {user.role === "admin" && <Button onClick={handleDelete}>Eliminar</Button>}
  </div>
);
```

---

## Resumen de Restricciones

| Acción                       | Admin | Worker |
| ---------------------------- | ----- | ------ |
| Ver datos                    | ✅    | ✅     |
| Crear productos/servicios    | ✅    | ✅     |
| Editar productos/servicios   | ✅    | ❌     |
| Eliminar productos/servicios | ✅    | ❌     |
| Registrar entradas           | ✅    | ✅     |
| Procesar ventas              | ✅    | ✅     |
| Gestionar pedidos            | ✅    | ✅     |
| Editar ventas                | ✅    | ❌     |
| Eliminar registros           | ✅    | ❌     |
| Gestionar usuarios           | ✅    | ❌     |
| Configurar sistema           | ✅    | ❌     |
| Ver audit log                | ✅    | ❌     |

---

## Seguridad

✅ **Row Level Security (RLS)** habilitado en todas las tablas  
✅ **Políticas automáticas** basadas en roles  
✅ **Funciones seguras** con `SECURITY DEFINER`  
✅ **Audit log** para trazabilidad  
✅ **Validaciones** a nivel de base de datos  
✅ **Protección contra** SQL injection (Supabase)

---

## Próximos Pasos

1. ✅ Ejecutar el schema SQL actualizado en Supabase
2. ⏳ Crear el primer usuario administrador
3. ⏳ Implementar AuthContext en React
4. ⏳ Proteger rutas según rol
5. ⏳ Actualizar UI para mostrar/ocultar según permisos
6. ⏳ Implementar página de gestión de usuarios (solo admin)
