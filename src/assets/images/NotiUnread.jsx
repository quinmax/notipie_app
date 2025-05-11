import * as React from "react";
import Svg, { Path } from "react-native-svg";

const NotiUnread = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={11}
    fill="none"
    {...props}
  >
    <Path
      fill="#B3B3B3"
      stroke="#9BA8B0"
      d="m3.238 8.735-.277.32-.054.06L.9 6.817l.376-.33 1.962 2.248Zm2.489-.568-.83.948-.052-.06-.279-.32.784-.897.377.329Zm3.928-4.5L8.348 5.164l-.376-.328 1.306-1.498.377.329Zm1.964-2.25-1.306 1.497-.377-.33 1.306-1.496.377.329Z"
    />
    <Path
      stroke="#9BA8B0"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m16.76.94-4.286 4.5M7.76 9.375l.429.563 2.143-2.25"
    />
  </Svg>
)
export default NotiUnread;
