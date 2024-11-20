"use client";

import { useContext, useState } from "react";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import CatalogItem from "./CatalogItem";
import CatalogBreadcrumb from "./CatalogBreadcrumb";
import CatalogPageItem from "./CatalogPageItem";
import CatalogTurnBackPageItem from "./CatalogTurnBackPageItem";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Types
interface ElementInfo {
  title: string;
  visibility?: {
    catalog: boolean;
  };
  image: string;
  tag: string[];
  description: string;
}

export interface CatalogElement {
  name: string;
  prototype: "lines" | "items" | "holes";
  info: ElementInfo;
}

interface Category {
  name: string;
  label: string;
  categories: Category[];
  elements: CatalogElement[];
}

interface BreadcrumbItem {
  name: string;
  action: () => void;
}

interface CatalogListProps {
  state: any;
  onClose?: () => void;
}

// Styles
const ITEMS_GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(14em, 1fr))",
  gridGap: "10px",
  marginTop: "1em",
};

const CatalogList: React.FC<CatalogListProps> = ({ state, onClose }) => {
  const {
    catalog,
    translator,
    itemsActions,
    linesActions,
    holesActions,
    projectActions,
  } = useContext(ReactPlannerContext);

  const currentCategory = catalog.getCategory(state.catalog.page);
  const categoriesToDisplay = currentCategory.categories;
  const elementsToDisplay = currentCategory.elements.filter((element) =>
    element.info.visibility ? element.info.visibility.catalog : true
  );

  const [categories] = useState<Category[]>(currentCategory.categories);
  const [elements] = useState<CatalogElement[]>(elementsToDisplay);
  const [matchString, setMatchString] = useState("");
  const [matchedElements, setMatchedElements] = useState<CatalogElement[]>([]);

  const flattenCategories = (categories: Category[]): CatalogElement[] => {
    return categories.reduce((acc: CatalogElement[], curr: Category) => {
      return [...acc, ...curr.elements, ...flattenCategories(curr.categories)];
    }, []);
  };

  const handleSearch = (text: string) => {
    const array = [...elements, ...flattenCategories(categories)];
    let filtered: CatalogElement[] = [];

    if (text) {
      const regexp = new RegExp(text, "i");
      filtered = array.filter((item) => regexp.test(item.info.title));
    }

    setMatchString(text);
    setMatchedElements(filtered);
  };

  const handleElementSelect = (element: CatalogElement) => {
    console.log(element);
    switch (element.prototype) {
      case "lines":
        linesActions.selectToolDrawingLine(element.name);
        break;
      case "items":
        itemsActions.selectToolDrawingItem(element.name);
        break;
      case "holes":
        holesActions.selectToolDrawingHole(element.name);
        break;
    }

    projectActions.pushLastSelectedCatalogElementToHistory(element);
    onClose();
  };

  const renderBreadcrumb = () => {
    if (state.catalog.page === "root") return null;

    const breadcrumbsItems: BreadcrumbItem[] = [];

    state.catalog.path.forEach((pathName: string) => {
      breadcrumbsItems.push({
        name: catalog.getCategory(pathName).label,
        action: () => projectActions.goBackToCatalogPage(pathName),
      });
    });

    breadcrumbsItems.push({
      name: currentCategory.label,
      action: () => {},
    });

    return <CatalogBreadcrumb names={breadcrumbsItems} />;
  };

  const renderTurnBackButton = () => {
    const pathSize = state.catalog.path.size;
    if (pathSize === 0) return null;

    return (
      <CatalogTurnBackPageItem
        key={pathSize}
        page={catalog.categories[state.catalog.path.get(pathSize - 1)]}
      />
    );
  };

  const renderSelectedHistory = () => {
    const selectedHistory = state.get("selectedElementsHistory");
    if (!selectedHistory.size) return null;

    return (
      <div className="w-full overflow-x-scroll mt-4 flex items-center relative px-2 rounded-lg">
        <Label className="inline-block mr-5 text-sm">Last Selected</Label>
        {selectedHistory.map((element: CatalogElement, index: number) => (
          <Button
            variant="secondary"
            className="mr-2"
            key={index}
            title={element.name}
            onClick={() => handleElementSelect(element)}
          >
            {element.name}
          </Button>
        ))}
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
