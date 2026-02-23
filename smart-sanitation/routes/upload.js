const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// AI simulation - same logic as JSX app
function analyzeImages(fileCount) {
  const ISSUES = [
    { class:"Heavy Dirt/Stains", deduction:25, icon:"🟤" },
    { class:"Broken Fixtures", deduction:20, icon:"🔧" },
    { class:"Waste/Litter", deduction:20, icon:"🗑️" },
    { class:"No Hygiene Items", deduction:10, icon:"🧴" },
    { class:"Poor Lighting", deduction:10, icon:"💡" },
    { class:"Water Puddles", deduction:15, icon:"💧" },
  ];
  
  const numIssues = Math.floor(Math.random() * 3);
  const shuffled = [...ISSUES].sort(() => Math.random() - 0.5);
  const detected = shuffled.slice(0, numIssues);
  const totalDeduction = detected.reduce((s, i) => s + i.deduction, 0);
  const score = Math.max(20, 95 - totalDeduction - Math.floor(Math.random() * 8));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D';
  
  return { score, grade, issues: detected, filesAnalyzed: fileCount };
}

router.post('/photos', upload.array('photos', 6), (req, res) => {
  const { toilet_id } = req.body;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No photos uploaded' });
  }

  const aiResult = analyzeImages(req.files.length);
  const urgent = aiResult.grade === 'C' || aiResult.grade === 'D';

  res.json({
    success: true,
    toilet_id,
    files_uploaded: req.files.length,
    ai_result: aiResult,
    urgent,
    message: 'Analysis complete. Pending admin review.',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;