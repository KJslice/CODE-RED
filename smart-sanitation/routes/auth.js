const express = require('express');
const router = express.Router();

const EMPLOYEES = [
  { id:"EMP001", name:"Suresh Wankhede", zone:"Sitabuldi / Sadar", email:"suresh@nmc.gov.in", password:"emp001", compliant:true, uploads:22, assignedToilets:[1,3] },
  { id:"EMP002", name:"Meena Thakre", zone:"Itwari / Lakadganj", email:"meena@nmc.gov.in", password:"emp002", compliant:false, uploads:18, assignedToilets:[2,6] },
  { id:"EMP003", name:"Dilip Rao", zone:"Dharampeth / Nandanvan", email:"dilip@nmc.gov.in", password:"emp003", compliant:false, uploads:11, assignedToilets:[4,7] },
  { id:"EMP004", name:"Kavita Borkar", zone:"Gandhibagh / Cotton Mkt", email:"kavita@nmc.gov.in", password:"emp004", compliant:true, uploads:25, assignedToilets:[5,8] },
];

const ADMINS = [
  { id:"ADM001", name:"Rajesh Shukla", email:"admin@nmc.gov.in", password:"admin123", role:"admin" },
  { id:"ADM002", name:"Priya Deshmukh", email:"priya@nmc.gov.in", password:"admin456", role:"admin" },
];

router.post('/login', (req, res) => {
  const { role, email, password } = req.body;

  if (role === 'public') {
    return res.json({ success: true, role: 'public', name: 'Citizen', token: 'public-token-123' });
  }

  if (role === 'employee') {
    const emp = EMPLOYEES.find(e => e.email === email && e.password === password);
    if (emp) {
      const { password: _, ...empData } = emp;
      return res.json({ success: true, role: 'employee', token: `emp-token-${emp.id}`, ...empData });
    }
  }

  if (role === 'admin') {
    const adm = ADMINS.find(a => a.email === email && a.password === password);
    if (adm) {
      const { password: _, ...admData } = adm;
      return res.json({ success: true, role: 'admin', token: `adm-token-${adm.id}`, ...admData });
    }
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;