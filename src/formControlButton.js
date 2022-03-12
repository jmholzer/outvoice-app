import React from 'react';
import Button from '@material-ui/core/Button';
import Email from './icons/Email';
import PictureAsPdf from './icons/PictureAsPdf';
import Print from './icons/Print';

const buttonIcons = {
  print: Print,
  download: PictureAsPdf,
  printLabel: Email
}

const buttonLabels = {
  print: "Print",
  download: "Download",
  printLabel: "Print Label"
}

const buttonStyle = {
  color: "#3B97D3",
  borderColor: "#3B97D3",
  width: "162px",
  marginLeft: "10px",
  marginRight: "10px"
};

export default function PrintLabelButton(props) {
  var Icon = buttonIcons[props.buttonType];

  return (
    <Button
      variant="outlined"
      size="large"
      type="submit"
      endIcon={<Icon />}
      style={buttonStyle}
    >
      {buttonLabels[props.buttonType]}
    </Button>
  );
}