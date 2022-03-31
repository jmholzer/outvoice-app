import React,{useState , useEffect} from 'react';
import Typography from '@material-ui/core/Typography';
import { currencyFormatter } from './currencyFormatter.js';
import { calculateTotal } from './calculateTotal.js';

export default function TotalSum(props) {

    const [rowData, setRowData] = useState(props.rowData);

    useEffect(() => {
        setRowData(props.rowData);
    }, [props.rowData]);

    return (
        <Typography 
            inline variant="subtitle1"
            align="right"
            style={{ 'paddingRight': '60px' }}
            >
                Total {currencyFormatter(calculateTotal(rowData), "£")}
        </Typography>
    );
};