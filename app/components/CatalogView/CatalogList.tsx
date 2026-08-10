"use client";

import { useState, useMemo } from "react";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { usePlannerStore } from "../../store";
import CatalogItem from "./CatalogItem";
import CatalogBreadcrumb from "./CatalogBreadcrumb";
import CatalogPageItem from "./CatalogPageItem";
import CatalogTurnBackPageItem from "./CatalogTurnBackPageItem";
import { Input } from "@/components/ui/input";
import { Search, PackageOpen } from "lucide-react";
import type { CatalogElement, CatalogCategory } from "../../store/types";

interface BreadcrumbItem {
  name: string;
  action: () => void;
}

interface CatalogListProps {
  onClose?: () => void;
}

function flattenCategories(categories: CatalogCategory[]): CatalogElement[] {
  return categories.reduce((acc: CatalogElement[], curr: CatalogCategory) => {
    return [...acc, ...curr.elements, ...flattenCategories(curr.categories)];
  }, []);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Dense grid shared by folders, sections and search results: ~8 columns
 *  in the 64rem dialog with the compact 96px thumbnails. */
const GRID_CLASS =
  "grid grid-cols-[repeat(auto-fill,minmax(6.75rem,1fr))] gap-2";

/** Display order of catalog sections (derived from element tags). */
const SECTION_ORDER = [
  "Walls & Structure",
  "Doors & Openings",
  "Windows",
  "Stairs",
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Living Room",
  "Office",
  "Decor",
  "Other",
];

const ROOM_TAG_TO_SECTION: Record<string, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  bedroom: "Bedroom",
  living: "Living Room",
  office: "Office",
  decor: "Decor",
  stair: "Stairs",
  structure: "Walls & Structure",
};

/** Map an element to its section using prototype + info.tag. Room-tagged
 *  items use their first (primary) room tag; untagged ones land in Other. */
function sectionFor(element: CatalogElement): string {
  const rawTag = element.info.tag;
  const tags = (Array.isArray(rawTag) ? rawTag : rawTag ? [rawTag] : []).map(
    (t: string) => t.toLowerCase()
  );
  if (element.prototype === "lines" || tags.includes("wall"))
    return "Walls & Structure";
  if (element.prototype === "holes") {
    return tags.some((t) => t === "window" || t === "finestre")
      ? "Windows"
      : "Doors & Openings";
  }
  for (const tag of tags) {
    const section = ROOM_TAG_TO_SECTION[tag];
    if (section) return section;
  }
  return "Other";
}

const elementTitle = (element: CatalogElement) =>
  element.info.title || element.name;

