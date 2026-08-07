import React from "react";
import { useParams } from "react-router-dom";
import Q1query from "./Q1query";
import Q2query from "./Q2query";
import Q3query from "./Q3query";

const Query: React.FC = () => {
  const { id } = useParams();

  if (id === "Q1") {
    return <Q1query />;
  }
   if (id === "Q2") {
    return <Q2query />;
  }
     if (id === "Q3") {
    return <Q3query />;
  }

  return <div className="p-4">this is {id} query</div>;
};

export default Query;

