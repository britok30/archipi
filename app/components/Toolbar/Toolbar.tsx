"use client";

import React, { useContext } from "react";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import ToolbarButton from "./ToolbarButton";
import ToolbarSaveButton from "./ToolbarSaveButton";
import ToolbarLoadButton from "./ToolbarLoadButton";
import ScreenshotToolbarButton from "./ScreenshotToolbarButton";
import { IoIosDocument, IoIosUndo, IoIosRedo } from "react-icons/io";
import { FaBookOpen, FaMousePointer, FaCube } from "react-icons/fa";
import { IoSquare, IoSettingsSharp } from "react-icons/io5";
import {
  MODE_IDLE,
  MODE_3D_VIEW,
  MODE_3D_FIRST_PERSON,
  MODE_VIEWING_CATALOG,
  MODE_CONFIGURING_PROJECT,
} from "../../utils/constants";

interface ToolbarProps {
  state: any; // Replace `any` with the actual state type if available
  allowProjectFileSupport: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  state,
  allowProjectFileSupport,
}) => {
  const { projectActions, viewer3DActions, translator } =
    useContext(ReactPlannerContext);
  const mode = state.get("mode");

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-[50%] z-[999] flex bg-black rounded-lg px-5 py-3 space-x-6">
      {allowProjectFileSupport && (
        <ToolbarButton
          active={false}
          tooltip={translator.t("New project")}
          onClick={() =>
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
      )}

      {allowProjectFileSupport && <ToolbarSaveButton state={state} />}
      {allowProjectFileSupport && <ToolbarLoadButton state={state} />}

      <ToolbarButton
        active={mode === MODE_VIEWING_CATALOG}
        tooltip={translator.t("Open catalog")}
        onClick={() => projectActions.openCatalog()}
      >
        <FaBookOpen className="mb-0.5" size={23} />
        Catalog
      </ToolbarButton>

      <ToolbarButton
        active={mode === MODE_IDLE}
        tooltip={translator.t("2D View")}
        onClick={() => projectActions.setMode(MODE_IDLE)}
      >
        {[MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode) ? (
          <IoSquare className="mb-0.5" size={23} />
        ) : (
          <FaMousePointer className="mb-0.5" size={23} />
        )}
        2D
      </ToolbarButton>

      <ToolbarButton
        active={mode === MODE_3D_VIEW}
        tooltip={translator.t("3D View")}
        onClick={() => viewer3DActions.selectTool3DView()}
      >
        <FaCube className="mb-0.5" size={23} />
        3D
      </ToolbarButton>

      <ToolbarButton
        active={false}
        tooltip={translator.t("Undo (CTRL-Z)")}
        onClick={() => projectActions.undo()}
      >
        <IoIosUndo className="mb-0.5" size={23} />
        Undo
      </ToolbarButton>

      <ToolbarButton
        active={false}
        tooltip={translator.t("Redo (CTRL-Y)")}
        onClick={() => projectActions.redo()}
      >
        <IoIosRedo className="mb-0.5" size={23} />
        Redo
      </ToolbarButton>

      <ToolbarButton
        active={mode === MODE_CONFIGURING_PROJECT}
        tooltip={translator.t("Configure project")}
        onClick={() => projectActions.openProjectConfigurator()}
      >
        <IoSettingsSharp className="mb-0.5" size={23} />
        Settings
      </ToolbarButton>

      <ScreenshotToolbarButton mode={mode} />
    </div>
  );
};

Toolbar.displayName = "Toolbar";

export default Toolbar;
