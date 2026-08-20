import { useState, useMemo, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reports.css";

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalDateInputValue = (dateString) => {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? "" : toDateInputValue(date);
};

function Reports({ tasks, user, billingInfo }) {
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const [dateFrom, setDateFrom] = useState(toDateInputValue(startOfMonth));
  const [dateTo, setDateTo] = useState(toDateInputValue(currentDate));
  const [rate, setRate] = useState(15);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");

  // Pre-populate from workspace billing settings
  useEffect(() => {
    if (billingInfo) {
      setClientName(billingInfo.billingName || "");
      setClientEmail(billingInfo.billingEmail || "");
      setClientCompany(billingInfo.billingCompany || "");
    }
  }, [billingInfo]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!task.completedAt) return false;
        const completedDate = toLocalDateInputValue(task.completedAt);
        return (
          (!dateFrom || completedDate >= dateFrom) &&
          (!dateTo || completedDate <= dateTo)
        );
      })
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  }, [tasks, dateFrom, dateTo]);

  const totalHours = filteredTasks.reduce(
    (sum, t) => sum + (t.timeSpent || 0) / 60,
    0,
  );
  const totalAmount = totalHours * rate;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (!dateStr || Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatHours = (minutes) => {
    const h = (minutes || 0) / 60;
    return h % 1 === 0 ? h.toString() : h.toFixed(2);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const billingPeriod = `${formatDate(dateFrom) || "Start"} - ${formatDate(dateTo) || "Present"}`;
    const invoiceNo = `${dateFrom || "open"}-${dateTo || "open"}-${String(Math.floor(Math.random() * 90) + 10)}`;
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", 14, 20);

    // Meta info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No.: ${invoiceNo}`, 14, 30);
    doc.text(`Date: ${today}`, 14, 36);
    doc.text(`Billing Period: ${billingPeriod}`, 14, 42);

    // Biller
    doc.setFont("helvetica", "bold");
    doc.text("Biller:", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(user?.name || "—", 14, 58);
    if (user?.email) doc.text(user.email, 14, 64);

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(clientName || "—", 110, 58);
    if (clientEmail) doc.text(clientEmail, 110, 64);
    if (clientCompany) doc.text(clientCompany, 110, clientEmail ? 70 : 64);

    // Table
    const tableBody = filteredTasks.map((task) => [
      formatDate(task.completedAt),
      task.title,
      task.description || "—",
      formatHours(task.timeSpent),
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["Date", "Task", "Description", "Hours"]],
      body: tableBody,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 45 },
        2: { cellWidth: 85 },
        3: { cellWidth: 20, halign: "right" },
      },
      alternateRowStyles: { fillColor: [248, 249, 255] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.setDrawColor(200, 200, 200);
    doc.line(130, finalY, 196, finalY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Total Hours:", 130, finalY + 8);
    doc.text(totalHours.toFixed(2), 196, finalY + 8, { align: "right" });

    doc.text(`Rate /hr:`, 130, finalY + 15);
    doc.text(`$${Number(rate).toFixed(2)}`, 196, finalY + 15, {
      align: "right",
    });

    doc.line(130, finalY + 19, 196, finalY + 19);

    doc.setFont("helvetica", "bold");
    doc.text("Total Amount Due:", 130, finalY + 27);
    doc.text(`$${totalAmount.toFixed(2)}`, 196, finalY + 27, {
      align: "right",
    });

    doc.save(`invoice-${billingPeriod.replace(" ", "-")}.pdf`);
  };

  return (
    <div className="reports-page">
      <div className="reports-controls">
        <div className="controls-group">
          <div className="control-item">
            <label htmlFor="report-date-from">Date from</label>
            <input
              id="report-date-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="control-item">
            <label htmlFor="report-date-to">Date to</label>
            <input
              id="report-date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="control-item">
            <label>Rate / hr ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <div className="control-item">
            <label>Client Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. John Smith"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="control-item">
            <label>Client Email</label>
            <input
              type="email"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="control-item">
            <label>Company</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
            />
          </div>
        </div>

        <button
          className="download-btn"
          onClick={handleDownload}
          disabled={filteredTasks.length === 0}
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* Preview */}
      <div className="report-preview">
        <div className="preview-header">
          <div>
            <h3>Invoice</h3>
            <p className="preview-meta">
              {formatDate(dateFrom) || "Start"} -{" "}
              {formatDate(dateTo) || "Present"} &nbsp;·&nbsp; Biller:{" "}
              <strong>{user?.name}</strong>
              {clientName && (
                <>
                  {" "}
                  &nbsp;·&nbsp; Bill To: <strong>{clientName}</strong>
                  {clientCompany ? `, ${clientCompany}` : ""}
                  {clientEmail ? ` (${clientEmail})` : ""}
                </>
              )}
            </p>
          </div>
          <div className="preview-totals-mini">
            <span>{filteredTasks.length} tasks</span>
            <span>{totalHours.toFixed(2)} hrs</span>
            <span className="amount">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="no-report-data">
            No tasks found for the selected date range.
          </div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>Description</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="col-date">{formatDate(task.completedAt)}</td>
                  <td className="col-task">{task.title}</td>
                  <td className="col-desc">{task.description || "—"}</td>
                  <td className="col-hours">{formatHours(task.timeSpent)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="tfoot-label">
                  Total Hours
                </td>
                <td className="col-hours tfoot-value">
                  {totalHours.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="tfoot-label">
                  Rate / hr
                </td>
                <td className="col-hours tfoot-value">
                  ${Number(rate).toFixed(2)}
                </td>
              </tr>
              <tr className="tfoot-total">
                <td colSpan={3} className="tfoot-label">
                  Total Amount Due
                </td>
                <td className="col-hours tfoot-value">
                  ${totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reports;
