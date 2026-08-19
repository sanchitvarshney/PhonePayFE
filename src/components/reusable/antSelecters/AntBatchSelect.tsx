import React, { useEffect, useMemo } from "react";
import { Select } from "antd";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getDeviceBatches } from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";

export type BatchSelectValue = {
  label: string;
  value: string;
  totalQty: string | number;
};

type Props = {
  deviceKey?: string;
  onChange: (value: BatchSelectValue | null) => void;
  value: BatchSelectValue | null;
  label?: string;
  width?: string;
};

const AntBatchSelect: React.FC<Props> = ({
  deviceKey,
  value,
  onChange,
  label = "Select Batch",
  width = "100%",
}) => {
  const dispatch = useAppDispatch();
  const { deviceBatchLoading, deviceBatchData } = useAppSelector(
    (state) => state.materialRequestWithoutBom,
  );

  useEffect(() => {
    if (deviceKey) {
      dispatch(getDeviceBatches({ deviceKey }));
    }
  }, [deviceKey, dispatch]);

  const batches = useMemo(
    () =>
      deviceBatchData.find((group) => group.deviceKey === deviceKey)
        ?.batches ?? [],
    [deviceBatchData, deviceKey],
  );

  const options = batches.map((batch) => ({
    value: batch.batchId,
    label: `${batch.batchId} (Qty: ${batch.totalQty})`,
    totalQty: batch.totalQty,
  }));

  return (
    <Select
      disabled={!deviceKey}
      loading={deviceBatchLoading}
      className="custom-input"
      style={{ width }}
      value={value?.value}
      placeholder={label}
      onChange={(selectedValue) => {
        const selectedOption = options.find((o) => o.value === selectedValue);
        onChange(selectedOption ? { ...selectedOption } : null);
      }}
      options={options}
    />
  );
};

export default AntBatchSelect;
