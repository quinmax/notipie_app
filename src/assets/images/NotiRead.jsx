import * as React from "react";
import Svg, { Path } from "react-native-svg";

const NotiRead = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={11}
    fill="none"
    {...props}
  >
    <Path
      stroke="#0D99FF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m.76 6.526 3.143 3.6 7.857-9m5 .063-8.572 9-.428-.563"
    />
  </Svg>
)
export default NotiRead;
