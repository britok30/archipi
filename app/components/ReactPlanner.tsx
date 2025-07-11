"use client";

import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import Translator from "../translator/translator";
import Catalog from "../catalog/catalog";
import actions from "../actions/export";
import Footer from "./Footer/Footer";
import { objectsMap } from "../utils/objects-utils";
import ReactPlannerContext from "../context/ReactPlannerContext";
import Overlays from "./Overlays";
import Sidebar from "./Sidebar/Sidebar";
import Content from "./Content";
import Toolbar from "./Toolbar/Toolbar";

const footerBarH = 25;

const ReactPlannerContent = (props) => {
  const { width, height, state, stateExtractor, ...otherProps } = props;

  const contentH = height - footerBarH;
  const extractedState = stateExtractor(state);
  const contextValue = useContext(ReactPlannerContext);

  useEffect(() => {
    const { stateExtractor, state, projectActions, catalog } = props;
    const plannerState = stateExtractor(state);
    const catalogReady = plannerState.getIn(["catalog", "ready"]);
    if (!catalogReady) {
      projectActions.initCatalog(catalog);
    }
  }, [props]);

  return (
    <div className="flex flex-row flex-nowrap w-full h-full">
      <Overlays
        width={width}
        height={contentH}
        state={extractedState}
        {...otherProps}
      />
      <Toolbar state={extractedState} {...otherProps} />
      <Content
        width={width}
        height={contentH}
        state={extractedState}
        {...otherProps}
      />
      <Sidebar state={extractedState} />
      <Footer
        width={width}
        height={footerBarH}
        state={extractedState}
        {...otherProps}
      />
    </div>
  );
};

ReactPlannerContent.propTypes = {
  translator: PropTypes.instanceOf(Translator),
  catalog: PropTypes.instanceOf(Catalog),
  allowProjectFileSupport: PropTypes.bool,
  plugins: PropTypes.arrayOf(PropTypes.func),
  autosaveKey: PropTypes.string,
  autosaveDelay: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  stateExtractor: PropTypes.func.isRequired,
  toolbarButtons: PropTypes.array,
  customContents: PropTypes.object,
  customOverlays: PropTypes.arrayOf(PropTypes.object),
  customActions: PropTypes.object,
  softwareSignature: PropTypes.string,
};

function ReactPlanner(props) {
  const {
    state,
    translator,
    catalog,
    projectActions,
    sceneActions,
    linesActions,
    holesActions,
    verticesActions,
    itemsActions,
    areaActions,
    viewer2DActions,
    viewer3DActions,
    groupsActions,
    ...customActions
  } = props;

  return (
    <ReactPlannerContext.Provider
      value={{
        state,
        translator,
        catalog,
        projectActions,
        sceneActions,
        linesActions,
        holesActions,
        verticesActions,
        itemsActions,
        areaActions,
        viewer2DActions,
        viewer3DActions,
        groupsActions,
        ...customActions,
        store: props.store,
      }}
    >
      <ReactPlannerContent {...props} />
    </ReactPlannerContext.Provider>
  );
}

ReactPlanner.defaultProps = {
  translator: new Translator(),
  catalog: new Catalog(),
  plugins: [],
  allowProjectFileSupport: true,
  toolbarButtons: [],
  footerbarComponents: [],
  customContents: {},
  customOverlays: [],
  customActions: {},
  softwareSignature: `ArchiPi`,
};

//redux connect
function mapStateToProps(reduxState) {
  return {
    state: reduxState,
  };
}

function mapDispatchToProps(dispatch) {
  return objectsMap(actions, (actionNamespace) =>
    bindActionCreators(actions[actionNamespace], dispatch)
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ReactPlanner);
