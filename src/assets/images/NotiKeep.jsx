import * as React from "react";
import Svg, { Path } from "react-native-svg";

const NotiKeep = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <Path
      fill="#03A9F4"
      fillRule="evenodd"
      d="M10 20c-4.714 0-7.071 0-8.536-1.465C0 17.072 0 14.714 0 10s0-7.071 1.464-8.536C2.93 0 5.286 0 10 0c4.714 0 7.071 0 8.535 1.464C20 2.93 20 5.286 20 10c0 4.714 0 7.071-1.465 8.535C17.072 20 14.714 20 10 20Zm2.474-13.581a.75.75 0 0 1 .107 1.055l-5.714 7a.75.75 0 0 1-1.162 0l-2.286-2.8a.75.75 0 0 1 1.162-.948l1.705 2.088 5.133-6.288a.75.75 0 0 1 1.055-.107Zm4 0a.75.75 0 0 1 .107 1.055l-5.714 7a.75.75 0 0 1-1.21-.064l-.285-.438a.75.75 0 0 1 .88-1.116l5.167-6.33a.75.75 0 0 1 1.055-.107Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default NotiKeep;
