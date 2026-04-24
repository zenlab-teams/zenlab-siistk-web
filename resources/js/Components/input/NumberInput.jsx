import { useEffect, useState } from "react";
import { TbAlertCircle } from "react-icons/tb";
import { motion } from "framer-motion";
import { PhoneInput, CountrySelector } from "react-international-phone";
import MaskedInput from "react-text-mask";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import "react-international-phone/style.css";

const NumberInput = ({
    name,
    placeholder = null,
    value = null,
    label = null,
    required = false,
    error = null,
    arrow = true,
    max = null,
    min = null,
    onChange,
    type = "number",
    qty = null,
}) => {
    const [IsInvalid, setIsInvalid] = useState(false);

    const handlePhoneNumberChange = (event) => {
        setPhoneNumber(event.target.value);
    };

    const convertPriceToInt = (price) => {
        const priceWithoutRp = price.replace("Rp", "").replace(/\./g, "");
        const priceInt = parseInt(priceWithoutRp, 10);
        return priceInt;
    };

    const handleChange = (e) => {
        if (type === "phone") {
            onChange(name, e);
        } else if (type === "currency") {
            const priceInt = convertPriceToInt(e.target.value);
            onChange(e.target.name, priceInt);
        } else {
            onChange(e.target.name, e.target.value);
        }
        setIsInvalid(false);
    };

    const handleChangeQTY = (e) => {
        onChange(qty, e.target.value)
    }

    const defaultMaskOptions = {
        prefix: "Rp",
        suffix: "",
        includeThousandsSeparator: true,
        thousandsSeparatorSymbol: ".",
        allowDecimal: true,
        decimalSymbol: ",",
        decimalLimit: 2,
        integerLimit: 12,
        allowNegative: false,
        allowLeadingZeroes: false,
    };

    if (type == "number") {
        return (
            <div className="flex flex-col w-full">
                {qty ? null : (
                    <label htmlFor={name} className="mb-1">
                        {label}
                        {required ? <span className="text-sm text-red-500 font-bold"> *</span> : null}
                    </label>
                )}
                <input
                    type="number"
                    name={name}
                    id={name}
                    value={value}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 border-2 rounded-lg outline-none focus:border-sky-300 transition-all dark:bg-slate-800 dark:border-slate-600 dark:focus:border-sky-600 [&::-webkit-inner-spin-button]:!bg-red-500 ${
                        !arrow && "[&::-webkit-inner-spin-button]:appearance-none"
                    } ${IsInvalid || error ? "!border-red-300 focus:!border-red-300 dark:!border-red-800" : null}`}
                    required={required}
                    max={max ? max : false}
                    min={min ? min : false}
                    onChange={qty ? handleChangeQTY : handleChange}
                    onInvalid={() => setIsInvalid(true)}
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
    } else if (type == "phone") {
        return (
            <div className="flex flex-col w-full">
                <label htmlFor={name} className="mb-1">
                    {label}
                    {required ? <span className="text-sm text-red-500 font-bold"> *</span> : null}
                </label>
                <PhoneInput
                    defaultCountry="id"
                    className="!h-full"
                    inputClassName={`!w-full !h-full !border-2 !rounded-e-lg !text-base focus:!border-sky-300 dark:!bg-slate-800 dark:!text-slate-200 dark:focus:!border-sky-600 ${
                        IsInvalid || error ? "!border-red-300 focus:!border-red-300 dark:!border-red-800" : "!border-slate-200 dark:!border-slate-600"
                    }`}
                    countrySelectorStyleProps={{
                        buttonClassName:
                            "!h-full !px-3 !border-2 !border-slate-200 !rounded-s-lg focus-visible:!bg-red-500 dark:!border-slate-600 dark:!bg-slate-800 dark:!text-slate-200 dark:focus:!border-sky-600",
                        dropdownStyleProps: {
                            className: "outline-none !rounded-lg dark:!bg-slate-700",
                            listItemClassName: "my-2 dark:!text-slate-200 dark:hover:!bg-slate-600 dark:checked:!bg-red-500",
                            listItemDialCodeClassName: "!text-slate-500 dark:!text-slate-400",
                        },
                    }}
                    inputProps={{ name: name, placeholder: placeholder, required: required, onInvalid: () => setIsInvalid(true) }}
                    value={value ? value : ""}
                    onChange={handleChange}
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
    } else if (type == "currency") {
        const currencyMask = createNumberMask(defaultMaskOptions);

        return (
            <div className="flex flex-col w-full">
                <label htmlFor={name} className="mb-1">
                    {label}
                    {required ? <span className="text-sm text-red-500 font-bold"> *</span> : null}
                </label>
                <MaskedInput
                    mask={currencyMask}
                    name="price"
                    type="text"
                    id={name}
                    inputMode="numeric"
                    className={`w-full px-3 py-2 border-2 rounded-lg outline-none focus:border-sky-300 dark:bg-slate-800 dark:border-slate-600 dark:focus:border-sky-600 transition-all ${
                        IsInvalid || error ? "!border-red-300 focus:!border-red-300 dark:!border-red-800" : null
                    }`}
                    placeholder={placeholder}
                    required={required}
                    value={!value ? null : value}
                    onInvalid={() => setIsInvalid(true)}
                    onChange={handleChange}
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
    }
};

export default NumberInput;
