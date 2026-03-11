import React, { forwardRef } from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label?: string;
  required?: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ id, label, className = "", required = false, ...inputProps }, ref) => {
    return (
      <div className={`relative z-0 ${className}`}>
        <input
          id={id}
          ref={ref}
          className="block py-2.5 h-[40px] px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-slate-400 focus:border-b-2 peer"
          placeholder=" "
          autoComplete="off"
          {...inputProps}
        />
        {label && (
          <label
            htmlFor={id}
            className="absolute text-sm text-slate-500 duration-300 transform -translate-y-6 scale-100 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-slate-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-100 peer-focus:-translate-y-6"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;

