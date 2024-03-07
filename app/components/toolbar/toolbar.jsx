import React, { memo, useContext } from "react";
import PropTypes from "prop-types";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { IoIosDocument } from "react-icons/io";
import ToolbarButton from "./toolbar-button";
import ToolbarSaveButton from "./toolbar-save-button";
import ToolbarLoadButton from "./toolbar-load-button";
import If from "../../utils/react-if";
import {
  MODE_IDLE,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_VIEWING_CATALOG,
  MODE_CONFIGURING_PROJECT,
} from "../../utils/constants";
import * as SharedStyle from "../../styles/shared-style";
import { FaBookOpen, FaMousePointer } from "react-icons/fa";
import { FaCube } from "react-icons/fa";
import { IoSquare } from "react-icons/io5";
import { IoIosUndo } from "react-icons/io";
import { IoIosRedo } from "react-icons/io";
import { IoSettingsSharp } from "react-icons/io5";
import { IoCamera } from "react-icons/io5";
import ScreenshotToolbarButton from "../../ui/screenshot-toolbar-button";
import { CiCircleInfo } from "react-icons/ci";

const sortButtonsCb = (a, b) => {
  if (a.index === undefined || a.index === null) {
    a.index = Number.MAX_SAFE_INTEGER;
  }

  if (b.index === undefined || b.index === null) {
    b.index = Number.MAX_SAFE_INTEGER;
  }

  return a.index - b.index;
};

const mapButtonsCb = (el, ind) => {
  return (
    <If key={ind} condition={el.condition} style={{ position: "relative" }}>
      {el.dom}
    </If>
  );
};

const shouldUpdate = (prevProps, nextProps) => {
  return prevProps.state.hashCode() === nextProps.state.hashCode();
};

const Toolbar = memo(({ state, toolbarButtons, allowProjectFileSupport }) => {
  const { projectActions, viewer3DActions, translator } =
    useContext(ReactPlannerContext);

  let mode = state.get("mode");

  let sorter = [
    {
      index: 0,
      condition: allowProjectFileSupport,
      dom: (
        <ToolbarButton
          active={false}
          tooltip={translator.t("New project")}
          onClick={(event) =>
            window.confirm(
              translator.t("Would you want to start a new Project?")
            )
              ? projectActions.newProject()
              : null
          }
        >
          <IoIosDocument className="mb-0.5" size={25} />
          New
        </ToolbarButton>
      ),
    },
    {
      index: 1,
      condition: allowProjectFileSupport,
      dom: <ToolbarSaveButton state={state} />,
    },
    {
      index: 2,
      condition: allowProjectFileSupport,
      dom: <ToolbarLoadButton state={state} />,
    },
    {
      index: 3,
      condition: true,
      dom: (
        <ToolbarButton
          active={[MODE_VIEWING_CATALOG].includes(mode)}
          tooltip={translator.t("Open catalog")}
          onClick={(event) => projectActions.openCatalog()}
        >
          <FaBookOpen className="mb-0.5" size={23} />
          Catalog
        </ToolbarButton>
      ),
    },
    {
      index: 4,
      condition: true,
      dom: (
        <ToolbarButton
          active={[MODE_IDLE].includes(mode)}
          tooltip={translator.t("2D View")}
          onClick={(event) => projectActions.setMode(MODE_IDLE)}
        >
          {[MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode) ? (
            <IoSquare className="mb-0.5" size={23} />
          ) : (
            <FaMousePointer className="mb-0.5" size={23} />
          )}
          2D
        </ToolbarButton>
      ),
    },
    {
      index: 5,
      condition: true,
      dom: (
        <ToolbarButton
          active={[MODE_3D_VIEW].includes(mode)}
          tooltip={translator.t("3D View")}
          onClick={(event) => viewer3DActions.selectTool3DView()}
        >
          <FaCube className="mb-0.5" size={23} />
          3D
        </ToolbarButton>
      ),
    },
    // TODO(react-planner #16)
    // {
    //   index: 6,
    //   condition: true,
    //   dom: (
    //     <ToolbarButton
    //       active={[MODE_3D_FIRST_PERSON].includes(mode)}
    //       tooltip={translator.t("3D First Person")}
    //       onClick={(event) => viewer3DActions.selectTool3DFirstPerson()}
    //     >
    //       3D 1st
    //     </ToolbarButton>
    //   ),
    // },
    {
      index: 6,
      condition: true,
      dom: (
        <ToolbarButton
          active={false}
          tooltip={translator.t("Undo (CTRL-Z)")}
          onClick={(event) => projectActions.undo()}
        >
          <IoIosUndo className="mb-0.5" size={23} />
          Undo
        </ToolbarButton>
      ),
    },
    {
      index: 7,
      condition: true,
      dom: (
        <ToolbarButton
          active={false}
          tooltip={translator.t("Redo (CTRL-Y)")}
          onClick={(event) => projectActions.redo()}
        >
          <IoIosRedo className="mb-0.5" size={23} />
          Redo
        </ToolbarButton>
      ),
    },
    {
      index: 8,
      condition: true,
      dom: (
        <ToolbarButton
          active={[MODE_CONFIGURING_PROJECT].includes(mode)}
          tooltip={translator.t("Configure project")}
          onClick={(event) => projectActions.openProjectConfigurator()}
        >
          <IoSettingsSharp className="mb-0.5" size={23} />
          Settings
        </ToolbarButton>
      ),
    },
    {
      index: 9,
      condition: true,
      dom: <ScreenshotToolbarButton mode={mode} />,
    },
    {
      index: 10,
      condition: true,
      dom: (
        <ToolbarButton
          active={false}
          tooltip={
            <>
              <div className="mb-3">
                <h3 className="mb-1">2D View Controls</h3>
                <ul className="flex flex-col space-y-1">
                  <li>Move View: Click and drag the mouse in any direction.</li>
                  <li>Zoom: Scroll the mouse wheel up or down.</li>
                  <li>Cancel Action: Press the &apos;Esc&apos; key.</li>
                  <li>Delete item: Select and press Backspace/Delete</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-1">3D View Controls</h3>
                <ul className="flex flex-col space-y-1">
                  <li>
                    - Rotate: Click and drag with the mouse in any direction.
                  </li>
                  <li>- Zoom: Scroll the mouse wheel up or down.</li>
                  <li>
                    - Move Camera: Hold CMD/CTRL and click, then drag to
                    reposition the camera.
                  </li>
                </ul>
              </div>
            </>
          }
        >
          <CiCircleInfo className="mb-0.5" size={23} />
          Tips
        </ToolbarButton>
      ),
    },
  ];

  sorter = sorter.concat(
    toolbarButtons.map((Component, key) => {
      return Component.prototype //if is a react component
        ? {
            condition: true,
            dom: React.createElement(Component, { mode, state, key }),
          }
        : {
            //else is a sortable toolbar button
            index: Component.index,
            condition: Component.condition,
            dom: React.createElement(Component.dom, { mode, state, key }),
          };
    })
  );

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-[50%] z-[999] flex bg-black rounded-lg px-5 py-3 space-x-6">
      {sorter.sort(sortButtonsCb).map(mapButtonsCb)}
    </div>
  );
}, shouldUpdate);

Toolbar.displayName = "Toolbar";

Toolbar.propTypes = {
  state: PropTypes.object.isRequired,
  allowProjectFileSupport: PropTypes.bool.isRequired,
  toolbarButtons: PropTypes.array,
};

export default Toolbar;
