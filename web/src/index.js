import * as React from "react";

export const Extension = (props) => {
  return (
    <div>
      <h1>Hello world!</h1>
      <p>Find me in ./web/src/index.js</p>
    </div>
  )
}

((window) => {
  const component = () => {
    return React.createElement(
      "div",
      { style: { padding: "10px" } },
      "Hello World"
    );
  };
  window.extensionsAPI.registerSystemLevelExtension(
    component,
    "Test Ext",
    "/hello",
    "fa-flask"
  );
})(window);