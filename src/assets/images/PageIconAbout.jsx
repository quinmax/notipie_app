import * as React from "react";
import Svg, { Path } from "react-native-svg";

const PageIconAbout = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={48}
    fill="none"
    {...props}
  >
    <Path
      stroke="#03A9F4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M24.01 34.556V21.89M24 43a19 19 0 1 0 0-38 19 19 0 0 0 0 38Z"
    />
    <Path
      stroke="#03A9F4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M23.912 14.886h.02"
    />
  </Svg>
)
export default PageIconAbout;
