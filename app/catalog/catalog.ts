import {
  PropertyColor,
  PropertyEnum,
  PropertyString,
  PropertyNumber,
  PropertyLengthMeasure,
  PropertyToggle,
  PropertyCheckbox,
  PropertyHidden,
  PropertyReadOnly,
} from "./properties/export";

import { UNIT_CENTIMETER } from "../utils/constants";

interface PropertyConfig {
  type: string;
  defaultValue: any;
  [key: string]: any;
}

interface ElementInfo {
  tag: string;
  description: string;
  image: string;
  [key: string]: any;
}

interface Element {
  name: string;
  prototype: string;
  info: ElementInfo;
  properties: { [key: string]: PropertyConfig };
  render2D: (element: any, layer: any, scene: any) => React.ReactElement;
  render3D: (element: any, layer: any, scene: any) => Promise<any>;
  [key: string]: any;
}

interface Category {
  name: string;
  label: string;
  elements: Element[];
  categories: Category[];
}

interface PropertyType {
  type: string;
  Viewer: React.ComponentType<any>;
  Editor: React.ComponentType<any>;
}

interface Categories {
  [key: string]: Category;
}

interface Elements {
  [key: string]: Element;
}

interface PropertyTypes {
  [key: string]: PropertyType;
}

export default class Catalog {
  private elements: Elements;
  private categories: Categories;
  private propertyTypes: PropertyTypes;
  readonly unit: string;

  constructor(unit: string = UNIT_CENTIMETER) {
    this.elements = {};
    this.categories = {
      root: { name: "root", label: "/", elements: [], categories: [] },
    };
    this.propertyTypes = {};
    this.unit = unit;

    this.registerMultiplePropertyType([
      ["color", PropertyColor, PropertyColor],
      ["enum", PropertyEnum, PropertyEnum],
      ["string", PropertyString, PropertyString],
      ["number", PropertyNumber, PropertyNumber],
      ["length-measure", PropertyLengthMeasure, PropertyLengthMeasure],
      ["toggle", PropertyToggle, PropertyToggle],
      ["checkbox", PropertyCheckbox, PropertyCheckbox],
      ["hidden", PropertyHidden, PropertyHidden],
      ["read-only", PropertyReadOnly, PropertyReadOnly],
    ]);
  }

  getElement(type: string): Element {
    if (this.hasElement(type)) {
      return this.elements[type];
    }
    throw new Error(`Element ${type} does not exist in catalog`);
  }

  getCategory(categoryName: string): Category {
    if (this.hasCategory(categoryName)) {
      return this.categories[categoryName];
    }
    throw new Error(`Category ${categoryName} does not exist in catalog`);
  }

  getPropertyType(type: string): PropertyType {
    if (this.propertyTypes.hasOwnProperty(type)) {
      return this.propertyTypes[type];
    }
    throw new Error(`Element ${type} does not exist in catalog`);
  }

  registerElement(json: Element): void {
    json.properties = json.properties || {};
    if (this.validateElement(json)) {
      this.elements[json.name] = json;
      this.categories.root.elements.push(this.elements[json.name]);
    }
  }

  registerMultipleElements(elementArray: Element[]): void {
    elementArray.forEach((el) => this.registerElement(el));
  }

  registerPropertyType(
    type: string,
    Viewer: React.ComponentType<any>,
    Editor: React.ComponentType<any>
  ): void {
    this.propertyTypes[type] = { type, Viewer, Editor };
  }

  registerMultiplePropertyType(
    propertyTypeArray: [
      string,
      React.ComponentType<any>,
      React.ComponentType<any>
    ][]
  ): void {
    propertyTypeArray.forEach((el) => this.registerPropertyType(...el));
  }

  private validateElement(json: Element): boolean {
    if (!json.hasOwnProperty("name")) throw new Error("Element not valid");

    const name = json.name;
    if (!json.hasOwnProperty("prototype"))
      throw new Error(`Element ${name} doesn't have prototype`);

    if (!json.hasOwnProperty("info"))
      throw new Error(`Element ${name} doesn't have info`);
    if (!json.info.hasOwnProperty("tag"))
      throw new Error(`Element ${name} doesn't have tag`);
    if (!json.info.hasOwnProperty("description"))
      throw new Error(`Element ${name} doesn't have description`);
    if (!json.info.hasOwnProperty("image"))
      throw new Error(`Element ${name} doesn't have image`);

    if (!json.hasOwnProperty("render2D"))
      throw new Error(`Element ${name} doesn't have render2D handler`);
    if (!json.hasOwnProperty("render3D"))
      throw new Error(`Element ${name} doesn't have render3D handler`);
    if (!json.hasOwnProperty("properties"))
      throw new Error(`Element ${name} doesn't have properties`);

    for (const propertyName in json.properties) {
      const propertyConfigs = json.properties[propertyName];
      if (!propertyConfigs.hasOwnProperty("type"))
        throw new Error(
          `Element ${name}, Property ${propertyName} doesn't have type`
        );
      if (!propertyConfigs.hasOwnProperty("defaultValue"))
        throw new Error(
          `Element ${name}, Property ${propertyName} doesn't have defaultValue`
        );
    }

    return true;
  }

  hasElement(type: string): boolean {
    return this.elements.hasOwnProperty(type);
  }

  registerCategory(
    name: string,
    label: string,
    childs?: Element[]
  ): Category | null {
    if (this.validateCategory(name, label)) {
      this.categories[name] = { name, label, categories: [], elements: [] };
      this.categories.root.categories.push(this.categories[name]);

      if (childs && childs.length) {
        childs.forEach((el) => this.addToCategory(name, el));
      }

      return this.categories[name];
    }
    return null;
  }

  addToCategory(name: string, child: Element | Category): void {
    if (this.hasElement(child.name)) {
      this.categories[name].elements.push(child as Element);
      this.categories.root.elements.splice(
        this.categories.root.elements.indexOf(child as Element),
        1
      );
    } else if (this.hasCategory(child.name)) {
      this.categories[name].categories.push(child as Category);
      this.categories.root.categories.splice(
        this.categories.root.categories.indexOf(child as Category),
        1
      );
    } else {
      throw new Error(`child ${child.name} is neither category nor element`);
    }
  }

  categoryHasElement(categoryName: string, elementName: string): boolean {
    return (
      this.hasCategory(categoryName) &&
      this.categories[categoryName].elements.some(
        (el) => el.name === elementName
      )
    );
  }

  private validateCategory(name: string, label: string): boolean {
    if (!name) {
      throw new Error("Category has undefined name");
    }
    if (name === "") {
      throw new Error("Category has empty name");
    }
    if (this.hasCategory(name)) {
      throw new Error("Category has already been registered");
    }

    return true;
  }

  hasCategory(categoryName: string): boolean {
    return this.categories.hasOwnProperty(categoryName);
  }
}
