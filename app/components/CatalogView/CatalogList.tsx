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
          placeholder="Search elements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
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
                className="px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {element.info.title || element.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {isSearching ? (
        matchedElements.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
            {matchedElements.map((elem) => (
              <CatalogItem
                key={elem.name}
                element={elem}
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
          {catalogState.path.length > 0 && <CatalogTurnBackPageItem />}
          {categoriesToDisplay.map((cat) => (
            <CatalogPageItem
              key={cat.name}
              page={cat}
              oldPage={currentCategory}
            />
          ))}
          {elementsToDisplay.map((elem) => (
            <CatalogItem
              key={elem.name}
              element={elem}
              onSelect={handleElementSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogList;
