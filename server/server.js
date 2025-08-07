// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Report = require('./models/Report'); // Make sure the path matches your file structure

const app = express();
const PORT = 1000;

// Replace with your local or MongoDB Atlas URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/harassment_reports';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use(cors());
app.use(bodyParser.json());

app.post('/api/harassment', async (req, res) => {
  try {
    const { totalIncidents, riskLevel, incidentTimeline, videoName } = req.body;

    console.log('Received data:', { totalIncidents, riskLevel, incidentTimeline, videoName });

    // Create new report with correct field names matching schema
    const report = new Report({
      video_name: videoName || 'Unknown Video',
      total_incidents: totalIncidents,
      risk_level: riskLevel,
      incident_timeline: incidentTimeline
    });

    const savedReport = await report.save();
    console.log('Report saved successfully:', savedReport);
    
    res.status(201).json({
      message: 'Harassment data saved successfully',
      report: savedReport
    });
  } catch (err) {
    console.error('Error saving harassment data:', err);
    res.status(500).json({ 
      message: "Failed to save harassment data", 
      error: err.message 
    });
  }
});

// GET: Retrieve all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ created_at: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
});

// GET: Retrieve a specific report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});