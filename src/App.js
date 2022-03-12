import './App.css';

import Container from '../node_modules/@material-ui/core/Container';
import Typography from '../node_modules/@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import InvoiceForm from './invoiceGeneration';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

const TitleTypography = withStyles({
  root: {
    color: "#3B97D3"
  }
})(Typography);

const MainHeader = () => {
  return (
    <div>
      <Container maxWidth="md" style={{ height: '120px', backgroundColor: '#FFFFFF' }}>
        <TitleTypography variant='h2'>
          Outvoice
        </TitleTypography>
        <Box mt={1} />
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