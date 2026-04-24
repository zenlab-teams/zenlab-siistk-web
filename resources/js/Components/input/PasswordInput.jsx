import { useEffect, useRef, useState } from "react";
import { FaRegEyeSlash, FaEyeSlash } from "react-icons/fa";
import { TbAlertCircle } from "react-icons/tb";
import { motion } from "framer-motion";

const PasswordInput = ({ name, placeholder = null, label, value = null, required = false, error = null, onChange }) => {
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    const openPassword = () => {
        if (isPasswordOpen) {
            setIsPasswordOpen(false);
        } else {
            setIsPasswordOpen(true);
        }
    };

    const handleChange = (e) => {
        onChange(e.target.name, e.target.value);
        setIsInvalid(false);
    };

    return (
        <div className="flex flex-col w-full">
            <label htmlFor={name} className="mb-1">
                {label}
                {required && name !== "password" ? <span className="text-sm text-red-500 font-bold"> *</span> : null}
            </label>
            <div className="relative flex items-center flex-row-reverse">
                <input
                    type={isPasswordOpen ? "text" : "password"}
                    name={name}
                    id={name}
                    placeholder={placeholder}
                    value={value}
                    className={`dark:bg-slate-700 w-full px-3 py-2 border-2 dark:border-slate-600 rounded-lg outline-none focus:border-sky-300 transition-all ${
                        isInvalid || error ? "border-red-300 focus:border-red-300 dark:!border-red-800" : null
                    }`}
                    required
                    onChange={handleChange}
                    onInvalid={() => setIsInvalid(true)}
                />
                {isPasswordOpen ? (
                    <FaEyeSlash
                        className="absolute mr-5 text-slate-400 text-xl cursor-pointer hover:text-slate-500 hover:text-2xl transition-all"
                        onClick={openPassword}
                    />
                ) : (
                    <FaRegEyeSlash
                        className="absolute mr-5 text-slate-400 text-xl cursor-pointer hover:text-slate-500 hover:text-2xl transition-all"
                        onClick={openPassword}
                    />
                )}
            </div>
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

export default PasswordInput;
