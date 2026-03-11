import React, { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import axiosInstance from "@/api/axiosInstance";
import { Select } from "antd";

export type SkuType = {
  code: string;
  name: string;
};

type Props = {
  onChange: (value: { label: string; value: string } | null) => void;
  value: { label: string; value: string } | null;
  label?: string;
  width?: string;
  endpoint: string;
};

const AntLocationSelectAcordinttoModule: React.FC<Props> = ({
  value,
  onChange,
  label = "Search Item",
  width = "100%",
  endpoint,
}) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);
  const [loading, setLoading] = useState<boolean>(false);
  const [itemList, setItemList] = useState<SkuType[]>([]);

  const fetchItems = async (query: string | null) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${endpoint}?search=${query}`);
      if (response.data.success) {
        setItemList(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedInputValue) {
      fetchItems(debouncedInputValue);
    }
  }, [debouncedInputValue]);

  return (
    <Select
      onFocus={() => fetchItems(null)}
      filterOption={false}
      showSearch
      loading={loading}
      className={`w-[${width}] custom-select`}
      value={value?.value}
      onSearch={(input) => {
        if (input) setInputValue(input);
        else fetchItems(null);
      }}
      placeholder={label}
      onChange={(selectedValue) => {
        const selectedItem = itemList.find((item) => item.code === selectedValue);
        onChange({
          value: selectedItem!.code,
          label: `${selectedItem?.name}`,
        });
      }}
      options={
        itemList.length > 0
          ? itemList?.map((item) => ({
              value: item.code,
              label: `${item.name}`,
            }))
          : value
          ? [value]
          : []
      }
    />
  );
};

export default AntLocationSelectAcordinttoModule;
