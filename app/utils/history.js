import { Map, List } from "immutable";
import patch from "immutablepatch";
import diff from "immutablediff";

// Initialize history structure
export const createHistoryStructure = () => {
  return Map({
    first: null,
    last: null,
    undoList: List(),
    redoList: List(),
  });
};

export const historyPush = (historyStructure, item) => {
  // If this is the first item, set both first and last
  if (!historyStructure.get("first")) {
    return historyStructure.set("first", item).set("last", item);
  }

  const currentLast = historyStructure.get("last");

  // Only push if the item is different from the last one
  if (currentLast.hashCode() !== item.hashCode()) {
    const diffData = diff(currentLast, item);
    const toPush = Map({
      time: Date.now(),
      diff: diffData,
    });

    return historyStructure
      .set("last", item)
      .update("undoList", (list) => list.push(toPush))
      .set("redoList", List()); // Clear redo list when new change is made
  }

  return historyStructure;
};

export const historyPop = (historyStructure) => {
  if (
    !historyStructure.get("last") ||
    historyStructure.get("undoList").size === 0
  ) {
    return historyStructure;
  }

  // Start with the first state
  let currentState = historyStructure.get("first");
  const undoList = historyStructure.get("undoList");

  // Apply all diffs except the last one
  for (let i = 0; i < undoList.size - 1; i++) {
    const diffToApply = undoList.get(i).get("diff");
    try {
      currentState = patch(currentState, diffToApply);
    } catch (error) {
      console.error("Failed to apply patch:", error);
      return historyStructure; // Return unchanged if patch fails
    }
  }

  // Move the last undo item to the redo list
  const lastUndo = undoList.last();

  return historyStructure
    .set("last", currentState)
    .update("undoList", (list) => list.pop())
    .update("redoList", (list) => list.push(lastUndo));
};

export const historyRedo = (historyStructure) => {
  if (historyStructure.get("redoList").size === 0) {
    return historyStructure;
  }

  const lastRedo = historyStructure.get("redoList").last();
  const currentLast = historyStructure.get("last");

  try {
    const redoState = patch(currentLast, lastRedo.get("diff"));

    return historyStructure
      .set("last", redoState)
      .update("undoList", (list) =>
        list.push(
          Map({
            time: Date.now(),
            diff: lastRedo.get("diff"),
          })
        )
      )
      .update("redoList", (list) => list.pop());
  } catch (error) {
    console.error("Failed to apply redo patch:", error);
    return historyStructure; // Return unchanged if patch fails
  }
};
