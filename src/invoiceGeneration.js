import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Search from '@material-ui/icons/Search';
import Delete from '@material-ui/icons/Delete';
import FormControlButton from './formControlButton';
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



const defaultFormValues = {
    firstName: "",
    lastName: "",
    invoiceDate: Moment(new Date()),
    addressLine1: "",
    addressLine2: "",
    city: "",
    postCode: "",
    receiptAmount: "",
    receiptNumber: "",
    receiptDescription: "",
};

const defaultAlertState = {
    open: false,
    severity: "",
    message: "",
};

  
var searchResults = {};

export default function InvoiceForm() {
    const [formValues, setFormValues] = useState(defaultFormValues);
    const [alert, setAlert] = useState(defaultAlertState)

    const [rowData] = useState([
        {"Item": "Example", "Price per Item": "10", "Billable Units": 10, "Subtotal": 100}
    ]);
    
    const [columnDefs] = useState([
        { field: "Item", resizable: true, minWidth: 400 },
        { field: "Price per Item", resizable: true, minWidth:  30 },
        { field: "Billable Units", resizable: true, minWidth: 30 },
        { field: "Subtotal", resizable: true, minWidth: 30 }
    ]);   

    const resetAlertState = () => {
        setAlert(defaultAlertState);
    };

    const handleInputChange = (e) => {
        if (e._isAMomentObject) {
            setFormValues({
                ...formValues,
                ["invoiceDate"]: e
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
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                addressLine1: formValues.addressLine1,
                addressLine2: formValues.addressLine2,
                city: formValues.city,
                postCode: formValues.postCode,
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
            addressLine1: "",
            addressLine2: "",
            city: "",
            postCode: ""
        });

        // reset search results as these may have changed
        for (var result in searchResults) delete searchResults[result];
    }

    const handleAddressSearch = (event) => {
        let searchKey = formValues.firstName + formValues.lastName;
        if (!(searchKey in searchResults)) {
            fetch("http://api.outvoice.com:8000/client", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: formValues.firstName,
                    lastName: formValues.lastName,
                    addressLine1: formValues.addressLine1,
                    addressLine2: formValues.addressLine2,
                    city: formValues.city,
                    postCode: formValues.postCode,
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
                addressLine1: searchResults[searchKey][index].addressLine1,
                addressLine2: searchResults[searchKey][index].addressLine2,
                city: searchResults[searchKey][index].city,
                postCode: searchResults[searchKey][index].postCode
            })

            if (searchResults[searchKey].length > 1) {
                index = (index + 1) % (searchResults[searchKey].length);
                searchResults[searchKey].searchResultLoops = index;
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        var submitValues = cloneDeep(formValues);
        submitValues["invoiceDate"] = submitValues["invoiceDate"].format("YYYY-MM-DD");

        if (event.nativeEvent.submitter.innerText === "DOWNLOAD") {
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
                        + submitValues["firstName"]
                        + "_" + submitValues["lastName"]
                        + "_" + submitValues["invoiceDate"]
                    )
                    download(blob, fileName, "application/pdf")
                })
                .then(
                    setFormValues(
                        defaultFormValues
                    )
                );
        }
        else if (event.nativeEvent.submitter.innerText === "PRINT") {
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
                    <Typography variant="h6" gutterBottom component="div">
                        Recipient Information
                    </Typography>
                    <Grid item xs={12} sm={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            required
                            id="firstName"
                            name="firstName"
                            label="First name"
                            fullWidth
                            value={formValues.firstName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            required
                            id="lastName"
                            name="lastName"
                            label="Last name"
                            fullWidth
                            value={formValues.lastName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <IconButton aria-label="search" onClick={handleAddressSearch} style={{ 'paddingTop': '15px' }}>
                            <Search style={{ color: "#3B97D3" }} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <IconButton aria-label="delete" onClick={handleClientDelete} style={{ 'paddingTop': '15px' }}>
                            <Delete style={{ color: "#3B97D3" }} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            id="addressLine1"
                            name="addressLine1"
                            label="Address line 1"
                            fullWidth
                            value={formValues.addressLine1}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="addressLine2"
                            name="addressLine2"
                            label="Address line 2"
                            fullWidth
                            value={formValues.addressLine2}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="city"
                            name="city"
                            label="Town / City"
                            fullWidth
                            value={formValues.city}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            id="postCode"
                            name="postCode"
                            label="Post code"
                            fullWidth
                            value={formValues.postCode}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid container>
                        <div style={{ height: "20px" }} />
                    </Grid>
                    <Typography variant="h6" gutterBottom component="div">
                        Payables
                    </Typography>
                    <Grid item xs={12} sm={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }} >
                            <AgGridReact
                                rowData={rowData}
                                columnDefs={columnDefs}
                                domLayout={'autoHeight'}
                                onGridReady={e => {
                                    e.api.sizeColumnsToFit();
                                    e.columnApi.resetColumnState();
                                }}>
                            </AgGridReact>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            id="receiptAmount"
                            name="receiptAmount"
                            label="Receipt Amount"
                            fullWidth
                            value={formValues.receiptAmount}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            id="receiptNumber"
                            name="receiptNumber"
                            label="Receipt Number"
                            fullWidth
                            value={formValues.receiptNumber}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <KeyboardDatePicker
                                required
                                clearable
                                format="DD/MM/YYYY"
                                id="invoiceDate"
                                name="invoiceDate"
                                label="Invoice Date"
                                value={formValues.invoiceDate}
                                onChange={handleInputChange}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid container>
                        <div style={{ height: "30px" }} />
                    </Grid>
                    <Grid container justify="center" sm={12}>
                        <FormControlButton
                            buttonType="download"
                            name="download"
                        />
                        <FormControlButton
                            buttonType="print"
                            name="print"
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