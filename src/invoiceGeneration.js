import React, { useState, useCallback, useRef } from 'react';
import { withStyles } from "@material-ui/core/styles";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import Search from '@material-ui/icons/Search';
import Delete from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import CloudDownload from '@material-ui/icons/CloudDownload';
import FormControlButton from './formControlButton';
import TotalSum from './totalSum';
import download from './download';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import Moment from 'moment'
import MomentUtils from '@date-io/moment';
import * as cloneDeep from 'lodash/cloneDeep';
import Notification from './notification';
import Box from '@material-ui/core/Box';
import { AgGridReact } from 'ag-grid-react';
import Divider from '@material-ui/core/Divider';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { currencyFormatter } from './currencyFormatter.js';
import { calculateTotal } from './calculateTotal';
import { taxRate } from './calculateTax.js'

const BlueTextTypography = withStyles({
    root: {
        color: "#3B97D3"
    }
})(Typography);

const defaultFormValues = {
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    post_code: "",
    invoice_number: "",
    invoice_date: Moment(new Date()),
    pay_date: Moment(new Date()),
    email_address: "",
    cc_email_address: "",
};

const defaultAlertState = {
    open: false,
    severity: "",
    message: "",
};

const calculateAmountDue = (params) => {
    let amountDue = Number(params.data.count) * Number(params.data.cost_per_item);
    return currencyFormatter(amountDue, "£")
};

function createLineItem() {
    const item = {
        "item": "",
        "cost_per_item": null,
        "count": null
    };
    return item;
}
  
var searchResults = {};

