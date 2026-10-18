import { useState } from "react";

import {
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";

import Visibility from
  "@mui/icons-material/Visibility";

import VisibilityOff from
  "@mui/icons-material/VisibilityOff";

// A password input with an eye button that shows or hides the text.
// It takes the same props as a MUI TextField.
function PasswordField({
  slotProps,
  ...props
}) {
  const [visible, setVisible] =
    useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      slotProps={{
        ...slotProps,
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={
                  visible
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() => {
                  setVisible(
                    (current) => !current,
                  );
                }}
                // Keep the focus in the input when the button is pressed.
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
              >
                {visible ? (
                  <VisibilityOff />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default PasswordField;
