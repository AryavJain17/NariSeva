// server/models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  video_name: { type: String, required: true },
  total_incidents: { type: Number, required: true },
  risk_level: { type: String, required: true },
  incident_timeline: { type: [String], required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);