import * as React from "react";

export const Extension = (props) => {
  return (
    <div>
      <h1>Hello world!</h1>
      <p>Find me in ./web/src/index.js</p>
    </div>
  )
}

export const component = Extension;

((window) => {
  window.extensionsAPI.registerResourceExtension(
    component,
    "*",
    "*",
    "Nice extension"
  );
})(window);