# 🚀 Guía Completa de Migración a Supabase

Esta guía te llevará paso a paso para migrar tu aplicación **Autolavado Gochi** a Supabase.

---

## 📋 Tabla de Contenidos

1. [Crear Cuenta y Proyecto en Supabase](#1-crear-cuenta-y-proyecto-en-supabase)
2. [Configurar la Base de Datos](#2-configurar-la-base-de-datos)
3. [Obtener Credenciales](#3-obtener-credenciales)
4. [Configurar Variables de Entorno](#4-configurar-variables-de-entorno)
5. [Verificar la Instalación](#5-verificar-la-instalación)
6. [Configurar Autenticación](#6-configurar-autenticación)
7. [Registrar Usuario Administrador](#7-registrar-usuario-administrador)
8. [Probar la Conexión](#8-probar-la-conexión)
9. [Migrar Datos Existentes (Opcional)](#9-migrar-datos-existentes-opcional)
10. [Solución de Problemas](#10-solución-de-problemas)

---

## 1. Crear Cuenta y Proyecto en Supabase

### Paso 1.1: Crear Cuenta

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"** o **"Sign Up"**
3. Puedes registrarte con:
   - GitHub (recomendado)
   - Google
   - Email

### Paso 1.2: Crear Nuevo Proyecto

1. Una vez dentro del dashboard, haz clic en **"New Project"**
2. Completa los siguientes campos:

   - **Name:** `autolavado-gochi` (o el nombre que prefieras)
   - **Database Password:** Crea una contraseña segura (¡guárdala en un lugar seguro!)
   - **Region:** Selecciona la región más cercana a Venezuela (ej: `South America (São Paulo)`)
   - **Pricing Plan:** Selecciona **"Free"** para empezar

3. Haz clic en **"Create new project"**
4. Espera 2-3 minutos mientras Supabase configura tu proyecto

---

## 2. Configurar la Base de Datos

### Paso 2.1: Abrir SQL Editor

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"** (botón verde en la esquina superior derecha)

### Paso 2.2: Ejecutar el Schema SQL

1. Abre el archivo `supabase-schema.sql` de tu proyecto
2. Copia **TODO** el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **"Run"** (botón verde en la esquina inferior derecha)

> ⏱️ **Tiempo estimado:** 5-10 segundos

### Paso 2.3: Verificar que se Crearon las Tablas

1. En el menú lateral, haz clic en **"Table Editor"**
2. Deberías ver las siguientes tablas:

   - ✅ `usuarios`
   - ✅ `productos`
   - ✅ `movimientos`
   - ✅ `clientes`
   - ✅ `ventas`
   - ✅ `servicios`
   - ✅ `pedidos`
   - ✅ `configuracion_sistema`
   - ✅ `registro_auditoria`

3. Haz clic en cualquier tabla para ver su estructura y datos iniciales

---

## 3. Obtener Credenciales

### Paso 3.1: Ir a Project Settings

1. En el menú lateral, haz clic en el ícono de **engranaje** (⚙️) o **"Project Settings"**
2. En el menú de configuración, selecciona **"API"**

### Paso 3.2: Copiar Credenciales

Necesitarás copiar dos valores importantes:

**1. Project URL:**

```
https://tu-proyecto-id.supabase.co
```

**2. API Key (anon/public):**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **IMPORTANTE:**
>
> - Usa la clave **`anon`** o **`public`** (NO uses la clave `service_role` en el frontend)
> - La clave `anon` es segura para usar en el cliente porque las políticas RLS protegen tus datos

---

## 4. Configurar Variables de Entorno

### Paso 4.1: Crear Archivo .env

1. En la raíz de tu proyecto, crea un archivo llamado `.env.local`
2. Agrega las siguientes variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 📝 **Nota:** Reemplaza los valores con tus credenciales reales de Supabase

### Paso 4.2: Verificar .gitignore

Asegúrate de que tu archivo `.gitignore` incluya:

```gitignore
# Variables de entorno
.env
.env.local
.env.production
```

Esto evitará que tus credenciales se suban a GitHub.

### Paso 4.3: Reiniciar el Servidor de Desarrollo

```bash
# Detén el servidor actual (Ctrl + C)
# Luego reinicia:
npm run dev
```

---

## 5. Verificar la Instalación

### Paso 5.1: Verificar Cliente de Supabase

Tu proyecto ya tiene configurado el cliente de Supabase en:

```
src/lib/supabaseClient.ts
```

Verifica que el archivo contenga:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Paso 5.2: Probar Conexión Básica

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Esto debería mostrar tus productos de ejemplo
const { data, error } = await window.supabase.from("productos").select("*");
console.log(data, error);
```

Si ves los productos, ¡la conexión funciona! ✅

---

## 6. Configurar Autenticación

### Paso 6.1: Configurar Proveedores de Autenticación

1. Ve a **Authentication** → **Providers** en el menú lateral
2. Asegúrate de que **Email** esté habilitado
3. Configura las siguientes opciones:
   - **Enable email confirmations:** Desactivado (para desarrollo)
   - **Enable email autoconfirm:** Activado (para desarrollo)

> 🔒 **Para producción:** Activa las confirmaciones por email

### Paso 6.2: Configurar URLs de Redirección

1. Ve a **Authentication** → **URL Configuration**
2. Agrega las siguientes URLs:
   - **Site URL:** `http://localhost:5173` (para desarrollo)
   - **Redirect URLs:**
     - `http://localhost:5173/**`
     - `https://tu-dominio.com/**` (cuando despliegues)

---

## 7. Registrar Usuario Administrador

### Opción A: Registro desde la Aplicación (Recomendado)

1. Abre tu aplicación en el navegador
2. Ve a la página de registro/login
3. Regístrate con el email: `julianherrera.dev@gmail.com`
4. Crea una contraseña segura

### Opción B: Crear Usuario desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Haz clic en **"Add user"** → **"Create new user"**
3. Completa:
   - **Email:** `julianherrera.dev@gmail.com`
   - **Password:** (crea una contraseña)
   - **Auto Confirm User:** ✅ Activado
4. Haz clic en **"Create user"**

### Paso 7.2: Vincular Usuario con Tabla `usuarios`

Después de crear el usuario en Auth:

1. Ve a **Authentication** → **Users**
2. Haz clic en el usuario que acabas de crear
3. Copia el **UUID** (algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

4. Ve a **SQL Editor** y ejecuta:

```sql
-- Actualizar el usuario administrador con el UUID real
UPDATE usuarios
SET auth_user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'  -- Reemplaza con tu UUID
WHERE email = 'julianherrera.dev@gmail.com';
```

5. Verifica que se actualizó correctamente:

```sql
SELECT * FROM usuarios WHERE email = 'julianherrera.dev@gmail.com';
```

---

## 8. Probar la Conexión

### Paso 8.1: Iniciar Sesión

1. Abre tu aplicación
2. Inicia sesión con:
   - **Email:** `julianherrera.dev@gmail.com`
   - **Contraseña:** (la que creaste)

### Paso 8.2: Verificar Permisos de Administrador

Prueba las siguientes acciones para verificar que tienes permisos de admin:

- ✅ Ver todos los productos
- ✅ Crear un nuevo producto
- ✅ Editar un producto
- ✅ Eliminar un producto
- ✅ Ver movimientos de inventario
- ✅ Registrar una venta en el POS
- ✅ Ver configuración del sistema

### Paso 8.3: Verificar Datos Iniciales

Verifica que se cargaron los datos de ejemplo:

**Productos:**

- Cera Premium
- Shampoo Automotriz
- Microfibra Premium
- Aromatizante

**Servicios:**

- Lavado Express
- Lavado Completo
- Encerado Premium
- Pulido

---

## 9. Migrar Datos Existentes (Opcional)

Si tienes datos en localStorage que quieres migrar a Supabase:

### Paso 9.1: Exportar Datos de localStorage

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Exportar productos
const productos = JSON.parse(localStorage.getItem("products") || "[]");
console.log(JSON.stringify(productos, null, 2));

// Exportar clientes
const clientes = JSON.parse(localStorage.getItem("customers") || "[]");
console.log(JSON.stringify(clientes, null, 2));

// Exportar ventas
const ventas = JSON.parse(localStorage.getItem("sales") || "[]");
console.log(JSON.stringify(ventas, null, 2));
```

### Paso 9.2: Importar a Supabase

1. Copia los datos exportados
2. Ve a **Table Editor** en Supabase
3. Selecciona la tabla correspondiente
4. Haz clic en **"Insert"** → **"Insert row"**
5. Pega los datos y ajusta los nombres de campos según el nuevo esquema en español

> 💡 **Tip:** Para grandes cantidades de datos, es mejor crear un script SQL de migración

---

## 10. Solución de Problemas

### ❌ Error: "Invalid API key"

**Solución:**

1. Verifica que copiaste la clave `anon` correcta
2. Asegúrate de que no hay espacios extra en el `.env.local`
3. Reinicia el servidor de desarrollo

### ❌ Error: "Failed to fetch"

**Solución:**

1. Verifica que la URL del proyecto sea correcta
2. Verifica tu conexión a internet
3. Revisa que el proyecto de Supabase esté activo (no pausado)

### ❌ Error: "Row Level Security policy violation"

**Solución:**

1. Verifica que el usuario esté autenticado
2. Verifica que el usuario tenga el rol correcto en la tabla `usuarios`
3. Revisa las políticas RLS en **Authentication** → **Policies**

### ❌ No puedo ver los datos

**Solución:**

1. Verifica que ejecutaste el schema SQL completo
2. Ve a **Table Editor** y verifica que las tablas tengan datos
3. Verifica que las políticas RLS permitan lectura

### ❌ Error: "relation 'users' does not exist"

**Solución:**

- El código está usando nombres de tablas en inglés
- Necesitas actualizar el código para usar los nombres en español
- O volver a ejecutar el schema SQL antiguo en inglés

---

## 🎉 ¡Migración Completada!

Si llegaste hasta aquí, tu aplicación ya está conectada a Supabase. Ahora puedes:

- ✅ Acceder a tus datos desde cualquier dispositivo
- ✅ Tener backups automáticos
- ✅ Escalar tu aplicación fácilmente
- ✅ Usar autenticación segura
- ✅ Implementar Row Level Security

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Comunidad de Supabase](https://github.com/supabase/supabase/discussions)

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas durante la migración:

1. Revisa la sección de **Solución de Problemas** arriba
2. Consulta los logs en la consola del navegador (F12)
3. Revisa los logs de Supabase en **Logs** → **Database**
4. Contacta al soporte de Supabase o busca en su comunidad

---

**¡Buena suerte con tu migración! 🚀**
