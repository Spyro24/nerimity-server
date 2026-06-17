import { Request, Response, Router } from 'express';
import { dateToDateTime, prisma } from '../../common/database';
import { authenticate } from '../../middleware/authenticate';
import { isModMiddleware } from './isModMiddleware';

export function getStats(Router: Router) {
  Router.get('/moderation/stats', authenticate(), isModMiddleware({ allowModBadge: true }), route);
}

async function route(req: Request, res: Response) {
  const firstDayOfWeek = getFirstDayOfWeek();

  const totalRegisteredUsersTime = performance.now();
  const totalRegisteredUsers = await prisma.user.count();

  const weeklyRegisteredUsersTime = performance.now();
  const weeklyRegisteredUsers = await prisma.user.count({
    where: {
      joinedAt: {
        gte: dateToDateTime(firstDayOfWeek),
      },
    },
  });

  const totalCreatedServersTime = performance.now();
  const totalCreatedServers = await prisma.server.count();

  const totalCreatedMessagesTime = performance.now();
  const totalCreatedMessages = await prisma.message.count();

  const weeklyCreatedMessagesTime = performance.now();
  const weeklyCreatedMessages = await prisma.message.count({
    where: {
      createdAt: {
        gte: dateToDateTime(firstDayOfWeek),
      },
    },
  });

  res.json({
    totalRegisteredUsers,
    weeklyRegisteredUsers,
    totalCreatedServers,
    totalCreatedMessages,
    weeklyCreatedMessages,

    debug: {
      totalRegisteredUsersTime: performance.now() - totalRegisteredUsersTime,
      weeklyRegisteredUsersTime: performance.now() - weeklyRegisteredUsersTime,
      totalCreatedServersTime: performance.now() - totalCreatedServersTime,
      totalCreatedMessagesTime: performance.now() - totalCreatedMessagesTime,
      weeklyCreatedMessagesTime: performance.now() - weeklyCreatedMessagesTime,
    },
  });
}

// Get the first day of the current week (Monday)
function getFirstDayOfWeek() {
  const date = new Date();
  const day = date.getDay();

  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  date.setDate(diff);

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}
