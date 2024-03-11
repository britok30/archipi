"use client";

import React from "react";
import PropTypes from "prop-types";
import { MdArrowBack as Arrow } from "react-icons/md";
import * as SharedStyle from "../../styles/shared-style";
import classNames from "classnames";

const breadcrumbStyle = {
  margin: "1.5em",
  display: "flex",
};

const breadcrumbTextStyle = {
  fontSize: "20px",
  cursor: "pointer",
};

const breadcrumbLastTextStyle = {
  ...breadcrumbTextStyle,
  fontWeight: "bolder",
  color: SharedStyle.SECONDARY_COLOR.main,
};

const breadcrumbTabStyle = {
  fill: SharedStyle.COLORS.black,
  fontSize: "24px",
  marginLeft: "10px",
  marginRight: "10px",
};

const CatalogBreadcrumb = ({ names }) => {
  let labelNames = names.map((name, ind) => {
    let lastElement = ind === names.length - 1;

    return (
      <div className="flex" key={ind}>
        <div
          className={classNames("text-lg cursor-pointer text-white", {
            "font-bold": lastElement,
          })}
          onClick={name.action || null}
        >
          {name.name}
        </div>
        {!lastElement ? (
          <Arrow className="fill-black text-2xl mx-[10px]" />
        ) : null}
      </div>
    );
  });

  return <div style={breadcrumbStyle}>{labelNames}</div>;
};

CatalogBreadcrumb.propTypes = {
  names: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CatalogBreadcrumb;
