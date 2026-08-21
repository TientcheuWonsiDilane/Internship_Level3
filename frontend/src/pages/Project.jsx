import React from "react";
import { useParams } from "react-router-dom";

const Project = () => {
  const { slug } = useParams();
  return <div className="p-8">Project Page (placeholder) slug: {slug}</div>;
};

export default Project;
