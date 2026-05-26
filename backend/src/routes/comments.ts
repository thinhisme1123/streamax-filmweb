import express from 'express';
import { Comment } from '../models/Comment';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/comments/:movieSlug
router.get('/:movieSlug', async (req, res) => {
  try {
    const comments = await Comment.find({ movieSlug: req.params.movieSlug })
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/comments
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { movieSlug, rating, text } = req.body;
    if (!movieSlug || !rating || !text) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
    }
    
    const comment = new Comment({
      user: req.userId,
      movieSlug,
      rating,
      text
    });
    await comment.save();
    
    const populated = await comment.populate('user', 'email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
