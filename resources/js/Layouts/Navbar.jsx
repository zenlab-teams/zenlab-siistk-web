import { TbMenu2 } from "react-icons/tb";
import Logo from "../../assets/image/Logo.svg";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../Redux/slice";

const Navbar = () => {
    const dispatch = useDispatch();

    return (
        <nav className="sm:hidden fixed top-0 left-0 right-0 z-10 h-14 bg-white dark:bg-slate-800 shadow-md flex items-center px-4 gap-3">
            <TbMenu2
                className="text-2xl text-slate-600 dark:text-slate-300 cursor-pointer"
                onClick={() => dispatch(toggleSidebar())}
            />
            <div className="flex items-center gap-1.5">
                <img src={Logo} className="w-5" />
                <span className="text-base font-bold">
                    <span className="text-sky-500">Telaten</span>Karya
                </span>
            </div>
        </nav>
    );
};

export default Navbar;
