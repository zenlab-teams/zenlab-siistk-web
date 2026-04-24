import { useTheme } from "@table-library/react-table-library/theme";
import { useSelector } from "react-redux";

export const tableStyle = (layout, type = null) => {
    const darkMode = useSelector((state) => state.darkMode);

    const tableTheme = useTheme({
        Table: `
            ::-webkit-scrollbar {
                width: 10px;
                padding: 100px
            }
          
            ::-webkit-scrollbar-track {
                background-color: #e2e8f0;
                border-radius: 10px;
            }
           
            ::-webkit-scrollbar-thumb {
                background-color: #64748b; 
                border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background-color: #0ea5e9; 
            }

            --data-table-library_grid-template-columns: ${layout};
        `,
        Row: `
            &:not(:last-of-type) > .td {
                border-bottom: 1px solid #e2e8f0;
            }
            &.row-select-selected {
                background-color: #e2e8f0;
            }
            &.row-select-single-selected {
                background-color: #e0f2fe;
            }
        `,
        BaseCell: `
            &:last-of-type {
                text-align: center;
            },
            &:first-of-type div {
                height: 1.25rem;
            },
            &:first-of-type {
                text-align: center;
            }
        `,
    });

    const orderTableTheme = useTheme({
        Table: `
            ::-webkit-scrollbar {
                width: 10px;
                padding: 100px
            }
          
            ::-webkit-scrollbar-track {
                background-color: #e2e8f0;
                border-radius: 10px;
            }
           
            ::-webkit-scrollbar-thumb {
                background-color: #64748b; 
                border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background-color: #0ea5e9; 
            }

            --data-table-library_grid-template-columns: ${layout};
        `,
        Row: `
            &:not(:last-of-type) > .td {
                border-bottom: 1px solid #e2e8f0;
            }
            &.row-select-selected {
                background-color: #e2e8f0;
            }
            &.row-select-single-selected {
                background-color: #e0f2fe;
            }
        `,
        BaseCell: `
            &:last-of-type {
                text-align: center;
            },
        `,
    });

    if (darkMode) {
        tableTheme.Row = `
            &:not(:last-of-type) > .td {
                border-bottom: 1px solid #334155;
            }
            &.row-select-selected {
                background-color: #334155!important;
            }
            &.row-select-single-selected {
                background-color: #075985!important;
            }
        `;
        tableTheme.Table = `
            ::-webkit-scrollbar {
                width: 10px;
                padding: 100px
            }
        
            ::-webkit-scrollbar-track {
                background-color: #334155;
                border-radius: 10px;
            }
        
            ::-webkit-scrollbar-thumb {
                background-color: #94a3b8; 
                border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background-color: #0ea5e9; 
            }

            --data-table-library_grid-template-columns: ${layout};
        `;
    }

    if (type == 'order-table') {
        return orderTableTheme;
    } else {
        return tableTheme;
    }
};

export const tableRowsSizeOptions = () => {
    const rowsSizeOptions = [
        { value: 5, label: "5" },
        { value: 10, label: "10" },
        { value: 15, label: "15" },
        { value: 20, label: "20" },
        { value: 25, label: "25" },
        { value: 30, label: "30" },
        { value: 35, label: "35" },
        { value: 40, label: "40" },
        { value: 45, label: "45" },
        { value: 50, label: "50" },
    ];

    return rowsSizeOptions;
}
