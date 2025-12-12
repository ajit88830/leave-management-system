const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');

// GET ALL LEAVES (Manager only - simplified)
router.get('/all', async (req, res) => {
  try {
    // Ideally, filter by department or manager's team. fetching all for simplicity.
    const leaves = await Leave.find().populate('employeeId', 'name email');
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MY LEAVES (Employee)
router.get('/my-leaves/:userId', async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.userId });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// APPLY FOR LEAVE
router.post('/apply', async (req, res) => {
  try {
    const newLeave = new Leave(req.body);
    await newLeave.save();
    res.json(newLeave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE LEAVE STATUS (Approve/Reject)
router.put('/:id', async (req, res) => {
  try {
    const { status, managerComment } = req.body;
    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id, 
      { status, managerComment }, 
      { new: true }
    );
    res.json(updatedLeave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE LEAVE (Only if pending)
router.delete('/:id', async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ msg: 'Leave not found' });
    
    if (leave.status !== 'Pending') {
      return res.status(400).json({ msg: 'Cannot cancel processed leave' });
    }

    await Leave.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Leave Cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;