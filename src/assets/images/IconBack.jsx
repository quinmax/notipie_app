import * as React from "react";
import Svg, { Path } from "react-native-svg";

const IconBack = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={35}
    height={34}
    fill="none"
    {...props}
  >
    <Path
      fill="#fff"
      d="M17.665 34c-9.4 0-17-7.6-17-17s7.6-17 17-17 17 7.6 17 17-7.6 17-17 17Zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15Z"
    />
    <Path
      fill="#fff"
      d="m17.965 26.7-9.7-9.7 9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3-1.4 1.4Z"
    />
    <Path fill="#fff" d="M9.665 16h17v2h-17v-2Z" />
  </Svg>
)
export default IconBack;
