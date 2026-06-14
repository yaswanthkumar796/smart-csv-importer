import express from 'express';
import multer from 'multer';
import { processCsv } from '../services/importService.js';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const report = await processCsv(req.file.path);
    
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import processed successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process import' });
  }
});

export default router;
