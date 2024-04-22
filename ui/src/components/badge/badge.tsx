import * as React from "react";

import { blue, gold, green, red, gray } from '@ant-design/colors';
import { mdiCheck, mdiSync, mdiExclamation } from "@mdi/js";
import Icon from "@mdi/react";
import { Flex } from "antd";

require("./badge.scss");

export default function Badge(props : any) {
  const bg ="#DEE6EB";
  var path;
  if (props.ready) {
    path = mdiCheck;
  } else if (props.severityType === "error") {
    path = mdiExclamation;
  } else {
    path = mdiSync;
  }

  return (
    <div className="badge-wrap">
      <div 
        className="top-right"
        style={{
          top: -(props.size / 2) + "px",
          right: -(props.size / 2) + "px",
          height: props.size + "px",
          width: props.size + "px",
        }}
      >
        <div
          className="border"
          style={{
            borderColor: bg,
            height: (props.size) + "px",
            width: (props.size) + "px",
          }}
        >
          <div className="badge-fill"
            style={{
              backgroundColor: getColor(props.ready, props.severityType),
              height: (props.size - 4) + "px",
              width: (props.size - 4) + "px",
            }}
          >
            <Flex justify="center" align="center" className="badge-icon-wrap">
              <Icon path={path} size={"12px"} color="#fff" className="badge-icon" />
            </Flex>
          </div>
        </div>
      </div>
    </div>
  )
}

function getColor(ready : boolean, severityType : string) {
  if (ready) {
    return green[6];
  }
  switch(severityType) {
    case "error":
      return red[5];
    case "warning":
      return gold[6];
    case "info":
      return blue[6];
    default:
      return gray[6];
  }
}