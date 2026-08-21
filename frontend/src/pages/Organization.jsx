import React from "react";
import { useParams } from "react-router-dom";

const Organization = () => {
  const { id } = useParams();
  return <div className="p-8">Organization Page (placeholder) id: {id}</div>;
};

export default Organization;
