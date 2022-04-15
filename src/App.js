import './App.css';

import Container from '../node_modules/@material-ui/core/Container';
import Typography from '../node_modules/@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import WorkflowTabs from './workflowTabs';
import Box from '@material-ui/core/Box';
import { Icon } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import outvoice from './outvoice-icon/outvoice.svg'

const TitleTypography = withStyles({
  root: {
    color: "#3B97D3"
  }
})(Typography);

const Logo = () => {
  return (
    <Icon>
      <img src={outvoice} height={60} width={60} />
    </Icon>
  )
}

const MainHeader = () => {
  return (
    <div>
      <Container maxWidth="md" style={{ height: '120px', backgroundColor: '#FFFFFF', 'paddingTop': '15px' }}>
        <Grid container spacing={0}>
          <Grid item display="inline">
            <TitleTypography component="div" sx={{ display: 'inline' }} variant='h2'>
              Outvoice
            </TitleTypography>
          </Grid>
          <Grid item display="inline" style={{ width: "200px" }}>
            <Logo component="div" />
          </Grid>
        </Grid>
        <Box mt={1} />
        <Box mt={1} />
      </Container>
    </div>
  )
}

const App = () => {
  return (
    <div>
      <MainHeader />
      <Container maxWidth="md" style={{ height: '100%' }}>
        <WorkflowTabs />
      </Container>
    </div>
  );
}

export default App;