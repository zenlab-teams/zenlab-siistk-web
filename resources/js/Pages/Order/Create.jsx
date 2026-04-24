import { useDispatch, useSelector } from "react-redux";
import { setCurrentRoute } from "../../Redux/slice";
import Layout from "../../Layouts/Default";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Sidebar from "../../Layouts/Sidebar";
import { TbPlus, TbTrash, TbX } from "react-icons/tb";
import { MdKeyboardArrowLeft } from "react-icons/md";
import TextInput from "../../Components/input/TextInput";
import TextAreaInput from "../../Components/input/TextAreaInput";
import SelectInput from "../../Components/input/SelectInput";
import NumberInput from "../../Components/input/NumberInput";
import ImageInput from "../../Components/input/ImageInput";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useRowSelect } from "@table-library/react-table-library/select";
import { tableStyle } from "../../config/tableConfig";
import { useSort, HeaderCellSort, SortToggleType } from "@table-library/react-table-library/sort";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import NoData from "./../../../assets/image/NoData.svg";
import CheckboxInput from "../../Components/input/CheckboxInput";
import ModalProduct from "../../Components/modal/ModalCart";
import EmptyCart from "../../../assets/image/EmptyCart.svg";
import ModalConfirm from "../../Components/modal/ModalConfirm";

