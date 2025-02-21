export class ValidationUtils {
  static isValidNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  static isValidId(id) {
    return typeof id === 'string' && id.length > 0;
  }

  static isValidType(type, allowedTypes) {
    return allowedTypes.includes(type);
  }

  static validateElement(element) {
    if (!element) return false;
    if (!this.isValidId(element.id)) return false;
    if (!this.isValidType(element.type, Object.values(ElementTypes))) return false;
    return true;
  }
}