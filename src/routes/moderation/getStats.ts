import { Request, Response, Router } from 'express';
import { dateToDateTime, prisma } from '../../common/database';
import { authenticate } from '../../middleware/authenticate';
import { isModMiddleware } from './isModMiddleware';

export function getStats(Router: Router) {
  Router.get('/moderation/stats', authenticate(), isModMiddleware({ allowModBadge: true }), route);
}

async function route(req: Request, res: Response) {
  const firstDayOfWeek = getFirstDayOfWeek();

  let totalRegisteredUsersTime = performance.now();
  const totalRegisteredUsers = await prisma.user.count();
  totalRegisteredUsersTime = performance.now() - totalRegisteredUsersTime;

  let weeklyRegisteredUsersTime = performance.now();
  const weeklyRegisteredUsers = await prisma.user.count({
    where: {
      joinedAt: {
        gte: dateToDateTime(firstDayOfWeek),
      },
    },
  });
  weeklyRegisteredUsersTime = performance.now() - weeklyRegisteredUsersTime;

  let totalCreatedServersTime = performance.now();
  const totalCreatedServers = await prisma.server.count();
  totalCreatedServersTime = performance.now() - totalCreatedServersTime;

  let totalCreatedMessagesTime = performance.now();
  const totalCreatedMessages = await prisma.message.count();
  totalCreatedMessagesTime = performance.now() - totalCreatedMessagesTime;

  let weeklyCreatedMessagesTime = performance.now();
  const weeklyCreatedMessages = await prisma.message.count({
    where: {
      createdAt: {
        gte: dateToDateTime(firstDayOfWeek),
      },
    },
  });
  weeklyCreatedMessagesTime = performance.now() - weeklyCreatedMessagesTime;

  res.json({
    totalRegisteredUsers,
    weeklyRegisteredUsers,
    totalCreatedServers,
    totalCreatedMessages,
    weeklyCreatedMessages,

    debug: {
      totalRegisteredUsersTime,
      weeklyRegisteredUsersTime,
      totalCreatedServersTime,
      totalCreatedMessagesTime,
      weeklyCreatedMessagesTime,
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
