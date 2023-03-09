import React, { useState } from "react";
import style from "./dashboardHome.module.css";
import ClosedPositions from "./ClosedPositions/ClosedPositions";
import ActivePositions from "./ActivePositions/ActivePositions";
import Navbar from "../Navbar/Navbar";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  const [status, setStatus] = useState(true);

  return (
    <div className="dashboardBody">
      <Navbar />
      <div>
        <div className={style.section1}>
          <div className={style.leftSideSection1}>
            <div className={style.heading}>My Dashboard</div>

            <div>
              <div className={style.statusLinks}>
                <div
                  className={status === true ? style.underLineActive : null}
                  onClick={() => setStatus(true)}
                >
                  Active Interviews
                </div>

                <div
                  className={status === false ? style.underLineActive : null}
                  onClick={() => setStatus(false)}
                >
                  Closed Interviews
                </div>
              </div>
            </div>
          </div>
          <div>
            <button className={style.createBtn}>
              <Link to={"/dashboard/createJobPosition"}>+ CREATE</Link>
            </button>
          </div>
        </div>
        {status ? <ActivePositions /> : <ClosedPositions />}
      </div>
    </div>
  );
};
export default DashboardHome;
