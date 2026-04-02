import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Booking.scss";

const API_BASE = "https://localhost:7035/api/booking";

type TableStatus = "available" | "booked";

interface Table {
  id: number;
  label: string;
  capacity: 2 | 4 | 6;
  status: TableStatus;
  x: number;
  y: number;
}

interface BookingRecord {
  id: number;
  tableId: number;
  guestName: string;
  guestCount: number;
  time: string;
  status: string;
}

interface BookingLog {
  tableId: number;
  guestName: string;
  guestCount: number;
  date: string;
}

interface LocationState {
  partySize?: number;
  date?: string;
}

const todayISO = (): string => new Date().toISOString().split("T")[0];

const baseTables: Table[] = [
  { id: 1, label: "Table 1", capacity: 2, status: "available", x: 1, y: 1 },
  { id: 2, label: "Table 2", capacity: 2, status: "available", x: 3, y: 1 },
  { id: 3, label: "Table 3", capacity: 4, status: "available", x: 1, y: 3 },
  { id: 4, label: "Table 4", capacity: 4, status: "available", x: 3, y: 3 },
  { id: 5, label: "Table 5", capacity: 6, status: "available", x: 1, y: 5 },
  { id: 6, label: "Table 6", capacity: 6, status: "available", x: 3, y: 5 },
];