const CatalogList: React.FC<CatalogListProps> = ({ onClose }) => {
  const { catalog } = useCatalogContext();

  const catalogState = usePlannerStore((state) => state.catalog);
  const selectedElementsHistory = usePlannerStore(
    (state) => state.selectedElementsHistory
  );

  const selectToolDrawingLine = usePlannerStore(
    (state) => state.selectToolDrawingLine
  );
  const selectToolDrawingItem = usePlannerStore(
    (state) => state.selectToolDrawingItem
  );
  const selectToolDrawingHole = usePlannerStore(
    (state) => state.selectToolDrawingHole
  );
  const goBackToCatalogPage = usePlannerStore(
    (state) => state.goBackToCatalogPage
  );
  const pushLastSelectedCatalogElementToHistory = usePlannerStore(
    (state) => state.pushLastSelectedCatalogElementToHistory
  );

  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = useMemo(() => {
    if (!catalog)
      return { name: "root", label: "/", elements: [], categories: [] };
    return catalog.getCategory(catalogState.page);
  }, [catalog, catalogState.page]);

  const categoriesToDisplay = currentCategory.categories;

  const elementsToDisplay = useMemo(
    () =>
      currentCategory.elements.filter((element) =>
        element.info.visibility ? element.info.visibility.catalog : true
      ),
    [currentCategory.elements]
  );

  // All searchable elements (current + nested categories), memoized
  const allElements = useMemo(
    () => [...elementsToDisplay, ...flattenCategories(categoriesToDisplay)],
    [elementsToDisplay, categoriesToDisplay]
  );

  // Derived search results — no separate state needed
  const matchedElements = useMemo(() => {
    if (!searchQuery) return [];
    const pattern = new RegExp(escapeRegex(searchQuery), "i");
    return allElements.filter((item) => {
      const title = item.info.title || item.name;
      return pattern.test(title);
    });
  }, [searchQuery, allElements]);

  const handleElementSelect = (element: CatalogElement) => {
    switch (element.prototype) {
      case "lines":
        selectToolDrawingLine(element.name);
        break;
      case "items":
        selectToolDrawingItem(element.name);
        break;
      case "holes":
        selectToolDrawingHole(element.name);
        break;
    }

    pushLastSelectedCatalogElementToHistory(element.name);
    onClose?.();
  };

  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    if (catalogState.page === "root" || !catalog) return [];

    const items: BreadcrumbItem[] = catalogState.path.map(
      (pathName: string) => ({
        name: catalog.getCategory(pathName).label,
        action: () => goBackToCatalogPage(),
      })
    );

    items.push({
      name: currentCategory.label,
      action: () => {},
    });

    return items;
  }, [catalogState.page, catalogState.path, catalog, currentCategory.label, goBackToCatalogPage]);

  // Recently used elements
  const historyElements = useMemo(() => {
    if (!catalog || selectedElementsHistory.length === 0) return [];
    return selectedElementsHistory
      .map((name: string) =>
        catalog.hasElement(name) ? catalog.getElement(name) : null
      )
      .filter(Boolean) as CatalogElement[];
  }, [catalog, selectedElementsHistory]);

  const isSearching = searchQuery.length > 0;

  // Group the flat element list into room/purpose sections (alphabetical
  // within each). Falls back to a single flat grid when everything shares
  // one section (e.g. inside the Windows/Doors folders).
  const sections = useMemo(() => {
    const bySection = new Map<string, CatalogElement[]>();
    for (const element of elementsToDisplay) {
      const name = sectionFor(element);
      const bucket = bySection.get(name);
      if (bucket) bucket.push(element);
      else bySection.set(name, [element]);
    }
    for (const bucket of bySection.values()) {
      bucket.sort((a, b) => elementTitle(a).localeCompare(elementTitle(b)));
    }
    return SECTION_ORDER.filter((name) => bySection.has(name)).map((name) => ({
      name,
      elements: bySection.get(name)!,
    }));
  }, [elementsToDisplay]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      {breadcrumbItems.length > 0 && (
        <CatalogBreadcrumb names={breadcrumbItems} />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search walls, doors, furniture..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="h-10 pl-9 bg-muted/40 border-border/60 focus-visible:ring-primary/40"
        />
      </div>

      {/* Recently used */}
      {!isSearching && historyElements.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recently used
          </p>
          <div className="flex flex-wrap gap-2">
            {historyElements.map((element) => (
              <button
                key={element.name}
                onClick={() => handleElementSelect(element)}
                className="px-3 py-1.5 text-xs rounded-full border border-border/60 bg-secondary text-secondary-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              >
                {(element.info.title || element.name).replace(/\b\w/g, (c) =>
                  c.toUpperCase()
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {isSearching ? (
        matchedElements.length > 0 ? (
          <div className={GRID_CLASS}>
            {matchedElements.map((elem) => (
              <CatalogItem
                key={elem.name}
                element={elem}
                showType
                onSelect={handleElementSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <PackageOpen className="size-12 mb-3 opacity-40" />
            <p className="text-sm">
              No elements matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )
      ) : (
        <>
          {(catalogState.path.length > 0 || categoriesToDisplay.length > 0) && (
            <div className={GRID_CLASS}>
              {catalogState.path.length > 0 && <CatalogTurnBackPageItem />}
              {categoriesToDisplay.map((cat) => (
                <CatalogPageItem
                  key={cat.name}
                  page={cat}
                  oldPage={currentCategory}
                />
              ))}
            </div>
          )}
          {sections.length > 1 ? (
            sections.map((section) => (
              <section key={section.name} className="space-y-2">
                <h3 className="sticky top-0 z-10 -mx-1 bg-background/95 px-1 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                  {section.name}
                  <span className="ml-1.5 font-normal text-muted-foreground/60">
                    {section.elements.length}
                  </span>
                </h3>
                <div className={GRID_CLASS}>
                  {section.elements.map((elem) => (
                    <CatalogItem
                      key={elem.name}
                      element={elem}
                      onSelect={handleElementSelect}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className={GRID_CLASS}>
              {(sections[0]?.elements ?? []).map((elem) => (
                <CatalogItem
                  key={elem.name}
                  element={elem}
                  onSelect={handleElementSelect}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CatalogList;
