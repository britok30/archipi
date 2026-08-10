import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePlannerStore } from '@/app/store/usePlannerStore';
import FormNumberInput from '@/app/components/FormNumberInput';
import PropertyLengthMeasure from '@/app/components/Properties/PropertyLengthMeasure';
import PropertyString from '@/app/components/Properties/PropertyString';
import PanelLayerElements from '@/app/components/Sidebar/PanelLayerElements';
import ElementEditor from '@/app/components/Sidebar/ElementEditor';
import { PlannerProvider } from '@/app/context/ReactPlannerContext';
import { Accordion } from '@/components/ui/accordion';
import type { Line } from '@/app/store/types';
import { LAYER, s, layer, drawWall, resetHistory } from './helpers';

// jsdom lacks a few DOM APIs Radix UI relies on
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  usePlannerStore.getState().newProject();
});

afterEach(() => {
  cleanup();
});

// ===========================================================================
// FormNumberInput
// ===========================================================================
describe('FormNumberInput', () => {
  it('never calls onChange with NaN when the text becomes invalid', () => {
    const onChange = vi.fn();
    const onInvalid = vi.fn();
    render(
      <FormNumberInput value={50} min={0} max={100} onChange={onChange} onInvalid={onInvalid} />
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    // A number input coerces non-numeric text to "" — the empty/cleared state
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
    // Resets to the last valid prop value
    expect(input.value).toBe('50');
  });

  it('rejects out-of-range values on commit and resets', () => {
    const onChange = vi.fn();
    const onInvalid = vi.fn();
    render(
      <FormNumberInput value={50} min={0} max={100} onChange={onChange} onInvalid={onInvalid} />
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '500' } });
    expect(onInvalid).toHaveBeenCalledTimes(1); // flagged while typing
    expect(input.getAttribute('aria-invalid')).toBe('true');

    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('50');
  });

  it('typing a valid value fires onValid only; Enter commits it', () => {
    const onChange = vi.fn();
    const onValid = vi.fn();
    render(<FormNumberInput value={50} min={0} max={100} onChange={onChange} onValid={onValid} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '42' } });
    expect(onValid).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled(); // typing alone never commits

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('blur commits and rounds to the configured precision', () => {
    const onChange = vi.fn();
    render(<FormNumberInput value={1} precision={3} onChange={onChange} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '7.123456' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(7.123);
  });
});

// ===========================================================================
// PropertyLengthMeasure
// ===========================================================================
describe('PropertyLengthMeasure', () => {
  it('switching unit cm -> m converts only the displayed value, not the stored cm', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <PropertyLengthMeasure
        value={{ length: 150, _length: 150, _unit: 'cm' }}
        onUpdate={onUpdate}
        configs={{ label: 'width' }}
      />
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'm' }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const emitted = onUpdate.mock.calls[0][0];
    expect(emitted.length).toBe(150); // stored cm unchanged
    expect(emitted._length).toBe(1.5); // displayed value converted
    expect(emitted._unit).toBe('m');
  });

  it('typing a value in metres stores the correct centimetres', () => {
    const onUpdate = vi.fn();
    render(
      <PropertyLengthMeasure
        value={{ length: 150, _length: 1.5, _unit: 'm' }}
        onUpdate={onUpdate}
        configs={{ label: 'width' }}
      />
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('1.5');

    fireEvent.change(input, { target: { value: '2' } });
    expect(onUpdate).not.toHaveBeenCalled(); // no commit per keystroke
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const emitted = onUpdate.mock.calls[0][0];
    expect(emitted.length).toBe(200); // 2 m -> 200 cm
    expect(emitted._length).toBe(2);
    expect(emitted._unit).toBe('m');
  });

  it('typing while in cm stores the value verbatim', () => {
    const onUpdate = vi.fn();
    render(
      <PropertyLengthMeasure
        value={{ length: 100, _length: 100, _unit: 'cm' }}
        onUpdate={onUpdate}
        configs={{ label: 'height' }}
      />
    );
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '240' } });
    fireEvent.blur(input);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ length: 240, _length: 240, _unit: 'cm' })
    );
  });
});

