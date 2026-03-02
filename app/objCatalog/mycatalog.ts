"use client";

import { Catalog } from "../../lib/catalog";
import * as Areas from "./area";
import * as Lines from "./lines";
import * as Holes from "./holes";
import * as Items from "./items";

let catalog = new Catalog();

for (let x in Areas) catalog.registerElement((Areas as any)[x]);
for (let x in Lines) catalog.registerElement((Lines as any)[x]);
for (let x in Holes) catalog.registerElement((Holes as any)[x]);
for (let x in Items) catalog.registerElement((Items as any)[x]);

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
