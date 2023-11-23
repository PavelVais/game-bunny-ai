export class Coordinations {
    /**
     * Konvertuje pozici z matter.js na pozici pro p5.js
     * @param {Matter.Body} body - Těleso v matter.js
     * @param {Object} size - Objekt s x (šířkou) a y (výškou)
     */
    static cornerToCenter(body, size) {
        return {
            x: body.position.x - size.x / 2,
            y: body.position.y - size.y / 2,
        };
    }

    /**
     * Konvertuje pozici z p5.js na pozici pro matter.js
     * @param {number} x - X pozice v p5.js
     * @param {number} y - Y pozice v p5.js
     * @param {Object} size - Objekt s x (šířkou) a y (výškou)
     */
    static centerToCorner(x, y, size) {
        return {
            x: x + size.x / 2,
            y: y + size.y / 2,
        };
    }

    /**
     * Vypočítá vzdálenost mezi dvěma body
     */
    static distanceBetween(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Vypočítá normalizovaný směrový vektor z jednoho bodu do druhého
     */
    static directionTo(fromPoint, toPoint) {
        const dx = toPoint.x - fromPoint.x;
        const dy = toPoint.y - fromPoint.y;
        const distance = Coordinations.distanceBetween(fromPoint, toPoint);
        return {
            x: dx / distance,
            y: dy / distance,
        };
    }
}
