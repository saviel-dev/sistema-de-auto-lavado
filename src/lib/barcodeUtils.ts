/**
 * Barcode Utilities
 * Functions for validating, formatting, and generating barcode data
 */

/**
 * Validates if a barcode string is valid
 * Now accepts ANY non-empty string to support all barcode formats:
 * - Standard formats: EAN-13, UPC-A, EAN-8, UPC-E, Code 39, Code 128
 * - 2D codes: QR codes, Data Matrix, PDF417
 * - Custom/proprietary formats
 * - Alphanumeric codes
 */
export function validateBarcode(code: string): boolean {
  if (!code) return false;

  // Remove leading/trailing whitespace
  const trimmedCode = code.trim();

  // Accept any non-empty string (minimum 1 character)
  // This allows for maximum flexibility with different barcode types
  return trimmedCode.length > 0;
}

/**
 * Validates the check digit of an EAN or UPC barcode
 */
function validateCheckDigit(code: string): boolean {
  const digits = code.split("").map(Number);
  const checkDigit = digits.pop()!;

  let sum = 0;
  digits.forEach((digit, index) => {
    // For EAN-13: multiply odd positions by 1, even by 3 (from right to left)
    // For UPC-A: multiply odd positions by 3, even by 1 (from right to left)
    const isEAN13 = code.length === 13;
    const multiplier =
      (digits.length - index) % 2 === (isEAN13 ? 1 : 0) ? 1 : 3;
    sum += digit * multiplier;
  });

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return calculatedCheckDigit === checkDigit;
}

/**
 * Calculates the check digit for a barcode
 */
export function calculateCheckDigit(code: string): string {
  const cleanCode = code.replace(/[\s-]/g, "");
  const digits = cleanCode.split("").map(Number);

  let sum = 0;
  const isEAN13 = cleanCode.length === 12; // Will become EAN-13

  digits.forEach((digit, index) => {
    const multiplier =
      (digits.length - index) % 2 === (isEAN13 ? 0 : 1) ? 1 : 3;
    sum += digit * multiplier;
  });

  const checkDigit = (10 - (sum % 10)) % 10;
  return cleanCode + checkDigit;
}

/**
 * Formats a barcode for display (adds spaces for readability)
 * Handles standard formats and returns custom formats as-is
 */
export function formatBarcode(code: string): string {
  const cleanCode = code.replace(/[\s-]/g, "");
  const isNumeric = /^\d+$/.test(cleanCode);

  // Only format standard numeric barcodes
  if (isNumeric) {
    // Format EAN-13: XXX XXXX XXXX X
    if (cleanCode.length === 13) {
      return cleanCode.replace(/(\d{3})(\d{4})(\d{5})(\d{1})/, "$1 $2 $3 $4");
    }

    // Format UPC-A: X XXXXX XXXXX X
    if (cleanCode.length === 12) {
      return cleanCode.replace(/(\d{1})(\d{5})(\d{5})(\d{1})/, "$1 $2 $3 $4");
    }

    // Format EAN-8: XXXX XXXX
    if (cleanCode.length === 8) {
      return cleanCode.replace(/(\d{4})(\d{4})/, "$1 $2");
    }
  }

  // Return custom/alphanumeric codes as-is (trimmed)
  return code.trim();
}

/**
 * Generates test barcodes for development and testing
 */
export function generateTestBarcodes(): Array<{
  code: string;
  name: string;
  type: string;
}> {
  return [
    { code: "7501234567890", name: "Cera Premium", type: "EAN-13" },
    { code: "7501234567906", name: "Shampoo Automotriz", type: "EAN-13" },
    { code: "7501234567913", name: "Microfibra Premium", type: "EAN-13" },
    { code: "7501234567920", name: "Pulidor de Llantas", type: "EAN-13" },
    { code: "7501234567937", name: "Aromatizante", type: "EAN-13" },
    { code: "012345678905", name: "Limpiador de Vidrios", type: "UPC-A" },
    { code: "012345678912", name: "Cepillo de Lavado", type: "UPC-A" },
    { code: "012345678929", name: "Aspiradora Portátil", type: "UPC-A" },
  ];
}

/**
 * Normalizes a barcode (removes spaces, converts to uppercase)
 */
export function normalizeBarcode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}

/**
 * Detects the barcode type based on length and format
 * Now supports detection of multiple barcode types
 */
export function detectBarcodeType(code: string): string {
  const cleanCode = code.replace(/[\s-]/g, "");
  const isNumeric = /^\d+$/.test(cleanCode);
  const isAlphanumeric = /^[A-Z0-9]+$/i.test(cleanCode);

  // Standard numeric barcodes
  if (isNumeric) {
    switch (cleanCode.length) {
      case 13:
        return "EAN-13";
      case 12:
        return "UPC-A";
      case 8:
        return "EAN-8";
      case 6:
      case 7:
        return "UPC-E";
      default:
        return cleanCode.length > 13 ? "Código Numérico Largo" : "Código Numérico";
    }
  }

  // Alphanumeric codes (Code 39, Code 128, etc.)
  if (isAlphanumeric) {
    return "Código Alfanumérico";
  }

  // Special characters (QR, Data Matrix, etc.)
  return "Código Personalizado";
}
