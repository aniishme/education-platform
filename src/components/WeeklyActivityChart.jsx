import { useState } from "react";
import { formatMinutes } from "../utils/studyData";
import "../Dashboard.css";

const TICK_STEP = 30;

// Minutes studied on each of the last seven days. One series, so no legend:
// the heading says what is plotted. Every value is also in the table view.
function WeeklyActivityChart({ days }) {
  const [showTable, setShowTable] = useState(false);

  const total = days.reduce((sum, day) => sum + day.minutes, 0);
  const average = Math.round(total / days.length);
  const busiestMinutes = Math.max(...days.map((day) => day.minutes));
  const busiestIndex = days.findIndex((day) => day.minutes === busiestMinutes);

  // round the top of the axis up to a clean number, with at least an hour of headroom
  const axisMax = Math.max(60, Math.ceil(busiestMinutes / TICK_STEP) * TICK_STEP);
  const ticks = [axisMax, axisMax / 2, 0];

  return (
    <div className="activity">
      <div className="dash-head">
        <div>
          <p className="dash-kicker">Weekly activity</p>
          <h2 className="dash-title" id="activity-heading">
            Study time this week
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

      <dl className="dash-stats">
        <div>
          <dt>Total time</dt>
          <dd>{formatMinutes(total)}</dd>
        </div>
        <div>
          <dt>Daily average</dt>
          <dd>{formatMinutes(average)}</dd>
        </div>
        <div>
          <dt>Best day ({days[busiestIndex].shortLabel})</dt>
          <dd>{formatMinutes(busiestMinutes)}</dd>
        </div>
      </dl>

      {showTable ? (
        <div className="activity-table-wrap">
          <table className="activity-table">
            <caption className="visually-hidden">Minutes studied each day over the last 7 days</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Time studied</th>
                <th scope="col">
                  <span className="visually-hidden">Compared with the busiest day</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.longLabel} className={day.isToday ? "today" : undefined}>
                  <th scope="row">
                    <span className="table-day">
                      {day.weekday}
                      {day.isToday && <span className="table-today">Today</span>}
                    </span>
                    <span className="table-date">{day.dateLabel}</span>
                  </th>
                  <td className={day.minutes ? "table-time" : "table-time none"}>
                    {day.minutes ? formatMinutes(day.minutes) : "No study"}
                  </td>
                  <td className="table-share" aria-hidden="true">
                    <span className="table-share-track">
                      <span style={{ width: `${(day.minutes / axisMax) * 100}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td className="table-time">{formatMinutes(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="activity-chart" role="group" aria-label="Minutes studied each day over the last 7 days">
          <div className="activity-gridlines" aria-hidden="true">
            {ticks.map((tick) => (
              <div
                className={`activity-gridline${tick === 0 ? " baseline" : ""}`}
                key={tick}
                style={{ bottom: `${(tick / axisMax) * 100}%` }}
              >
                <span>{tick}m</span>
              </div>
            ))}
          </div>

          <div className="activity-columns">
            {days.map((day, index) => {
              const height = (day.minutes / axisMax) * 100;

              return (
                <div
                  className={`activity-col${day.isToday ? " today" : ""}`}
                  key={day.longLabel}
                  tabIndex={0}
                  role="img"
                  aria-label={`${day.longLabel}: ${day.minutes ? formatMinutes(day.minutes) : "no study"}`}
                >
                  <div className="activity-bar-area">
                    {day.minutes > 0 ? (
                      <span className="activity-bar" style={{ height: `${height}%` }} />
                    ) : (
                      // a short tick keeps a rest day visible instead of an empty gap
                      <span className="activity-rest" />
                    )}

                    {/* label only the busiest day; the tooltip and table carry the rest */}
                    {index === busiestIndex && busiestMinutes > 0 && (
                      <span className="activity-value" style={{ bottom: `calc(${height}% + 6px)` }}>
                        {formatMinutes(day.minutes)}
                      </span>
                    )}

                    <span className="activity-tip" style={{ bottom: `calc(${height}% + 12px)` }}>
                      <strong>{day.minutes ? formatMinutes(day.minutes) : "No study"}</strong>
                      <span>{day.longLabel}</span>
                    </span>
                  </div>
                  <span className={`activity-day${day.isToday ? " today" : ""}`}>
                    {day.isToday ? "Today" : day.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyActivityChart;
