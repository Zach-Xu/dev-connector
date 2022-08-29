import React, { Fragment } from "react";
import { useSelector } from "react-redux";

export default function Alert() {
  const alerts = useSelector((state) => state.alert);

  return (
    <Fragment>
      {alerts &&
        alerts.length > 0 &&
        alerts.map((alert) => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        ))}
    </Fragment>
  );
}
