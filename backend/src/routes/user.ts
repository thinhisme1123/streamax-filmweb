import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// GET /api/user/profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/user/favorites
router.post('/favorites', async (req: AuthRequest, res) => {
  try {
    const { slug, title, poster_url } = req.body;
    
    if (!slug) {
      return res.status(400).json({ message: 'Thiếu slug của phim' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const existsIndex = user.favorites.findIndex((f) => f.slug === slug);

    if (existsIndex > -1) {
      // Remove
      user.favorites.splice(existsIndex, 1);
    } else {
      // Add
      user.favorites.push({ slug, title, poster_url });
    }

    await user.save();
    res.json(user.favorites);
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/user/history
router.post('/history', async (req: AuthRequest, res) => {
  try {
    const { movieSlug, movieTitle, poster_url, currentEpisode, episodeSlug, progressPercentage, currentTime, totalDuration } = req.body;

    if (!movieSlug) {
      return res.status(400).json({ message: 'Thiếu slug của phim' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const historyIndex = user.watchHistory.findIndex((h) => h.movieSlug === movieSlug);

    if (historyIndex > -1) {
      // Update existing
      user.watchHistory[historyIndex].currentEpisode = currentEpisode || user.watchHistory[historyIndex].currentEpisode;
      user.watchHistory[historyIndex].episodeSlug = episodeSlug || user.watchHistory[historyIndex].episodeSlug;
      user.watchHistory[historyIndex].progressPercentage = progressPercentage !== undefined ? progressPercentage : user.watchHistory[historyIndex].progressPercentage;
      user.watchHistory[historyIndex].currentTime = currentTime !== undefined ? currentTime : user.watchHistory[historyIndex].currentTime;
      user.watchHistory[historyIndex].totalDuration = totalDuration !== undefined ? totalDuration : user.watchHistory[historyIndex].totalDuration;
      user.watchHistory[historyIndex].lastWatchedAt = new Date();
      if (movieTitle) user.watchHistory[historyIndex].movieTitle = movieTitle;
      if (poster_url) user.watchHistory[historyIndex].poster_url = poster_url;
    } else {
      // Add new
      user.watchHistory.push({
        movieSlug,
        movieTitle,
        poster_url,
        currentEpisode: currentEpisode || '',
        episodeSlug: episodeSlug || '',
        progressPercentage: progressPercentage || 0,
        currentTime: currentTime || 0,
        totalDuration: totalDuration || 0,
        lastWatchedAt: new Date(),
      });
    }

    await user.save();
    res.json(user.watchHistory);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/user/history/:movieSlug
router.delete('/history/:movieSlug', async (req: AuthRequest, res) => {
  try {
    const { movieSlug } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    user.watchHistory = user.watchHistory.filter(h => h.movieSlug !== movieSlug) as any;
    await user.save();
    res.json({ message: 'Đã xoá khỏi lịch sử' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/user/profile/password
router.put('/profile/password', async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;
