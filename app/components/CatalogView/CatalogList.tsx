"use client";

import { useState, useMemo } from "react";
import { useCatalogContext } from "../../context/ReactPlannerContext";
import { usePlannerStore } from "../../store";
import CatalogItem from "./CatalogItem";
import CatalogBreadcrumb from "./CatalogBreadcrumb";
import CatalogPageItem from "./CatalogPageItem";
import CatalogTurnBackPageItem from "./CatalogTurnBackPageItem";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CatalogElement, CatalogCategory } from "../../store/types";

interface BreadcrumbItem {
  name: string;
  action: () => void;
}

interface CatalogListProps {
  onClose?: () => void;
}

// Styles
const ITEMS_GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(14em, 1fr))",
  gridGap: "10px",
  marginTop: "1em",
};

const CatalogList: React.FC<CatalogListProps> = ({ onClose }) => {
  const { catalog } = useCatalogContext();

  // Get state from Zustand
  const catalogState = usePlannerStore((state) => state.catalog);
  const selectedElementsHistory = usePlannerStore((state) => state.selectedElementsHistory);

  // Get actions from Zustand
  const selectToolDrawingLine = usePlannerStore((state) => state.selectToolDrawingLine);
  const selectToolDrawingItem = usePlannerStore((state) => state.selectToolDrawingItem);
  const selectToolDrawingHole = usePlannerStore((state) => state.selectToolDrawingHole);
  const goBackToCatalogPage = usePlannerStore((state) => state.goBackToCatalogPage);
  const changeCatalogPage = usePlannerStore((state) => state.changeCatalogPage);
  const pushLastSelectedCatalogElementToHistory = usePlannerStore(
    (state) => state.pushLastSelectedCatalogElementToHistory
  );

  const currentCategory = useMemo(() => {
    if (!catalog) return { name: 'root', label: '/', elements: [], categories: [] };
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

  const [matchString, setMatchString] = useState("");
  const [matchedElements, setMatchedElements] = useState<CatalogElement[]>([]);

  const flattenCategories = (categories: CatalogCategory[]): CatalogElement[] => {
    return categories.reduce((acc: CatalogElement[], curr: CatalogCategory) => {
      return [...acc, ...curr.elements, ...flattenCategories(curr.categories)];
    }, []);
  };

  const handleSearch = (text: string) => {
    const allElements = [...elementsToDisplay, ...flattenCategories(categoriesToDisplay)];
    let filtered: CatalogElement[] = [];

    if (text) {
      const regexp = new RegExp(text, "i");
      filtered = allElements.filter((item) => {
        const title = item.info.title || item.name;
        return regexp.test(title);
      });
    }

    setMatchString(text);
    setMatchedElements(filtered);
  };

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

  const renderBreadcrumb = () => {
    if (catalogState.page === "root") return null;
    if (!catalog) return null;

    const breadcrumbsItems: BreadcrumbItem[] = [];

    catalogState.path.forEach((pathName: string) => {
      breadcrumbsItems.push({
        name: catalog.getCategory(pathName).label,
        action: () => goBackToCatalogPage(),
      });
    });

    breadcrumbsItems.push({
      name: currentCategory.label,
      action: () => {},
    });

    return <CatalogBreadcrumb names={breadcrumbsItems} />;
  };

  const renderTurnBackButton = () => {
    const pathSize = catalogState.path.length;
    if (pathSize === 0 || !catalog) return null;

    const previousPage = catalogState.path[pathSize - 1];
    const previousCategory = catalog.getCategory(previousPage);

    return (
      <CatalogTurnBackPageItem
        key={pathSize}
        page={previousCategory}
      />
    );
  };

  const renderSelectedHistory = () => {
    if (selectedElementsHistory.length === 0 || !catalog) return null;

    return (
      <div className="w-full overflow-x-scroll mt-4 flex items-center relative px-2 rounded-lg">
        <Label className="inline-block mr-5 text-sm">Last Selected</Label>
        {selectedElementsHistory.map((elementName: string, index: number) => {
          const element = catalog.hasElement(elementName) ? catalog.getElement(elementName) : null;
          if (!element) return null;
          return (
            <Button
              variant="secondary"
              className="mr-2"
              key={index}
              title={element.name}
              onClick={() => handleElementSelect(element)}
            >
              {element.name}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderCatalogItems = () => {
    if (matchString) {
      return matchedElements.map((elem) => (
        <CatalogItem
          key={elem.name}
          element={elem}
          onSelect={handleElementSelect}
        />
      ));
    }

    return (
      <>
        {renderTurnBackButton()}
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
      </>
    );
  };

  return (
    <div className="w-full px-2">
      <h1 className="text-4xl text-white mb-4">Catalog</h1>
      {renderBreadcrumb()}

      <div className="flex flex-col space-y-2">
        <Label htmlFor="search">Search Elements</Label>
        <Input
          id="search"
          type="text"
          name="search"
          placeholder="Search catalog"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {renderSelectedHistory()}

      <div style={ITEMS_GRID}>{renderCatalogItems()}</div>
    </div>
  );
};

export default CatalogList;