export default function InvoiceForm() {
    const [formValues, setFormValues] = useState(defaultFormValues);
    const [alert, setAlert] = useState(defaultAlertState);
    const [rowData, setRowData] = useState([
        {"item": "", "cost_per_item": 0, "count": 0}
    ]);
    const [columnDefs] = useState([
        {
            headerName: "Item",
            field: "item",
            resizable: true,
            minWidth: 400,
            editable: true
        },
        {
            headerName: "Cost per Item",
            field: "cost_per_item",
            resizable: true,
            minWidth: 30,
            editable: true,
            valueFormatter: params => currencyFormatter(params.data.cost_per_item, '£'),
            filter: 'agNumberColumnFilter',
            filterParams: {
              suppressAndOrCondition: true,
              filterOptions: ['greaterThan'],
            }
        },
        {
            headerName: "Count",
            field: "count",
            resizable: true,
            minWidth: 30,
            valueFormatter: params => Number(params.data.count),
            editable: true
        },
        {
            headerName: "Amount Due",
            field: "amountDue",
            resizable: true,
            minWidth: 30,
            //valueFormatter: params => currencyFormatter(params.data.amountDue, '£'),
            filter: 'agNumberColumnFilter',
            filterParams: {
              suppressAndOrCondition: true,
              filterOptions: ['greaterThan'],
            },
            valueGetter: calculateAmountDue
        }
    ]);

    const addRow = useCallback(
        () => {
            const newStore = rowData.slice();
            const newLineItem = createLineItem();
            newStore.push(newLineItem)
            setRowData(newStore);
        },
        [rowData]
    );

    const gridRef = useRef();

    const removeRow = useCallback(() => {
        const selectedRowNodes = gridRef.current.api.getSelectedNodes();
        const selectedIds = selectedRowNodes.map(function (rowNode) {
            return Number(rowNode.id);
        });;
        setRowData(rowData.filter((_, index) => !selectedIds.includes(index)));
    }, [rowData]);

    const onCellValueChanged = useCallback((params) => {
        let data = [...rowData]
        setRowData(data);
    })

    const resetAlertState = () => {
        setAlert(defaultAlertState);
    };

    const handleInputChange = (e) => {
        if (e._isAMomentObject) {
            let caller = e.caller;
            delete caller.e;
            setFormValues({
                ...formValues,
                [caller]: e
            })
        }
        else {
            const { name, value } = e.target;
            setFormValues({
                ...formValues,
                [name]: value,
            })
        }
    };

    const handleClientDelete = (event) => {
        fetch("http://api.outvoice.com:8000/client", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: formValues.first_name,
                last_name: formValues.last_name,
                address_line_1: formValues.address_line_1,
                address_line_2: formValues.address_line_2,
                city: formValues.city,
                post_code: formValues.post_code,
                method: "remove"
            })
        })
            .then(response => response.json())
            .then(response => {
                if(response.success) {
                    setAlert({
                        open: true,
                        severity: "success",
                        message: "Deleted client address record.",
                    });
                } else {
                    setAlert({
                        open: true,
                        severity: "info",
                        message: "Client address not found in database, no changes made.",
                    });
                }
            })

        setFormValues({
            ...formValues,
            address_line_1: "",
            address_line_2: "",
            city: "",
            post_code: ""
        });

        // reset search results as these may have changed
        for (var result in searchResults) delete searchResults[result];
    }

    const handleAddressSearch = (event) => {
        let searchKey = formValues.first_name + formValues.last_name;
        if (!(searchKey in searchResults)) {
            fetch("http://api.outvoice.com:8000/client", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: formValues.first_name,
                    last_name: formValues.last_name,
                    address_line_1: formValues.address_line_1,
                    address_line_2: formValues.address_line_2,
                    city: formValues.city,
                    post_code: formValues.post_code,
                    method: "search"
                })
            })
                .then(response => response.json())
                .then(response => {
                    searchResults[searchKey] = response;
                    searchResults[searchKey].searchResultLoops = 0;
                })
                .then(() => injectSearchResults(searchKey));
        } else {
            injectSearchResults(searchKey);
        }
    }

    const injectSearchResults = searchKey => {
        if (searchResults[searchKey].length > 0) {
            let index = searchResults[searchKey].searchResultLoops;
            setFormValues({
                ...formValues,
                address_line_1: searchResults[searchKey][index].address_line_1,
                address_line_2: searchResults[searchKey][index].address_line_2,
                city: searchResults[searchKey][index].city,
                post_code: searchResults[searchKey][index].post_code
            })

            if (searchResults[searchKey].length > 1) {
                index = (index + 1) % (searchResults[searchKey].length);
                searchResults[searchKey].searchResultLoops = index;
            }
        }
    }

    const handleSubmit = (method) => {
        //event.preventDefault();
        var submitValues = cloneDeep(formValues);
        submitValues["invoice_date"] = submitValues["invoice_date"].format("YYYY-MM-DD");
        submitValues["pay_date"] = submitValues["pay_date"].format("YYYY-MM-DD");
        // Add line items, balance
        submitValues["line_items"] = cloneDeep(rowData);
        submitValues["subtotal"] = calculateTotal(rowData);
        submitValues["tax"] = taxRate;
        //console.log(event);
        //console.log(event.submitter);
        if (method == "download") {
            submitValues["method"] = "download";
            fetch("http://api.outvoice.com:8000/invoice", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitValues)
            })
                .then(res => res.blob())
                .then(blob => {
                    var fileName = (
                        "Invoice_"
                        + submitValues["first_name"]
                        + "_" + submitValues["last_name"]
                        + "_" + submitValues["invoice_date"]
                    )
                    download(blob, fileName, "application/pdf")
                })
        }
        //else if (event.nativeEvent.submitter.innerText === "PRINT") {
        else if (method == "email") {
            submitValues["method"] = "print";
            fetch("http://api.outvoice.com:8000/invoice", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitValues)
            })
                .then(
                    setFormValues(
                        defaultFormValues
                    )
                );
        }

        // reset search results as these may have changed
        for (var result in searchResults) delete searchResults[result];
    };

    return (
        <React.Fragment>
            <Box mt={2} />
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <BlueTextTypography variant="h6" gutterBottom component="div">
                        Client's details...
                    </BlueTextTypography>
                    <Grid item xs={12} sm={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            required
                            id="first_name"
                            name="first_name"
                            label="Client's first name"
                            fullWidth
                            value={formValues.first_name}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            required
                            id="last_name"
                            name="last_name"
                            label="Client's last name"
                            fullWidth
                            value={formValues.last_name}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <IconButton aria-label="search" onClick={handleAddressSearch} style={{ 'paddingTop': '15px' }}>
                            <Tooltip title="Search for client">
                                <Search style={{ color: "#3B97D3" }} />
                            </Tooltip>
                        </IconButton>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <IconButton aria-label="delete" onClick={handleClientDelete} style={{ 'paddingTop': '15px' }}>
                            <Tooltip title="Delete client data from database">
                                <Delete style={{ color: "#3B97D3" }} />
                            </Tooltip>
                        </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            id="address_line_1"
                            name="address_line_1"
                            label="Client's address (line 1)"
                            fullWidth
                            value={formValues.address_line_1}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="address_line_2"
                            name="address_line_2"
                            label="Client's address (line 2)"
                            fullWidth
                            value={formValues.address_line_2}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="city"
                            name="city"
                            label="Client's city"
                            fullWidth
                            value={formValues.city}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="post_code"
                            name="post_code"
                            label="Client's postcode"
                            fullWidth
                            value={formValues.post_code}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid container>
                        <div style={{ height: "20px" }} />
                    </Grid>
                    <BlueTextTypography variant="h6" gutterBottom component="div">
                        Request payment for...
                    </BlueTextTypography>
                    <Grid item xs={12} sm={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }} >
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columnDefs}
                                domLayout={'autoHeight'}
                                enableCellChangeFlash={true}
                                animateRows={true}
                                rowSelection='single'
                                onCellValueChanged={onCellValueChanged}
                                onGridReady={e => {
                                    e.api.sizeColumnsToFit();
                                    e.columnApi.resetColumnState();
                                }}>
                            </AgGridReact>
                        </div>
                    </Grid>
                    <Grid container justify="center" sm={12}>
                        <IconButton onClick={() => addRow()} aria-label="add" style={{ 'paddingTop': '5px' }}>
                            <Add style={{ color: "#3B97D3" }} />
                        </IconButton>
                        <IconButton onClick={() => removeRow()} aria-label="add" style={{ 'paddingTop': '5px' }}>
                            <Remove style={{ color: "#3B97D3" }} />
                        </IconButton>
                    </Grid>
                    <Grid container justify="space-between" sm={12}>
                        <Grid container justify="space-between">  
                            <Typography inline variant="h6" align="left"></Typography>
                            <TotalSum rowData={rowData}></TotalSum>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={12} style={{ 'paddingTop': '0px' }}></Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            id="invoice_number"
                            name="invoice_number"
                            label="Invoice number"
                            fullWidth
                            value={formValues.invoice_number}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <KeyboardDatePicker
                                required
                                clearable
                                format="DD/MM/YYYY"
                                id="invoice_date"
                                name="invoice_date"
                                label="Invoice dated"
                                value={formValues.invoice_date}
                                onChange={(e) => {
                                    e.caller = "invoice_date"
                                    handleInputChange(e)
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <KeyboardDatePicker
                                required
                                clearable
                                format="DD/MM/YYYY"
                                id="pay_date"
                                name="pay_date"
                                label="Client to pay on"
                                value={formValues.pay_date}
                                onChange={(e) => {
                                    e.caller = "pay_date"
                                    handleInputChange(e)
                                }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid container>
                        <div style={{ height: "30px" }} />
                    </Grid>
                    <BlueTextTypography variant="h6" gutterBottom component="div">
                        Send to...
                    </BlueTextTypography>
                    <Grid item xs={12} sm={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="email_address"
                            name="email_address"
                            label="Client's email address"
                            fullWidth
                            value={formValues.email_address}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="cc_email_address"
                            name="cc_email_address"
                            label="Cc email address"
                            fullWidth
                            value={formValues.cc_email_address}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid container justify="center" sm={12} style={{ 'paddingTop': '17px' }}>
                        <IconButton aria-label="download"  style={{ 'paddingTop': '15px', 'borderRadius': 0}}>
                            <Tooltip title="Download a copy">
                                <CloudDownload onClick={(e) => handleSubmit("download")} style={{ color: "#3B97D3" }} />
                            </Tooltip>
                        </IconButton>
                        <FormControlButton
                            buttonType="email"
                            name="email"
                            style="form"
                        />
                    </Grid>
                </Grid>
            </form>
            <Notification
                open={alert.open}
                severity={alert.severity}
                message={alert.message}
                resetState={resetAlertState}
            />
        </React.Fragment>
    );
}