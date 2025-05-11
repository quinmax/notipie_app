import * as React from "react";
import Svg, { Path } from "react-native-svg";

const MeetingModeOn = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={25}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.452 9.988v6a.75.75 0 0 0 .75.75h5.25l4.94 4.94c.945.945 2.56.275 2.56-1.06V5.358c0-1.335-1.615-2.005-2.56-1.06l-4.94 4.94h-5.25a.75.75 0 0 0-.75.75Z"
    />
    <Path
      fill="#fff"
      d="M27.294 12.144h-3a.376.376 0 0 0-.375.375v.937c0 .206.17.375.375.375h3a.376.376 0 0 0 .375-.375v-.937a.376.376 0 0 0-.375-.375Zm-.982 6.135-2.585-1.492a.37.37 0 0 0-.508.138l-.467.808a.375.375 0 0 0 .136.511l2.585 1.493a.371.371 0 0 0 .509-.138l.466-.808a.377.377 0 0 0-.136-.512Zm-3.096-9.23a.371.371 0 0 0 .509.14l2.585-1.494a.375.375 0 0 0 .136-.51l-.464-.807a.371.371 0 0 0-.509-.138l-2.585 1.493a.375.375 0 0 0-.136.51l.464.807Z"
    />
  </Svg>
)
export default MeetingModeOn;