const Booking: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [tables, setTables] = useState<Table[]>(baseTables);
  const [bookingLogs, setBookingLogs] = useState<BookingLog[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [tableName, setTableName] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");
  const [guestCount, setGuestCount] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const resolveTablesForDate = (data: BookingRecord[], targetDate: string): TableStatus[] => {
    const bookedTableIds = new Set(
      data
        .filter((b) => b.time.split("T")[0] === targetDate)
        .map((b) => b.tableId)
    );
    return baseTables.map((t) => (bookedTableIds.has(t.id) ? "booked" : "available"));
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error();
        const data: BookingRecord[] = await res.json();

        const targetDate = locationState?.date ?? todayISO();
        const statuses = resolveTablesForDate(data, targetDate);

        setTables((prev) => {
          const updated = prev.map((t, i) => ({ ...t, status: statuses[i] }));

          if (locationState?.partySize) {
            const size = locationState.partySize;
            const match = updated.find((t) => t.status === "available" && t.capacity >= size);
            if (match) {
              setSelectedId(match.id);
              setTableName(match.label);
            }
          }

          return updated;
        });

        setBookingLogs(
          data
            .filter((b) => b.time.split("T")[0] === targetDate)
            .map((b) => ({
              tableId: b.tableId,
              guestName: b.guestName,
              guestCount: b.guestCount,
              date: b.time.split("T")[0],
            }))
        );

        if (locationState?.date) setDate(locationState.date);
        if (locationState?.partySize) setGuestCount(String(locationState.partySize));
      } catch {
        setSubmitMsg({ type: "error", text: "Failed to load reservations." });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedId) ?? null,
    [tables, selectedId]
  );

  const maxGuests = selectedTable?.capacity ?? 2;

  const handleTableClick = (table: Table) => {
    if (table.status === "booked") return;
    setSelectedId(table.id);
    setTableName(table.label);
    setGuestCount("");
    setGuestName("");
    setSubmitMsg(null);
  };

  const handleDateChange = async (newDate: string) => {
    setDate(newDate);
    setSubmitMsg(null);

    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error();
      const data: BookingRecord[] = await res.json();

      const statuses = resolveTablesForDate(data, newDate);

      setTables((prev) =>
        prev.map((t, i) => {
          const updated = { ...t, status: statuses[i] };
          return updated;
        })
      );

      setBookingLogs(
        data
          .filter((b) => b.time.split("T")[0] === newDate)
          .map((b) => ({
            tableId: b.tableId,
            guestName: b.guestName,
            guestCount: b.guestCount,
            date: b.time.split("T")[0],
          }))
      );

      setSelectedId((prevId) => {
        if (prevId === null) return null;
        const stillAvailable = statuses[baseTables.findIndex((t) => t.id === prevId)] === "available";
        if (!stillAvailable) {
          setTableName("");
          return null;
        }
        return prevId;
      });
    } catch {
      setSubmitMsg({ type: "error", text: "Failed to check availability for this date." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTable) {
      setSubmitMsg({ type: "error", text: "Please select a table on the floor plan." });
      return;
    }
    if (selectedTable.status === "booked") {
      setSubmitMsg({ type: "error", text: "This table is already booked." });
      return;
    }
    if (!guestName.trim() || !guestCount || !date) {
      setSubmitMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }

    const count = Number(guestCount);
    if (count < 1 || count > maxGuests) {
      setSubmitMsg({ type: "error", text: `Guest count must be between 1 and ${maxGuests}.` });
      return;
    }

    const payload = {
      tableId: selectedTable.id,
      guestName: guestName.trim(),
      guestCount: count,
      time: new Date(date).toISOString(),
      status: "booked",
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setSubmitMsg({ type: "error", text: "Table is already booked for this date." });
        return;
      }
      if (!res.ok) throw new Error();

      setTables((prev) =>
        prev.map((t) => (t.id === selectedTable.id ? { ...t, status: "booked" } : t))
      );

      setBookingLogs((prev) => [
        ...prev,
        { tableId: selectedTable.id, guestName: guestName.trim(), guestCount: count, date },
      ]);

      setSubmitMsg({ type: "success", text: `${selectedTable.label} booked for ${date}!` });
      setSelectedId(null);
      setTableName("");
      setGuestName("");
      setGuestCount("");
      setDate("");
    } catch {
      setSubmitMsg({ type: "error", text: "Failed to complete reservation. Please try again." });
    }
  };

  if (loading) {
    return (
      <div className="booking__state">
        <span className="booking__spinner" />
        <span>Loading floor plan...</span>
      </div>
    );
  }

  return (
    <div className="booking">
      <header className="booking__header">
        <h1 className="booking__title">Reserve Your Table</h1>
        <p className="booking__subtitle">Select a table &amp; complete the form</p>
        <div className="booking__divider" />
      </header>

      <div className="booking__layout">
        <aside className="booking__form-panel">
          <form className="booking__form" onSubmit={handleSubmit} noValidate>
            <h2 className="booking__form-title">Reservation Details</h2>

            <div className="booking__field">
              <label className="booking__label" htmlFor="tableName">
                Table
              </label>
              <input
                id="tableName"
                className="booking__input"
                type="text"
                placeholder="Select a table from the floor plan"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                readOnly
              />
            </div>

            <div className="booking__field">
              <label className="booking__label" htmlFor="guestName">
                Guest Name
              </label>
              <input
                id="guestName"
                className="booking__input"
                type="text"
                placeholder="Enter guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                disabled={!selectedTable}
              />
            </div>

            <div className="booking__field">
              <label className="booking__label" htmlFor="guestCount">
                Guests
              </label>
              <div className="booking__select-wrap">
                <select
                  id="guestCount"
                  className="booking__select"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  disabled={!selectedTable}
                >
                  <option value="">— select guest count —</option>
                  {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
                <span className="booking__select-arrow">▾</span>
              </div>
              {selectedTable && (
                <p className="booking__field-hint">Max capacity: {selectedTable.capacity} guests</p>
              )}
            </div>

            <div className="booking__field">
              <label className="booking__label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                className="booking__input booking__input--date"
                type="date"
                min={todayISO()}
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            {submitMsg && (
              <p className={`booking__msg booking__msg--${submitMsg.type}`}>{submitMsg.text}</p>
            )}

            <button type="submit" className="booking__submit" disabled={!selectedTable}>
              Confirm Reservation
            </button>
          </form>

          <div className="booking__legend">
            <span className="booking__legend-dot booking__legend-dot--available" />
            <span className="booking__legend-label">Available</span>
            <span className="booking__legend-dot booking__legend-dot--booked" />
            <span className="booking__legend-label">Booked</span>
          </div>
        </aside>

        <section className="booking__floor">
          <h2 className="booking__floor-title">Floor Plan</h2>

          <div className="booking__room">
            <span className="booking__room-label">Main Dining Room</span>
            <span className="booking__corner booking__corner--tl" />
            <span className="booking__corner booking__corner--tr" />
            <span className="booking__corner booking__corner--bl" />
            <span className="booking__corner booking__corner--br" />

            <div className="booking__tables-grid">
              {tables.map((table) => (
                <button
                  key={table.id}
                  className={[
                    "booking__table",
                    `booking__table--cap${table.capacity}`,
                    `booking__table--${table.status}`,
                    selectedId === table.id ? "booking__table--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ gridColumn: table.x, gridRow: table.y }}
                  onClick={() => handleTableClick(table)}
                  aria-label={`${table.label}, capacity ${table.capacity}, ${table.status}`}
                  aria-pressed={selectedId === table.id}
                >
                  <span className="booking__table-label">{table.label}</span>
                  <span className="booking__table-cap">
                    {table.capacity === 2 && "●●"}
                    {table.capacity === 4 && "●●●●"}
                    {table.capacity === 6 && "●●●●●●"}
                  </span>
                  <span className="booking__table-seats">{table.capacity} seats</span>
                </button>
              ))}
            </div>
          </div>

          {bookingLogs.length > 0 && (
            <div className="booking__log">
              <h3 className="booking__log-title">Today's Reservations</h3>
              <ul className="booking__log-list">
                {bookingLogs.map((b, i) => {
                  const tbl = tables.find((t) => t.id === b.tableId);
                  return (
                    <li key={i} className="booking__log-item">
                      <span className="booking__log-table">{tbl?.label}</span>
                      <span className="booking__log-info">
                        {b.guestName} · {b.guestCount} guests · {b.date}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Booking;