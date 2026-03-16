import React from "react";
import { useParams } from "react-router-dom";
import Q1query from "./Q1query";

const Query: React.FC = () => {
  const { id } = useParams();

  if (id === "Q1") {
    return <Q1query />;
  }

  return <div className="p-4">this is {id} query</div>;
};

export default Query;

