"""Utility helpers for geometry calculations."""

import math


def calculate_circle_area(radius: float) -> float:
	"""Calculate the area of a circle from its radius.

	Example usage:
		area = calculate_circle_area(5)
		print(area)  # 78.53981633974483
	"""
	# Validate that a value was provided and it can be treated as a number.
	if radius is None:
		raise ValueError("radius is required")

	if not isinstance(radius, (int, float)):
		raise TypeError("radius must be a number")

	# Negative radii are invalid; radius 0 has area 0.
	if radius < 0:
		raise ValueError("radius cannot be negative")

	if radius == 0:
		return 0.0

	return math.pi * (radius ** 2)


if __name__ == "__main__":
	sample_radius = 7
	sample_area = calculate_circle_area(sample_radius)
	print(f"Area of circle with radius {sample_radius}: {sample_area}")
