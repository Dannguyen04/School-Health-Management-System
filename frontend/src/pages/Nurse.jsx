import React from "react";
import { Outlet } from "react-router-dom";
import NurseLayout from "../layouts/Nurse";

const Nurse = () => {
  return (
    <NurseLayout>
      <Outlet />
    </NurseLayout>
  );
};

export default Nurse;
