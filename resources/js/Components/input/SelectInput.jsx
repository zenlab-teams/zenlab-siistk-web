import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import makeAnimated from "react-select/animated";
import { motion } from "framer-motion";
import { TbAlertCircle } from "react-icons/tb";
import classNames from "classnames";
import { useState } from "react";

const SelectInput = ({ 
    options, 
    label, 
    type, 
    required = false, 
    name, 
    error, 
    placeholder, 
    formatOptionLabel, 
    value, 
    onChange, 
    isOptionDisabled,
    creatable = false,
    onCreateOption = null
}) => {
    const SelectComponent = creatable ? CreatableSelect : Select;

    const animatedComponents = makeAnimated();
    
    const customStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 45,
        }),
    };

    const handleChange = (selected) => {
        onChange(name, selected.value);
    };

    const valueOptionsIndex = value && options.findIndex(itemOptions => itemOptions.value === value);

    return (
        <div className="flex flex-col w-full">
            <label htmlFor={name} className="mb-1">
                {label}
                {required && <span className="text-sm text-red-500 font-bold"> *</span>}
            </label>
            <SelectComponent
                options={options}
                onCreateOption={onCreateOption}
                components={animatedComponents}
                classNames={{
                    control: ({ isFocused }) =>
                        classNames(
                            "!border-2 !outline-none !rounded-lg dark:!bg-slate-800",
                            isFocused ? "!border-sky-200 dark:!border-sky-500 dark:!border-opacity-20" : '!border-slate-200 dark:!border-slate-600'
                        ),
                    singleValue: () => classNames("!text-slate-500 dark:!text-slate-400"),
                    dropdownIndicator: () => classNames("dark:!text-slate-400"),
                    indicatorSeparator: () => classNames("hidden"),
                    menu: () => classNames("!rounded-xl dark:!bg-slate-800"),
                    option: ({ isSelected, isFocused }) => classNames(isSelected && "!bg-sky-400 dark:!bg-sky-500", isFocused && "dark:!bg-slate-600"),
                }}
                name={name}
                placeholder={placeholder}
                styles={customStyles}
                formatOptionLabel={formatOptionLabel}
                value={value && options[valueOptionsIndex]}
                required={required}
                isOptionDisabled={isOptionDisabled}
                onChange={ type == "filter" ? onChange : handleChange}
            />
            {error && (
                <motion.div
                    className="flex gap-1 items-center text-red-400 font-bold mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <TbAlertCircle className="text-xl" />
                    <span>{error}</span>
                </motion.div>
            )}
        </div>
    );
};

export default SelectInput;
