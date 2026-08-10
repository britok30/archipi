import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePlannerStore } from '@/app/store/usePlannerStore';
import { setupAutosave, loadSavedScene, clearSavedScene } from '@/app/store/middleware/autosave';
import { setupKeyboardShortcuts } from '@/app/store/middleware/keyboard';
import {
  MODE_IDLE,
  MODE_DRAWING_ITEM,
  MODE_DRAWING_LINE,
  MODE_DRAGGING_LINE,
} from '@/app/store/types';
import { LAYER, s, layer, drawWall, resetHistory } from './helpers';

const AUTOSAVE_KEY = 'archipi';

beforeEach(() => {
  usePlannerStore.getState().newProject();
  localStorage.clear();
});

// ===========================================================================
// Autosave
// ===========================================================================
describe('setupAutosave', () => {
  let teardown: (() => void) | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    teardown?.();
    teardown = null;
    vi.useRealTimers();
  });

  it('persists the scene to localStorage after the debounce delay', () => {
    teardown = setupAutosave();

    s().addVerticalGuide(123);
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull(); // not yet

    vi.advanceTimersByTime(499);
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();

    vi.advanceTimersByTime(1);
    const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY)!);
    const guideIds = Object.keys(saved.guides.vertical);
    expect(guideIds).toHaveLength(1);
    expect(saved.guides.vertical[guideIds[0]].x).toBe(123);
  });

  it('debounces rapid scene changes into a single write', () => {
    teardown = setupAutosave();
    const spy = vi.spyOn(Storage.prototype, 'setItem');

    s().addVerticalGuide(1);
    vi.advanceTimersByTime(300);
    s().addVerticalGuide(2);
    vi.advanceTimersByTime(300); // first timer was cancelled
    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('skips persisting while a drawing gesture is in progress', () => {
    teardown = setupAutosave();

    s().selectToolDrawingLine('wall');
    s().beginDrawingLine(LAYER, 0, 0);
    s().updateDrawingLine(200, 0);
    expect(s().mode).toBe(MODE_DRAWING_LINE);

    vi.advanceTimersByTime(1000);
    // Mid-gesture scenes (with rubber-band lines) are never persisted
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();

    // Finishing the gesture changes the scene again and persists it
    s().endDrawingLine(200, 0);
    s().stopDrawingLine();
    vi.advanceTimersByTime(500);

    const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY)!);
    expect(Object.keys(saved.layers[LAYER].lines)).toHaveLength(1);
  });

  it('stops persisting after teardown', () => {
    teardown = setupAutosave();
    teardown();
    teardown = null;

    s().addVerticalGuide(9);
    vi.advanceTimersByTime(1000);
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();
  });
});

describe('loadSavedScene / clearSavedScene', () => {
  it('round-trips a valid scene', () => {
    drawWall(0, 0, 400, 0);
    const scene = JSON.parse(JSON.stringify(s().scene));
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(scene));

    expect(loadSavedScene()).toEqual(scene);
  });

  it('returns null when nothing was saved', () => {
    expect(loadSavedScene()).toBeNull();
  });

  it('returns null and removes the key on corrupt JSON', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(AUTOSAVE_KEY, '{"layers": {broken');

    expect(loadSavedScene()).toBeNull();
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();
    errorSpy.mockRestore();
  });

  it('clearSavedScene removes the key', () => {
    localStorage.setItem(AUTOSAVE_KEY, '{}');
    clearSavedScene();
    expect(localStorage.getItem(AUTOSAVE_KEY)).toBeNull();
  });
});

