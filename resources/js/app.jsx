import { createInertiaApp } from "@inertiajs/react";
import nProgress from "nprogress";
import { createRoot } from "react-dom/client";
import { router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { Provider } from "react-redux";
import store from "./Redux/store";

createInertiaApp({
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob("./Pages/**/*.jsx")),
    setup({ el, App, props }) {
        createRoot(el).render(
            <Provider store={store}>
                <App {...props} />
            </Provider>
        );
    },
    progress: {
        color: "#0ea5e9",
        includeCSS: true,
        showSpinner: true,
    },
});

router.on("start", () => nProgress.start());
router.on("progress", (event) => {
    if (event.detail.progress.percentage) {
        nProgress.set((event.detail.progress.percentage / 100) * 0.9);
    }
});
router.on("finish", () => nProgress.done());
