import React from "react";

const Tag = ({ onClick = () => null, children }) => {
  return (
    <span onClick={onClick} className="tag">
      {children}
    </span>
  );
};

export default Tag;
