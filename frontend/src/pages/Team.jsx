import React from "react";
import { useParams } from "react-router-dom";

const Team = () => {
  const { id } = useParams();
  return <div className="p-8">Team Page (placeholder) id: {id}</div>;
};

export default Team;
