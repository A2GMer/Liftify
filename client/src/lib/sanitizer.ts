import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onclick', 'onload', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
  });
}

/**
 * Sanitize text input to prevent XSS attacks
 * @param text - The text to sanitize
 * @returns Sanitized text string
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate and sanitize workout data
 * @param data - The workout data to validate
 * @returns Sanitized workout data
 */
export function validateWorkoutData(data: any): any {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid workout data');
  }

  const sanitized = {
    workout: {
      date: data.workout?.date || '',
      time: data.workout?.time || '',
      notes: data.workout?.notes ? sanitizeText(data.workout.notes) : '',
      overallRating: Math.max(1, Math.min(10, parseInt(data.workout?.overallRating) || 5)),
      allOutFeeling: Math.max(1, Math.min(10, parseInt(data.workout?.allOutFeeling) || 5)),
    },
    sets: Array.isArray(data.sets) ? data.sets.map((set: any) => ({
      setNumber: Math.max(1, parseInt(set.setNumber) || 1),
      weight: Math.max(0, Math.min(1000, parseFloat(set.weight) || 0)),
      reps: Math.max(1, Math.min(100, parseInt(set.reps) || 1)),
      powerBelt: Boolean(set.powerBelt),
      buttUp: Boolean(set.buttUp),
      assistance: Boolean(set.assistance),
      failed: Boolean(set.failed),
      isCheatingSet: Boolean(set.isCheatingSet),
      formFocused: Boolean(set.formFocused),
      repFocused: Boolean(set.repFocused),
      notes: set.notes ? sanitizeText(set.notes) : '',
    })) : [],
  };

  // Validation checks
  if (!sanitized.workout.date || !sanitized.workout.time) {
    throw new Error('Date and time are required');
  }

  if (sanitized.sets.length === 0) {
    throw new Error('At least one set is required');
  }

  return sanitized;
}

/**
 * Validate URL parameters to prevent injection
 * @param param - The parameter to validate
 * @returns Validated parameter
 */
export function validateUrlParam(param: string): string {
  return param.replace(/[^a-zA-Z0-9\-_]/g, '');
}

/**
 * Validate numeric input
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated numeric value
 */
export function validateNumber(value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error('Invalid number');
  }
  return Math.max(min, Math.min(max, num));
}