const OrderCreate = ({ flash, products, filterSuppliers, filterCategories, customer }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setCurrentRoute({ route: "order", subRoute: null }));
    }, []);

    const tableTheme = tableStyle("auto 1.5fr 1fr 1fr 1fr 1fr 0.5fr");

    const [productsData, setProductsData] = useState(products);
    const [cartData, setCartData] = useState([]);
    const [modalProduct, setModalProduct] = useState(true);
    const [modalConfirm, setModalConfirm] = useState(false);
    const [selectedItem, setSelectedItem] = useState([]);
    const [total_product, settotal_product] = useState(0);
    const [total_stock, settotal_stock] = useState(0);
    const [total_price, settotal_price] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        order_name: "",
        customer_id: null,
        total_product: total_product,
        total_stock: total_stock,
        total_price: total_price,
        cartData: cartData,
    });

    const handleAddCart = (itemId, itemPrice, itemName) => {
        setCartData([...cartData, { product_id: itemId, product_name: itemName, product_price: itemPrice, qty: null, total_price: 0 }]);
    };

    const tableData = { nodes: productsData.filter((item) => cartData.map((cartItem) => cartItem.product_id).includes(item.id)) };

    const onSelectChange = (action, state) => {
        setSelectedItem(state.ids);
    };

    useEffect(() => {
        const totalQty = cartData.reduce((accumulator, currentValue) => accumulator + currentValue.qty, 0);
        const alltotal_price = cartData.reduce((accumulator, currentValue) => accumulator + currentValue.total_price, 0);

        settotal_product(cartData.length);
        settotal_stock(!isNaN(totalQty) ? totalQty : 0);
        settotal_price(alltotal_price);

    }, [cartData, cartData.length])

    useEffect(() => {
        setData({
            ...data,
            total_price: total_price,
            total_product: total_product,
            total_stock: total_stock,
            cartData: cartData,
        });
    }, [total_product, total_price, total_stock, cartData])

    const select = useRowSelect(tableData, {
        onChange: onSelectChange,
    });

    const sort = useSort(
        tableData,
        {},
        {
            sortToggleType: SortToggleType.AlternateWithReset,
            sortIcon: {
                margin: "8px",
                iconDefault: <FaSort fontSize="small" />,
                iconUp: <FaSortUp fontSize="small" />,
                iconDown: <FaSortDown fontSize="small" />,
            },
            sortFns: {
                NAME: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
                PRICE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
                STOCK: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
            },
        }
    );

    const onChangeQTY = (itemID, qty) => {
        const dataSelected = tableData.nodes
        const indextotal_price = dataSelected.findIndex(item => item.id === itemID);

        setCartData((prevCartData) => {
            return prevCartData.map((item) => {
                if (item.product_id === itemID) {
                    return { ...item, qty: parseInt(qty), total_price: parseInt(dataSelected[indextotal_price].price * qty) };
                }
                return item;
            });
        });
    }

    const removeCartItem = (itemID) => {
        const indexToRemove = cartData.findIndex(item => item.product_id === itemID);

        if (indexToRemove !== -1) {
            cartData.splice(indexToRemove, 1);
        }
    }

    const removeAllCartItem = () => {
        const updatedItems = cartData.filter((item) => !selectedItem.includes(item.product_id));
        setCartData(updatedItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setModalConfirm(true);
    };

    const submitForm = () => {
        post(route("order.store"));
    }

    let customerOptions = [];
    customer.forEach((customer) => {
        customerOptions.push({ value: customer.id, label: customer.name });
    });

    console.log(cartData);

    return (
        <Layout flash={flash}>
            <Head>
                <title>Create Order | AgentApp</title>
            </Head>
            <Sidebar />
            <AnimatePresence>
                {modalProduct ? (
                    <ModalProduct
                        products={products}
                        closeModal={() => setModalProduct(false)}
                        filterCategories={filterCategories}
                        filterSuppliers={filterSuppliers}
                        handleAddCart={handleAddCart}
                        cartData={cartData}
                    />
                ) : modalConfirm ? (
                    <ModalConfirm
                        closeModal={() => setModalConfirm(false)}
                        title={"Confirm Order"}
                        description={"If an order has been made, the product stock will decrease unless the order status is set to cancelled."}
                        action={() => submitForm()}
                    />
                ) : null }
            </AnimatePresence>
            <section className="sm:ml-80 p-8 relative">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold">Order</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Add New Order</p>
                </div>
                <div className="bg-white dark:bg-slate-800 shadow-lg p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold">Create Order</p>
                        <Link
                            href={route("order.index")}
                            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-lg font-bold transition-all"
                        >
                            <MdKeyboardArrowLeft className="font-bold text-xl" /> Back
                        </Link>
                    </div>
                    <div className="flex justify-center w-full">
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3" encType="multipart/form-data">
                            <div className="grid grid-cols-1 lg:grid-cols-12 justify-center gap-5">
                                <div className="lg:col-span-8">
                                    <div className="flex justify-between w-full items-center">
                                        <p>
                                            Sales Cart<span className="text-sm text-red-500 font-bold"> *</span>
                                        </p>
                                        <div className="flex items-center gap-3">
                                            {selectedItem.length > 0 && (
                                                <TbTrash
                                                    className="text-4xl p-1 text-red-500 rounded-lg bg-red-100 hover:bg-red-200 transition-all cursor-pointer"
                                                    onClick={removeAllCartItem}
                                                />
                                            )}
                                            <TbPlus
                                                className="text-4xl p-1 text-emerald-500 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-all cursor-pointer"
                                                onClick={() => setModalProduct(true)}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Table
                                            data={tableData}
                                            className="text-lg mt-3 !table-fixed max-h-[38rem] !border-b-2 dark:border-slate-600"
                                            theme={tableTheme}
                                            sort={sort}
                                            layout={{ fixedHeader: true, custom: true }}
                                            select={select}
                                        >
                                            {(tableList) => (
                                                <>
                                                    <Header>
                                                        <HeaderRow
                                                            className="!bg-slate-100 dark:!bg-slate-700 text-slate-500 dark:text-slate-400"
                                                            layout={{ custom: true }}
                                                        >
                                                            <HeaderCell className="border-s-2 border-y-2 rounded-s-xl !py-2 !px-3 dark:border-slate-600">
                                                                <CheckboxInput
                                                                    name="tableSelect"
                                                                    checked={select.state.all}
                                                                    indeterminate={!select.state.all && !select.state.none}
                                                                    onChange={select.fns.onToggleAll}
                                                                />
                                                            </HeaderCell>
                                                            <HeaderCellSort
                                                                className="!py-2 !px-3 border-y-2 border-slate-200 dark:border-slate-600 hover:text-sky-500 transition-all"
                                                                sortKey="NAME"
                                                            >
                                                                Sales
                                                            </HeaderCellSort>
                                                            <HeaderCellSort className="!py-2 !px-3 border-y-2 dark:border-slate-600" sortKey="PRICE">
                                                                Price
                                                            </HeaderCellSort>
                                                            <HeaderCellSort className="!py-2 !px-3 border-y-2 dark:border-slate-600" sortKey="STOCK">
                                                                Stock
                                                            </HeaderCellSort>
                                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">QTY</HeaderCell>
                                                            <HeaderCell className="!py-2 !px-3 border-y-2 dark:border-slate-600">
                                                                Total Price
                                                            </HeaderCell>
                                                            <HeaderCell className="!py-2 !px-3 rounded-r-xl border-y-2 border-r-2 border-slate-200 dark:border-slate-600">
                                                                Action
                                                            </HeaderCell>
                                                        </HeaderRow>
                                                    </Header>
                                                    <Body>
                                                        {tableList.length > 0 ? (
                                                            tableList.map((item) => (
                                                                <Row
                                                                    key={item.id}
                                                                    item={item}
                                                                    className="dark:!bg-slate-800 hover:bg-slate-100 dark:hover:!bg-slate-700 cursor-pointer transition-all"
                                                                >
                                                                    <Cell className="!p-3 rounded-s-xl">
                                                                        <CheckboxInput
                                                                            name={"tableItemSelect" + item.id}
                                                                            checked={select.state.ids.includes(item.id)}
                                                                            onChange={() => select.fns.onToggleById(item.id)}
                                                                        />
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                            className="flex justify-start gap-3 items-center whitespace-normal"
                                                                        >
                                                                            <img
                                                                                src={"/storage/productImages/" + item.image}
                                                                                className="w-20 h-20 object-cover rounded-xl"
                                                                            />
                                                                            {item.name}
                                                                        </motion.div>
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        <motion.div
                                                                            className="whitespace-normal"
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                        >
                                                                            Rp{item.price.toLocaleString()}
                                                                        </motion.div>
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                        >
                                                                            <span className="text-lg">{item.stock}</span>
                                                                        </motion.div>
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                        >
                                                                            <NumberInput name="qty" qty={item.id} min={1} max={item.stock} value={!isNaN(cartData.find(cart => cart.product_id == item.id).qty) ? cartData.find(cart => cart.product_id == item.id).qty : 0} required={true} onChange={onChangeQTY} />
                                                                        </motion.div>
                                                                    </Cell>
                                                                    <Cell className="!p-3">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                        >
                                                                            Rp{cartData.find(cart => cart.product_id === item.id).total_price.toLocaleString()}
                                                                        </motion.div>
                                                                    </Cell>
                                                                    <Cell className="!p-3 rounded-r-xl">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            whileInView={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.05 }}
                                                                            className="flex gap-3 justify-center"
                                                                        >
                                                                            <TbX
                                                                                className="text-3xl text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                                                                                onClick={() => removeCartItem(item.id)}
                                                                            />
                                                                        </motion.div>
                                                                    </Cell>
                                                                </Row>
                                                            ))
                                                        ) : (
                                                            <Cell
                                                                gridColumnStart={1}
                                                                gridColumnEnd={100}
                                                                className="h-[25rem] *:!h-full *:flex *:items-center *:justify-center *:flex-col"
                                                            >
                                                                <img src={NoData} className="w-52" />
                                                                <p className="text-2xl py-2 px-5 bg-slate-200 text-slate-400 font-bold rounded-xl mt-8 dark:text-slate-500 dark:bg-slate-700">
                                                                    Cart is empty
                                                                </p>
                                                                <p className="text-slate-400 dark:text-slate-500 mt-3">Add product to cart</p>
                                                            </Cell>
                                                        )}
                                                    </Body>
                                                </>
                                            )}
                                        </Table>
                                    </div>
                                </div>
                                <div className="lg:col-span-4 flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <TextInput
                                            label="Order Name"
                                            type="text"
                                            name="order_name"
                                            placeholder="Enter Order Name"
                                            required={true}
                                            onChange={setData}
                                            value={data.order_name}
                                            error={errors.order_name && errors.order_name}
                                            />
                                        <SelectInput
                                            name="customer_id"
                                            label="Customer"
                                            placeholder="Select Customer"
                                            options={customerOptions}
                                            value={data.customer_id}
                                            onChange={setData}
                                            error={errors.customer_id && errors.customer_id}
                                            required={true}
                                        ></SelectInput>
                                    </div>
                                    <div className="w-full border-2 py-3 px-5 rounded-xl mt-5">
                                        <p className="text-xl font-bold mb-2">Order Details</p>
                                        <div className="w-full flex justify-between text-lg">
                                            <p>Total Sales</p>
                                            <span>{total_product}</span>
                                        </div>
                                        <div className="w-full flex justify-between text-lg">
                                            <p>Total QTY Stock</p>
                                            <span>{total_stock}</span>
                                        </div>
                                        <div className="w-full flex justify-between text-lg">
                                            <p>Total Price</p>
                                            <span>Rp.{total_price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 justify-end mt-3">
                                <button
                                    type="reset"
                                    // onClick={handleReset}
                                    className="bg-red-500 hover:bg-red-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="bg-sky-500 hover:bg-sky-600 text-white dark:text-slate-800 px-5 py-2 rounded-lg font-bold transition-all"
                                >
                                    Add Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default OrderCreate;
