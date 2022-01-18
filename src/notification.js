import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
}));

function Notification(props) {
    const classes = useStyles();
    const [alert, setAlert] = useState(props);

    React.useEffect(() => {
        setAlert(props);
    }, [props])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlert({
            ...alert,
            open: false,
        })
        props.resetState()
    };

    return (
        <div className={classes.root}>
            <Snackbar
                open={alert.open}
                autoHideDuration={4000} onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleClose} severity={alert.severity}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default React.memo(
    Notification,
    (prevProps, nextProps) => prevProps.open === nextProps.open
);