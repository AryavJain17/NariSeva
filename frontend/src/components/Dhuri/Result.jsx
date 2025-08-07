import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Result = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/harassment');
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Harassment Detection Reports</h2>
      {reports.map((report, idx) => (
        <div key={idx} className="border rounded-lg p-4 mb-4 shadow">
          <p><strong>Risk Level:</strong> {report.riskLevel}</p>
          <p><strong>Total Incidents:</strong> {report.totalIncidents}</p>
          <p><strong>Timeline:</strong></p>
          <ul className="list-disc pl-6">
            {report.incidentTimeline.map((t, i) => (
              <li key={i}>{t.start} to {t.end}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Result;
