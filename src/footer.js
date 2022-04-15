import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import { withStyles } from "@material-ui/core/styles";

const FooterTextTypography = withStyles({
    root: {
      color: "#858585"
    }
  })(Typography);

export default function Footer(props) {
    return (
        <Grid align='center' style={{'paddingTop': '70px'}} >
            <Divider />
            <FooterTextTypography variant="caption">
                <pre style={{ fontFamily: 'inherit' }}>
                    Outvoice Demo. Created by Jannic Holzer (
                    <Link
                        color="inherit"
                        href="https://github.com/jmholzer"
                    >
                            github.com/jmholzer
                    </Link>
                    ).
                </pre>
                <Link
                    color="inherit"
                    href="https://www.flaticon.com/free-icons/paper"
                >
                        Paper icons created by Smashicons - Flaticon
                </Link>
            </FooterTextTypography>
        </Grid>
    );
}