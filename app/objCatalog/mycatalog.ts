"use client";

import * as Areas from "./area";
import * as Lines from "./lines";
import * as Holes from "./holes";
import * as Items from "./items";
import Catalog from "../catalog/catalog";

let catalog = new Catalog();

for (let x in Areas) catalog.registerElement(Areas[x]);
for (let x in Lines) catalog.registerElement(Lines[x]);
for (let x in Holes) catalog.registerElement(Holes[x]);
for (let x in Items) catalog.registerElement(Items[x]);

catalog.registerCategory("windows", "Windows", [
  Holes.window,
  Holes.sashWindow,
  Holes.venetianBlindWindow,
  Holes.windowCurtain,
]);
catalog.registerCategory("doors", "Doors", [
  Holes.door,
  Holes.doorDouble,
  Holes.panicDoor,
  Holes.panicDoorDouble,
  Holes.slidingDoor,
]);

export default catalog;
