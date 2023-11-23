import { Collision } from "matter-js";
/**
 * Determines if the given object is overlapping with atleast one of the other objects.
 * @param {Matter.Body} firstObject - The first object to check for overlapping.
 * @param {Array<Matter.Body>} otherObjects - An array of other objects to compare with the first object.
 * @returns {boolean} - True if the first object is overlapping with any of the other objects, false otherwise.
 */
export function isOverlappingSome(firstObject, otherObjects) {
    return otherObjects.some((object) => Collision.collides(firstObject, object));
}