// ===========================================================================
// PanelLayerElements
// ===========================================================================
describe('PanelLayerElements', () => {
  function renderPanel() {
    return render(
      <Accordion type="single" collapsible defaultValue="layer-elements">
        <PanelLayerElements />
      </Accordion>
    );
  }

  it('accepts regex metacharacters like ( and [ in the filter without throwing', async () => {
    drawWall(0, 0, 400, 0);
    const user = userEvent.setup();
    renderPanel();

    const filter = screen.getByPlaceholderText('Filter elements...');
    await user.type(filter, '(');
    expect(screen.getByText('No matching elements')).toBeDefined();

    await user.clear(filter);
    await user.type(filter, '[[');
    expect(screen.getByText('No matching elements')).toBeDefined();

    await user.clear(filter);
    await user.type(filter, '\\d+(');
    expect(screen.getByText('No matching elements')).toBeDefined();
  });

  it('filters by name and clicking a row selects the line in the store', async () => {
    const lineId = drawWall(0, 0, 400, 0);
    const lineName = layer().lines[lineId].name;
    const user = userEvent.setup();
    renderPanel();

    const filter = screen.getByPlaceholderText('Filter elements...');
    await user.type(filter, 'wall_');
    const row = screen.getByText(lineName);

    await user.click(row);
    expect(layer().selected.lines).toEqual([lineId]);
    expect(layer().lines[lineId].selected).toBe(true);
  });

  it('shows the empty state when the layer has no elements', () => {
    renderPanel();
    expect(screen.getByText('No elements on this layer')).toBeDefined();
  });
});

// ===========================================================================
// ElementEditor
// ===========================================================================
describe('ElementEditor', () => {
  it('renders null (no crash) for a line whose vertices are missing from the layer', () => {
    drawWall(0, 0, 400, 0);
    const ghostLine: Line = {
      id: 'ghost-line',
      type: 'wall',
      prototype: 'lines',
      name: 'wall_ghost',
      vertices: ['missing-a', 'missing-b'],
      holes: [],
      misc: {},
      selected: false,
      properties: {},
      visible: true,
    };

    const { container } = render(
      <PlannerProvider>
        <ElementEditor element={ghostLine} layer={layer()} />
      </PlannerProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders the editor shell for a valid item element', () => {
    drawWall(0, 0, 400, 0);
    s().selectToolDrawingItem('sofa');
    s().endDrawingItem(LAYER, 100, 100);
    const item = Object.values(layer().items)[0];

    render(
      <PlannerProvider>
        <ElementEditor element={item} layer={layer()} />
      </PlannerProvider>
    );

    expect(screen.getByText('Attributes')).toBeDefined();
    expect(screen.getByText('Properties')).toBeDefined();
  });
});

// ===========================================================================
// PropertyString
// ===========================================================================
describe('PropertyString', () => {
  it('commits on blur, not per keystroke (undo history untouched while typing)', async () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().selectLine(LAYER, lineId);
    resetHistory();

    const user = userEvent.setup();
    render(
      <PropertyString
        value=""
        onUpdate={(v) => s().setProperties({ title: v })}
        configs={{ label: 'title' }}
      />
    );

    const input = screen.getByLabelText('title') as HTMLInputElement;
    await user.type(input, 'kitchen');

    // Keystrokes stay local: nothing written to the store or the undo stack
    expect(input.value).toBe('kitchen');
    expect(s().sceneHistory.past).toHaveLength(0);
    expect(layer().lines[lineId].properties.title).toBeUndefined();

    fireEvent.blur(input);

    expect(layer().lines[lineId].properties.title).toBe('kitchen');
    expect(s().sceneHistory.past).toHaveLength(1); // exactly one commit
  });

  it('does not commit when the value is unchanged', () => {
    const onUpdate = vi.fn();
    render(<PropertyString value="same" onUpdate={onUpdate} configs={{ label: 'name' }} />);

    const input = screen.getByLabelText('name');
    fireEvent.blur(input);

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('runs the configured hook before committing', async () => {
    const onUpdate = vi.fn();
    const hook = vi.fn(async (v: string) => v.toUpperCase());
    const user = userEvent.setup();
    render(<PropertyString value="" onUpdate={onUpdate} configs={{ label: 'code', hook }} />);

    const input = screen.getByLabelText('code');
    await user.type(input, 'abc{Enter}');

    expect(hook).toHaveBeenCalledWith('abc', undefined, undefined, undefined);
    expect(onUpdate).toHaveBeenCalledWith('ABC');
  });
});
