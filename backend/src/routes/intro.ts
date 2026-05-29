import express from 'express';
import { IntroTimestamp } from '../models/IntroTimestamp';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/intro/:movieSlug — Public, returns the intro end time for a movie
router.get('/:movieSlug', async (req, res) => {
  try {
    const record = await IntroTimestamp.findOne({ movieSlug: req.params.movieSlug });
    if (!record) {
      return res.json(null);
    }
    res.json({ introEndTime: record.introEndTime });
  } catch (error) {
    console.error('Fetch intro timestamp error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/intro — Auth required, upserts the intro timestamp for a movie
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { movieSlug, introEndTime } = req.body;
    if (!movieSlug || introEndTime === undefined || introEndTime === null) {
      return res.status(400).json({ message: 'Thiếu movieSlug hoặc introEndTime' });
    }

    const parsedTime = Number(introEndTime);
    if (isNaN(parsedTime) || parsedTime <= 0) {
      return res.status(400).json({ message: 'introEndTime phải là số dương' });
    }

    const record = await IntroTimestamp.findOneAndUpdate(
      { movieSlug },
      { introEndTime: parsedTime, markedBy: req.userId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(record);
  } catch (error) {
    console.error('Save intro timestamp error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
