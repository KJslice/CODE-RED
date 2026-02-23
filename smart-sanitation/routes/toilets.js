const express = require('express');
const router = express.Router();

const TOILETS = [
  { id:1, name:"Sitabuldi Market Public Toilet", area:"Sitabuldi", grade:"A", score:94, rating:4.5, reviews:128, distance:0.3, status:"Open", water:true, soap:true, handDryer:true, wheelchair:false, lastCleaned:"10 min ago", lat:21.146, lng:79.088, issues:[], queue:2 },
  { id:2, name:"Itwari Station Facility", area:"Itwari", grade:"C", score:62, rating:3.1, reviews:74, distance:0.7, status:"Open", water:true, soap:false, handDryer:false, wheelchair:false, lastCleaned:"3 hrs ago", lat:21.151, lng:79.075, issues:["Wet floor","No soap"], queue:0, alert:true },
  { id:3, name:"Sadar Market Toilet Block", area:"Sadar", grade:"A", score:91, rating:4.3, reviews:96, distance:1.1, status:"Open", water:true, soap:true, handDryer:false, wheelchair:true, lastCleaned:"25 min ago", lat:21.138, lng:79.082, issues:[], queue:1 },
  { id:4, name:"Dharampeth Community Toilet", area:"Dharampeth", grade:"B", score:78, rating:3.8, reviews:42, distance:1.4, status:"Open", water:true, soap:true, handDryer:false, wheelchair:false, lastCleaned:"1 hr ago", lat:21.131, lng:79.062, issues:["Minor litter"], queue:0 },
  { id:5, name:"Gandhibagh Public WC", area:"Gandhibagh", grade:"A", score:88, rating:4.1, reviews:61, distance:0.9, status:"Open", water:true, soap:true, handDryer:true, wheelchair:true, lastCleaned:"45 min ago", lat:21.143, lng:79.101, issues:[], queue:3 },
  { id:6, name:"Lakadganj Facility", area:"Lakadganj", grade:"B", score:81, rating:3.9, reviews:33, distance:1.6, status:"Maintenance", water:false, soap:false, handDryer:false, wheelchair:false, lastCleaned:"6 hrs ago", lat:21.158, lng:79.095, issues:["Under maintenance"], queue:0 },
  { id:7, name:"Nandanvan Park Toilet", area:"Nandanvan", grade:"D", score:34, rating:1.8, reviews:19, distance:1.9, status:"Open", water:false, soap:false, handDryer:false, wheelchair:false, lastCleaned:"12 hrs ago", lat:21.122, lng:79.098, issues:["Overflow","No water","Heavy litter"], queue:0, alert:true },
  { id:8, name:"Cotton Market WC", area:"Cotton Market", grade:"B", score:74, rating:3.6, reviews:51, distance:1.2, status:"Open", water:true, soap:false, handDryer:false, wheelchair:false, lastCleaned:"2 hrs ago", lat:21.165, lng:79.082, issues:["Low soap"], queue:1 },
];

router.get('/', (req, res) => {
  let toilets = [...TOILETS];
  if (req.query.grade) toilets = toilets.filter(t => t.grade === req.query.grade.toUpperCase());
  if (req.query.status) toilets = toilets.filter(t => t.status === req.query.status);
  res.json({ toilets, count: toilets.length });
});

router.get('/:id', (req, res) => {
  const toilet = TOILETS.find(t => t.id === parseInt(req.params.id));
  if (!toilet) return res.status(404).json({ error: 'Toilet not found' });
  res.json(toilet);
});

router.post('/:id/rate', (req, res) => {
  const { rating } = req.body;
  const toilet = TOILETS.find(t => t.id === parseInt(req.params.id));
  if (!toilet) return res.status(404).json({ error: 'Toilet not found' });
  const newCount = toilet.reviews + 1;
  const newRating = ((toilet.rating * toilet.reviews) + rating) / newCount;
  toilet.rating = Math.round(newRating * 10) / 10;
  toilet.reviews = newCount;
  res.json({ success: true, newRating: toilet.rating, reviews: toilet.reviews });
});

module.exports = router;