export default class NameGenerator {
  static generateName( prototype, type ) {
    return type.substring(0, 1).toUpperCase() + type.substring(1);
  }
}
