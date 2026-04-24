import { useEffect, useState } from "react";
import { TbPhotoPlus } from "react-icons/tb";
import { TbTrashX, TbEdit } from "react-icons/tb";
import { motion } from "framer-motion";
import { TbAlertCircle } from "react-icons/tb";

const ImageInput = ({ name, label, placeholder, required = false, value, error, edit = null, onChange }) => {
    const [image, setImage] = useState(edit ? edit : value);
    const [IsInvalid, setIsInvalid] = useState(false);

    const handleChange = (e) => {
        setImage(URL.createObjectURL(e.target.files[0]));
        onChange(name, e.target.files[0]);
    };

    const handleRemove = () => {
        setImage(null);
        onChange(name, null);
    };

    useEffect(() => {
        if (value == 'old') {
            setImage(edit);
            console.log(true);
        }
    }, [value])

    return (
        <div className="h-full">
            <label className="cursor-pointer">
                <input
                    type="file"
                    name={name}
                    className="hidden"
                    accept="image/jpeg, image/jpg, image/png"
                    required={edit ? false : required}
                    onChange={handleChange}
                    onInvalid={() => setIsInvalid(true)}
                />
                <p className="mb-1">
                    {label}
                    {required && <span className="text-sm text-red-500 font-bold"> *</span>}
                </p>
                <div
                    className={`w-full border-2 border-slate-200 hover:!border-sky-300 transition-all rounded-lg h-[21.5rem] overflow-hidden flex justify-center dark:border-slate-600 dark:hover:!border-sky-600 ${
                        error || IsInvalid ? "!border-red-300 dark:!border-red-800": null
                    }`}
                >
                    <div className={`h-full w-full flex items-center justify-center flex-col gap-3 ${image && "hidden"}`}>
                        <TbPhotoPlus className="text-slate-500 text-8xl" />
                        <div className="text-center">
                            <p className="text-xl mb-1">{placeholder}</p>
                            <p className="text-sm text-slate-400">Supported format (JPEG, JPG, PNG)</p>
                        </div>
                    </div>
                    <div className={`h-full w-full group/imgPreview flex justify-center relative ${!image && "hidden"}`}>
                        <div className="absolute w-full h-full bg-slate-800 bg-opacity-70 hidden group-hover/imgPreview:flex items-center justify-center gap-2">
                            <TbEdit className="text-7xl text-sky-500 hover:bg-sky-500 hover:bg-opacity-30 p-2 rounded-xl transition-all" />
                            <button type="button" onClick={handleRemove}>
                                <TbTrashX className="text-7xl text-red-500 hover:bg-red-500 hover:bg-opacity-30 p-2 rounded-xl transition-all" />
                            </button>
                        </div>
                        <img src={image} className="h-full object-cover" />
                    </div>
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
            </label>
        </div>
    );
};

export default ImageInput;
