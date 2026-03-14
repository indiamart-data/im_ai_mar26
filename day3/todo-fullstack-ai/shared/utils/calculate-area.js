/**
 * Calculates the area of a circle for a given radius.
 *
 * Example usage:
 * const area = calculateCircleArea(5);
 * // area = 78.53981633974483
 *
 * @param {number} radius - Circle radius (must be a non-negative finite number).
 * @returns {number|null} Circle area, or null when input is invalid.
 */
function calculateCircleArea(radius) {
	// Guard clause for invalid input types.
	if (typeof radius !== 'number' || !Number.isFinite(radius)) {
		return null;
	}

	// Guard clause to prevent negative radius values.
	if (radius < 0) {
		return null;
	}

	const area = Math.PI * radius * radius;
	return area;
}

module.exports = {
	calculateCircleArea,
};
