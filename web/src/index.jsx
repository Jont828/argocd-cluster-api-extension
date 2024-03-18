import * as React from "react";
import Tree from "./components/Tree.jsx";

export const Extension = (props) => {
  return (
    <div>
      <h1>Hello world!</h1>
      <p>Find me in ./web/src/index.js</p>
      <Tree />
    </div>
  )
}

export const component = Extension;

((window) => {
  window.extensionsAPI.registerResourceExtension(
    component,
    "argoproj.io",
    "Application",
    "My Application Tab"
  );
})(window);