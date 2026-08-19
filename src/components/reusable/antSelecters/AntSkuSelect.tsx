import React, { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";
import { Select } from "antd";

type SkuItem = {
  id: string;
  text: string;
  device_key?: string;
  deviceKey?: string;
  key?: string;
};

export type SkuSelectValue = {
  label: string;
  value: string;
  deviceKey?: string;
};

type Props = {
  onChange: (value: SkuSelectValue | null) => void;
  value: SkuSelectValue | null;
  label?: string;
  width?: string;
  skuType?: string;
};

const AntSkuSelect: React.FC<Props> = ({
  value,
  onChange,
  label = "Search SKU",
  width = "100%",
  skuType = "soundBox",
}) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [skuList, setSkuList] = useState<SkuItem[]>([]);

  const fetchSkus = async (query: string | null) => {
   
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/product/bySku/${query}?type=${skuType}`
      );
      if (response.data.success) {
        setSkuList(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching SKUs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      fetchSkus(debouncedInputValue);
    }else {
      fetchSkus(null);
    }
  }, [debouncedInputValue]);

  return (
    <Select
      filterOption={false}
      showSearch
      loading={loading}
      className="custom-input"
      style={{ width }}
      value={value?.value}
      onSearch={(input) => {
        if (input) setInputValue(input);
      }}
      placeholder={label}
      onChange={(selectedValue) => {
        const selectedItem = skuList.find((item) => item.id === selectedValue);
        if (selectedItem) {
          onChange({
            value: selectedItem.id,
            label: selectedItem.text,
            deviceKey:
              selectedItem.device_key ??
              selectedItem.deviceKey ??
              selectedItem.key ??
              selectedItem.id,
          });
        }
      }}
      options={
        skuList.length > 0
          ? skuList.map((item) => ({ value: item.id, label: item.text }))
          : value
          ? [value]
          : []
      }
    />
  );
};

export default AntSkuSelect;
