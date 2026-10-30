# SUKITEX — Sistema de Cotizaciones B2B de Confección Textil

Aplicación estática construida con **Astro + React + Tailwind CSS** diseñada para **SUKITEX** (confección de prendas de vestir corporativas, uniformes e indumentaria industrial B2B).

## Características Principales

- **Estructura Jerárquica Producto Padre + Sub-filas de Variantes y Tallas**:
  - Cada prenda agrupa su **Ficha Técnica Textil** (Tela, Gramaje, Composición, Colores, Costura/Acabados) y foto/boceto referencial.
  - Sub-filas por cada combinación de **Variante de Personalización** (ej. 1 bordado en pecho, doble bordado pecho + espalda, estampado DTF/serigrafía) y **Tallas** (`S - M - L`, tallas especiales `XL`, `XXL`, o **Curva de Tallas** interactiva que suma las cantidades automáticamente).
- **Doble Modalidad de Cotización**:
  - **Con Cantidades y Totales**: Calcula subtotales por variante, subtotal por prenda, descuentos, IGV (18% configurable: *Precios + IGV*, *Incluye IGV*, o *Sin IGV*), monto total en letras (`SON: ... SOLES`) y cronograma de adelanto/contra entrega.
  - **Modo Tarifario / Lista de Precios por Talla**: Presenta los precios unitarios por talla y variante de acabado con su escala o mínimo de producción sugerido (MOQ), sin obligar a fijar una suma total.
- **2 Temas Visuales Intercambiables en 1 Clic**:
  - **Corporativo SUKITEX**: Cabecera verde bosque (`#1F261E`) con acentos en dorado (`#EBA552`) y crema (`#F8F5F1`).
  - **Impresión Limpia (Eco-Print)**: Diseño ejecutivo sobre fondo blanco optimizado para impresoras de oficina.
- **Exportación Directa**:
  - **Descargar PDF (`.pdf`)** en formato A4.
  - **Descargar Imagen HD (`.png`)** en alta resolución lista para enviar por WhatsApp Business.
  - **Impresión Nativa Vectorial (`Ctrl + P`)**.
- **Catálogo B2B de Prendas, Clientes Frecuentes e Historial Local**:
  - 8 plantillas textiles B2B precargadas + guardado de plantillas propias, clientes frecuentes, historial de cotizaciones y exportación/importación `.json`.

## Comandos de Desarrollo

```bash
npm install
npm run dev
npm run build
```
