import { useMemo, useState } from "react";
import { getLearnerGrowth } from "../utils/learnerGrowth";

const TICK_STEP = 5;
const periods = [
  { id: "days", label: "Days", unit: "last 14 days" },
  { id: "months", label: "Months", unit: "last 6 months" },
  { id: "years", label: "Years", unit: "last 5 years" },
];

// New learners per day, month, or year. One series, so no legend: the heading
// and period toggle say what is plotted. Every value is also in the table view.
function LearnerGrowthChart() {
  const [period, setPeriod] = useState("days");
  const [showTable, setShowTable] = useState(false);

  const points = useMemo(() => getLearnerGrowth(period), [period]);
  const activePeriod = periods.find((item) => item.id === period);

  const total = points.reduce((sum, point) => sum + point.value, 0);
  const busiestValue = Math.max(...points.map((point) => point.value));
  const busiestIndex = points.findIndex((point) => point.value === busiestValue);

  const axisMax = Math.max(TICK_STEP, Math.ceil(busiestValue / TICK_STEP) * TICK_STEP);
  const ticks = [axisMax, axisMax / 2, 0];

  return (
    <section className="dash-card activity admin-growth-card" aria-labelledby="growth-heading">
      <div className="dash-head">
        <div>
          <p className="dash-kicker">Learner growth</p>
          <h2 className="dash-title" id="growth-heading">
            New learners
          </h2>
        </div>
        <button
          type="button"
          className="activity-toggle"
          onClick={() => setShowTable((current) => !current)}
          aria-pressed={showTable}
        >
          {showTable ? "View as chart" : "View as table"}
        </button>
      </div>

      <div className="growth-period-toggle" role="group" aria-label="Time range">
        {periods.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`growth-period-button${item.id === period ? " active" : ""}`}
            aria-pressed={item.id === period}
            onClick={() => setPeriod(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <dl className="dash-stats single growth-stats">
        <div>
          <dt>New learners, {activePeriod.unit}</dt>
          <dd>{total}</dd>
        </div>
      </dl>

      {showTable ? (
        <div className="activity-table-wrap">
          <table className="activity-table">
            <caption className="visually-hidden">New learners for each {period.slice(0, -1)}, {activePeriod.unit}</caption>
            <thead>
              <tr>
                <th scope="col">{period === "days" ? "Day" : period === "months" ? "Month" : "Year"}</th>
                <th scope="col">New learners</th>
                <th scope="col">
                  <span className="visually-hidden">Compared with the busiest {period.slice(0, -1)}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.longLabel} className={point.isCurrent ? "today" : undefined}>
                  <th scope="row">
                    <span className="table-day">
                      {point.longLabel}
                      {point.isCurrent && <span className="table-today">Now</span>}
                    </span>
                  </th>
                  <td className="table-time">{point.value}</td>
                  <td className="table-share" aria-hidden="true">
                    <span className="table-share-track">
                      <span style={{ width: `${(point.value / axisMax) * 100}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td className="table-time">{total}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="activity-chart" role="group" aria-label={`New learners per ${period.slice(0, -1)}, ${activePeriod.unit}`}>
          <div className="activity-gridlines" aria-hidden="true">
            {ticks.map((tick) => (
              <div
                className={`activity-gridline${tick === 0 ? " baseline" : ""}`}
                key={tick}
                style={{ bottom: `${(tick / axisMax) * 100}%` }}
              >
                <span>{tick}</span>
              </div>
            ))}
          </div>

          <div
            className="activity-columns growth-columns"
            style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
          >
            {points.map((point, index) => {
              const height = (point.value / axisMax) * 100;

              return (
                <div
                  className={`activity-col${point.isCurrent ? " today" : ""}`}
                  key={point.longLabel}
                  tabIndex={0}
                  role="img"
                  aria-label={`${point.longLabel}: ${point.value} new ${point.value === 1 ? "learner" : "learners"}`}
                >
                  <div className="activity-bar-area">
                    {point.value > 0 ? (
                      <span className="activity-bar" style={{ height: `${height}%` }} />
                    ) : (
                      <span className="activity-rest" />
                    )}

                    {index === busiestIndex && busiestValue > 0 && (
                      <span className="activity-value" style={{ bottom: `calc(${height}% + 6px)` }}>
                        {point.value}
                      </span>
                    )}

                    <span className="activity-tip" style={{ bottom: `calc(${height}% + 12px)` }}>
                      <strong>
                        {point.value} new {point.value === 1 ? "learner" : "learners"}
                      </strong>
                      <span>{point.longLabel}</span>
                    </span>
                  </div>
                  <span className={`activity-day${point.isCurrent ? " today" : ""}`}>{point.shortLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default LearnerGrowthChart;
