"use client";

import React, { useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import Image from "next/image";

const CatalogItem = ({ element }) => {
  const { linesActions, itemsActions, holesActions, projectActions } =
    useContext(ReactPlannerContext);

  const select = () => {
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

  return (
    <div
      className="w-[14rem] p-2 bg-[#292929] border border-transparent hover:border-white rounded-lg cursor-pointer relative transition duration-300 ease-in-out self-center justify-self-center"
      onClick={select}
    >
      <h3 className="text-2xl text-white mb-4">{element.info.title}</h3>

      <div className="w-full h-[8rem] relative overflow-hidden m-0 p-0 mb-2">
        <Image
          className="object-contain object-center"
          src={element.info.image}
          fill
          alt={`catalog_item_${element.info.title}`}
        />
      </div>
      <div className="flex space-x-1 items-center mb-2">
        {element.info.tag.map((tag, index) => (
          <span
            className="bg-black text-xs text-white rounded-md p-1"
            key={index}
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-white font-semibold">
        {element.info.description}
      </p>
    </div>
  );
};

CatalogItem.propTypes = {
  element: PropTypes.object.isRequired,
};

export default CatalogItem;
