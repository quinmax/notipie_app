import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const MuteMode = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={34}
    height={34}
    fill="none"
    {...props}
  >
    <Path
      fill="#03A9F4"
      d="M17.01 8.75v16.5a.75.75 0 0 1-1.255.555L10.47 21H7.76a1.75 1.75 0 0 1-1.75-1.75v-4.5c0-.966.784-1.75 1.75-1.75h2.71l5.285-4.805a.75.75 0 0 1 1.255.555Zm-5.745 5.555a.75.75 0 0 1-.505.195h-3a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25h3c.187 0 .367.069.505.195l4.245 3.86v-13.11l-4.245 3.86ZM21.29 13.22a.75.75 0 1 0-1.06 1.06L22.95 17l-2.72 2.72a.75.75 0 1 0 1.06 1.06l2.72-2.72 2.72 2.72a.75.75 0 1 0 1.06-1.06L25.07 17l2.72-2.72a.75.75 0 0 0-1.06-1.06l-2.72 2.72-2.72-2.72Z"
    />
    <Circle cx={17.009} cy={17} r={15.989} stroke="#03A9F4" strokeWidth={2} />
  </Svg>
)
export default MuteMode;
