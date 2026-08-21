import React from "react";
import { useParams } from "react-router-dom";

const Repository = () => {
  const { id } = useParams();
  return <div className="p-8">Repository Page (placeholder) id: {id}</div>;
};

export default Repository;
