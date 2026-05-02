import React from "react";
import { useParams } from "react-router-dom";
import R1Report from "./R1Report";
import R2Report from "./R2Report";

const Report: React.FC = () => {
  const { id } = useParams();

  if (id === "R1") {
    return <R1Report />;
  }
  if (id === "R2") {
    return <R2Report />;
  }

  return <div className="p-4">This is {id} Report</div>;
};

export default Report;
