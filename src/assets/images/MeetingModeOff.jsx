import * as React from "react";
import Svg, { Path } from "react-native-svg";

const MeetingModeOff = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7.125 15.75H6a.75.75 0 0 1-.75-.75V9A.75.75 0 0 1 6 8.25h5.25l4.94-4.94c.944-.945 2.56-.275 2.56 1.06v.13m0 6.375v8.754c0 1.336-1.616 2.005-2.56 1.06l-3.44-3.44M5.25 21l16.5-16.5"
    />
  </Svg>
)
export default MeetingModeOff;
