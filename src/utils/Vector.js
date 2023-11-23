/**
 * Linearly interpolates between two values.
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} amt - The interpolation amount between 0 and 1.
 * @return {number} The interpolated value.
 */
export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

export function calculateDistance(x1, y1, x2, y2) {
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

/**
 * Determines if two entities are nearby based on their positions.
 *
 * @param {Object} entity - The first entity.
 * @param {Object} entity2 - The second entity.
 * @param {Number} [threshold=100] - The maximum distance threshold.
 * @returns {Boolean} - True if the entities are nearby, false otherwise.
 */
export function isNearby(entity, entity2, threshold = 100) {
    let agentX = entity.position.x;
    let agentY = entity.position.y;
    let platformX = entity2.position.x;
    let platformY = entity2.position.y;

    let distance = calculateDistance(agentX, agentY, platformX, platformY);
    return distance < threshold;
}
