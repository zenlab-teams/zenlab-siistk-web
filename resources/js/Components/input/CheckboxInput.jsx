import { useEffect, useRef, useState } from "react";
import { TbCheck } from "react-icons/tb";

const CheckboxInput = ({ name, checked = null, indeterminate = null, onChange = null }) => {
    return (
        <input
            type="checkbox"
            name={name}
            id={name}
            checked={checked}
            indeterminate={indeterminate}
            onChange={onChange}
            className="appearance-none w-5 h-5 border-2 border-slate-300 rounded-md hover:bg-slate-200 checked:bg-sky-400 checked:border-sky-200 checked:hover:bg-sky-500 dark:border-slate-500 dark:hover:bg-slate-600 dark:checked:bg-sky-400 dark:checked:border-sky-800 transition-all"
        />
    );
};

export default CheckboxInput;
