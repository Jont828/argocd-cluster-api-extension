import * as React from "react";
import Tree from "./components/Tree.jsx";

export const Extension = (props) => {
  return (
    <div id="root">
      <h1>Hello world!</h1>
      <p>Find me in ./web/src/index.js</p>
      <Tree />
    </div>
  )
}

export const component = Extension;

((window) => {
  window.extensionsAPI.registerSystemLevelExtension(
    component,
    "Cluster API",
    "/cluster-api",
    "fa-turtle"
  );
})(window);