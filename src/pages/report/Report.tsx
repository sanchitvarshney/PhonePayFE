import React from "react";
import { useParams } from "react-router-dom";
import R1Report from "./R1Report";
import R2Report from "./R2Report";
import R4Report from "./R4Report";
import R3Report from "./R3Report";

const Report: React.FC = () => {
  const { id } = useParams();

  if (id === "R1") {
    return <R1Report />;
  }
  if (id === "R2") {
    return <R2Report />;
  }
      if (id === "R3") {
    return <R3Report />;
  }
    if (id === "R4") {
    return <R4Report />;
  }

  return <div className="p-4">This is {id} Report</div>;
};

export default Report;
