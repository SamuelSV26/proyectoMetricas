# Automatización de Métricas Web Institucionales - UAM

Evaluación automática del rendimiento de páginas institucionales de la UAM con **Cypress** y **Lighthouse**, guardando el historial en JSON y enviando el informe clasificado a **Google Sheets** mediante `google-spreadsheet` y `google-auth-library`.

## 1. Integrantes y Páginas

| Integrante | Página | URL |
| :--- | :--- | :--- |
| **Samuel Sanchez** | Donaciones | `https://intrauam.autonoma.edu.co/ponline/pagosEnLinea/donaciones/donar` |
| **Santiago Cotrini** | Graduados | `https://www.autonoma.edu.co/graduados` |

## 2. Estructura

- `config/pages.js`: Páginas institucionales a evaluar.
- `config/devices.js`: Perfiles de emulación (`mobile` y `desktop`).
- `config/thresholds.js`: Umbrales únicos (`Bueno`, `Por mejorar`, `Deficiente`).
- `config/schedule.js`: Programación independiente de jobs para móvil y escritorio.
- `cypress/e2e/lighthouse.cy.js`: Prueba dinámica con Cypress + Lighthouse.
- `cypress/fixtures/lighthouse-metrics.json`: Historial acumulativo de métricas (en ms).
- `scripts/saveMetrics.js`: Normalización de métricas y registro de errores en el JSON.
- `scripts/sync-to-sheets.js`: Envío y coloreado automático en Google Sheets (en segundos).
- `scheduler.js`: Ejecución programada con `node-cron` en zona horaria `America/Bogota`.

## 3. Instalación y Configuración de Google Sheets

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar Google Cloud Service Account:
   - En [Google Cloud Console](https://console.cloud.google.com/), crear un proyecto y habilitar **Google Sheets API**.
   - Ir a **Credenciales → Crear credenciales → Cuenta de servicio**, entrar a la pestaña **Claves → Agregar clave → JSON**.
   - Guardar el archivo descargado en la raíz del proyecto con el nombre `credentials.json`.
   - Compartir tu hoja de Google Sheets (como **Editor**) con el correo `client_email` que aparece dentro de `credentials.json`.
3. Copiar el ID de tu hoja de Google Sheets (la cadena entre `/d/` y `/edit` en la URL) dentro del archivo `.env`:
   ```env
   GOOGLE_SHEET_ID=tu_id_de_hoja_aqui
   ```

## 4. Comandos de Ejecución

```bash
npm run cypress:run          # Ejecuta todas las páginas en móvil y escritorio y actualiza Sheets
npm run cypress:run:mobile   # Ejecuta solo perfil móvil y actualiza Sheets
npm run cypress:run:desktop  # Ejecuta solo perfil escritorio y actualiza Sheets
npm run cypress:open         # Abre la interfaz de Cypress
npm run sync:sheets          # Sincroniza manualmente el JSON actual con Google Sheets
npm run scheduler            # Inicia el scheduler activo según config/schedule.js
npm run scheduler:now        # Ejecuta de inmediato los jobs habilitados en config/schedule.js
```

## 5. Estrategia del Scheduler

- Se inicia con `npm run scheduler` y puede mantenerse activo en una terminal dedicada o en segundo plano con PM2 (`npx pm2 start scheduler.js`).
- Usa zona horaria `America/Bogota` en `node-cron` e implementa una cola secuencial para evitar colisiones entre ejecuciones de Chrome. (Si se usara un servicio externo como GitHub Actions, los cron trabajan en UTC y pueden presentar retrasos).

## 6. Análisis de Resultados y Recomendaciones

- **Mejor rendimiento:** **Donaciones (Móvil)** con **94–96 pts** (`Bueno`), tiempos rápidos de `FCP (~2.0 s)` y `LCP (~2.5 s)`.
- **Peor rendimiento:** **Graduados (Escritorio)** con **26–40 pts** (`Deficiente`), penalizado por `FCP (~5.0 s)` y `LCP (~6.7 s)`.
- **Diferencias entre dispositivos:** El viewport de escritorio (`1350x940`) descarga imágenes/banners de mayor peso en el portal institucional frente a la vista móvil compacta.
- **Recomendaciones:** Comprimir imágenes principales a WebP/AVIF, aplicar `preload` al elemento LCP y diferir CSS/JS que bloquea el renderizado inicial.
