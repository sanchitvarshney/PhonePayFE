import React from "react";
import { useParams } from "react-router-dom";
import R1Report from "./R1Report";

const Report: React.FC = () => {
  const { id } = useParams();

  if (id === "R1") {
    return <R1Report />;
  }

  return <div className="p-4">This is {id} Report</div>;
};

export default Report;

