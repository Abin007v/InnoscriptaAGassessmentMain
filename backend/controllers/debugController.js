import { DebugService } from '../services/debugService.js';

class DebugController {
  static async getIndices(req, res) {
    try {
      const indices = await DebugService.getAllIndices();
      res.status(200).json({
        success: true,
        data: indices
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getIndexData(req, res) {
    try {
      const { index } = req.params;
      const { size } = req.query;
      const data = await DebugService.getIndexData(index, parseInt(size) || 100);
      res.status(200).json({
        success: true,
        count: data.length,
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getUserEmails(req, res) {
    try {
      const { userId } = req.params;
      const emails = await DebugService.getEmailsByUser(userId);
      res.status(200).json({
        success: true,
        count: emails.length,
        data: emails
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getUserMailboxes(req, res) {
    try {
      const { userId } = req.params;
      const mailboxes = await DebugService.getUserMailboxes(userId);
      res.status(200).json({
        success: true,
        count: mailboxes.length,
        data: mailboxes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export { DebugController }; 