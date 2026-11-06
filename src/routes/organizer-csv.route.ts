import { Express, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { OrganizerService } from '../services/organizer.service';

export function addOrganizerCsvRoute(app: Express) {
  app.get('/api/v1/organizer/events/:listingId/attendees/export', async (req: Request, res: Response) => {
    try {
      // Accept token from Authorization header or ?token= query param
      let token = '';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.query.token) {
        token = req.query.token as string;
      }

      if (!token) {
        res.status(401).json({ success: false, error: { message: 'No token provided' } });
        return;
      }

      const decoded = AuthService.verifyToken(token);
      if (decoded.role !== 'organizer') {
        res.status(403).json({ success: false, error: { message: 'Access denied' } });
        return;
      }

      const { listingId } = req.params;
      const attendees = await OrganizerService.getAttendees(listingId, decoded.organizerEmail!);

      // Build CSV
      const headers = ['Ticket Code', 'Tier', 'Attendee Name', 'Email', 'Phone', 'Checked In', 'Check-In Time'];
      const rows = attendees.map((a) => [
        a.ticketCode,
        a.tierName,
        a.attendeeName ?? '',
        a.attendeeEmail ?? '',
        a.attendeePhone ?? '',
        a.isUsed ? 'Yes' : 'No',
        a.checkedInAt ?? '',
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendees-${listingId}.csv"`);
      res.send(csv);
    } catch (err: any) {
      if (err.status === 403 || err.name === 'ForbiddenError') {
        res.status(403).json({ success: false, error: { message: 'Access denied' } });
      } else if (err.status === 404 || err.name === 'NotFoundError') {
        res.status(404).json({ success: false, error: { message: 'Not found' } });
      } else {
        res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
      }
    }
  });
}
