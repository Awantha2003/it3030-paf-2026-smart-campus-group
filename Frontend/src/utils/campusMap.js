import {
  calculateDistanceKm,
  estimateTravelMinutes,
  getTechnicianCoordinates,
  parseCoordinates,
  parseCoordinatesFromLocation
} from './location';

// Give higher weight to more urgent tickets.
function getPriorityWeight(priority) {
  if (priority === 'CRITICAL') return 5;
  if (priority === 'HIGH') return 4;
  if (priority === 'MEDIUM') return 3;
  if (priority === 'LOW') return 2;
  return 1;
}

// Open tickets are treated as more urgent than completed ones.
function getStatusWeight(status) {
  if (status === 'OPEN') return 3;
  if (status === 'IN_PROGRESS') return 2;
  return 1;
}

// Count how many active tickets a technician is already handling.
export function getTechnicianActiveLoad(technicianId, tickets = []) {
  return tickets.filter(
    (ticket) =>
      ticket.assignedTo === technicianId &&
      ticket.status !== 'RESOLVED' &&
      ticket.status !== 'CLOSED' &&
      ticket.status !== 'REJECTED'
  ).length;
}

// Rank technicians by distance, workload, and category match.
export function rankTechniciansForTicket(ticket, technicians = [], tickets = []) {
  const destination = parseCoordinatesFromLocation(ticket?.location);

  return technicians
    .filter((technician) => technician.active)
    .map((technician) => {
      const coordinates = getTechnicianCoordinates(technician);
      const distanceKm = calculateDistanceKm(coordinates, destination);
      const activeLoad = getTechnicianActiveLoad(technician.id, tickets);
      const travelMinutes = estimateTravelMinutes(distanceKm, 'walking');
      const specializationMatch = (technician.specialization || '')
        .toLowerCase()
        .includes((ticket?.category || '').toLowerCase());
      const score =
        (distanceKm ?? 10) +
        activeLoad * 0.9 -
        (specializationMatch ? 0.35 : 0);

      return {
        technician,
        coordinates,
        distanceKm,
        activeLoad,
        travelMinutes,
        score
      };
    })
    .sort((left, right) => {
      if (left.distanceKm === null && right.distanceKm !== null) return 1;
      if (left.distanceKm !== null && right.distanceKm === null) return -1;
      if (left.score !== right.score) return left.score - right.score;
      return left.activeLoad - right.activeLoad;
    });
}

// Rank a technician's own tickets so the next best task appears first.
export function rankTicketsForTechnician(tickets = [], currentCoordinates) {
  return [...tickets]
    .map((ticket) => {
      const destination = parseCoordinatesFromLocation(ticket.location);
      const distanceKm = calculateDistanceKm(currentCoordinates, destination);
      const travelMinutes = estimateTravelMinutes(distanceKm, 'walking');
      const priorityWeight = getPriorityWeight(ticket.priority);
      const statusWeight = getStatusWeight(ticket.status);
      const score =
        priorityWeight * 100 +
        statusWeight * 30 -
        Math.min(distanceKm ?? 5, 5) * 8;

      return {
        ...ticket,
        destination,
        distanceKm,
        travelMinutes,
        dispatchScore: score
      };
    })
    .sort((left, right) => right.dispatchScore - left.dispatchScore);
}

// Measure how much ticket and technician data can be shown on the live map.
export function getMapCoverageSummary(tickets = [], technicians = []) {
  const actionableTickets = tickets.filter(
    (ticket) => ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED'
  );

  const geocodedTickets = actionableTickets.filter((ticket) => parseCoordinatesFromLocation(ticket.location));
  const liveTechnicians = technicians.filter((technician) => getTechnicianCoordinates(technician));

  return {
    actionableCount: actionableTickets.length,
    geocodedCount: geocodedTickets.length,
    liveTechnicianCount: liveTechnicians.length,
    coverageRate:
      actionableTickets.length > 0
        ? Math.round((geocodedTickets.length / actionableTickets.length) * 100)
        : 100
  };
}

// Find the closest item to a given starting point.
export function getNearestEntity(origin, items = [], getCoordinates) {
  const start = parseCoordinates(origin);

  if (!start) {
    return null;
  }

  const ranked = items
    .map((item) => ({
      item,
      distanceKm: calculateDistanceKm(start, getCoordinates(item))
    }))
    .filter((entry) => entry.distanceKm !== null)
    .sort((left, right) => left.distanceKm - right.distanceKm);

  return ranked[0] || null;
}
