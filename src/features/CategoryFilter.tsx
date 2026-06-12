import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import type {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
} from "ag-grid-community";
import type { CustomFilterProps } from "ag-grid-react";
import { useGridFilter } from "ag-grid-react";

// Custom Category Filter
export default ({ model, onModelChange }: CustomFilterProps) => {
  const [closeFilter, setCloseFilter] = useState<(() => void) | undefined>();
  const [unappliedModel, setUnappliedModel] = useState<string | null>(model?.value || null);

  const categories = ["PART", "PCB", "OTHER", "PACKING"];

  const doesFilterPass = useCallback(
    (params: IDoesFilterPassParams) => {
      if (unappliedModel == null) return true;
      return params.data.category === unappliedModel;
    },
    [unappliedModel]
  );

  const afterGuiAttached = useCallback(
    ({ hidePopup }: IAfterGuiAttachedParams) => {
      setCloseFilter(() => hidePopup);
    },
    []
  );

  useGridFilter({
    doesFilterPass,
    afterGuiAttached,
  });

  useEffect(() => {
    setUnappliedModel(model?.value || null);
  }, [model]);

  const onCategoryChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setUnappliedModel(value === "All" ? null : value);
  };

  const onClick = () => {
    onModelChange(unappliedModel ? { value: unappliedModel } : null);
    if (closeFilter) {
      closeFilter();
    }
  };

  return (
    <div className="p-4 w-52">
      <div className="font-bold mb-2">Select Category</div>
      <div className="mb-2">
        <label className="inline-block mr-2">
          <input
            type="radio"
            name="category"
            value="All"
            checked={unappliedModel == null}
            onChange={onCategoryChange}
            className="mr-1"
          />
          All
        </label>
      </div>
      {categories.map((category) => (
        <div key={category} className="mb-2">
          <label className="inline-block mr-2">
            <input
              type="radio"
              name="category"
              value={category}
              checked={unappliedModel === category}
              onChange={onCategoryChange}
              className="mr-1"
            />
            {category}
          </label>
        </div>
      ))}
      <button
        onClick={onClick}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Apply
      </button>
    </div>
  );
};