// ===========================================================================
// Keyboard shortcuts
// ===========================================================================
describe('setupKeyboardShortcuts', () => {
  let teardown: (() => void) | null = null;

  beforeEach(() => {
    teardown = setupKeyboardShortcuts();
  });

  afterEach(() => {
    teardown?.();
    teardown = null;
  });

  /** Dispatch a real KeyboardEvent on window with a legacy keyCode. */
  function pressKey(
    keyCode: number,
    opts: { ctrlKey?: boolean; shiftKey?: boolean; type?: 'keydown' | 'keyup' } = {}
  ): void {
    const event = new KeyboardEvent(opts.type ?? 'keydown', {
      ctrlKey: opts.ctrlKey ?? false,
      shiftKey: opts.shiftKey ?? false,
      bubbles: true,
      cancelable: true,
    });
    // jsdom's KeyboardEvent constructor does not honor legacy keyCode init
    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
    window.dispatchEvent(event);
  }

  const ESC = 27;
  const DELETE = 46;
  const Z = 90;
  const Y = 89;
  const ALT = 18;

  it('Escape during item placement cancels without popping history', () => {
    drawWall(0, 0, 400, 0); // prior committed work
    resetHistory();
    s().saveProjectToHistory(); // one committed entry
    const committedScene = JSON.parse(JSON.stringify(s().scene));

    s().selectToolDrawingItem('sofa');
    s().updateDrawingItem(LAYER, 100, 100);
    expect(s().mode).toBe(MODE_DRAWING_ITEM);

    pressKey(ESC);

    expect(s().mode).toBe(MODE_IDLE);
    expect(s().drawingSupport).toEqual({});
    // The committed history entry is intact
    expect(s().sceneHistory.past).toHaveLength(1);
    expect(s().scene).toEqual(committedScene);
    expect(Object.keys(layer().items)).toHaveLength(0);
  });

  it('Escape during line drawing keeps committed walls and drops the rubber-band', () => {
    s().selectToolDrawingLine('wall');
    s().beginDrawingLine(LAYER, 0, 0);
    s().updateDrawingLine(200, 0);
    s().endDrawingLine(200, 0);
    expect(s().mode).toBe(MODE_DRAWING_LINE);
    expect(Object.keys(layer().lines)).toHaveLength(2);

    pressKey(ESC);

    expect(s().mode).toBe(MODE_IDLE);
    expect(Object.keys(layer().lines)).toHaveLength(1);
  });

  it('Escape during a drag rolls back and pops the phantom history entry', () => {
    const lineId = drawWall(0, 0, 400, 0);
    resetHistory();
    const preDragScene = JSON.parse(JSON.stringify(s().scene));

    s().beginDraggingLine(LAYER, lineId, 100, 0);
    expect(s().mode).toBe(MODE_DRAGGING_LINE);
    expect(s().sceneHistory.past).toHaveLength(1); // pushed at drag begin
    s().updateDraggingLine(150, 90);

    pressKey(ESC);

    expect(s().mode).toBe(MODE_IDLE);
    expect(s().draggingSupport).toEqual({});
    expect(s().scene).toEqual(preDragScene);
    // The phantom entry is popped: undo won't be a visible no-op
    expect(s().sceneHistory.past).toHaveLength(0);
  });

  it('Escape while idle just resets the tool', () => {
    s().selectToolPan();
    pressKey(ESC);
    expect(s().mode).toBe(MODE_IDLE);
  });

  it('Ctrl+Z undoes and Ctrl+Shift+Z / Ctrl+Y redo', () => {
    const originalWidth = s().scene.width;
    s().setProjectProperties({ width: 4444 });
    expect(s().scene.width).toBe(4444);

    pressKey(Z, { ctrlKey: true });
    expect(s().scene.width).toBe(originalWidth);
    expect(s().sceneHistory.future).toHaveLength(1);

    pressKey(Z, { ctrlKey: true, shiftKey: true });
    expect(s().scene.width).toBe(4444);

    pressKey(Z, { ctrlKey: true });
    expect(s().scene.width).toBe(originalWidth);

    pressKey(Y, { ctrlKey: true });
    expect(s().scene.width).toBe(4444);
  });

  it('plain Z without modifier does not undo', () => {
    s().setProjectProperties({ width: 4444 });
    pressKey(Z);
    expect(s().scene.width).toBe(4444);
  });

  it('Delete removes the current selection', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().selectLine(LAYER, lineId);

    pressKey(DELETE);

    expect(layer().lines[lineId]).toBeUndefined();
    expect(Object.keys(layer().vertices)).toHaveLength(0);
  });

  it('keydown originating from an input element is ignored', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().selectLine(LAYER, lineId);

    const input = document.createElement('input');
    document.body.appendChild(input);
    const event = new KeyboardEvent('keydown', { bubbles: true });
    Object.defineProperty(event, 'keyCode', { get: () => DELETE });
    input.dispatchEvent(event);
    input.remove();

    expect(layer().lines[lineId]).toBeDefined();
  });

  it('Alt toggles alterate on keydown, off on keyup, and resets on window blur', () => {
    expect(s().alterate).toBe(false);

    pressKey(ALT);
    expect(s().alterate).toBe(true);

    pressKey(ALT, { type: 'keyup' });
    expect(s().alterate).toBe(false);

    // Alt-Tab away: keydown fires, keyup is lost, blur must reset the flag
    pressKey(ALT);
    expect(s().alterate).toBe(true);
    window.dispatchEvent(new Event('blur'));
    expect(s().alterate).toBe(false);

    // Blur with alterate already false stays false (no double toggle)
    window.dispatchEvent(new Event('blur'));
    expect(s().alterate).toBe(false);
  });
});
