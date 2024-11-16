"use client";

import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import CatalogItem from "./CatalogItem";
import CatalogBreadcrumb from "./CatalogBreadcrumb";
import CatalogPageItem from "./CatalogPageItem";
import CatalogTurnBackPageItem from "./CatalogTurnBackPageItem";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const searchContainer = {
  width: "100%",
  height: "3em",
  padding: "0.625em",
  background: "#f7f7f9",
  border: "1px solid #e1e1e8",
  cursor: "pointer",
  position: "relative",
  boxShadow: "0 1px 6px 0 rgba(0, 0, 0, 0.11), 0 1px 4px 0 rgba(0, 0, 0, 0.11)",
  borderRadius: "2px",
  transition: "all .2s ease-in-out",
  WebkitTransition: "all .2s ease-in-out",
  marginBottom: "1em",
};

const historyContainer = {
  ...searchContainer,
  padding: "0.2em 0.625em",
};

const itemsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(14em, 1fr))",
  gridGap: "10px",
  marginTop: "1em",
};

const CatalogList = ({ state, width, height, style }) => {
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

  const [categories, setCategories] = useState(currentCategory.categories);
  const [elements, setElements] = useState(elementsToDisplay);
  const [matchString, setMatchString] = useState("");
  const [matchedElements, setMatchedElements] = useState([]);

  const flattenCategories = (categories) => {
    let toRet = [];

    for (let x = 0; x < categories.length; x++) {
      let curr = categories[x];
      toRet = toRet.concat(curr.elements);
      if (curr.categories.length)
        toRet = toRet.concat(flattenCategories(curr.categories));
    }

    return toRet;
  };

  const matcharray = (text) => {
    let array = elements.concat(flattenCategories(categories));

    let filtered = [];

    if (text !== "") {
      let regexp = new RegExp(text, "i");
      for (let i = 0; i < array.length; i++) {
        if (regexp.test(array[i].info.title)) {
          filtered.push(array[i]);
        }
      }
    }

    setMatchString(text);
    setMatchedElements(filtered);
  };

  const select = (element) => {
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
  };

  let breadcrumbComponent = null;
  const page = state.catalog.page;

  if (page !== "root") {
    let breadcrumbsNames = [];

    state.catalog.path.forEach((pathName) => {
      breadcrumbsNames.push({
        name: catalog.getCategory(pathName).label,
        action: () => projectActions.goBackToCatalogPage(pathName),
      });
    });

    breadcrumbsNames.push({ name: currentCategory.label, action: "" });

    breadcrumbComponent = <CatalogBreadcrumb names={breadcrumbsNames} />;
  }

  let pathSize = state.catalog.path.size;

  let turnBackButton =
    pathSize > 0 ? (
      <CatalogTurnBackPageItem
        key={pathSize}
        page={catalog.categories[state.catalog.path.get(pathSize - 1)]}
      />
    ) : null;

  const selectedHistory = state.get("selectedElementsHistory");

  return (
    <div className="bg-black w-full min-h-screen p-4 ">
      <h1 className="text-4xl text-white mb-4">Catalog</h1>
      {breadcrumbComponent}

      <div className="flex flex-col space-y-2">
        <Label htmlFor="search">Search Elements</Label>
        <Input
          id="search"
          type="text"
          name="search"
          placeholder="Search catalog"
          onChange={(e) => {
            matcharray(e.target.value);
          }}
        />
      </div>

      {selectedHistory.size ? (
        <div className="w-full h-[3rem] mt-4 flex items-center bg-[#292929] relative px-2 rounded-lg">
          <span className="inline-block mr-5 text-sm">
            {translator.t("Last Selected")}
          </span>
          {selectedHistory.map((el, ind) => (
            <Button key={ind} title={el.name} onClick={() => select(el)}>
              {el.name}
            </Button>
          ))}
        </div>
      ) : null}

      <div style={itemsStyle}>
        {matchString === ""
          ? [
              turnBackButton,
              categoriesToDisplay.map((cat) => (
                <CatalogPageItem
                  key={cat.name}
                  page={cat}
                  oldPage={currentCategory}
                />
              )),
              elementsToDisplay.map((elem) => (
                <CatalogItem key={elem.name} element={elem} />
              )),
            ]
          : matchedElements.map((elem) => (
              <CatalogItem key={elem.name} element={elem} />
            ))}
      </div>
    </div>
  );
};

CatalogList.propTypes = {
  state: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,
};

export default CatalogList;
