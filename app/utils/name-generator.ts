export default class NameGenerator {
  static generateName(prototype: string, type: string): string {
    return type.substring(0, 1).toUpperCase() + type.substring(1);
  }
}
