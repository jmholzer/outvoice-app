import './App.css';

import Container from '../node_modules/@material-ui/core/Container';
import Grid from '../node_modules/@material-ui/core/Grid';
import Typography from '../node_modules/@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import WbSunnyIcon from './icons/WbSunny';
import NightsStayIcon from './icons/NightsStay';
import InvoiceForm from './invoiceGeneration';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

const TitleTypography = withStyles({
  root: {
    color: "#85D3E0"
  }
})(Typography);

const SubtitleTypography = withStyles({
  root: {
    color: "#4A4A4A"
  }
})(Typography);

const getTimeOfDay = () => {
  var hour = (new Date()).getHours()
  if (hour < 6 || hour >= 18) {
    return "Evening";
  } else if (hour > 6 && hour < 12) {
    return "Morning"
  } else if (hour >= 12 && hour < 18) {
    return "Afternoon";
  }
}

const TimeOfDayMessage = () => {
  var timeOfDay = getTimeOfDay();

  const iconStyle = {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    position: "relative",
    top: '4px' /* 50% - 3/4 of icon height */
  };

  return (
    <div>
      <Grid container spacing={0}>
        <Grid item display="inline">
          <SubtitleTypography variant='h5'>
            {"Good " + timeOfDay}
          </SubtitleTypography>
        </Grid>
        <Grid item display="inline" style={{ width: "50px" }}>
          {timeOfDay == "Evening" ? <NightsStayIcon style={iconStyle}/> : <WbSunnyIcon style={iconStyle}/>}
        </Grid>
      </Grid>
    </div>
  );
}

const MainHeader = () => {
  return (
    <div>
      <Container maxWidth="md" style={{ height: '120px', backgroundColor: '#FFFFFF' }}>
        <TitleTypography variant='h2'>
          Outvoice
        </TitleTypography>
        <Box mt={1} />
        <TimeOfDayMessage  minWidth="200px" />
        <Box mt={1} />
        <Divider />
      </Container>
    </div>
  )
}


const App = () => {
  return (
    <div>
      <MainHeader />
      <Container maxWidth="md" style={{ height: '100%' }}>
        <InvoiceForm />
      </Container>
    </div>
  );
}

export default App;