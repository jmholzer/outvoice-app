import React,{useState , useEffect} from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { currencyFormatter } from './currencyFormatter.js';
import { calculateTotal } from './calculateTotal.js';
import { calculateTax } from './calculateTax.js'

export default function TotalSum(props) {

    const [rowData, setRowData] = useState(props.rowData);

    useEffect(() => {
        setRowData(props.rowData);
    }, [props.rowData]);

    var subtotal = calculateTotal(rowData);
    var tax = calculateTax(subtotal);
    var total = subtotal + tax;

    return (
        <Typography 
            inline variant="subtitle1"
            align="right"
            style={{ 'paddingRight': '60px' }}
            >
                <Box fontSize = {14} fontStyle="oblique" m={1}>
                    Subtotal – {currencyFormatter(subtotal, "£")}
                </Box>
                <Box fontSize = {14} fontStyle="oblique" m={1}>
                    VAT – {currencyFormatter(tax, "£")}
                </Box>
                <Box fontSize = {20} fontStyle="oblique" m={1}>
                    Total – {currencyFormatter(total, "£")}
                </Box>
        </Typography>
    );
};