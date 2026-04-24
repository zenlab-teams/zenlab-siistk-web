const Button = ({ type = null, label, name, disabled = false }) => {
    return (
        <button
            type={type}
            name={name}
            className="bg-sky-400 text-white font-bold w-full p-2 rounded-lg hover:bg-sky-500 disabled:bg-slate-300 transition-all"
            disabled={disabled}
        >
            {label}
        </button>
    );
};
export default Button;
