import * as React from "react";
import Svg, { Path } from "react-native-svg";

const PageIconNoti = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={48}
    fill="none"
    {...props}
  >
    <Path
      fill="#03A9F4"
      d="M43.06 28.94 39 24.878V19.5A15.021 15.021 0 0 0 25.5 4.575V1.5h-3v3.075A15.02 15.02 0 0 0 9 19.5v5.379l-4.06 4.06A1.5 1.5 0 0 0 4.5 30v4.5A1.5 1.5 0 0 0 6 36h10.5v1.166a7.725 7.725 0 0 0 6.75 7.798A7.51 7.51 0 0 0 31.5 37.5V36H42a1.5 1.5 0 0 0 1.5-1.5V30a1.5 1.5 0 0 0-.44-1.06ZM28.5 37.5a4.5 4.5 0 1 1-9 0V36h9v1.5Zm12-4.5h-33v-2.379l4.06-4.06A1.5 1.5 0 0 0 12 25.5v-6a12 12 0 0 1 24 0v6c0 .398.158.78.44 1.06l4.06 4.061V33Z"
    />
  </Svg>
)
export default PageIconNoti;
